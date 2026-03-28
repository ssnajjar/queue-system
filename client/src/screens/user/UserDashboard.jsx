import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Badge, Notification } from '../../components/shared'

export function UserDashboard({ user, setPage, setActiveService, inQueue, currentQueueService, queueEntry }) {
  const [services, setServices]           = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  useEffect(() => {
    async function load() {
      try {
        const [svcs, notifs] = await Promise.all([
          api.services.list(),
          user?.id ? api.notifications.list(user.id) : Promise.resolve([]),
        ])
        setServices(svcs)
        setNotifications(notifs)
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) return <div className="screen"><p>Loading…</p></div>

  const totalWaiting = services.reduce((sum, s) => sum + s.queueLength, 0)

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Dashboard</h1>
        <p className="screen-sub">{today}</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num amber">{services.length}</div>
          <div className="stat-label">Active Services</div>
        </div>
        <div className="stat-card">
          <div className={`stat-num ${inQueue ? '' : 'muted'}`}>
            {inQueue ? `#${queueEntry.position}` : '—'}
          </div>
          <div className="stat-label">Your Position</div>
        </div>
        <div className="stat-card">
          <div className={`stat-num ${inQueue ? 'amber' : 'muted'}`}>
            {inQueue ? `~${queueEntry.waitTime}` : '—'}
          </div>
          <div className="stat-label">Min Wait</div>
        </div>
        <div className="stat-card">
          <div className={`stat-num ${inQueue ? '' : 'muted'}`}>
            {inQueue ? notifications.length : 0}
          </div>
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
          {services.slice(0, 3).map(s => (
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
          {inQueue && notifications.length > 0
            ? notifications.map(n => <Notification key={n.id} notif={n} />)
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