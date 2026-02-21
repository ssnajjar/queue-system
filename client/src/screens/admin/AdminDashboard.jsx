import { MOCK_SERVICES } from '../../data/mockData'
import { Badge } from '../../components/shared'

export function AdminDashboard({ setPage }) {
  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Admin Dashboard</h1>
        <p className="screen-sub">System overview · Live</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num amber">4</div>
          <div className="stat-label">Active Services</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">28</div>
          <div className="stat-label">Total in Queue</div>
        </div>
        <div className="stat-card">
          <div className="stat-num amber">12</div>
          <div className="stat-label">Served Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">~24</div>
          <div className="stat-label">Avg Wait (min)</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Service Overview</h3>
          <button className="btn-ghost" onClick={() => setPage('admin-services')}>Manage →</button>
        </div>
        {MOCK_SERVICES.map(s => (
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