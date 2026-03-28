import { useEffect, useState } from 'react'
import { api } from '../../api'

export function QueueStatusScreen({ user, inQueue, setInQueue, currentQueueService, setCurrentQueueService, queueEntry, setQueueEntry }) {
  const [liveQueue, setLiveQueue] = useState([])
  const [loading, setLoading]     = useState(false)
  const [leaving, setLeaving]     = useState(false)
  const [error, setError]         = useState('')

  // fetch live queue from backend whenever the user is in a queue
  useEffect(() => {
    if (!inQueue || !queueEntry?.serviceId) return
    setLoading(true)
    api.queue.get(queueEntry.serviceId)
      .then(data => setLiveQueue(data.queue || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [inQueue, queueEntry?.serviceId])

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

  // derive status from live position
  const myStatus = queueEntry
    ? (queueEntry.position <= 2 ? 'almost-ready' : 'waiting')
    : 'waiting'

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