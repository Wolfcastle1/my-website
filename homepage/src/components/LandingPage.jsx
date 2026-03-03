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
  const [exchanges, setExchanges] = useState([])
  const [pending, setPending] = useState(null)
  const [cleared, setCleared] = useState(false)
  const [terminalVisible, setTerminalVisible] = useState(false)
  const [terminalClosing, setTerminalClosing] = useState(false)
  const [iconPositions, setIconPositions] = useState(null)
  const [terminalSize] = useState(() => ({
    width:  Math.min(720, window.innerWidth  * 0.9),
    height: window.innerHeight * 0.5,
  }))
  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const dockIconRef = useRef(null)
  const aboutIconRef = useRef(null)
  const linksIconRef = useRef(null)
  const dockOffset = useRef({ x: 0, y: 0 })
  const dragMoved = useRef(false)
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

    if (pending.charIdx < currentResponseLine.text.length) {
      const timer = setTimeout(() => {
        setPending(p => ({ ...p, charIdx: p.charIdx + 1 }))
      }, TYPING_SPEED)
      return () => clearTimeout(timer)
    } else if (pending.lineIdx < pending.lines.length - 1) {
      const timer = setTimeout(() => {
        setPending(p => ({ ...p, lineIdx: p.lineIdx + 1, charIdx: 0 }))
      }, LINE_DELAY)
      return () => clearTimeout(timer)
    } else {
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

  // Initialize icon positions
  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const hPad = Math.max(40, vw * 0.08)
    setIconPositions({
      about:    { x: hPad,            y: vh * 0.5 - 50 },
      links:    { x: vw - hPad - 80,  y: vh * 0.5 - 50 },
      terminal: { x: hPad,            y: vh - 140       },
    })
  }, [])

  // Clamp icon positions when viewport resizes
  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const clamp = (pos, ref) => {
        const w = ref.current?.offsetWidth  ?? 80
        const h = ref.current?.offsetHeight ?? 90
        return {
          x: Math.min(Math.max(0, pos.x), vw - w),
          y: Math.min(Math.max(0, pos.y), vh - h),
        }
      }
      setIconPositions(prev => {
        if (!prev) return prev
        return {
          about:    clamp(prev.about,    aboutIconRef),
          links:    clamp(prev.links,    linksIconRef),
          terminal: clamp(prev.terminal, dockIconRef),
        }
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Open terminal on initial page load
  useEffect(() => {
    const icon = dockIconRef.current
    if (icon) {
      const rect = icon.getBoundingClientRect()
      dockOffset.current = {
        x: (rect.left + rect.width / 2) - window.innerWidth / 2,
        y: (rect.top + rect.height / 2) - window.innerHeight / 2,
      }
    }
    setTerminalVisible(true)
  }, [])

  const resetTerminalContent = () => {
    setAnimationDone(false)
    setCurrentLine(0)
    setCurrentChar(0)
    setCompletedLines([])
    setUserInput('')
    setExchanges([])
    setPending(null)
    setCleared(false)
    messagePoolRef.current = [...ERROR_MESSAGES].sort(() => Math.random() - 0.5)
  }

  const handleIconMouseDown = (e, key) => {
    e.preventDefault()
    dragMoved.current = false
    const startMouseX = e.clientX
    const startMouseY = e.clientY
    const { x: startX, y: startY } = iconPositions[key]

    const onMouseMove = (e) => {
      const dx = e.clientX - startMouseX
      const dy = e.clientY - startMouseY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.current = true
      setIconPositions(prev => ({
        ...prev,
        [key]: { x: startX + dx, y: startY + dy },
      }))
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      document.body.classList.remove('dragging-icon')
    }

    document.body.classList.add('dragging-icon')
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const handleDockIconClick = () => {
    if (dragMoved.current) { dragMoved.current = false; return }
    if (terminalVisible) return

    const icon = dockIconRef.current
    if (icon) {
      const rect = icon.getBoundingClientRect()
      dockOffset.current = {
        x: (rect.left + rect.width / 2) - window.innerWidth / 2,
        y: (rect.top + rect.height / 2) - window.innerHeight / 2,
      }
    }

    resetTerminalContent()
    setTerminalVisible(true)
  }

  const handleAnimationEnd = () => {
    if (terminalClosing) {
      setTerminalVisible(false)
      setTerminalClosing(false)
    } else {
      setAnimationDone(true)
    }
  }

  const handleSubmit = () => {
    if (!userInput.trim()) return
    const cmd = userInput.trim().toLowerCase()

    if (cmd === 'clear') {
      setExchanges([])
      setCleared(true)
      setUserInput('')
      return
    }

    let lines
    switch (cmd) {
      case 'ls':
        lines = [
          { text: ' passwords.txt' },
          { text: 'wait...' },
          { text: 'security breach detected... initiating self-destruct sequence...', className: 'terminal-warning' },
          { text: '3...', className: 'terminal-warning' },
          { text: '2...', className: 'terminal-warning' },
          { text: '1...', className: 'terminal-warning' },
          { text: 'just kidding ;)' },
        ]
        break
      case 'help':
        lines = [
          { text: '...knock, and the door will be opnend.', className: 'terminal-advice' },
        ]
        break
      case 'knock':
        lines = [
          { text: 'usage: knock <door-name>', className: 'terminal-error-code' },
        ]
        break
      default: {
        const funnyMsg = messagePoolRef.current.length > 0
          ? messagePoolRef.current.pop()
          : FALLBACK_MESSAGE
        lines = [
          { text: '[ERROR]', className: 'terminal-error-code' },
          { text: funnyMsg, className: 'terminal-error-msg' },
        ]
      }
    }

    setPending({ cmd: userInput, lines, lineIdx: 0, charIdx: 0 })
    setUserInput('')
  }

  return (
    <main className="landing-page">
      {iconPositions && (
        <>
          <Link
            ref={aboutIconRef}
            to="/about"
            className="desktop-icon"
            style={{ position: 'absolute', left: iconPositions.about.x, top: iconPositions.about.y }}
            onMouseDown={e => handleIconMouseDown(e, 'about')}
            onClick={e => { if (dragMoved.current) { e.preventDefault(); dragMoved.current = false } }}
          >
            <span className="desktop-icon-emoji">📖</span>
            <span className="desktop-icon-label">About Me</span>
          </Link>

          <Link
            ref={linksIconRef}
            to="/links"
            className="desktop-icon"
            style={{ position: 'absolute', left: iconPositions.links.x, top: iconPositions.links.y }}
            onMouseDown={e => handleIconMouseDown(e, 'links')}
            onClick={e => { if (dragMoved.current) { e.preventDefault(); dragMoved.current = false } }}
          >
            <span className="desktop-icon-emoji">🔗</span>
            <span className="desktop-icon-label">Links</span>
          </Link>

          <button
            ref={dockIconRef}
            className="desktop-icon dock-terminal-icon"
            style={{ position: 'absolute', left: iconPositions.terminal.x, top: iconPositions.terminal.y }}
            onMouseDown={e => handleIconMouseDown(e, 'terminal')}
            onClick={handleDockIconClick}
          >
            <span className="desktop-icon-emoji">💻</span>
            <span className="desktop-icon-label">Terminal</span>
          </button>
        </>
      )}

      {terminalVisible && (
        <div
          className={`terminal-window${terminalClosing ? ' closing' : ''}`}
          style={{
            '--dock-x': `${dockOffset.current.x}px`,
            '--dock-y': `${dockOffset.current.y}px`,
            width:  terminalSize.width,
            height: terminalSize.height,
          }}
          onAnimationEnd={handleAnimationEnd}
        >
          <div className="terminal-header">
            <span
              className="terminal-dot red"
              onClick={() => !terminalClosing && setTerminalClosing(true)}
            />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">sam@portfolio ~ </span>
          </div>
          <div className="terminal-body" ref={bodyRef}>
            {/* Initial auto-typed lines */}
            {!cleared && lines.map((line, lineIdx) => {
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
                {exchange.lines.map((line, lineIdx) => (
                  <div key={lineIdx} className={`terminal-line ${line.className || ''}`}>
                    {line.text}
                  </div>
                ))}
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
                  const chars = lineIdx < pending.lineIdx ? line.text.length : pending.charIdx
                  const isCurrent = lineIdx === pending.lineIdx && chars < line.text.length
                  return (
                    <div key={lineIdx} className={`terminal-line ${line.className || ''}`}>
                      {line.text.slice(0, chars)}
                      {isCurrent && <span className="terminal-cursor">▋</span>}
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
      )}
    </main>
  )
}

export default LandingPage
