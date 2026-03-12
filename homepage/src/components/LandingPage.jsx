import { useState, useEffect, useRef } from 'react'
import './LandingPage.css'
import Window from './Window'
import DesktopWidget from './DesktopWidget'
import AboutPage from './AboutPage'
import LinksPage from './LinksPage'

const lines = [
  [{ text: 'Welcome to https://sam-thomas.dev' }],
  [{ text: 'This is my personal website' }],
  [
    { text: 'Check out my ' },
    { text: 'about page', action: 'about' },
    { text: ' and my ' },
    { text: 'links', action: 'links' },
  ],
  [{ text: 'commands: whoami · skills · contact · about · links · ls · clear' }],
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

  const isMobile = window.innerWidth < 600
  const [terminalSize] = useState(() => ({
    width:  Math.min(720, window.innerWidth * 0.9),
    height: window.innerHeight * 0.5,
  }))
  const aboutSize = { width: Math.min(720, window.innerWidth * 0.9), height: Math.min(680, window.innerHeight * 0.88) }
  const linksSize = { width: Math.min(480, window.innerWidth * 0.9), height: Math.min(280, window.innerHeight * 0.7) }

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
  const commandHistoryRef = useRef([])
  const historyIndexRef   = useRef(-1)

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
    const iconW = 80
    const iconH = 90
    const bPad  = 16
    const gap   = Math.max(20, (vw - 3 * iconW) / 4)
    const iconY = vh - iconH - bPad
    setIconPositions({
      widget:   { x: vw - 180,                       y: 20                  },
      about:    { x: gap,                             y: iconY               },
      terminal: { x: gap * 2 + iconW,                y: iconY               },
      links:    { x: gap * 3 + iconW * 2,             y: iconY               },
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

  const handleIconTouchStart = (e, key) => {
    dragMoved.current = false
    const touch = e.touches[0]
    const startTouchX = touch.clientX
    const startTouchY = touch.clientY
    const { x: startX, y: startY } = iconPositions[key]

    const onTouchMove = (te) => {
      te.preventDefault()
      const t = te.touches[0]
      const dx = t.clientX - startTouchX
      const dy = t.clientY - startTouchY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.current = true
      setIconPositions(prev => ({ ...prev, [key]: { x: startX + dx, y: startY + dy } }))
    }
    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
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
          { text: 'available commands:', className: 'terminal-advice' },
          { text: '  whoami   — who built this', className: 'terminal-warning' },
          { text: '  skills   — tech stack', className: 'terminal-warning' },
          { text: '  contact  — find me online', className: 'terminal-warning' },
          { text: '  about    — open the About Me window', className: 'terminal-warning' },
          { text: '  links    — open the Links window', className: 'terminal-warning' },
          { text: '  ls       — list files (proceed with caution)', className: 'terminal-warning' },
          { text: '  clear    — clear the terminal', className: 'terminal-warning' },
        ]
        break
      case 'whoami':
        responseLines = [
          { text: 'Sam Thomas', className: 'terminal-advice' },
          { text: 'Software Developer  ·  started 2021', className: 'terminal-warning' },
          { text: 'Full-stack: React frontends, Go backends, PostgreSQL databases' },
        ]
        break
      case 'skills':
        responseLines = [
          { text: 'Languages & Runtimes', className: 'terminal-advice' },
          { text: '  JavaScript  ·  Go', className: 'terminal-warning' },
          { text: 'Frontend', className: 'terminal-advice' },
          { text: '  React  ·  HTML / CSS', className: 'terminal-warning' },
          { text: 'Backend & Data', className: 'terminal-advice' },
          { text: '  PostgreSQL  ·  REST APIs', className: 'terminal-warning' },
          { text: 'Tooling', className: 'terminal-advice' },
          { text: '  Git  ·  Vite  ·  Railway  ·  Cloudflare Pages', className: 'terminal-warning' },
        ]
        break
      case 'contact':
        responseLines = [
          { text: 'GitHub    →  github.com/Wolfcastle1', className: 'terminal-advice' },
          { text: 'LinkedIn  →  linkedin.com/in/samuel-thomas-464076163', className: 'terminal-advice' },
          { text: 'Instagram →  instagram.com/dummy_thicc_cavz', className: 'terminal-advice' },
        ]
        break
      case 'about':
        handleAboutOpen()
        responseLines = [{ text: 'Opening About Me...', className: 'terminal-advice' }]
        break
      case 'links':
        handleLinksOpen()
        responseLines = [{ text: 'Opening Links...', className: 'terminal-advice' }]
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

  const rainbowAngle = Math.atan2(window.innerHeight, window.innerWidth) * (180 / Math.PI)

  return (
    <main className="landing-page" style={{ '--rainbow-angle': `${rainbowAngle}deg` }}>
      {iconPositions && (
        <>
          <button
            ref={aboutIconRef}
            className="desktop-icon"
            style={{ position: 'absolute', left: iconPositions.about.x, top: iconPositions.about.y }}
            onMouseDown={e => handleIconMouseDown(e, 'about')}
            onTouchStart={e => handleIconTouchStart(e, 'about')}
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
            onTouchStart={e => handleIconTouchStart(e, 'links')}
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
            onTouchStart={e => handleIconTouchStart(e, 'terminal')}
            onClick={handleTerminalOpen}
          >
            <span className="desktop-icon-emoji">💻</span>
            <span className="desktop-icon-label">Terminal</span>
          </button>

          <DesktopWidget
            ref={widgetRef}
            style={{ left: iconPositions.widget.x, top: iconPositions.widget.y }}
            onMouseDown={e => handleIconMouseDown(e, 'widget')}
            onTouchStart={e => handleIconTouchStart(e, 'widget')}
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
        <div className="terminal-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
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
        <AboutPage />
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
        scrollable={false}
      >
        <LinksPage />
      </Window>
    </main>
  )
}

export default LandingPage
