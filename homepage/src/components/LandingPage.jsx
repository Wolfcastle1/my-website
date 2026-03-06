import { useState, useEffect, useRef } from 'react'
import './LandingPage.css'
import Window from './Window'
import DesktopWidget from './DesktopWidget'

const lines = [
  [{ text: 'Welcome to https://sam-thomas.dev' }],
  [{ text: 'This is my personal website' }],
  [
    { text: 'Check out my ' },
    { text: 'about page', action: 'about' },
    { text: ' and my ' },
    { text: 'links', action: 'links' },
  ],
]

const LINKS = [
  { id: 'linkedin', label: 'LinkedIn', description: 'Connect with me professionally', url: 'https://www.linkedin.com/in/samuel-thomas-464076163/', icon: '💼' },
  { id: 'github',   label: 'GitHub',   description: 'Check out my projects and code',  url: 'https://github.com/Wolfcastle1', icon: '🐙' },
  { id: 'instagram',label: 'Instagram',description: 'Follow me on Instagram',          url: 'https://www.instagram.com/dummy_thicc_cavz', icon: '📸' },
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
    return <span key={i}>{text}</span>
  })
}

function LandingPage({ initialWindow = 'terminal' }) {
  // Terminal content state
  const [animationDone, setAnimationDone] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [completedLines, setCompletedLines] = useState([])
  const [userInput, setUserInput] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [exchanges, setExchanges] = useState([])
  const [pending, setPending] = useState(null)
  const [cleared, setCleared] = useState(false)

  // Window visibility states
  const [terminalVisible, setTerminalVisible] = useState(false)
  const [terminalClosing, setTerminalClosing] = useState(false)
  const [terminalPos, setTerminalPos] = useState(null)

  const [aboutVisible, setAboutVisible] = useState(false)
  const [aboutClosing, setAboutClosing] = useState(false)
  const [aboutPos, setAboutPos] = useState(null)

  const [linksVisible, setLinksVisible] = useState(false)
  const [linksClosing, setLinksClosing] = useState(false)
  const [linksPos, setLinksPos] = useState(null)

  const [zIndexes, setZIndexes] = useState({ terminal: 10, about: 11, links: 12 })
  const [iconPositions, setIconPositions] = useState(null)

  const [terminalSize] = useState(() => ({
    width:  Math.min(720, window.innerWidth  * 0.9),
    height: window.innerHeight * 0.5,
  }))
  const aboutSize = { width: Math.min(620, window.innerWidth * 0.9), height: Math.min(520, window.innerHeight * 0.85) }
  const linksSize = { width: Math.min(480, window.innerWidth * 0.9), height: Math.min(300, window.innerHeight * 0.7) }

  // Refs
  const inputRef = useRef(null)
  const bodyRef  = useRef(null)
  const dockIconRef  = useRef(null)
  const aboutIconRef = useRef(null)
  const linksIconRef = useRef(null)
  const terminalDockOffset = useRef({ x: 0, y: 0 })
  const aboutDockOffset    = useRef({ x: 0, y: 0 })
  const linksDockOffset    = useRef({ x: 0, y: 0 })
  const widgetRef          = useRef(null)
  const dragMoved = useRef(false)
  const messagePoolRef = useRef([...ERROR_MESSAGES].sort(() => Math.random() - 0.5))

  // Helpers
  // windowPos/windowSize: when provided, offset is relative to the window's actual center (needed for close after drag).
  // When omitted, falls back to viewport center (correct for open, since windows always open centered).
  const computeDockOffset = (iconRef, offsetRef, windowPos, windowSize) => {
    const icon = iconRef.current
    if (!icon) return
    const rect = icon.getBoundingClientRect()
    const iconCx = rect.left + rect.width  / 2
    const iconCy = rect.top  + rect.height / 2
    const refCx = windowPos ? windowPos.x + windowSize.width  / 2 : window.innerWidth  / 2
    const refCy = windowPos ? windowPos.y + windowSize.height / 2 : window.innerHeight / 2
    offsetRef.current = { x: iconCx - refCx, y: iconCy - refCy }
  }

  const getOpenPos = (size) => ({
    x: (window.innerWidth  - size.width)  / 2,
    y: (window.innerHeight - size.height) / 2,
  })

  const bringToFront = (key) => {
    setZIndexes(prev => {
      const maxZ = Math.max(...Object.values(prev))
      if (prev[key] === maxZ) return prev
      return { ...prev, [key]: maxZ + 1 }
    })
  }

  // Initial lines typing effect
  useEffect(() => {
    if (!animationDone) return
    if (currentLine >= lines.length) return

    const line = lines[currentLine]
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
  }, [animationDone, currentLine, currentChar])

  // Response typing effect
  useEffect(() => {
    if (!pending) return

    const currentResponseLine = pending.lines[pending.lineIdx]

    if (pending.charIdx < currentResponseLine.text.length) {
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

  const isTypingDone = currentLine >= lines.length
  const showInput = isTypingDone && pending === null

  // Auto-scroll terminal to bottom
  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    const isNearBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 60
    if (isNearBottom) body.scrollTop = body.scrollHeight
  }, [currentChar, currentLine, pending, exchanges])

  useEffect(() => {
    if (showInput) inputRef.current?.focus()
  }, [showInput])

  // Initialize icon positions
  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const hPad = Math.max(40, vw * 0.08)
    setIconPositions({
      about:    { x: hPad,                  y: vh * 0.5 - 50    },
      links:    { x: vw - hPad - 80,        y: vh * 0.5 - 50    },
      terminal: { x: hPad,                  y: vh - 140         },
      widget:   { x: vw - hPad - 180,       y: vh * 0.5 + 60    },
    })
  }, [])

  // Clamp icon positions on resize
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
          widget:   clamp(prev.widget,   widgetRef),
        }
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-open initial window on load
  useEffect(() => {
    if (initialWindow === 'about') {
      computeDockOffset(aboutIconRef, aboutDockOffset)
      setAboutPos(getOpenPos(aboutSize))
      setAboutVisible(true)
    } else if (initialWindow === 'links') {
      computeDockOffset(linksIconRef, linksDockOffset)
      setLinksPos(getOpenPos(linksSize))
      setLinksVisible(true)
    } else {
      computeDockOffset(dockIconRef, terminalDockOffset)
      setTerminalPos(getOpenPos(terminalSize))
      setTerminalVisible(true)
    }
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
      setIconPositions(prev => ({ ...prev, [key]: { x: startX + dx, y: startY + dy } }))
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

  // Terminal handlers
  const handleTerminalOpen = () => {
    if (dragMoved.current) { dragMoved.current = false; return }
    if (terminalVisible) return
    computeDockOffset(dockIconRef, terminalDockOffset)
    setTerminalPos(getOpenPos(terminalSize))
    resetTerminalContent()
    setTerminalVisible(true)
  }
  const handleTerminalClose = () => {
    if (terminalClosing) return
    computeDockOffset(dockIconRef, terminalDockOffset, terminalPos, terminalSize)
    setTerminalClosing(true)
  }
  const handleTerminalAnimationEnd = () => {
    if (terminalClosing) { setTerminalVisible(false); setTerminalClosing(false) }
    else setAnimationDone(true)
  }

  // About handlers
  const handleAboutOpen = () => {
    if (dragMoved.current) { dragMoved.current = false; return }
    if (aboutVisible) { bringToFront('about'); return }
    computeDockOffset(aboutIconRef, aboutDockOffset)
    setAboutPos(getOpenPos(aboutSize))
    setAboutVisible(true)
  }
  const handleAboutClose = () => {
    if (aboutClosing) return
    computeDockOffset(aboutIconRef, aboutDockOffset, aboutPos, aboutSize)
    setAboutClosing(true)
  }
  const handleAboutAnimationEnd = () => {
    if (aboutClosing) { setAboutVisible(false); setAboutClosing(false) }
  }

  // Links handlers
  const handleLinksOpen = () => {
    if (dragMoved.current) { dragMoved.current = false; return }
    if (linksVisible) { bringToFront('links'); return }
    computeDockOffset(linksIconRef, linksDockOffset)
    setLinksPos(getOpenPos(linksSize))
    setLinksVisible(true)
  }
  const handleLinksClose = () => {
    if (linksClosing) return
    computeDockOffset(linksIconRef, linksDockOffset, linksPos, linksSize)
    setLinksClosing(true)
  }
  const handleLinksAnimationEnd = () => {
    if (linksClosing) { setLinksVisible(false); setLinksClosing(false) }
  }

  const handleTerminalAction = (action) => {
    if (action === 'about') handleAboutOpen()
    else if (action === 'links') handleLinksOpen()
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

    let responseLines
    switch (cmd) {
      case 'ls':
        responseLines = [
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
        responseLines = [
          { text: '...knock, and the door will be opnend.', className: 'terminal-advice' },
        ]
        break
      case 'knock':
        responseLines = [
          { text: 'usage: knock <door-name>', className: 'terminal-error-code' },
        ]
        break
      default: {
        const funnyMsg = messagePoolRef.current.length > 0
          ? messagePoolRef.current.pop()
          : FALLBACK_MESSAGE
        responseLines = [
          { text: '[ERROR]', className: 'terminal-error-code' },
          { text: funnyMsg, className: 'terminal-error-msg' },
        ]
      }
    }

    setPending({ cmd: userInput, lines: responseLines, lineIdx: 0, charIdx: 0 })
    setUserInput('')
  }

  const ASCII_ART = (() => {
    const lines = [
      ' ____    _    __  __',
      '/ ___|  / \\  |  \\/  |',
      '\\___ \\ / _ \\ | |\\/| |',
      ' ___) / ___ \\| |  | |',
      '|____/_/   \\_\\_|  |_|',
      '',
      ' _____ _   _  ___  __  __    _    ____',
      '|_   _| | | |/ _ \\|  \\/  |  / \\  / ___|',
      '  | | | |_| | | | | |\\/| | / _ \\ \\___ \\',
      '  | | |  _  | |_| | |  | |/ ___ \\ ___) |',
      '  |_| |_| |_|\\___/|_|  |_/_/   \\_\\____/ ',
    ]
    const max    = Math.max(...lines.map(l => l.length))
    const top    = ' ' + '_'.repeat(max + 2)
    const bottom = '|' + '_'.repeat(max + 2) + '|'
    return [top, ...lines.map(l => '| ' + l.padEnd(max) + ' |'), bottom].join('\n')
  })()

  return (
    <main className="landing-page">
      <pre className="ascii-bg" aria-hidden="true">{ASCII_ART}</pre>
      {iconPositions && (
        <>
          <button
            ref={aboutIconRef}
            className="desktop-icon"
            style={{ position: 'absolute', left: iconPositions.about.x, top: iconPositions.about.y }}
            onMouseDown={e => handleIconMouseDown(e, 'about')}
            onClick={handleAboutOpen}
          >
            <span className="desktop-icon-emoji">📖</span>
            <span className="desktop-icon-label">About Me</span>
          </button>

          <button
            ref={linksIconRef}
            className="desktop-icon"
            style={{ position: 'absolute', left: iconPositions.links.x, top: iconPositions.links.y }}
            onMouseDown={e => handleIconMouseDown(e, 'links')}
            onClick={handleLinksOpen}
          >
            <span className="desktop-icon-emoji">🔗</span>
            <span className="desktop-icon-label">Links</span>
          </button>

          <button
            ref={dockIconRef}
            className="desktop-icon dock-terminal-icon"
            style={{ position: 'absolute', left: iconPositions.terminal.x, top: iconPositions.terminal.y }}
            onMouseDown={e => handleIconMouseDown(e, 'terminal')}
            onClick={handleTerminalOpen}
          >
            <span className="desktop-icon-emoji">💻</span>
            <span className="desktop-icon-label">Terminal</span>
          </button>

          <DesktopWidget
            ref={widgetRef}
            style={{ left: iconPositions.widget.x, top: iconPositions.widget.y }}
            onMouseDown={e => handleIconMouseDown(e, 'widget')}
          />
        </>
      )}

      {/* Terminal window */}
      <Window
        title="sam@portfolio ~ "
        visible={terminalVisible}
        closing={terminalClosing}
        pos={terminalPos}
        size={terminalSize}
        zIndex={zIndexes.terminal}
        dockOffset={terminalDockOffset.current}
        onClose={handleTerminalClose}
        onPosChange={setTerminalPos}
        onInteract={() => bringToFront('terminal')}
        onAnimationEnd={handleTerminalAnimationEnd}
      >
        <div className="terminal-body" ref={bodyRef}>
          {!cleared && lines.map((line, lineIdx) => {
            if (lineIdx > currentLine) return null
            const isCompleted = completedLines.includes(lineIdx)
            const charsToShow = lineIdx < currentLine ? getLineLength(line) : currentChar
            return (
              <div key={lineIdx} className="terminal-line">
                {renderPartialLine(line, charsToShow, handleTerminalAction)}
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
                <div key={lineIdx} className={`terminal-line ${line.className || ''}`}>
                  {line.text}
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
      </Window>

      {/* About Me window */}
      <Window
        title="about@portfolio ~ "
        visible={aboutVisible}
        closing={aboutClosing}
        pos={aboutPos}
        size={aboutSize}
        zIndex={zIndexes.about}
        dockOffset={aboutDockOffset.current}
        onClose={handleAboutClose}
        onPosChange={setAboutPos}
        onInteract={() => bringToFront('about')}
        onAnimationEnd={handleAboutAnimationEnd}
      >
        <div className="about-body">
          <div className="about-hero">
            <div className="about-avatar">ST</div>
            <div className="about-intro">
              <h2 className="about-name">Sam Thomas</h2>
              <p className="about-tagline">Software Developer</p>
            </div>
          </div>
          <p className="about-bio">
            A software developer who enjoys building full-stack web applications across the whole stack —
            clean UIs in React, efficient Go backends, and PostgreSQL schemas that scale.
          </p>
          <h3 className="about-section-title">Skills</h3>
          <div className="about-skills">
            {['JavaScript', 'React', 'Go', 'PostgreSQL', 'HTML / CSS', 'Git'].map(s => (
              <span key={s} className="about-skill-badge">{s}</span>
            ))}
          </div>
          <h3 className="about-section-title">Experience</h3>
          <div className="about-timeline">
            <div className="about-timeline-item">
              <span className="about-timeline-period">2024 – Present</span>
              <div>
                <strong>Software Engineer</strong>
                <p>Your Company</p>
              </div>
            </div>
          </div>
        </div>
      </Window>

      {/* Links window */}
      <Window
        title="links@portfolio ~ "
        visible={linksVisible}
        closing={linksClosing}
        pos={linksPos}
        size={linksSize}
        zIndex={zIndexes.links}
        dockOffset={linksDockOffset.current}
        onClose={handleLinksClose}
        onPosChange={setLinksPos}
        onInteract={() => bringToFront('links')}
        onAnimationEnd={handleLinksAnimationEnd}
      >
        <div className="links-body">
          {LINKS.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="link-card">
              <span className="link-card-icon">{link.icon}</span>
              <div className="link-card-text">
                <span className="link-card-label">{link.label}</span>
                <span className="link-card-description">{link.description}</span>
              </div>
              <span className="link-card-arrow">→</span>
            </a>
          ))}
        </div>
      </Window>
    </main>
  )
}

export default LandingPage
