import { useEffect, useRef } from 'react'

const STRIPES = [
  { color: '#e03030' },
  { color: '#e8c000' },
  { color: '#27a844' },
  { color: '#1a6fd4' },
]

const WAVELENGTH   = 320    // px — width of one full cycle
const WAVE_TRAVEL  = 3000   // ms — time for the packet to cross the stripe
const MIN_INTERVAL = 1000   // ms between waves
const MAX_INTERVAL = 2000

export default function BackgroundCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    let waveStripe    = -1
    let waveDirection = 1
    let waveProgress  = 0   // 0 → 1 as packet travels across
    let waveActive    = false
    let lastTime      = null
    let scheduled     = null
    let rafId         = null

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const scheduleNext = () => {
      const delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL)
      scheduled = setTimeout(() => {
        waveStripe    = Math.floor(Math.random() * STRIPES.length)
        waveDirection = Math.random() < 0.5 ? 1 : -1
        waveProgress  = 0
        waveActive    = true
      }, delay)
    }
    scheduleNext()

    const drawStripe = (stripeIdx, waveCenter) => {
      const vw = canvas.width
      const vh = canvas.height
      const bandH   = vh * 0.16
      const stripeH = bandH / STRIPES.length
      const halfW   = Math.max(vw, vh) * 1.5
      const maxA    = stripeH * 0.65

      const yTop    = -bandH / 2 + stripeIdx * stripeH
      const yBottom = yTop + stripeH

      ctx.fillStyle = STRIPES[stripeIdx].color

      if (waveCenter === null) {
        ctx.fillRect(-halfW, yTop, halfW * 2, stripeH)
        return
      }

      const halfCycle = WAVELENGTH / 2
      const step = 3

      ctx.beginPath()
      // top edge left → right
      for (let x = -halfW; x <= halfW; x += step) {
        const dx = x - waveCenter
        let disp = 0
        if (Math.abs(dx) < halfCycle) {
          // Hann window * sine: smooth single-cycle bump
          const hann = 0.5 * (1 + Math.cos(Math.PI * dx / halfCycle))
          disp = maxA * hann * Math.sin((2 * Math.PI * dx) / WAVELENGTH)
        }
        const y = yTop + disp
        if (x === -halfW) ctx.moveTo(x, y)
        else              ctx.lineTo(x, y)
      }
      // bottom edge right → left
      for (let x = halfW; x >= -halfW; x -= step) {
        const dx = x - waveCenter
        let disp = 0
        if (Math.abs(dx) < halfCycle) {
          const hann = 0.5 * (1 + Math.cos(Math.PI * dx / halfCycle))
          disp = maxA * hann * Math.sin((2 * Math.PI * dx) / WAVELENGTH)
        }
        ctx.lineTo(x, yBottom + disp)
      }
      ctx.closePath()
      ctx.fill()
    }

    const frame = (ts) => {
      rafId = requestAnimationFrame(frame)
      const dt = lastTime === null ? 0 : (ts - lastTime) / 1000
      lastTime = ts

      const vw = canvas.width
      const vh = canvas.height
      ctx.clearRect(0, 0, vw, vh)

      const angle = Math.atan2(vh, vw)
      ctx.save()
      ctx.translate(vw / 2, vh / 2)
      ctx.rotate(angle)

      // Advance wave packet
      let waveCenter = null
      if (waveActive) {
        waveProgress += dt / (WAVE_TRAVEL / 1000)
        if (waveProgress >= 1) {
          waveActive = false
          waveStripe = -1
          scheduleNext()
        } else {
          const halfW = Math.max(vw, vh) * 1.5
          const startX = waveDirection > 0 ? -halfW - WAVELENGTH / 2 : halfW + WAVELENGTH / 2
          const endX   = waveDirection > 0 ?  halfW + WAVELENGTH / 2 : -halfW - WAVELENGTH / 2
          waveCenter = startX + (endX - startX) * waveProgress
        }
      }

      // Draw non-waving stripes first, then waving stripe on top
      for (let i = 0; i < STRIPES.length; i++) {
        if (i !== waveStripe) drawStripe(i, null)
      }
      if (waveStripe >= 0) drawStripe(waveStripe, waveCenter)

      ctx.restore()
    }

    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(scheduled)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
