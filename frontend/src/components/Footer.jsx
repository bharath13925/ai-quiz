import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const [hoveredTech, setHoveredTech] = useState(null)

  const TECHS = ['React', 'Node.js', 'MongoDB', 'Flask', 'XGBoost', 'Firebase']

  return (
    <footer className="relative bg-[#020817] border-t border-white/5 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        .footer-link { position: relative; transition: all 0.25s ease; }
        .footer-link::before {
          content: '';
          position: absolute;
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #06b6d4;
          opacity: 0;
          transition: all 0.25s ease;
        }
        .footer-link:hover::before { opacity: 1; left: -8px; }
        .footer-link:hover { color: #22d3ee !important; padding-left: 8px; }
      `}</style>

      {/* Animated top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(6,182,212,0.5),rgba(59,130,246,0.3),rgba(139,92,246,0.2),transparent)' }} />

      {/* Background subtle grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(6,182,212,0.8) 1px,transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      {/* Glow orbs */}
      <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-cyan-500/4 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-blue-500/4 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 opacity-50 blur-md group-hover:opacity-90 group-hover:blur-lg transition-all duration-500" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/40 transition-all duration-400">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div>
                <span className="font-black text-xl text-white" style={{ fontFamily: "'Syne',sans-serif" }}>
                  AI<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Quiz</span>
                </span>
                <div className="text-[9px] text-cyan-400/50 tracking-[0.2em] uppercase font-medium group-hover:text-cyan-400/80 transition-colors duration-300">Adaptive Learning</div>
              </div>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
              An intelligent adaptive quiz platform powered by XGBoost AI. Master CS topics with personalised difficulty that evolves as you grow.
            </p>

            {/* Tech badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {TECHS.map((tech) => (
                <span
                  key={tech}
                  onMouseEnter={() => setHoveredTech(tech)}
                  onMouseLeave={() => setHoveredTech(null)}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-default transition-all duration-300"
                  style={{
                    border: hoveredTech === tech ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    color: hoveredTech === tech ? '#22d3ee' : '#475569',
                    background: hoveredTech === tech ? 'rgba(6,182,212,0.08)' : 'transparent',
                    transform: hoveredTech === tech ? 'translateY(-1px)' : 'translateY(0)',
                    boxShadow: hoveredTech === tech ? '0 4px 12px rgba(6,182,212,0.15)' : 'none',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-black text-white text-xs mb-5 uppercase tracking-[0.15em]">Navigate</h4>
            <ul className="space-y-3">
              {['home', 'features', 'faq', 'contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollTo(item)}
                    className="footer-link text-slate-500 text-sm capitalize"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-black text-white text-xs mb-5 uppercase tracking-[0.15em]">Account</h4>
            <ul className="space-y-3">
              {[
                { label: 'Sign Up',     path: '/signup'              },
                { label: 'Log In',      path: '/login'               },
                { label: 'Dashboard',   path: '/dashboard'           },
                { label: 'Leaderboard', path: '/leaderboard/graphs'  },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="footer-link text-slate-500 text-sm"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-700 text-xs">
            © {new Date().getFullYear()} AIQuiz. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-600 text-xs">All systems operational</span>
            </div>
            <span className="text-slate-800 text-xs">·</span>
            <span className="text-slate-700 text-xs">Built with ❤️ in India</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer