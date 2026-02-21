import { MOCK_SERVICES, MOCK_NOTIFICATIONS } from '../../data/mockData'
import { Badge, Notification } from '../../components/shared'

export function UserDashboard({ setPage, setActiveService, inQueue, currentQueueService, queueEntry }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Dashboard</h1>
        <p className="screen-sub">{today}</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num amber">{MOCK_SERVICES.length}</div>
          <div className="stat-label">Active Services</div>
        </div>
        <div className="stat-card">
          <div className={`stat-num ${inQueue ? '' : 'muted'}`}>{inQueue ? `#${queueEntry.position}` : '—'}</div>
          <div className="stat-label">Your Position</div>
        </div>
        <div className="stat-card">
          <div className={`stat-num ${inQueue ? 'amber' : 'muted'}`}>{inQueue ? `~${queueEntry.waitTime}` : '—'}</div>
          <div className="stat-label">Min Wait</div>
        </div>
        <div className="stat-card">
          <div className={`stat-num ${inQueue ? '' : 'muted'}`}>{inQueue ? MOCK_NOTIFICATIONS.length : 0}</div>
          <div className="stat-label">Notifications</div>
        </div>
      </div>

      {inQueue && (
        <div className="active-queue-banner" onClick={() => setPage('status')}>
          <div className="aqb-left">
            <span className="aqb-dot"></span>
            <div>
              <div className="aqb-title">You're in queue: <strong>{currentQueueService}</strong></div>
              <div className="aqb-sub">Position #{queueEntry.position} · ~{queueEntry.waitTime} min estimated wait</div>
            </div>
          </div>
          <button className="btn-ghost">View Status →</button>
        </div>
      )}

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h3>Available Services</h3>
            <button className="btn-ghost" onClick={() => setPage('join')}>View All →</button>
          </div>
          {MOCK_SERVICES.slice(0, 3).map(s => (
            <div key={s.id} className="service-row" onClick={() => { setActiveService(s); setPage('join') }}>
              <div>
                <div className="service-name">{s.name}</div>
                <div className="service-meta">{s.queueLength} waiting · ~{s.duration} min/person</div>
              </div>
              <Badge priority={s.priority} />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h3>Notifications</h3></div>
          {inQueue
            ? MOCK_NOTIFICATIONS.map(n => <Notification key={n.id} notif={n} />)
            : (
              <div className="notif-empty">
                <p>No notifications yet.</p>
                <p className="notif-empty-sub">Join a queue to start receiving updates.</p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}