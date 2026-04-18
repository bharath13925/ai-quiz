import React, { useState } from 'react'

const faqs = [
  {
    q: 'How does the AI adapt quiz difficulty?',
    a: 'Our XGBoost model analyses every window of 5 questions — measuring accuracy, average response time, and correct-answer streak. After each window it predicts the optimal difficulty (easy, medium, or hard) for the next 5 questions in real time.',
    icon: '🧠',
  },
  {
    q: 'What topics are available?',
    a: 'AIQuiz currently covers four core CS topics: Graphs, Arrays, DBMS (Database Management Systems), and Operating Systems. Each topic has questions across three difficulty levels with unique scoring weights.',
    icon: '📚',
  },
  {
    q: 'How is my score calculated?',
    a: 'Score = (Correct Answers × Difficulty Weight) ÷ Average Time × 100. Weights: Easy ×1, Medium ×1.5, Hard ×2. Timed-out questions count as incorrect with the full 20s penalty applied.',
    icon: '🏆',
  },
  {
    q: 'What happens if I refresh during a quiz?',
    a: 'Your session is automatically saved in both sessionStorage and MongoDB. When you return to the same quiz URL, you will resume from exactly the question you left off on — no data is lost.',
    icon: '🔄',
  },
  {
    q: 'How many questions are in each quiz?',
    a: 'Each quiz contains exactly 20 questions split across 4 windows of 5. After each window the AI re-evaluates your performance and selects the next difficulty level for the upcoming window.',
    icon: '📊',
  },
  {
    q: 'Is my Firebase UID stored securely?',
    a: 'Yes. Every time you sign in with Google (or any Firebase method), your Firebase UID is synced to your MongoDB user document, ensuring your identity and history are consistent across all sessions and devices.',
    icon: '🔐',
  },
]

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <section id="faq" className="relative bg-[#030f1f] py-28 px-6 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-px h-64 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-px h-64 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent -translate-y-1/2" />
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 tracking-[0.2em] uppercase bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            FAQ
          </div>
          <h2 className="font-black text-5xl md:text-6xl text-white mb-5">
            Got{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              questions?
            </span>
          </h2>
          <p className="text-slate-400 text-lg">Everything you need to know about AIQuiz.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i
            return (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                  isOpen
                    ? 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 to-blue-950/20'
                    : 'border-slate-800/60 bg-white/[0.02] hover:border-slate-700/80 hover:bg-white/[0.03]'
                }`}
              >
                {/* Glow when open */}
                {isOpen && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 pointer-events-none" />
                )}

                <button
                  className="w-full flex items-center gap-4 px-6 py-5 text-left group"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                >
                  <span className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${
                    isOpen ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-white/5 border border-white/10 group-hover:bg-white/10'
                  }`}>
                    {faq.icon}
                  </span>
                  <span className={`flex-1 font-bold text-base transition-colors duration-300 ${isOpen ? 'text-cyan-300' : 'text-white group-hover:text-cyan-100'}`}>
                    {faq.q}
                  </span>
                  <span className={`flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-500 ${
                    isOpen
                      ? 'border-cyan-400/50 bg-cyan-500/10 rotate-45 text-cyan-400'
                      : 'border-slate-700 text-slate-500 group-hover:border-slate-600 group-hover:text-slate-400'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>

                <div className={`transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-6 pb-6 pl-[4.25rem] text-slate-300 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <p className="text-slate-400 text-sm mb-3">Still have questions?</p>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-cyan-400 font-semibold text-sm hover:text-cyan-300 underline underline-offset-4 transition-colors"
          >
            Contact our team →
          </button>
        </div>
      </div>
    </section>
  )
}

export default FAQ