import { useEffect, useRef, useState } from 'react'
import './TypingGame.css'
import { useTypingGame } from './useTypingGame'

// Mirrors the typing window sizing in LandingPage and the CSS clamps in
// TypingGame.css so generated lines fit the visible stage on any viewport.
function computeLineCharLimits() {
  const vw = window.innerWidth
  const winW = Math.min(720, vw * 0.9)
  const pad = Math.min(28, Math.max(16, vw * 0.04))
  const stageW = winW - 2 * pad
  const fontSizePx = Math.min(22.4, Math.max(16, vw * 0.025))
  // Monospace glyphs are ~0.6em wide; letter-spacing: 0.02em adds a little.
  const charW = fontSizePx * 0.62
  const max = Math.max(14, Math.min(44, Math.floor(stageW / charW) - 1))
  return { maxChars: max, minChars: Math.max(8, max - 6) }
}

function TypingGame({ wordList, transitionDuration = 250 }) {
  const inputRef = useRef(null)
  const [{ minChars, maxChars }, setLimits] = useState(computeLineCharLimits)
  const { active, upcoming, third, typed, transitioning, lineId, wpm, accuracy, started, handleKeyDown } =
    useTypingGame({ wordList, transitionDuration, minChars, maxChars })

  const [isFocused, setIsFocused] = useState(false)
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

  useEffect(() => {
    if (!isTouchDevice) {
      inputRef.current?.focus()
      setIsFocused(true)
    }
  }, [])

  useEffect(() => {
    const onResize = () => setLimits(computeLineCharLimits())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const focusInput = () => inputRef.current?.focus()

  return (
    <div
      className="typing-game"
      onClick={focusInput}
      style={{ '--transition-duration': `${transitionDuration}ms` }}
    >
      <input
        ref={inputRef}
        className="typing-input"
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
        aria-label="Typing game input"
      />

      {isTouchDevice && !isFocused && (
        <div className="typing-tap-hint" aria-hidden="true">tap to type</div>
      )}

      <div className="typing-stage">
        <div
          key={`shifter-${lineId}`}
          className={`typing-shifter${transitioning ? ' is-shifting' : ''}`}
        >
          <div className={`typing-line typing-line-active${transitioning ? ' is-leaving' : ''}`}>
            {active.split('').map((ch, i) => {
              let state = 'untyped'
              if (i < typed.length) state = typed[i] === ch ? 'correct' : 'incorrect'
              const isCursor = i === typed.length && !transitioning
              return (
                <span
                  key={i}
                  className={`typing-char typing-char-${state}${isCursor ? ' typing-char-cursor' : ''}`}
                >
                  {ch === ' ' ? ' ' : ch}
                </span>
              )
            })}
          </div>

          <div className={`typing-line typing-line-upcoming${transitioning ? ' is-promoting' : ''}`}>
            {upcoming.split('').map((ch, i) => (
              <span key={i} className="typing-char typing-char-untyped">
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </div>

          <div className={`typing-line typing-line-third${transitioning ? ' is-revealing' : ''}`}>
            {third.split('').map((ch, i) => (
              <span key={i} className="typing-char typing-char-untyped">
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="typing-stats">
        <span className="typing-stat">
          <span className="typing-stat-label">WPM</span>
          <span className="typing-stat-value">{started ? Math.round(wpm) : '—'}</span>
        </span>
        <span className="typing-stat">
          <span className="typing-stat-label">Accuracy</span>
          <span className="typing-stat-value">{started ? `${Math.round(accuracy)}%` : '—'}</span>
        </span>
      </div>
    </div>
  )
}

export default TypingGame
