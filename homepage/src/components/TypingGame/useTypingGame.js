import { useState, useRef, useCallback, useEffect } from 'react'
import { getNextLine } from '../../utils/getNextLine'
import defaultWordList from '../../data/wordList'

export function useTypingGame({ wordList = defaultWordList, transitionDuration = 350 } = {}) {
  const [lines, setLines] = useState(() => [
    getNextLine(wordList),
    getNextLine(wordList),
    getNextLine(wordList),
  ])
  const [typed, setTyped] = useState('')
  const [keystrokes, setKeystrokes] = useState({ correct: 0, total: 0 })
  const [startTime, setStartTime] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [lineId, setLineId] = useState(0)
  const [, setTick] = useState(0)
  const typedRef = useRef('')
  const transitioningRef = useRef(false)

  useEffect(() => {
    if (!startTime) return
    const id = setInterval(() => setTick(t => t + 1), 500)
    return () => clearInterval(id)
  }, [startTime])

  const active = lines[0]
  const upcoming = lines[1]
  const third = lines[2]

  const handleKeyDown = useCallback((e) => {
    if (transitioningRef.current) {
      e.preventDefault()
      return
    }
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = typedRef.current.slice(0, -1)
      typedRef.current = next
      setTyped(next)
      return
    }
    if (e.key.length !== 1) return
    if (e.ctrlKey || e.metaKey || e.altKey) return
    e.preventDefault()

    const prevTyped = typedRef.current
    const expected = active[prevTyped.length]
    const isCorrect = e.key === expected
    const next = prevTyped + e.key

    typedRef.current = next
    setStartTime(prev => prev ?? Date.now())
    setKeystrokes(k => ({
      correct: k.correct + (isCorrect ? 1 : 0),
      total: k.total + 1,
    }))
    setTyped(next)

    if (next === active) {
      transitioningRef.current = true
      setTransitioning(true)
      setTimeout(() => {
        typedRef.current = ''
        setLines(prev => [prev[1], prev[2], getNextLine(wordList)])
        setTyped('')
        setTransitioning(false)
        setLineId(id => id + 1)
        transitioningRef.current = false
      }, transitionDuration)
    }
  }, [active, wordList, transitionDuration])

  const elapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0
  const wpm = elapsedMinutes > 0 ? (keystrokes.correct / 5) / elapsedMinutes : 0
  const accuracy = keystrokes.total > 0 ? (keystrokes.correct / keystrokes.total) * 100 : 100

  return {
    active,
    upcoming,
    third,
    typed,
    transitioning,
    lineId,
    wpm,
    accuracy,
    started: startTime !== null,
    handleKeyDown,
  }
}
