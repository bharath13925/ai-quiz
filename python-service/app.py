"""
AIQuiz — Flask AI Service (XGBoost)
====================================
Predicts the next quiz-window difficulty from the user's last-window performance.

Features sent per request
--------------------------
  accuracy        0.0–1.0   fraction correct in the just-finished 5-question window
  avg_time        seconds   average per-question response time in that window
  streak          int       trailing correct-answer streak at end of window
  prev_difficulty 0|1|2     difficulty of the window that just finished (0=easy,1=medium,2=hard)

Output
------
  difficulty   "easy" | "medium" | "hard"
  engine       "xgboost" | "rule-based" | "fallback"

Run locally
-----------
  python app.py          # starts on port 5001
  gunicorn app:app -p 5001   # production
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
import pickle

# ── XGBoost (optional — graceful fallback to rule-based predictor) ────────────
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("⚠️  xgboost not installed — using rule-based fallback")

app = Flask(__name__)
CORS(app)

DIFFICULTY_LABELS = {0: "easy", 1: "medium", 2: "hard"}
DIFFICULTY_MAP    = {"easy": 0, "medium": 1, "hard": 2}
MODEL_PATH        = os.path.join(os.path.dirname(__file__), "xgboost_model.pkl")

model = None   # loaded/trained at startup


# ─── Synthetic training data ──────────────────────────────────────────────────
def get_synthetic_training_data():
    """
    Generate balanced synthetic training data (1 200 samples, 400 per class).

    Heuristics
    ----------
    easy   → low accuracy (0–0.50), high avg_time (20–45 s), low streak  (0–2)
    medium → mid accuracy (0.4–0.75), mid avg_time (10–25 s), mid streak (1–4)
    hard   → high accuracy (0.65–1),  low avg_time ( 5–15 s), high streak (3+)
    """
    np.random.seed(42)
    X, y = [], []

    for _ in range(400):                                     # easy
        X.append([np.random.uniform(0.00, 0.50),
                  np.random.uniform(20, 45),
                  np.random.randint(0, 3),
                  np.random.randint(0, 3)])
        y.append(0)

    for _ in range(400):                                     # medium
        X.append([np.random.uniform(0.40, 0.75),
                  np.random.uniform(10, 25),
                  np.random.randint(1, 5),
                  np.random.randint(0, 3)])
        y.append(1)

    for _ in range(400):                                     # hard
        X.append([np.random.uniform(0.65, 1.00),
                  np.random.uniform( 5, 15),
                  np.random.randint(3, 10),
                  np.random.randint(0, 3)])
        y.append(2)

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int32)


# ─── Load or train model ──────────────────────────────────────────────────────
def load_or_train_model():
    global model
    if not XGBOOST_AVAILABLE:
        return

    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            print("✅ XGBoost model loaded from disk")
            return
        except Exception as e:
            print(f"⚠️  Could not load saved model ({e}) — retraining…")

    print("🔄 Training XGBoost model on synthetic data…")
    X, y = get_synthetic_training_data()

    model = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.1,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        num_class=3,
        objective="multi:softmax",
    )
    model.fit(X, y)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    print("✅ XGBoost model trained and saved to disk")


# ─── Rule-based fallback predictor ────────────────────────────────────────────
def rule_based_predict(accuracy, avg_time, streak, prev_difficulty):
    """Simple heuristic used when XGBoost is unavailable."""
    if accuracy >= 0.80 and avg_time <= 12 and streak >= 3:
        return "hard"
    if accuracy <= 0.40 or avg_time >= 18:
        return "easy"
    return "medium"


# ─── Health check ─────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":       "ok",
        "xgboost":      XGBOOST_AVAILABLE,
        "model_loaded": model is not None,
    })


# ─── Predict endpoint — called after every 5-question window ──────────────────
@app.route("/predict", methods=["POST"])
def predict():
    """
    POST body (JSON)
    ----------------
    {
        "accuracy":        0.0–1.0,
        "avg_time":        float (seconds),
        "streak":          int,
        "prev_difficulty": 0 | 1 | 2
    }

    Response
    --------
    {
        "difficulty": "easy" | "medium" | "hard",
        "engine":     "xgboost" | "rule-based" | "fallback",
        "input":      { ...clamped input values }
    }
    """
    try:
        data = request.get_json(force=True) or {}

        accuracy        = float(data.get("accuracy",        0.5))
        avg_time        = float(data.get("avg_time",        15))
        streak          = float(data.get("streak",          0))
        prev_difficulty = float(data.get("prev_difficulty", 1))

        # Clamp to valid ranges
        accuracy        = max(0.0, min(1.0, accuracy))
        avg_time        = max(1.0, avg_time)
        streak          = max(0.0, streak)
        prev_difficulty = max(0.0, min(2.0, prev_difficulty))

        if model is not None and XGBOOST_AVAILABLE:
            features   = np.array([[accuracy, avg_time, streak, prev_difficulty]], dtype=np.float32)
            pred_idx   = int(model.predict(features)[0])
            difficulty = DIFFICULTY_LABELS.get(pred_idx, "medium")
            engine     = "xgboost"
        else:
            difficulty = rule_based_predict(accuracy, avg_time, streak, prev_difficulty)
            engine     = "rule-based"

        return jsonify({
            "difficulty": difficulty,
            "engine":     engine,
            "input": {
                "accuracy":        accuracy,
                "avg_time":        avg_time,
                "streak":          streak,
                "prev_difficulty": prev_difficulty,
            },
        })

    except Exception as e:
        print(f"❌ /predict error: {e}")
        return jsonify({"difficulty": "medium", "engine": "fallback", "error": str(e)}), 200


# ─── Retrain endpoint (optional admin use) ────────────────────────────────────
@app.route("/retrain", methods=["POST"])
def retrain():
    """
    Retrain with optional real data.

    POST body (optional):
    {
        "data": [
            {
                "accuracy": 0.8, "avg_time": 10, "streak": 3,
                "prev_difficulty": 1, "label": 2
            },
            ...  (min 10 samples required to use custom data)
        ]
    }
    """
    try:
        if not XGBOOST_AVAILABLE:
            return jsonify({"message": "XGBoost not available"}), 400

        body        = request.get_json(force=True) or {}
        custom_data = body.get("data")

        global model

        if custom_data and len(custom_data) >= 10:
            X = np.array(
                [[d["accuracy"], d["avg_time"], d["streak"], d["prev_difficulty"]]
                 for d in custom_data],
                dtype=np.float32,
            )
            y = np.array([d["label"] for d in custom_data], dtype=np.int32)
        else:
            X, y = get_synthetic_training_data()

        model = xgb.XGBClassifier(
            n_estimators=150, max_depth=4, learning_rate=0.1,
            use_label_encoder=False, eval_metric="mlogloss",
            random_state=42, num_class=3, objective="multi:softmax",
        )
        model.fit(X, y)

        with open(MODEL_PATH, "wb") as f:
            pickle.dump(model, f)

        return jsonify({"message": "Model retrained successfully", "samples": len(X)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Startup ──────────────────────────────────────────────────────────────────
load_or_train_model()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"🚀 AI Service running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)