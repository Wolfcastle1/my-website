import './Window.css'

function Window({ title, visible, closing, pos, size, zIndex, dockOffset, onClose, onPosChange, onInteract, onAnimationEnd, children }) {
  if (!visible) return null

  const handleHeaderMouseDown = (e) => {
    if (e.target.classList.contains('window-dot')) return
    e.preventDefault()
    const startMouseX = e.clientX
    const startMouseY = e.clientY
    const { x: startX, y: startY } = pos

    const onMouseMove = (me) => {
      onPosChange({ x: startX + me.clientX - startMouseX, y: startY + me.clientY - startMouseY })
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

  return (
    <div
      className={`window${closing ? ' closing' : ''}`}
      style={{
        '--dock-x': `${dockOffset.x}px`,
        '--dock-y': `${dockOffset.y}px`,
        width: size.width,
        height: size.height,
        position: 'absolute',
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        zIndex,
      }}
      onMouseDown={onInteract}
      onAnimationEnd={onAnimationEnd}
    >
      <div className="window-header" onMouseDown={handleHeaderMouseDown}>
        <span className="window-dot red" onClick={onClose} />
        <span className="window-dot yellow" />
        <span className="window-dot green" />
        <span className="window-title">{title}</span>
      </div>
      <div className="window-body">{children}</div>
    </div>
  )
}

export default Window
