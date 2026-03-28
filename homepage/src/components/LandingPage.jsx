import { useState, useEffect, useRef } from 'react'
import './LandingPage.css'
import Window from './Window'
import DesktopWidget from './DesktopWidget'
import AboutPage from './AboutPage'
import LinksPage from './LinksPage'
import TerminalContent from './TerminalContent'

const LINKS = [
  { id: 'linkedin', label: 'LinkedIn', description: 'Connect with me professionally', url: 'https://www.linkedin.com/in/samuel-thomas-464076163/', icon: '💼' },
  { id: 'github',   label: 'GitHub',   description: 'Check out my projects and code',  url: 'https://github.com/Wolfcastle1', icon: '🐙' },
  { id: 'instagram',label: 'Instagram',description: 'Follow me on Instagram',          url: 'https://www.instagram.com/dummy_thicc_cavz', icon: '📸' },
]

function LandingPage({ initialWindow = 'terminal' }) {
  const [terminalActive, setTerminalActive] = useState(false)

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
  const terminalContentRef = useRef(null)
  const dockIconRef    = useRef(null)
  const aboutIconRef   = useRef(null)
  const linksIconRef   = useRef(null)
  const resumeIconRef  = useRef(null)
  const terminalDockOffset = useRef({ x: 0, y: 0 })
  const aboutDockOffset    = useRef({ x: 0, y: 0 })
  const linksDockOffset    = useRef({ x: 0, y: 0 })
  const widgetRef          = useRef(null)
  const dragMoved = useRef(false)

  // Helpers
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

  // Initialize icon positions
  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const iconW = 80
    const iconH = 90
    const bPad  = 16
    const gap   = Math.max(16, (vw - 4 * iconW) / 5)
    const iconY = vh - iconH - bPad
    setIconPositions({
      widget:   { x: vw - 206,                       y: 20      },
      about:    { x: gap,                             y: iconY   },
      terminal: { x: gap * 2 + iconW,                y: iconY   },
      links:    { x: gap * 3 + iconW * 2,             y: iconY   },
      resume:   { x: gap * 4 + iconW * 3,             y: iconY   },
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
          resume:   clamp(prev.resume,   resumeIconRef),
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
    if (terminalVisible) { bringToFront('terminal'); return }
    computeDockOffset(dockIconRef, terminalDockOffset)
    setTerminalPos(getOpenPos(terminalSize))
    setTerminalActive(false)
    terminalContentRef.current?.reset()
    setTerminalVisible(true)
    bringToFront('terminal')
  }
  const handleTerminalClose = () => {
    if (terminalClosing) return
    computeDockOffset(dockIconRef, terminalDockOffset, terminalPos, terminalSize)
    setTerminalClosing(true)
  }
  const handleTerminalAnimationEnd = () => {
    if (terminalClosing) { setTerminalVisible(false); setTerminalClosing(false) }
    else setTerminalActive(true)
  }

  // About handlers
  const handleAboutOpen = () => {
    if (dragMoved.current) { dragMoved.current = false; return }
    if (aboutVisible) { bringToFront('about'); return }
    computeDockOffset(aboutIconRef, aboutDockOffset)
    setAboutPos(getOpenPos(aboutSize))
    setAboutVisible(true)
    bringToFront('about')
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
    bringToFront('links')
  }
  const handleLinksClose = () => {
    if (linksClosing) return
    computeDockOffset(linksIconRef, linksDockOffset, linksPos, linksSize)
    setLinksClosing(true)
  }
  const handleLinksAnimationEnd = () => {
    if (linksClosing) { setLinksVisible(false); setLinksClosing(false) }
  }

  // Resume handler
  const handleResumeDownload = () => {
    if (dragMoved.current) { dragMoved.current = false; return }
    const a = document.createElement('a')
    a.href = '/resume.pdf'
    a.download = 'Sam_Thomas_resume.pdf'
    a.click()
  }

  const handleTerminalAction = (action) => {
    if (action === 'about') handleAboutOpen()
    else if (action === 'links') handleLinksOpen()
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

          <button
            ref={resumeIconRef}
            className="desktop-icon"
            style={{ position: 'absolute', left: iconPositions.resume.x, top: iconPositions.resume.y }}
            onMouseDown={e => handleIconMouseDown(e, 'resume')}
            onTouchStart={e => handleIconTouchStart(e, 'resume')}
            onClick={handleResumeDownload}
          >
            <span className="desktop-icon-emoji">📄</span>
            <span className="desktop-icon-label">Resume</span>
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
        <TerminalContent
          ref={terminalContentRef}
          active={terminalActive}
          onAction={handleTerminalAction}
        />
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
