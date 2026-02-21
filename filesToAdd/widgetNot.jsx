import { useState, useEffect } from 'react'

function TimeBlock({ value, label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', backgroundColor: '#1e1e2e',
      borderRadius: '12px', padding: '20px 28px',
      minWidth: '80px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#a78bfa', lineHeight: 1 }}>
        {String(value).padStart(2, '0')}
      </span>
      <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return <span style={{ fontSize: '2rem', color: '#a78bfa', alignSelf: 'center', marginBottom: '18px' }}>:</span>
}

export default function CountdownTimer() {
  const TARGET_SECONDS = 10 * 60 // 10 minutes default

  const [total, setTotal] = useState(TARGET_SECONDS)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  useEffect(() => {
    if (!running) return
    if (total <= 0) { setRunning(false); setFinished(true); return }
    const interval = setInterval(() => setTotal(t => t - 1), 1000)
    return () => clearInterval(interval)
  }, [running, total])

  const reset = () => {
    setTotal(TARGET_SECONDS)
    setRunning(false)
    setFinished(false)
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0f0f1a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '32px',
    }}>
      <h1 style={{ color: '#fff', fontSize: '1.8rem', margin: 0 }}>⏱ Countdown Timer</h1>

      {finished ? (
        <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 700 }}>🎉 Time's Up!</div>
      ) : (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <TimeBlock value={hours} label="Hours" />
          <Divider />
          <TimeBlock value={minutes} label="Minutes" />
          <Divider />
          <TimeBlock value={seconds} label="Seconds" />
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setRunning(r => !r)}
          style={{
            backgroundColor: running ? '#ef4444' : '#4f46e5',
            color: '#fff', border: 'none',
            padding: '10px 28px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
          }}
        >
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          onClick={reset}
          style={{
            backgroundColor: '#374151', color: '#fff', border: 'none',
            padding: '10px 28px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '1rem',
          }}
        >
          ↺ Reset
        </button>
      </div>
    </div>
  )
}