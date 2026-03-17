import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

const INTRO_LINES = [
  [{ text: 'Welcome!' }],
  [
    { text: 'Explore and have fun!' },
  ],
  [{ text: 'Also... This terminal has some cool features!', className: 'terminal-advice' }], 
  [{ text: 'Try out: ', className: 'terminal-highlight' }],
  [{ text: ' whoami', className: 'terminal-advice' }],
  [{ text: ' skills', className: 'terminal-advice' }],
  [{ text: ' contact', className: 'terminal-advice' }],
]

const ERROR_MESSAGES = [
  "I'm sorry, Dave. I'm afraid I can't do that",
  "We are all, by any practical definition of the words, foolproof and incapable of error",
  "** You Must Construct Additional Pylons **",
  "418: I'm a teapot",
  "There is an old saying in Tennessee — I know it's in Texas, probably in Tennessee — that says, fool me once, shame on... shame on you. Fool me — you can't get fooled again.",
  "It's easy to confuse 'what is' with 'what ought to be,' especially when 'what is' has worked out in your favor.",
  "Not all those who wander are lost.",
]

const FALLBACK_MESSAGE = "[Index out of bounds]: You've reached the end of my series of quotes :)"

const TYPING_SPEED = 30
const LINE_DELAY = 350

function getLineLength(line) {
  return line.reduce((sum, seg) => sum + seg.text.length, 0)
}

function renderPartialLine(lineSegments, charsTyped, onAction) {
  let remaining = charsTyped
  return lineSegments.map((seg, i) => {
    if (remaining <= 0) return null
    const visible = Math.min(remaining, seg.text.length)
    const text = seg.text.slice(0, visible)
    remaining -= visible
    const isFullyTyped = visible === seg.text.length
    if (seg.action && isFullyTyped) {
      return (
        <span key={i} className="terminal-link" style={{ cursor: 'pointer' }} onClick={() => onAction(seg.action)}>
          {text}
        </span>
      )
    }
    return <span key={i} className={seg.className || ''}>{text}</span>
  })
}

const TerminalContent = forwardRef(function TerminalContent({ active, onAction }, ref) {
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [completedLines, setCompletedLines] = useState([])
  const [userInput, setUserInput] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [exchanges, setExchanges] = useState([])
  const [pending, setPending] = useState(null)
  const [cleared, setCleared] = useState(false)

  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const messagePoolRef = useRef([...ERROR_MESSAGES].sort(() => Math.random() - 0.5))
  const commandHistoryRef = useRef([])
  const historyIndexRef = useRef(-1)

  useImperativeHandle(ref, () => ({
    reset() {
      setCurrentLine(0)
      setCurrentChar(0)
      setCompletedLines([])
      setUserInput('')
      setExchanges([])
      setPending(null)
      setCleared(false)
      messagePoolRef.current = [...ERROR_MESSAGES].sort(() => Math.random() - 0.5)
    },
  }))

  // Intro lines typing effect
  useEffect(() => {
    if (!active) return
    if (currentLine >= INTRO_LINES.length) return

    const line = INTRO_LINES[currentLine]
    const lineLength = getLineLength(line)

    if (currentChar < lineLength) {
      const timer = setTimeout(() => setCurrentChar(c => c + 1), TYPING_SPEED)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setCompletedLines(prev => [...prev, currentLine])
        setCurrentLine(l => l + 1)
        setCurrentChar(0)
      }, LINE_DELAY)
      return () => clearTimeout(timer)
    }
  }, [active, currentLine, currentChar])

  // Response typing effect
  useEffect(() => {
    if (!pending) return

    const currentResponseLine = pending.lines[pending.lineIdx]

    if (pending.charIdx < getLineLength(currentResponseLine)) {
      const timer = setTimeout(() => setPending(p => ({ ...p, charIdx: p.charIdx + 1 })), TYPING_SPEED)
      return () => clearTimeout(timer)
    } else if (pending.lineIdx < pending.lines.length - 1) {
      const timer = setTimeout(() => setPending(p => ({ ...p, lineIdx: p.lineIdx + 1, charIdx: 0 })), LINE_DELAY)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setExchanges(prev => [...prev, { cmd: pending.cmd, lines: pending.lines }])
        setPending(null)
      }, LINE_DELAY)
      return () => clearTimeout(timer)
    }
  }, [pending])

  const isTypingDone = currentLine >= INTRO_LINES.length
  const showInput = isTypingDone && pending === null

  // Auto-scroll to bottom
  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    const isNearBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 60
    if (isNearBottom) body.scrollTop = body.scrollHeight
  }, [currentChar, currentLine, pending, exchanges])

  useEffect(() => {
    if (showInput) inputRef.current?.focus()
  }, [showInput])

  const handleSubmit = () => {
    if (!userInput.trim()) return
    const cmd = userInput.trim().toLowerCase()

    const history = commandHistoryRef.current
    if (history[history.length - 1] !== cmd) history.push(cmd)
    historyIndexRef.current = -1

    if (cmd === 'clear') {
      setExchanges([])
      setCleared(true)
      setUserInput('')
      return
    }

    let responseLines
    switch (cmd) {
      case 'ls':
        responseLines = [
          [{ text: ' passwords.txt', className: 'terminal-advice' }],
          [{ text: 'wait...', className: 'terminal-warning' }],
          [{ text: 'security breach detected... initiating self-destruct sequence...', className: 'terminal-error-msg' }],
          [{ text: '3...', className: 'terminal-error-code' }],
          [{ text: '2...', className: 'terminal-error-code' }],
          [{ text: '1...', className: 'terminal-error-code' }],
          [{ text: 'just kidding ;)', className: 'terminal-advice' }],
        ]
        break
      case 'help':
        responseLines = [
          [{ text: 'available commands:', className: 'terminal-highlight' }],
          [{ text: '  whoami   — learn more about me', className: 'terminal-advice' }],
          [{ text: '  skills   — see the tools I am comfortable with', className: 'terminal-advice' }],
          [{ text: '  contact  — find me online', className: 'terminal-advice' }],
          [{ text: '  about    — open the About Me window', className: 'terminal-advice' }],
          [{ text: '  links    — open the Links window', className: 'terminal-advice' }],
          [{ text: '  ls       — list files (proceed with caution)', className: 'terminal-warning' }],
          [{ text: '  clear    — clear the terminal', className: 'terminal-advice' }],
        ]
        break
      case 'whoami':
        responseLines = [
          [{ text: 'Sam Thomas', className: 'terminal-highlight' }],
          [{ text: 'Chicago, IL', className: 'terminal-highlight' }],
          [{ text: 'Software Engineer  ·  JPMorgan Chase 2021 – Present', className: 'terminal-advice' }],
          [{ text: 'Computer Science ·  Northern Illinois University · 2017 - 2021', className: 'terminal-advice' }],
        ]
        break
      case 'skills':
        responseLines = [
          [{ text: 'Languages & Frameworks', className: 'terminal-highlight' }],
          [{ text: '  Java', className: 'terminal-advice' }],
          [{ text: '  SpringBoot', className: 'terminal-advice' }],
          [{ text: '  React', className: 'terminal-advice' }],
          [{ text: 'Databases', className: 'terminal-highlight' }],
          [{ text: '  Oracle', className: 'terminal-advice' }],
          [{ text: '  MongoDB', className: 'terminal-advice' }],
          [{ text: '  PostgreSQL', className: 'terminal-advice' }],
        ]
        break
      case 'contact':
        responseLines = [
          [{ text: 'GitHub    ', className: 'terminal-highlight' }],
          [{ text: '  →  github.com/Wolfcastle1', className: 'terminal-advice' }],
          [{ text: 'LinkedIn  ', className: 'terminal-highlight' }],
          [{ text: '  →  linkedin.com/in/samuel-thomas-464076163', className: 'terminal-advice' }],
        ]
        break
      case 'about':
        onAction('about')
        responseLines = [[{ text: 'Opening About Me...', className: 'terminal-highlight' }]]
        break
      case 'links':
        onAction('links')
        responseLines = [[{ text: 'Opening Links...', className: 'terminal-highlight' }]]
        break
      default: {
        const funnyMsg = messagePoolRef.current.length > 0
          ? messagePoolRef.current.pop()
          : FALLBACK_MESSAGE
        responseLines = [
          [{ text: '[ERROR]', className: 'terminal-error-code' }],
          [{ text: funnyMsg, className: 'terminal-error-msg' }],
        ]
      }
    }

    setPending({ cmd: userInput, lines: responseLines, lineIdx: 0, charIdx: 0 })
    setUserInput('')
  }

  return (
    <div className="terminal-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
      {!cleared && INTRO_LINES.map((line, lineIdx) => {
        if (lineIdx > currentLine) return null
        const isCompleted = completedLines.includes(lineIdx)
        const charsToShow = lineIdx < currentLine ? getLineLength(line) : currentChar
        return (
          <div key={lineIdx} className="terminal-line">
            {renderPartialLine(line, charsToShow, onAction)}
            {!isCompleted && lineIdx === currentLine && (
              <span className="terminal-cursor">▋</span>
            )}
          </div>
        )
      })}

      {isTypingDone && exchanges.map((exchange, i) => (
        <div key={i}>
          <div className="terminal-line">
            <span className="terminal-prompt">$ </span>
            <span>{exchange.cmd}</span>
          </div>
          {exchange.lines.map((line, lineIdx) => (
            <div key={lineIdx} className="terminal-line">
              {renderPartialLine(line, getLineLength(line), onAction)}
            </div>
          ))}
        </div>
      ))}

      {pending && (
        <div>
          <div className="terminal-line">
            <span className="terminal-prompt">$ </span>
            <span>{pending.cmd}</span>
          </div>
          {pending.lines.map((line, lineIdx) => {
            if (lineIdx > pending.lineIdx) return null
            const chars = lineIdx < pending.lineIdx ? getLineLength(line) : pending.charIdx
            const isCurrent = lineIdx === pending.lineIdx && chars < getLineLength(line)
            return (
              <div key={lineIdx} className="terminal-line">
                {renderPartialLine(line, chars, onAction)}
                {isCurrent && <span className="terminal-cursor">▋</span>}
              </div>
            )
          })}
        </div>
      )}

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
              onKeyDown={e => {
                if (e.key === 'Enter') { handleSubmit(); return }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  const history = commandHistoryRef.current
                  if (history.length === 0) return
                  const newIndex = historyIndexRef.current === -1
                    ? history.length - 1
                    : Math.max(0, historyIndexRef.current - 1)
                  historyIndexRef.current = newIndex
                  setUserInput(history[newIndex])
                  return
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  if (historyIndexRef.current === -1) return
                  const newIndex = historyIndexRef.current + 1
                  if (newIndex >= commandHistoryRef.current.length) {
                    historyIndexRef.current = -1
                    setUserInput('')
                  } else {
                    historyIndexRef.current = newIndex
                    setUserInput(commandHistoryRef.current[newIndex])
                  }
                  return
                }
              }}
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
  )
})

export default TerminalContent
