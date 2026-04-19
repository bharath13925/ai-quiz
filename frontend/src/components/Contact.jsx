import React, { useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const INFO_CARDS = [
  { icon: '✉️', label: 'Email',         value: 'bharathbandi13925@gmail.com', sub: 'Response within 24h' },
  { icon: '📍', label: 'Location',      value: 'Hyderabad, India',            sub: 'Telangana, IN'       },
  { icon: '⚡', label: 'Support Hours', value: '9 AM – 9 PM IST',            sub: 'Mon–Sat'             },
]

const Contact = () => {
  const [form,      setForm]      = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [focused,   setFocused]   = useState(null)
  const [charCount, setCharCount] = useState(0)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (e.target.name === 'message') setCharCount(e.target.value.length)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${BASE_URL}/contact`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send message')
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getInputStyle = (name) => ({
    width: '100%',
    background: focused === name ? 'rgba(6,182,212,0.05)' : 'rgba(255,255,255,0.02)',
    border: `1px solid ${focused === name ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.08)'}`,
    boxShadow: focused === name ? '0 0 0 3px rgba(6,182,212,0.12), inset 0 1px 2px rgba(0,0,0,0.2)' : 'inset 0 1px 2px rgba(0,0,0,0.1)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
  })

  return (
    <section id="contact" className="relative bg-[#020817] py-28 px-6 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        .contact-info-card { transition: all 0.35s ease; }
        .contact-info-card:hover {
          background: rgba(6,182,212,0.06) !important;
          border-color: rgba(6,182,212,0.22) !important;
          box-shadow: 0 8px 32px rgba(6,182,212,0.08);
          transform: translateY(-2px);
        }
        .contact-submit-btn { transition: all 0.3s ease; }
        .contact-submit-btn:not(:disabled):hover {
          transform: scale(1.01);
          box-shadow: 0 12px 40px rgba(6,182,212,0.35);
        }
        ::placeholder { color: rgba(100,116,139,0.7); }
      `}</style>

      {/* Backgrounds */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(6,182,212,1) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(6,182,212,0.5),rgba(59,130,246,0.3),transparent)' }} />
      <div className="absolute top-24 left-16 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-24 right-16 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase bg-cyan-500/10 border border-cyan-500/20 rounded-full px-5 py-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Contact Us
          </div>
          <h2 className="font-black text-5xl md:text-6xl text-white mb-5" style={{ fontFamily: "'Syne',sans-serif" }}>
            We'd love to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">hear from you</span>
          </h2>
          <p className="text-slate-400 text-lg">Have feedback, ideas, or issues? Reach out to the AIQuiz team.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left info */}
          <div className="lg:col-span-2 space-y-4">
            {INFO_CARDS.map((item, i) => (
              <div key={i} className="contact-info-card flex items-center gap-4 p-4 rounded-2xl cursor-default"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(59,130,246,0.1))', border: '1px solid rgba(6,182,212,0.2)' }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold">{item.label}</p>
                  <p className="text-white font-bold text-sm">{item.value}</p>
                  <p className="text-slate-500 text-xs">{item.sub}</p>
                </div>
              </div>
            ))}

            <div className="p-5 rounded-2xl relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.1),rgba(59,130,246,0.05))', border: '1px solid rgba(6,182,212,0.2)' }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-3xl"
                style={{ background: 'linear-gradient(225deg,rgba(6,182,212,0.15),transparent)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🚀</span>
                  <h4 className="font-bold text-white text-sm">Quick Response</h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  We typically respond within 24 hours. For urgent issues include{' '}
                  <span className="text-cyan-400 font-mono font-bold">"URGENT"</span> in your message.
                </p>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="lg:col-span-3">
            <div className="relative p-8 rounded-3xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
              <div className="absolute top-0 right-0 w-36 h-36 rounded-bl-3xl pointer-events-none"
                style={{ background: 'linear-gradient(225deg,rgba(6,182,212,0.1),transparent)' }} />

              {submitted ? (
                <div className="text-center py-14 relative z-10">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDelay: '0.3s' }} />
                    <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', boxShadow: '0 0 40px rgba(16,185,129,0.2)' }}>
                      ✅
                    </div>
                  </div>
                  <h3 className="font-black text-2xl text-white mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>Message Sent!</h3>
                  <p className="text-slate-400 text-sm mb-8">We'll get back to you within 24 hours.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); setCharCount(0) }}
                    className="px-6 py-2.5 text-sm font-bold text-cyan-400 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
                    style={{ border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.08)' }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                  {error && (
                    <div className="px-4 py-3.5 rounded-xl flex items-center gap-2 text-red-400 text-sm"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <span>⚠️</span> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { label: 'Your Name', name: 'name',  type: 'text',  placeholder: 'John Doe'          },
                      { label: 'Email',     name: 'email', type: 'email', placeholder: 'you@example.com'   },
                    ].map(({ label, name, type, placeholder }) => (
                      <div key={name}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>{label}</label>
                        <input
                          type={type} name={name} value={form[name]}
                          onChange={handleChange} required placeholder={placeholder}
                          onFocus={() => setFocused(name)} onBlur={() => setFocused(null)}
                          style={getInputStyle(name)}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Message</label>
                      <span style={{ fontSize: '10px', color: '#475569' }}>{charCount}/1000</span>
                    </div>
                    <textarea
                      name="message" value={form.message} onChange={handleChange} required
                      rows={5} placeholder="Tell us what's on your mind..." maxLength={1000}
                      onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
                      style={{ ...getInputStyle('message'), resize: 'none', display: 'block' }}
                    />
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="contact-submit-btn relative w-full py-4 rounded-xl font-bold text-white overflow-hidden disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center justify-center gap-2 text-sm">
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </>
                      ) : <>Send Message →</>}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact