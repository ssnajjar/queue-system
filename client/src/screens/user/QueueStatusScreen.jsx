import { useState } from 'react'
import { MOCK_QUEUES_BY_SERVICE } from '../../data/mockData'

export function QueueStatusScreen({ inQueue, setInQueue, currentQueueService, setCurrentQueueService, queueEntry, setQueueEntry }) {
  const [status, setStatus] = useState('waiting')

  const leaveQueue = () => {
    setInQueue(false)
    setCurrentQueueService(null)
    setQueueEntry(null)
    setStatus('waiting')
  }

  const baseQueue = queueEntry ? (MOCK_QUEUES_BY_SERVICE[queueEntry.serviceId] || []) : []
  const previewQueue = queueEntry
    ? [...baseQueue, { id: 9999, name: 'You', position: queueEntry.position, waitTime: queueEntry.waitTime, status: 'waiting', isYou: true }]
    : []

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Queue Status</h1>
        <p className="screen-sub">{currentQueueService || 'No active queue'}</p>
      </div>

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
              <div className={`status-badge status-${status}`}>
                {status === 'waiting' && '⏳ Waiting'}
                {status === 'almost-ready' && '⚡ Almost Ready'}
                {status === 'served' && '✓ Served'}
              </div>
              <div className="wait-display">
                <span className="wait-num">~{queueEntry.waitTime}</span>
                <span className="wait-unit">minutes</span>
              </div>
              <p className="wait-note">Estimated time until your turn</p>
            </div>
          </div>

          <div className="queue-list card">
            <div className="card-header"><h3>Queue Preview</h3></div>
            {previewQueue.map(person => (
              <div key={person.id} className={`queue-row ${person.isYou ? 'you' : ''}`}>
                <div className="q-pos">#{person.position}</div>
                <div className="q-name">{person.isYou ? 'You' : person.name}</div>
                <div className="q-wait">~{person.waitTime} min</div>
                <div className={`q-status-dot dot-${person.isYou ? status : person.status}`}></div>
              </div>
            ))}
          </div>

          <div className="status-sim-controls card">
            <div className="card-header"><h3>Simulate Status Change</h3><span className="sim-label">Demo only</span></div>
            <div className="sim-btns">
              <button className="btn-ghost" onClick={() => setStatus('waiting')}>Waiting</button>
              <button className="btn-ghost" onClick={() => setStatus('almost-ready')}>Almost Ready</button>
              <button className="btn-ghost" onClick={() => setStatus('served')}>Served</button>
            </div>
          </div>

          <button className="btn-danger" onClick={leaveQueue}>Leave Queue</button>
        </>
      )}
    </div>
  )
}