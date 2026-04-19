import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const NAV_LINKS = ['home', 'features', 'faq', 'contact']

const Navbar = () => {
  const navigate    = useNavigate()
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [activeLink,setActiveLink]= useState('home')
  const [hovered,   setHovered]   = useState(null)
  const indicatorRef = useRef(null)
  const navRef       = useRef(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
    setActiveLink(id)
  }

  return (
    <>
      <style>{`
        @keyframes navSlideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes menuSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-link-underline::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #06b6d4, #3b82f6);
          border-radius: 9999px;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .nav-link-underline:hover::after,
        .nav-link-underline.active::after {
          transform: scaleX(1);
        }
      `}</style>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-[#020817]/85 backdrop-blur-3xl border-b border-cyan-500/10 shadow-2xl shadow-black/50'
          : 'bg-transparent'
      }`} style={{ animation: 'navSlideDown 0.6s ease forwards' }}>

        {/* Animated top border */}
        <div className={`absolute top-0 left-0 right-0 h-px transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.6), rgba(59,130,246,0.4), transparent)' }} />

        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 opacity-70 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-500 scale-90 group-hover:scale-110" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow duration-500">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                AI<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Quiz</span>
              </span>
              <div className="text-[9px] text-cyan-400/60 tracking-[0.2em] uppercase font-medium -mt-0.5 group-hover:text-cyan-400/90 transition-colors duration-300">Adaptive Learning</div>
            </div>
          </div>

          {/* Desktop nav pill */}
          <div ref={navRef} className="hidden md:flex items-center gap-0.5 bg-white/[0.04] border border-white/10 rounded-2xl px-1.5 py-1.5 backdrop-blur-xl relative">
            {/* Sliding active background */}
            {NAV_LINKS.map((item) => (
              <button
                key={item}
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => scrollTo(item)}
                className={`relative px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-300 z-10 ${
                  activeLink === item
                    ? 'text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeLink === item && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30" />
                )}
                {hovered === item && activeLink !== item && (
                  <div className="absolute inset-0 rounded-xl bg-white/5 transition-all duration-200" />
                )}
                <span className="relative">{item}</span>
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="group relative px-5 py-2 text-sm font-semibold text-cyan-400 border border-cyan-400/25 rounded-xl overflow-hidden transition-all duration-300 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/15 hover:scale-105"
            >
              <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/8 transition-all duration-300" />
              <span className="relative">Log In</span>
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="group relative px-5 py-2 text-sm font-bold text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/35 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 group-hover:from-cyan-400 group-hover:to-blue-500" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Get Started</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`w-5 h-0.5 rounded-full transition-all duration-400 ${menuOpen ? 'bg-cyan-400 rotate-45 translate-y-2' : 'bg-white'}`} />
            <span className={`w-5 h-0.5 rounded-full transition-all duration-400 ${menuOpen ? 'opacity-0 scale-x-0' : 'bg-white'}`} />
            <span className={`w-5 h-0.5 rounded-full transition-all duration-400 ${menuOpen ? 'bg-cyan-400 -rotate-45 -translate-y-2' : 'bg-white'}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-500 overflow-hidden ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-[#020c1b]/97 backdrop-blur-2xl border-t border-cyan-500/10 px-5 py-5 flex flex-col gap-2">
            {NAV_LINKS.map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item)}
                className={`relative text-left py-2.5 px-4 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                  activeLink === item
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item}
              </button>
            ))}
            <div className="flex gap-3 pt-3 border-t border-white/5 mt-1">
              <button onClick={() => { navigate('/login'); setMenuOpen(false) }}
                className="flex-1 py-2.5 text-sm font-semibold text-cyan-400 border border-cyan-400/30 rounded-xl hover:bg-cyan-400/10 transition-all">
                Log In
              </button>
              <button onClick={() => { navigate('/signup'); setMenuOpen(false) }}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:opacity-90 transition-all">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar