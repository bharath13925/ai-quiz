import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate   = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('home')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
    setActiveLink(id)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
      scrolled
        ? 'bg-[#020817]/90 backdrop-blur-2xl border-b border-cyan-500/10 shadow-2xl shadow-cyan-500/5'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity blur-sm" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <div>
            <span className="font-black text-xl text-white tracking-tight">AI<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Quiz</span></span>
            <div className="text-[9px] text-cyan-400/60 tracking-[0.2em] uppercase font-medium -mt-0.5">Adaptive Learning</div>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-2xl px-2 py-1.5 backdrop-blur-xl">
          {['home', 'features', 'faq', 'contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
                activeLink === item
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-sm font-semibold text-cyan-400 border border-cyan-400/30 rounded-xl hover:bg-cyan-400/10 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="relative px-5 py-2 text-sm font-bold text-white rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 group-hover:from-cyan-400 group-hover:to-blue-500" />
            <span className="relative">Get Started</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-500 overflow-hidden ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#020817]/95 backdrop-blur-2xl border-t border-cyan-500/10 px-6 py-6 flex flex-col gap-3">
          {['home', 'features', 'faq', 'contact'].map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className="text-slate-300 hover:text-cyan-400 text-sm font-semibold capitalize text-left py-2 border-b border-white/5 transition-colors"
            >
              {item}
            </button>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { navigate('/login'); setMenuOpen(false) }}
              className="flex-1 py-2.5 text-sm font-semibold text-cyan-400 border border-cyan-400/30 rounded-xl hover:bg-cyan-400/10 transition-all"
            >
              Log In
            </button>
            <button
              onClick={() => { navigate('/signup'); setMenuOpen(false) }}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:opacity-90 transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar