import { useEffect, useRef } from 'react'

const STRIPES = [
  { color: '#f0a500' }, // amber
  { color: '#d4500a' }, // burnt orange
  { color: '#6b1a1a' }, // dark red
  { color: '#1a3a6e' }, // mid navy
]

const WAVELENGTH   = 320   // px — width of one full cycle
const WAVE_TRAVEL  = 3000  // ms — base time for a packet to cross
const MIN_INTERVAL = 1000  // ms between waves
const MAX_INTERVAL = 2000

// Animation types:
//   'single' — one full-cycle wave packet traveling in a random direction
//   'half'   — one half-period bump (arch) traveling in a random direction
//   'cross'  — two full-cycle packets from opposite ends crossing each other
//   'fast'   — single full-cycle packet at 3× speed
const ANIM_TYPES = ['single', 'half', 'cross', 'fast']

export default function BackgroundCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Each packet: { progress: 0..1, direction: ±1, style: 'full'|'half', speed: number }
    let wavePackets = []
    let waveStripe  = -1
    let waveActive  = false
    let lastTime    = null
    let scheduled   = null
    let rafId       = null

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width  = window.innerWidth  + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const scheduleNext = () => {
      const delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL)
      scheduled = setTimeout(() => {
        const type = ANIM_TYPES[Math.floor(Math.random() * ANIM_TYPES.length)]
        const dir  = Math.random() < 0.5 ? 1 : -1
        waveStripe = Math.floor(Math.random() * STRIPES.length)

        if (type === 'cross') {
          wavePackets = [
            { progress: 0, direction:  1, style: 'full', speed: 1 },
            { progress: 0, direction: -1, style: 'full', speed: 1 },
          ]
        } else {
          wavePackets = [{
            progress:  0,
            direction: dir,
            style:     type === 'half' ? 'half' : 'full',
            speed:     type === 'fast' ? 3 : 1,
          }]
        }

        waveActive = true
      }, delay)
    }
    scheduleNext()

    const drawStripe = (stripeIdx, centers) => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const bandH   = vh * 0.16
      const stripeH = bandH / STRIPES.length
      const halfW   = Math.max(vw, vh) * 1.5
      const maxA    = stripeH * 0.65

      const yTop    = -bandH / 2 + stripeIdx * stripeH
      const yBottom = yTop + stripeH

      ctx.fillStyle = STRIPES[stripeIdx].color

      if (!centers || centers.length === 0) {
        ctx.fillRect(-halfW, yTop, halfW * 2, stripeH)
        return
      }

      const halfCycle = WAVELENGTH / 2
      const step = 1

      const displacement = (x) => {
        let disp = 0
        for (const { x: cx, style } of centers) {
          const dx = x - cx
          if (style === 'full') {
            if (Math.abs(dx) < halfCycle) {
              const hann = 0.5 * (1 + Math.cos(Math.PI * dx / halfCycle))
              disp += maxA * hann * Math.sin((2 * Math.PI * dx) / WAVELENGTH)
            }
          } else {
            // smooth bump (raised cosine) at half the length
            const halfWindow = WAVELENGTH / 4
            if (Math.abs(dx) < halfWindow) {
              disp += maxA * 0.5 * (1 - Math.cos(Math.PI * (dx + halfWindow) / halfWindow))
            }
          }
        }
        return disp
      }

      ctx.beginPath()
      for (let x = -halfW; x <= halfW; x += step) {
        const y = yTop + displacement(x)
        if (x === -halfW) ctx.moveTo(x, y)
        else              ctx.lineTo(x, y)
      }
      for (let x = halfW; x >= -halfW; x -= step) {
        ctx.lineTo(x, yBottom + displacement(x))
      }
      ctx.closePath()
      ctx.fill()
    }

    const frame = (ts) => {
      rafId = requestAnimationFrame(frame)
      const dt = lastTime === null ? 0 : (ts - lastTime) / 1000
      lastTime = ts

      const vw = window.innerWidth
      const vh = window.innerHeight
      ctx.clearRect(0, 0, vw, vh)

      const angle = Math.atan2(vh, vw)
      ctx.save()
      ctx.translate(vw / 2, vh / 2)
      ctx.rotate(angle)

      // Advance packets and compute their current centers
      let centers = null
      if (waveActive) {
        const halfW = Math.max(window.innerWidth, window.innerHeight) * 1.5

        for (const p of wavePackets) {
          p.progress += (dt / (WAVE_TRAVEL / 1000)) * p.speed
        }
        wavePackets = wavePackets.filter(p => p.progress < 1)

        if (wavePackets.length === 0) {
          waveActive = false
          waveStripe = -1
          scheduleNext()
        } else {
          centers = wavePackets.map(p => {
            const startX = p.direction > 0 ? -halfW - WAVELENGTH / 2 :  halfW + WAVELENGTH / 2
            const endX   = p.direction > 0 ?  halfW + WAVELENGTH / 2 : -halfW - WAVELENGTH / 2
            return { x: startX + (endX - startX) * p.progress, style: p.style }
          })
        }
      }

      for (let i = 0; i < STRIPES.length; i++) {
        if (i !== waveStripe) drawStripe(i, null)
      }
      if (waveStripe >= 0) drawStripe(waveStripe, centers)

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
