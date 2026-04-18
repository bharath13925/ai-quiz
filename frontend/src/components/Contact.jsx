import React, { useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Contact = () => {
  const [form,      setForm]      = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [focused,   setFocused]   = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
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

  const inputClass = (name) => `w-full bg-white/[0.03] border rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-sm transition-all duration-300 outline-none ${
    focused === name
      ? 'border-cyan-500/60 bg-cyan-500/5 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
      : 'border-slate-800 hover:border-slate-700'
  }`

  return (
    <section id="contact" className="relative bg-[#020817] py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(6,182,212,1) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase bg-cyan-500/10 border border-cyan-500/20 rounded-full px-5 py-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Contact Us
          </div>
          <h2 className="font-black text-5xl md:text-6xl text-white mb-5">
            We'd love to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">hear from you</span>
          </h2>
          <p className="text-slate-400 text-lg">Have feedback, ideas, or issues? Reach out to the AIQuiz team.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left info */}
          <div className="lg:col-span-2 space-y-5">
            {[
              { icon: '✉️', label: 'Email', value: 'support@aiquiz.app', sub: 'Response within 24h' },
              { icon: '📍', label: 'Location', value: 'Hyderabad, India', sub: 'Telangana, IN' },
              { icon: '⚡', label: 'Support Hours', value: '9 AM – 9 PM IST', sub: 'Mon–Sat' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all duration-300 group cursor-default">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-semibold">{item.label}</p>
                  <p className="text-white font-bold text-sm">{item.value}</p>
                  <p className="text-slate-500 text-xs">{item.sub}</p>
                </div>
              </div>
            ))}

            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🚀</span>
                <h4 className="font-bold text-white text-sm">Quick Response</h4>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">We typically respond within 24 hours. For urgent issues include <span className="text-cyan-400 font-mono">"URGENT"</span> in your message.</p>
            </div>
          </div>

          {/* Right form */}
          <div className="lg:col-span-3">
            <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-3xl" />

              {submitted ? (
                <div className="text-center py-12">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                    <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl">✅</div>
                  </div>
                  <h3 className="font-black text-2xl text-white mb-3">Message Sent!</h3>
                  <p className="text-slate-400 text-sm mb-8">We'll get back to you within 24 hours.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }) }}
                    className="px-6 py-2.5 text-sm font-bold text-cyan-400 border border-cyan-400/30 rounded-xl hover:bg-cyan-400/10 transition-all"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                  {error && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center gap-2">
                      <span>⚠️</span> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { label: 'Your Name', name: 'name',  type: 'text',  placeholder: 'John Doe' },
                      { label: 'Email',     name: 'email', type: 'email', placeholder: 'you@example.com' },
                    ].map(({ label, name, type, placeholder }) => (
                      <div key={name}>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">{label}</label>
                        <input
                          type={type} name={name} value={form[name]}
                          onChange={handleChange} required placeholder={placeholder}
                          onFocus={() => setFocused(name)} onBlur={() => setFocused(null)}
                          className={inputClass(name)}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2">Message</label>
                    <textarea
                      name="message" value={form.message} onChange={handleChange} required rows={5}
                      placeholder="Tell us what's on your mind..."
                      onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
                      className={`${inputClass('message')} resize-none`}
                    />
                  </div>
                  <button
                    type="submit" disabled={loading}
                    className="relative w-full py-3.5 rounded-xl font-bold text-white overflow-hidden group disabled:opacity-60 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.01]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all group-hover:from-cyan-400 group-hover:to-blue-500" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-white/10 to-transparent" />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>Send Message <span>→</span></>
                      )}
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