import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================================
// useCountdown — Hook timer presisi untuk soal kuis
// ============================================================
// Usage: const { seconds, progress, isRunning, start, reset } = useCountdown(30)
// ============================================================

export const useCountdown = (initialSeconds = 30, onComplete = null) => {
  const [seconds, setSeconds]     = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef               = useRef(null)
  const onCompleteRef             = useRef(onComplete)

  // Jaga callback terbaru tanpa memicu re-render
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  const start = useCallback((from = null) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (from !== null) setSeconds(from)
    setIsRunning(true)

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setIsRunning(false)
          onCompleteRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const reset = useCallback((newSeconds = initialSeconds) => {
    stop()
    setSeconds(newSeconds)
  }, [initialSeconds, stop])

  useEffect(() => () => stop(), [stop])

  const progress = initialSeconds > 0 ? (seconds / initialSeconds) * 100 : 0

  return { seconds, progress, isRunning, start, stop, reset }
}
