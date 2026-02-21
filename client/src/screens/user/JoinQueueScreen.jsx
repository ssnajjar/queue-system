import { useState } from 'react'
import { MOCK_SERVICES } from '../../data/mockData'
import { Badge } from '../../components/shared'

export function JoinQueueScreen({ activeService, setActiveService, setPage, setInQueue, setCurrentQueueService, setQueueEntry }) {
  const [selected, setSelected] = useState(activeService || null)
  const [joined, setJoined] = useState(false)

  const handleJoin = () => {
    if (!selected) return
    const position = selected.queueLength + 1
    const waitTime = selected.queueLength * selected.duration
    setJoined(true)
    setInQueue(true)
    setCurrentQueueService(selected.name)
    setQueueEntry({ position, waitTime, serviceId: selected.id, serviceName: selected.name })
  }

  const handleGoToStatus = () => {
    setPage('status')
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Join a Queue</h1>
        <p className="screen-sub">Select a service to join</p>
      </div>

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
          <button className="btn-primary" onClick={handleGoToStatus}>View Queue Status →</button>
        </div>
      ) : (
        <>
          <div className="service-grid">
            {MOCK_SERVICES.map(s => (
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
                <button className="btn-primary" onClick={handleJoin}>Join Queue</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}