import React, { useState, useRef, useEffect } from 'react'

const faqs = [
  { icon: '🧠', q: 'How does the AI adapt quiz difficulty?',
    a: 'Our XGBoost model analyses every window of 5 questions — measuring accuracy, average response time, and correct-answer streak. After each window it predicts the optimal difficulty (easy, medium, or hard) for the next 5 questions in real time.' },
  { icon: '📚', q: 'What topics are available?',
    a: 'AIQuiz currently covers four core CS topics: Graphs, Arrays, DBMS (Database Management Systems), and Operating Systems. Each topic has questions across three difficulty levels with unique scoring weights.' },
  { icon: '🏆', q: 'How is my score calculated?',
    a: 'Score = (Correct Answers × Difficulty Weight) ÷ Average Time × 100. Weights: Easy ×1, Medium ×1.5, Hard ×2. Timed-out questions count as incorrect with the full 20s penalty applied.' },
  { icon: '🔄', q: 'What happens if I refresh during a quiz?',
    a: 'Your session is automatically saved in both sessionStorage and MongoDB. When you return, you will resume from exactly the question you left off on — no data is lost, and your timer state is restored accurately.' },
  { icon: '📊', q: 'How many questions are in each quiz?',
    a: 'Each quiz contains exactly 20 questions split across 4 windows of 5. After each window the AI re-evaluates your performance and selects the next difficulty level for the upcoming window.' },
  { icon: '🔐', q: 'Is my Firebase UID stored securely?',
    a: 'Yes. Every time you sign in with Google (or any Firebase method), your Firebase UID is synced to your MongoDB user document, ensuring your identity and history are consistent across all sessions and devices.' },
]

const FAQItem = ({ faq, index, isOpen, onToggle }) => {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  return (
    <div
      className="group relative rounded-2xl border transition-all duration-500 overflow-hidden"
      style={{
        border: isOpen ? '1px solid rgba(6,182,212,0.35)' : '1px solid rgba(255,255,255,0.06)',
        background: isOpen
          ? 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(59,130,246,0.03))'
          : 'rgba(255,255,255,0.01)',
        boxShadow: isOpen ? '0 0 40px rgba(6,182,212,0.08)' : 'none',
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full transition-all duration-500"
        style={{
          background: isOpen ? 'linear-gradient(180deg, #22d3ee, #3b82f6)' : 'transparent',
          opacity: isOpen ? 1 : 0,
        }}
      />

      <button
        className="w-full flex items-center gap-4 px-6 py-5 text-left"
        onClick={onToggle}
      >
        {/* Icon */}
        <span
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-400"
          style={{
            background: isOpen ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
            border: isOpen ? '1px solid rgba(6,182,212,0.3)' : '1px solid rgba(255,255,255,0.08)',
            transform: isOpen ? 'scale(1.05)' : 'scale(1)',
            boxShadow: isOpen ? '0 4px 16px rgba(6,182,212,0.2)' : 'none',
          }}
        >
          {faq.icon}
        </span>

        {/* Question */}
        <span
          className="flex-1 font-bold text-base transition-colors duration-300"
          style={{ color: isOpen ? '#67e8f9' : '#f1f5f9' }}
        >
          {faq.q}
        </span>

        {/* Toggle icon */}
        <span
          className="flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-400"
          style={{
            border: isOpen ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.1)',
            background: isOpen ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.04)',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            color: isOpen ? '#22d3ee' : '#64748b',
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>

      {/* Answer with smooth height animation */}
      <div style={{ height, overflow: 'hidden', transition: 'height 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
        <div ref={contentRef} className="px-6 pb-6 pl-20">
          <p className="text-slate-300 text-sm leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  )
}

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null)
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="faq" className="relative bg-[#030f1f] py-28 px-6 overflow-hidden">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>

      {/* Side accent lines */}
      <div className="absolute top-1/2 left-0 w-px h-72 -translate-y-1/2 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
      <div className="absolute top-1/2 right-0 w-px h-72 -translate-y-1/2 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute top-10 right-24 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-10 left-24 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />

      <div className="max-w-3xl mx-auto" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 tracking-[0.2em] uppercase bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            FAQ
          </div>
          <h2 className="font-black text-5xl md:text-6xl text-white mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
            Got{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              questions?
            </span>
          </h2>
          <p className="text-slate-400 text-lg">Everything you need to know about AIQuiz.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <FAQItem
                faq={faq}
                index={i}
                isOpen={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`mt-12 text-center p-6 rounded-2xl transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '500ms', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-slate-500 text-sm mb-3">Still have questions?</p>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="group inline-flex items-center gap-2 text-cyan-400 font-semibold text-sm hover:text-cyan-300 transition-colors"
          >
            Contact our team
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default FAQ