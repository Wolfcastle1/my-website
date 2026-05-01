import { useEffect, useRef, useState } from 'react'
import './TypingGame.css'
import { useTypingGame } from './useTypingGame'

function TypingGame({ wordList, transitionDuration = 250 }) {
  const inputRef = useRef(null)
  const { active, upcoming, third, typed, transitioning, lineId, wpm, accuracy, started, handleKeyDown } =
    useTypingGame({ wordList, transitionDuration })

  const [isFocused, setIsFocused] = useState(false)
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

  useEffect(() => {
    if (!isTouchDevice) {
      inputRef.current?.focus()
      setIsFocused(true)
    }
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
