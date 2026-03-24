import { useState, useEffect, useRef, forwardRef } from 'react'
import './DesktopWidget.css'

function getTimeString() {
  return new Date().toLocaleTimeString('en-US', { hour12: true })
}

function getDateString() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const DesktopWidget = forwardRef(function DesktopWidget({ style, onMouseDown }, ref) {
  const [clockTime, setClockTime] = useState(getTimeString)
  const [clockDate, setClockDate] = useState(getDateString)

  useEffect(() => {
    const interval = setInterval(() => {
      setClockTime(getTimeString())
      setClockDate(getDateString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const dragMovedRef = useRef(false)
  const mouseDownPos = useRef(null)

  const handleMouseDown = (e) => {
    dragMovedRef.current = false
    mouseDownPos.current = { x: e.clientX, y: e.clientY }
    const onMove = (ev) => {
      const dx = ev.clientX - mouseDownPos.current.x
      const dy = ev.clientY - mouseDownPos.current.y
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMovedRef.current = true
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    onMouseDown?.(e)
  }

  return (
    <div
      ref={ref}
      className="desktop-widget"
      style={style}
      onMouseDown={handleMouseDown}
    >
      <span className="widget-date">{clockDate}</span>
      <span className="widget-clock">{clockTime}</span>
    </div>
  )
})

export default DesktopWidget
