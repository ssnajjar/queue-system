import { useState } from 'react'
import { MOCK_SERVICES, MOCK_QUEUES_BY_SERVICE } from '../../data/mockData'

export function AdminQueueScreen() {
  const [selected, setSelected] = useState(1)
  const [queues, setQueues] = useState(
    Object.fromEntries(
      Object.entries(MOCK_QUEUES_BY_SERVICE).map(([id, q]) => [id, q])
    )
  )

  const queue = queues[selected] || []

  const updateQueue = (newQueue) => {
    setQueues(q => ({ ...q, [selected]: newQueue }))
  }

  const serveNext = () => {
    updateQueue(queue.slice(1).map((p, i) => ({ ...p, position: i + 1 })))
  }

  const removeUser = (id) => {
    updateQueue(queue.filter(p => p.id !== id).map((p, i) => ({ ...p, position: i + 1 })))
  }

  const moveUp = (idx) => {
    if (idx === 0) return
    const next = [...queue]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    updateQueue(next.map((p, i) => ({ ...p, position: i + 1 })))
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Queue Management</h1>
        <p className="screen-sub">Real-time queue control</p>
      </div>

      <div className="service-selector card">
        <label>Selected Service:</label>
        <div className="sel-btns">
          {MOCK_SERVICES.map(s => (
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
          <span className="qmh-count">{queue.length} in queue</span>
        </div>
        <button className="btn-primary" onClick={serveNext} disabled={queue.length === 0}>
          ▶ Serve Next
        </button>
      </div>

      <div className="card">
        {queue.length === 0 ? (
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
              <button className="btn-sm" onClick={() => moveUp(idx)} disabled={idx === 0}>↑</button>
              <button className="btn-sm btn-remove" onClick={() => removeUser(person.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}