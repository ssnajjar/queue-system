import { useEffect, useState } from 'react'
import { api } from '../../api'

export function AdminQueueScreen() {
  const [services, setServices]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [queue, setQueue]         = useState([])
  const [loadingSvc, setLoadingSvc] = useState(true)
  const [loadingQ, setLoadingQ]   = useState(false)
  const [serving, setServing]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    api.services.list()
      .then(svcs => {
        setServices(svcs)
        if (svcs.length > 0) setSelected(svcs[0].id)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingSvc(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoadingQ(true)
    api.queue.get(selected)
      .then(data => setQueue(data.queue || []))
      .catch(err => setError(err.message))
      .finally(() => setLoadingQ(false))
  }, [selected])

  const serveNext = async () => {
    if (!selected || queue.length === 0) return
    setServing(true)
    setError('')
    try {
      const data = await api.queue.serve(selected)
      setQueue(data.remainingQueue || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setServing(false)
    }
  }

  const removeUser = async (userId) => {
    try {
      await api.queue.leave(selected, userId)
      setQueue(q => q.filter(p => p.userId !== userId).map((p, i) => ({ ...p, position: i + 1 })))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loadingSvc) return <div className="screen"><p>Loading…</p></div>

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Queue Management</h1>
        <p className="screen-sub">Real-time queue control</p>
      </div>

      {error && <div className="api-error">{error}</div>}

      <div className="service-selector card">
        <label>Selected Service:</label>
        <div className="sel-btns">
          {services.map(s => (
            <button
              key={s.id}
              className={selected === s.id ? 'sel-btn active' : 'sel-btn'}
              onClick={() => setSelected(s.id)}
            >{s.name}</button>
          ))}
        </div>
      </div>

      <div className="queue-mgmt-header">
        <div className="qmh-info">
          <span className="qmh-count">{loadingQ ? '…' : `${queue.length} in queue`}</span>
        </div>
        <button className="btn-primary" onClick={serveNext} disabled={queue.length === 0 || serving}>
          {serving ? 'Serving…' : '▶ Serve Next'}
        </button>
      </div>

      <div className="card">
        {loadingQ ? (
          <p style={{ padding: '1rem' }}>Loading queue…</p>
        ) : queue.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">✓</div>
            <h3>Queue is empty</h3>
            <p>All users have been served.</p>
          </div>
        ) : queue.map((person, idx) => (
          <div key={person.id} className={`queue-mgmt-row ${idx === 0 ? 'next-up' : ''}`}>
            <div className="qmr-pos">#{person.position}</div>
            <div className="qmr-info">
              <div className="qmr-name">{person.name}</div>
              <div className="qmr-wait">~{person.waitTime} min wait</div>
            </div>
            {idx === 0 && <span className="next-badge">Next Up</span>}
            <div className="qmr-actions">
              <button className="btn-sm btn-remove" onClick={() => removeUser(person.userId)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}