import React from 'react'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-[#020817] border-t border-white/5 overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Background */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(6,182,212,1) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 opacity-50 blur-sm group-hover:opacity-80 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div>
                <span className="font-black text-xl text-white">AI<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Quiz</span></span>
                <div className="text-[9px] text-cyan-400/50 tracking-[0.2em] uppercase font-medium">Adaptive Learning</div>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-5">
              An intelligent adaptive quiz platform powered by XGBoost AI. Master CS topics with personalised difficulty that evolves as you grow.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {['React', 'Node.js', 'MongoDB', 'Flask', 'XGBoost'].map((tech) => (
                <span key={tech} className="px-2.5 py-1 text-[10px] font-bold text-slate-500 border border-slate-800 rounded-lg hover:border-cyan-500/30 hover:text-cyan-400 transition-all cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-5 uppercase tracking-[0.15em]">Navigate</h4>
            <ul className="space-y-3">
              {['home', 'features', 'faq', 'contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollTo(item)}
                    className="text-slate-500 hover:text-cyan-400 transition-colors text-sm capitalize group flex items-center gap-2"
                  >
                    <span className="w-4 h-px bg-slate-700 group-hover:bg-cyan-400 group-hover:w-6 transition-all duration-300" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-5 uppercase tracking-[0.15em]">Account</h4>
            <ul className="space-y-3">
              {[
                { label: 'Sign Up',   path: '/signup' },
                { label: 'Log In',    path: '/login' },
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Leaderboard', path: '/leaderboard' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="text-slate-500 hover:text-cyan-400 transition-colors text-sm group flex items-center gap-2"
                  >
                    <span className="w-4 h-px bg-slate-700 group-hover:bg-cyan-400 group-hover:w-6 transition-all duration-300" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} AIQuiz. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer