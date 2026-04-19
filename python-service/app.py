"""
AIQuiz — Flask AI Service (XGBoost + GridFS ONLY)
==================================================
Model persistence: MongoDB GridFS ONLY — no local .pkl storage.
GridFS collections: fs.files + fs.chunks (standard GridFS)

Features sent per request
--------------------------
  accuracy        0.0–1.0
  avg_time        seconds
  streak          int
  prev_difficulty 0|1|2

Output
------
  difficulty   "easy" | "medium" | "hard"
  engine       "xgboost" | "rule-based" | "fallback"
"""

# ── Load .env FIRST before anything else reads os.environ ────────────────────
import os

try:
    from dotenv import load_dotenv
    # Try loading from current dir, then parent
    loaded = load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"), override=False)
    if not loaded:
        load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"), override=False)
except ImportError:
    pass  # python-dotenv not installed — rely on system env

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import io
import pickle
import logging
import time

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("aiquiz.ai")

# ── XGBoost ───────────────────────────────────────────────────────────────────
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
    log.info("✅ XGBoost imported successfully (version: %s)", xgb.__version__)
except ImportError as e:
    XGBOOST_AVAILABLE = False
    log.warning("⚠️  XGBoost not installed (%s) — using rule-based fallback", e)

# ── PyMongo + GridFS ──────────────────────────────────────────────────────────
try:
    from pymongo import MongoClient
    import gridfs
    GRIDFS_AVAILABLE = True
    log.info("✅ PyMongo imported — GridFS model persistence enabled")
except ImportError as e:
    GRIDFS_AVAILABLE = False
    log.warning("⚠️  PyMongo not installed (%s) — GridFS disabled", e)

app = Flask(__name__)
CORS(app)

DIFFICULTY_LABELS = {0: "easy", 1: "medium", 2: "hard"}
DIFFICULTY_MAP    = {"easy": 0, "medium": 1, "hard": 2}
GRIDFS_FILENAME   = "xgboost_model.pkl"

model        = None
model_source = "none"
_gridfs_conn = None   # lazy (fs, db) tuple


# ─── GridFS connection (lazy) ─────────────────────────────────────────────────
def _get_gridfs():
    global _gridfs_conn
    if not GRIDFS_AVAILABLE:
        return None, None
    if _gridfs_conn is not None:
        return _gridfs_conn

    mongo_uri = os.environ.get("MONGO_URI") or os.environ.get("MONGODB_URI")
    if not mongo_uri:
        log.warning("⚠️  MONGO_URI not set — GridFS unavailable")
        log.warning("    Set MONGO_URI in python-service/.env or environment")
        return None, None

    log.info("🔌 Connecting to MongoDB: %s…", mongo_uri[:40] + "…")
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=8000)
        # Force connection test
        client.admin.command("ping")
        db     = client.get_default_database()
        fs     = gridfs.GridFS(db)
        # Ensure GridFS indexes exist
        db["fs.files"].create_index([("filename", 1)])
        db["fs.chunks"].create_index([("files_id", 1), ("n", 1)], unique=True)
        _gridfs_conn = (fs, db)
        log.info("✅ GridFS connected (db=%s)", db.name)
        return _gridfs_conn
    except Exception as e:
        log.error("❌ GridFS connection failed: %s", e)
        return None, None


# ─── Load model from GridFS ───────────────────────────────────────────────────
def _load_model_from_gridfs():
    fs, db = _get_gridfs()
    if fs is None:
        return None
    try:
        if fs.exists({"filename": GRIDFS_FILENAME}):
            grid_file   = fs.find_one({"filename": GRIDFS_FILENAME}, sort=[("uploadDate", -1)])
            model_bytes = grid_file.read()
            loaded      = pickle.loads(model_bytes)
            log.info("✅ Model loaded from GridFS (%d bytes, uploaded: %s)",
                     len(model_bytes), grid_file.uploadDate)
            return loaded
        log.info("ℹ️  No model in GridFS (filename='%s') — will train fresh", GRIDFS_FILENAME)
        return None
    except Exception as e:
        log.error("❌ GridFS load error: %s", e)
        return None


# ─── Save model to GridFS (replace existing) ──────────────────────────────────
def _save_model_to_gridfs(trained_model):
    fs, db = _get_gridfs()
    if fs is None:
        log.warning("⚠️  Skipping GridFS save — no connection")
        return False
    try:
        model_bytes = pickle.dumps(trained_model)
        # Delete ALL previous versions
        for old in list(fs.find({"filename": GRIDFS_FILENAME})):
            fs.delete(old._id)
            log.debug("🗑️  Deleted old GridFS model (id=%s)", old._id)
        file_id = fs.put(
            model_bytes,
            filename    = GRIDFS_FILENAME,
            contentType = "application/octet-stream",
        )
        log.info("✅ Model saved to GridFS — %d bytes, id=%s", len(model_bytes), file_id)
        return True
    except Exception as e:
        log.error("❌ GridFS save error: %s", e)
        return False


# ─── Synthetic training data ──────────────────────────────────────────────────
def get_synthetic_training_data():
    np.random.seed(42)
    X, y = [], []
    for _ in range(400):
        X.append([np.random.uniform(0.00, 0.50),
                  np.random.uniform(20, 45),
                  np.random.randint(0, 3),
                  np.random.randint(0, 3)])
        y.append(0)
    for _ in range(400):
        X.append([np.random.uniform(0.40, 0.75),
                  np.random.uniform(10, 25),
                  np.random.randint(1, 5),
                  np.random.randint(0, 3)])
        y.append(1)
    for _ in range(400):
        X.append([np.random.uniform(0.65, 1.00),
                  np.random.uniform( 5, 15),
                  np.random.randint(3, 10),
                  np.random.randint(0, 3)])
        y.append(2)
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int32)


# ─── Train model ─────────────────────────────────────────────────────────────
def _train_model(X=None, y=None):
    if X is None or y is None:
        log.info("🔄 Training XGBoost on synthetic data (1200 samples)…")
        X, y = get_synthetic_training_data()
    else:
        log.info("🔄 Training XGBoost on %d real samples…", len(X))

    t0  = time.time()
    clf = xgb.XGBClassifier(
        n_estimators      = 150,
        max_depth         = 4,
        learning_rate     = 0.1,
        use_label_encoder = False,
        eval_metric       = "mlogloss",
        random_state      = 42,
        num_class         = 3,
        objective         = "multi:softmax",
    )
    clf.fit(X, y)
    log.info("✅ Training complete in %.2fs", time.time() - t0)
    preds = clf.predict(X)
    log.info("📊 Training accuracy: %.1f%%", (preds == y).mean() * 100)
    return clf


# ─── Startup: GridFS only — no local storage ─────────────────────────────────
def load_or_train_model():
    global model, model_source

    if not XGBOOST_AVAILABLE:
        log.warning("⚠️  XGBoost unavailable — rule-based fallback mode")
        model_source = "none"
        return

    # Step 1: Try GridFS
    log.info("🔍 Loading model from GridFS…")
    loaded = _load_model_from_gridfs()
    if loaded is not None:
        model        = loaded
        model_source = "gridfs"
        log.info("✅ Model ready (source=gridfs)")
        return

    # Step 2: Train fresh → save ONLY to GridFS
    log.info("🔍 No model in GridFS — training fresh model…")
    model = _train_model()
    saved = _save_model_to_gridfs(model)
    model_source = "trained_new"
    log.info("✅ Model ready (source=trained_new, saved_to_gridfs=%s)", saved)


# ─── Rule-based fallback ──────────────────────────────────────────────────────
def rule_based_predict(accuracy, avg_time, streak, prev_difficulty):
    if accuracy >= 0.80 and avg_time <= 12 and streak >= 3:
        return "hard"
    if accuracy <= 0.40 or avg_time >= 18:
        return "easy"
    return "medium"


# ─── /health ──────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    fs, db = _get_gridfs()
    gridfs_has_model = False
    if fs:
        try:
            gridfs_has_model = fs.exists({"filename": GRIDFS_FILENAME})
        except Exception:
            pass
    return jsonify({
        "status":            "ok",
        "xgboost_available": XGBOOST_AVAILABLE,
        "model_loaded":      model is not None,
        "model_source":      model_source,
        "gridfs_available":  GRIDFS_AVAILABLE,
        "gridfs_connected":  fs is not None,
        "gridfs_has_model":  gridfs_has_model,
        "engine":            "xgboost" if (model is not None and XGBOOST_AVAILABLE) else "rule-based",
        "mongo_uri_set":     bool(os.environ.get("MONGO_URI")),
        "note":              "Model stored in MongoDB GridFS (fs.files + fs.chunks) only — no local .pkl",
    })


# ─── /predict ────────────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True) or {}

        accuracy        = max(0.0, min(1.0, float(data.get("accuracy",        0.5))))
        avg_time        = max(1.0,           float(data.get("avg_time",        15)))
        streak          = max(0.0,           float(data.get("streak",          0)))
        prev_difficulty = max(0.0, min(2.0,  float(data.get("prev_difficulty", 1))))

        confidence = None

        if model is not None and XGBOOST_AVAILABLE:
            features   = np.array([[accuracy, avg_time, streak, prev_difficulty]], dtype=np.float32)
            pred_idx   = int(model.predict(features)[0])
            difficulty = DIFFICULTY_LABELS.get(pred_idx, "medium")
            engine     = "xgboost"
            try:
                proba      = model.predict_proba(features)[0]
                confidence = round(float(proba[pred_idx]) * 100, 1)
            except Exception:
                pass
        else:
            difficulty = rule_based_predict(accuracy, avg_time, streak, prev_difficulty)
            engine     = "rule-based"

        return jsonify({
            "difficulty": difficulty,
            "engine":     engine,
            "debug": {
                "model_source":              model_source,
                "xgboost_available":         XGBOOST_AVAILABLE,
                "model_loaded":              model is not None,
                "prediction_confidence_pct": confidence,
                "storage":                   "gridfs_only",
            },
            "input": {
                "accuracy":        accuracy,
                "avg_time":        avg_time,
                "streak":          streak,
                "prev_difficulty": prev_difficulty,
            },
        })

    except Exception as e:
        log.exception("❌ /predict error")
        return jsonify({"difficulty": "medium", "engine": "fallback", "error": str(e)}), 200


# ─── /retrain ────────────────────────────────────────────────────────────────
@app.route("/retrain", methods=["POST"])
def retrain():
    try:
        if not XGBOOST_AVAILABLE:
            return jsonify({"message": "XGBoost not available"}), 400

        global model, model_source
        body        = request.get_json(force=True) or {}
        custom_data = body.get("data")

        if custom_data and len(custom_data) >= 10:
            X = np.array(
                [[d["accuracy"], d["avg_time"], d["streak"], d["prev_difficulty"]]
                 for d in custom_data], dtype=np.float32)
            y = np.array([d["label"] for d in custom_data], dtype=np.int32)
        else:
            X, y = None, None

        model        = _train_model(X, y)
        saved_gridfs = _save_model_to_gridfs(model)
        model_source = "retrained"

        return jsonify({
            "message":      "Model retrained and saved to GridFS",
            "saved_gridfs": saved_gridfs,
            "model_source": model_source,
            "storage":      "gridfs_only",
        })

    except Exception as e:
        log.exception("❌ /retrain error")
        return jsonify({"error": str(e)}), 500


# ─── /debug ──────────────────────────────────────────────────────────────────
@app.route("/debug", methods=["GET"])
def debug_info():
    fs, db = _get_gridfs()
    gridfs_files = []
    if fs:
        try:
            for f in fs.find({"filename": GRIDFS_FILENAME}):
                gridfs_files.append({
                    "id":         str(f._id),
                    "filename":   f.filename,
                    "length":     f.length,
                    "uploadDate": str(f.uploadDate),
                })
        except Exception as e:
            gridfs_files = [{"error": str(e)}]

    return jsonify({
        "xgboost_available": XGBOOST_AVAILABLE,
        "model_loaded":      model is not None,
        "model_source":      model_source,
        "gridfs_available":  GRIDFS_AVAILABLE,
        "gridfs_connected":  fs is not None,
        "gridfs_files":      gridfs_files,
        "mongo_uri_set":     bool(os.environ.get("MONGO_URI")),
        "storage_policy":    "gridfs_only — no local .pkl files used",
        "collections":       ["fs.files", "fs.chunks"],
    })


# ─── Startup ──────────────────────────────────────────────────────────────────
log.info("=" * 60)
log.info("🚀 AIQuiz AI Service — GridFS-only model storage")
log.info("   MONGO_URI loaded: %s", "YES" if os.environ.get("MONGO_URI") else "NO — check python-service/.env")
log.info("=" * 60)
load_or_train_model()
log.info("🏁 Ready — source=%s engine=%s",
         model_source,
         "xgboost" if (model is not None and XGBOOST_AVAILABLE) else "rule-based")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    log.info("🌐 Listening on http://0.0.0.0:%d", port)
    app.run(host="0.0.0.0", port=port, debug=False)