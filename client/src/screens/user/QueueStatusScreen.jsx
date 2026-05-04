import { useEffect, useState } from 'react'
import { api } from '../../api'

export function QueueStatusScreen({ user, inQueue, setInQueue, currentQueueService, setCurrentQueueService, queueEntry, setQueueEntry, setPage }) {
  const [liveQueue, setLiveQueue] = useState([])
  const [loading, setLoading]     = useState(false)
  const [leaving, setLeaving]     = useState(false)
  const [served, setServed]       = useState(false)
  const [error, setError]         = useState('')

  // Poll every 5 seconds while in queue; detect when the user is served
  useEffect(() => {
    if (!inQueue || !queueEntry?.serviceId) return

    const serviceId = queueEntry.serviceId
    const userId    = user?.id

    const fetchQueue = (showLoading) => {
      if (showLoading) setLoading(true)
      api.queue.get(serviceId)
        .then(data => {
          const entries = data.queue || []
          setLiveQueue(entries)
          setLoading(false)

          const myEntry = entries.find(p => p.userId === userId)
          if (myEntry) {
            setQueueEntry(prev => ({ ...prev, position: myEntry.position, waitTime: myEntry.waitTime }))
          } else {
            // No longer in queue — served or removed by admin
            setServed(true)
            setInQueue(false)
            setCurrentQueueService(null)
            setQueueEntry(null)
          }
        })
        .catch(() => setLoading(false))
    }

    fetchQueue(true)
    const interval = setInterval(() => fetchQueue(false), 5000)
    return () => clearInterval(interval)
  }, [inQueue]) // eslint-disable-line react-hooks/exhaustive-deps

  const leaveQueue = async () => {
    if (!user || !queueEntry) return
    setLeaving(true)
    setError('')
    try {
      await api.queue.leave(queueEntry.serviceId, user.id)
      setInQueue(false)
      setCurrentQueueService(null)
      setQueueEntry(null)
      setLiveQueue([])
    } catch (err) {
      setError(err.message)
    } finally {
      setLeaving(false)
    }
  }

  const myStatus = queueEntry
    ? (queueEntry.position <= 2 ? 'almost-ready' : 'waiting')
    : 'waiting'

  if (served) {
    return (
      <div className="screen">
        <div className="screen-header">
          <h1>Queue Status</h1>
          <p className="screen-sub">{currentQueueService || 'Service complete'}</p>
        </div>
        <div className="card success-card">
          <div className="success-icon">✓</div>
          <h2>You've been served!</h2>
          <p>Your turn has arrived. Thanks for using QueueSmart.</p>
          <button className="btn-primary" onClick={() => setPage('history')}>View History →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Queue Status</h1>
        <p className="screen-sub">{currentQueueService || 'No active queue'}</p>
      </div>

      {error && <div className="api-error">{error}</div>}

      {!inQueue ? (
        <div className="card empty-card">
          <div className="empty-icon">◎</div>
          <h3>You're not in any queue</h3>
          <p>Join a service to track your position here.</p>
        </div>
      ) : (
        <>
          <div className="status-hero">
            <div className="position-ring">
              <div className="position-inner">
                <div className="pos-num">{queueEntry.position}</div>
                <div className="pos-label">position</div>
              </div>
            </div>
            <div className="status-info">
              <div className={`status-badge status-${myStatus}`}>
                {myStatus === 'waiting'      && '⏳ Waiting'}
                {myStatus === 'almost-ready' && '⚡ Almost Ready'}
              </div>
              <div className="wait-display">
                <span className="wait-num">~{queueEntry.waitTime}</span>
                <span className="wait-unit">minutes</span>
              </div>
              <p className="wait-note">Estimated time until your turn</p>
            </div>
          </div>

          <div className="queue-list card">
            <div className="card-header">
              <h3>Queue Preview</h3>
              {loading && <span className="sim-label">Loading…</span>}
            </div>
            {liveQueue.map(person => (
              <div key={person.id} className={`queue-row ${person.userId === user?.id ? 'you' : ''}`}>
                <div className="q-pos">#{person.position}</div>
                <div className="q-name">{person.userId === user?.id ? 'You' : person.name}</div>
                <div className="q-wait">~{person.waitTime} min</div>
                <div className={`q-status-dot dot-${person.status}`}></div>
              </div>
            ))}
          </div>

          <button className="btn-danger" onClick={leaveQueue} disabled={leaving}>
            {leaving ? 'Leaving…' : 'Leave Queue'}
          </button>
        </>
      )}
    </div>
  )
}
