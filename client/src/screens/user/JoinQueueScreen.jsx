import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Badge } from '../../components/shared'

export function JoinQueueScreen({ user, activeService, setActiveService, setPage, setInQueue, setCurrentQueueService, setQueueEntry }) {
  const [services, setServices] = useState([])
  const [selected, setSelected] = useState(activeService || null)
  const [joined, setJoined]     = useState(false)
  const [loading, setLoading]   = useState(true)
  const [joining, setJoining]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    api.services.list()
      .then(setServices)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeService) setSelected(activeService)
  }, [activeService])

  const handleJoin = async () => {
    if (!selected || !user) return
    setJoining(true)
    setError('')
    try {
      const data = await api.queue.join(selected.id, user.id, user.name)
      const entry = data.entry

      setJoined(true)
      setInQueue(true)
      setCurrentQueueService(selected.name)
      setQueueEntry({
        id:          entry.id,
        position:    entry.position,
        waitTime:    entry.waitTime,
        serviceId:   selected.id,
        serviceName: selected.name,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setJoining(false)
    }
  }

  if (loading) return <div className="screen"><p>Loading services…</p></div>

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Join a Queue</h1>
        <p className="screen-sub">Select a service to join</p>
      </div>

      {error && <div className="api-error">{error}</div>}

      {joined ? (
        <div className="card success-card">
          <div className="success-icon">✓</div>
          <h2>You're in line!</h2>
          <p>You joined <strong>{selected.name}</strong></p>
          <div className="queue-ticket">
            <div className="ticket-num">#{selected.queueLength + 1}</div>
            <div className="ticket-meta">
              <div>Estimated wait</div>
              <div className="ticket-time">~{selected.queueLength * selected.duration} min</div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setPage('status')}>View Queue Status →</button>
        </div>
      ) : (
        <>
          <div className="service-grid">
            {services.map(s => (
              <div
                key={s.id}
                className={`service-card ${selected?.id === s.id ? 'selected' : ''}`}
                onClick={() => setSelected(s)}
              >
                <div className="sc-top">
                  <Badge priority={s.priority} />
                  <span className="sc-wait">~{s.duration} min/person</span>
                </div>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className="sc-footer">
                  <span className="sc-count">{s.queueLength} in queue</span>
                  <span className="sc-total">~{s.queueLength * s.duration} min total wait</span>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="join-bar">
              <div>
                <strong>{selected.name}</strong>
                <span> · {selected.queueLength} ahead of you · ~{selected.queueLength * selected.duration} min wait</span>
              </div>
              <div className="join-actions">
                <button className="btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleJoin} disabled={joining}>
                  {joining ? 'Joining…' : 'Join Queue'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}