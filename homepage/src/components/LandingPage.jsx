import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'

const lines = [
  [{ text: 'Welcome to https://sam-thomas.dev' }],
  [{ text: 'This is my personal website' }],
  [
    { text: 'Check out my ' },
    { text: 'about page', href: '/about' },
    { text: ' and my ' },
    { text: 'links', href: '/links' },
  ],
]

const ERROR_MESSAGES = [

  "I'm sorry, Dave. I'm afraid I can't do that",
  "We are all, by any practical definition of the words, foolproof and incapable of error",
  "The cake is a lie",
  "** You Must Construct Additional Pylons **",
  "418: I'm a teapot",
  "There is an old saying in Tennessee — I know it's in Texas, probably in Tennessee — that says, fool me once, shame on... shame on you. Fool me — you can't get fooled again.",
  "When Stanley came to a set of two open doors, he entered the door on his left.",
  "It's easy to confuse 'what is' with 'what ought to be,' especially when 'what is' has worked out in your favor.", 
  "Not all those who wander are lost.",
  "",  
]

const FALLBACK_MESSAGE = "[Index out of bounds]: You've reached the end of my series of quotes :)"

const TYPING_SPEED = 30
const LINE_DELAY = 350

function getLineLength(line) {
  return line.reduce((sum, seg) => sum + seg.text.length, 0)
}

function renderPartialLine(lineSegments, charsTyped) {
  let remaining = charsTyped
  return lineSegments.map((seg, i) => {
    if (remaining <= 0) return null
    const visible = Math.min(remaining, seg.text.length)
    const text = seg.text.slice(0, visible)
    remaining -= visible
    const isFullyTyped = visible === seg.text.length
    if (seg.href && isFullyTyped) {
      return (
        <Link key={i} to={seg.href} className="terminal-link">
          {text}
        </Link>
      )
    }
    return <span key={i}>{text}</span>
  })
}

function LandingPage() {
  const [animationDone, setAnimationDone] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [completedLines, setCompletedLines] = useState([])
  const [userInput, setUserInput] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  // exchanges: fully typed { cmd, lines: [errorLine, funnyLine] }
  const [exchanges, setExchanges] = useState([])
  // pending: response currently being typed out
  const [pending, setPending] = useState(null)
  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const messagePoolRef = useRef([...ERROR_MESSAGES].sort(() => Math.random() - 0.5))

  // Initial lines typing effect
  useEffect(() => {
    if (!animationDone) return
    if (currentLine >= lines.length) return

    const line = lines[currentLine]
    const lineLength = getLineLength(line)

    if (currentChar < lineLength) {
      const timer = setTimeout(() => {
        setCurrentChar(c => c + 1)
      }, TYPING_SPEED)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setCompletedLines(prev => [...prev, currentLine])
        setCurrentLine(l => l + 1)
        setCurrentChar(0)
      }, LINE_DELAY)
      return () => clearTimeout(timer)
    }
  }, [animationDone, currentLine, currentChar])

  // Response typing effect
  useEffect(() => {
    if (!pending) return

    const currentResponseLine = pending.lines[pending.lineIdx]

    if (pending.charIdx < currentResponseLine.length) {
      const timer = setTimeout(() => {
        setPending(p => ({ ...p, charIdx: p.charIdx + 1 }))
      }, TYPING_SPEED)
      return () => clearTimeout(timer)
    } else if (pending.lineIdx < pending.lines.length - 1) {
      // Move to next response line
      const timer = setTimeout(() => {
        setPending(p => ({ ...p, lineIdx: p.lineIdx + 1, charIdx: 0 }))
      }, LINE_DELAY)
      return () => clearTimeout(timer)
    } else {
      // Response fully typed — commit to exchanges
      const timer = setTimeout(() => {
        setExchanges(prev => [...prev, { cmd: pending.cmd, lines: pending.lines }])
        setPending(null)
      }, LINE_DELAY)
      return () => clearTimeout(timer)
    }
  }, [pending])

  const isTypingDone = currentLine >= lines.length
  const showInput = isTypingDone && pending === null

  // Auto-scroll to bottom as content is added, unless user has scrolled up
  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    const isNearBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 60
    if (isNearBottom) {
      body.scrollTop = body.scrollHeight
    }
  }, [currentChar, currentLine, pending, exchanges])

  useEffect(() => {
    if (showInput) {
      inputRef.current?.focus()
    }
  }, [showInput])

  const handleSubmit = () => {
    if (!userInput.trim()) return
    const funnyMsg = messagePoolRef.current.length > 0
      ? messagePoolRef.current.pop()
      : FALLBACK_MESSAGE
    setPending({
      cmd: userInput,
      lines: ['[ERROR]', funnyMsg],
      lineIdx: 0,
      charIdx: 0,
    })
    setUserInput('')
  }

  return (
    <main className="landing-page">
      <div className="terminal-window" onAnimationEnd={() => setAnimationDone(true)}>
        <div className="terminal-header">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="terminal-title">sam@portfolio ~ </span>
        </div>
        <div className="terminal-body" ref={bodyRef}>
          {/* Initial auto-typed lines */}
          {lines.map((line, lineIdx) => {
            if (lineIdx > currentLine) return null
            const isCompleted = completedLines.includes(lineIdx)
            const charsToShow = lineIdx < currentLine ? getLineLength(line) : currentChar
            return (
              <div key={lineIdx} className="terminal-line">
                {renderPartialLine(line, charsToShow)}
                {!isCompleted && lineIdx === currentLine && (
                  <span className="terminal-cursor">▋</span>
                )}
              </div>
            )
          })}

          {/* Completed exchanges */}
          {isTypingDone && exchanges.map((exchange, i) => (
            <div key={i}>
              <div className="terminal-line">
                <span className="terminal-prompt">$ </span>
                <span>{exchange.cmd}</span>
              </div>
              <div className="terminal-line terminal-error-code">{exchange.lines[0]}</div>
              <div className="terminal-line terminal-error-msg">{exchange.lines[1]}</div>
            </div>
          ))}

          {/* Currently-typing response */}
          {pending && (
            <div>
              <div className="terminal-line">
                <span className="terminal-prompt">$ </span>
                <span>{pending.cmd}</span>
              </div>
              {pending.lines.map((line, lineIdx) => {
                if (lineIdx > pending.lineIdx) return null
                const chars = lineIdx < pending.lineIdx ? line.length : pending.charIdx
                const isCurrent = lineIdx === pending.lineIdx && chars < line.length
                return (
                  <div
                    key={lineIdx}
                    className={`terminal-line ${lineIdx === 0 ? 'terminal-error-code' : 'terminal-error-msg'}`}
                  >
                    {line.slice(0, chars)}
                    {isCurrent && <span className="terminal-cursor terminal-cursor-error">▋</span>}
                  </div>
                )
              })}
            </div>
          )}

          {/* Interactive input prompt */}
          {showInput && (
            <div
              className="terminal-line terminal-input-line"
              onClick={() => inputRef.current?.focus()}
            >
              <span className="terminal-prompt">$ </span>
              <div className="terminal-input-wrapper">
                <span className="terminal-input-mirror">{userInput}</span>
                {inputFocused && <span className="terminal-cursor">▋</span>}
                <input
                  ref={inputRef}
                  className="terminal-input-hidden"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default LandingPage
