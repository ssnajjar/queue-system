import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Badge } from '../../components/shared'

export function AdminDashboard({ setPage }) {
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const loadServices = () => {
    api.services.list()
      .then(setServices)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadServices() }, [])

  if (loading) return <div className="screen"><p>Loading…</p></div>

  const totalWaiting = services.reduce((sum, s) => sum + s.queueLength, 0)
  const avgDuration  = services.length
    ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length)
    : 0

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Admin Dashboard</h1>
        <p className="screen-sub">System overview · Live</p>
      </div>

      {error && <div className="api-error">{error}</div>}

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num amber">{services.length}</div>
          <div className="stat-label">Active Services</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{totalWaiting}</div>
          <div className="stat-label">Total in Queue</div>
        </div>
        <div className="stat-card">
          <div className="stat-num amber">—</div>
          <div className="stat-label">Served Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">~{avgDuration}</div>
          <div className="stat-label">Avg Duration (min)</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Service Overview</h3>
          <button className="btn-ghost" onClick={() => setPage('admin-services')}>Manage →</button>
        </div>
        {services.map(s => (
          <div key={s.id} className="admin-service-row">
            <div className="asr-left">
              <div className="asr-name">{s.name}</div>
              <div className="asr-desc">{s.description}</div>
            </div>
            <div className="asr-stats">
              <div className="asr-queue">{s.queueLength}</div>
              <div className="asr-qlabel">waiting</div>
            </div>
            <Badge priority={s.priority} />
            <div className="quick-actions">
              <button className="btn-sm btn-open">Open</button>
              <button className="btn-sm btn-close">Close</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}