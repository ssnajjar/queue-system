import { useEffect, useState } from 'react'
import { api } from '../../api'

const EMPTY_FILTERS = { startDate: '', endDate: '', serviceId: '' }

export function AdminReports() {
  const [services, setServices]   = useState([])
  const [filters, setFilters]     = useState(EMPTY_FILTERS)
  const [applied, setApplied]     = useState(EMPTY_FILTERS)
  const [summary, setSummary]     = useState(null)
  const [history, setHistory]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  // Load service list once for the filter dropdown
  useEffect(() => {
    api.services.list()
      .then(setServices)
      .catch(() => {})
  }, [])

  // Load report data whenever applied filters change
  useEffect(() => {
    const active = stripEmpty(applied)
    setLoading(true)
    setError('')

    Promise.all([
      api.reports.summary(active),
      api.reports.history(active),
    ])
      .then(([s, h]) => {
        setSummary(s)
        setHistory(h)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [applied])

  const stripEmpty = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== ''))

  const handleApply = () => setApplied({ ...filters })

  const handleReset = () => {
    setFilters(EMPTY_FILTERS)
    setApplied(EMPTY_FILTERS)
  }

  const handleExportCsv = () => {
    const url = api.reports.csvUrl(stripEmpty(applied))
    const a   = document.createElement('a')
    a.href    = url
    a.download = ''
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const fmt = (val) => (val === null || val === undefined ? '—' : val)

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Reports</h1>
          <p className="screen-sub">Queue usage statistics · Admin only</p>
        </div>
        <button className="btn-primary" onClick={handleExportCsv}>
          Export CSV
        </button>
      </div>

      {error && <div className="api-error">{error}</div>}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>Filters</h3>
        </div>
        <div className="field-row" style={{ gap: 12, alignItems: 'flex-end' }}>
          <div className="field-group" style={{ flex: 1 }}>
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <div className="field-group" style={{ flex: 1 }}>
            <label>Service</label>
            <select
              value={filters.serviceId}
              onChange={e => setFilters(f => ({ ...f, serviceId: e.target.value }))}
            >
              <option value="">All Services</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleApply}>Apply</button>
            <button className="btn-ghost" onClick={handleReset}>Reset</button>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading report…</p>
      ) : (
        <>
          {/* Overall Stats */}
          {summary && (
            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="stat-card">
                <div className="stat-num">{fmt(summary.overall.totalEntries)}</div>
                <div className="stat-label">Total Entries</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: 'var(--green)' }}>
                  {fmt(summary.overall.totalServed)}
                </div>
                <div className="stat-label">Users Served</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: 'var(--red)' }}>
                  {fmt(summary.overall.totalCanceled)}
                </div>
                <div className="stat-label">Left Queue</div>
              </div>
              <div className="stat-card">
                <div className="stat-num amber">
                  {summary.overall.avgWaitTime ? `${summary.overall.avgWaitTime}m` : '—'}
                </div>
                <div className="stat-label">Avg Wait Time</div>
              </div>
            </div>
          )}

          {/* Per-Service Breakdown */}
          {summary && summary.byService.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3>Service Breakdown</h3>
              </div>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Served</th>
                    <th>Left Queue</th>
                    <th>Avg Wait (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byService.map((row, i) => (
                    <tr key={i}>
                      <td>{row.service}</td>
                      <td style={{ color: 'var(--green)' }}>{row.served}</td>
                      <td style={{ color: 'var(--red)' }}>{row.canceled}</td>
                      <td>{row.avgWaitTime ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Queue Participation History */}
          <div className="card">
            <div className="card-header">
              <h3>Queue Participation History</h3>
              <span className="screen-sub">{history.length} record{history.length !== 1 ? 's' : ''}</span>
            </div>
            {history.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>No records match the selected filters.</p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Outcome</th>
                    <th>Wait (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(row => (
                    <tr key={row.id}>
                      <td style={{ color: 'var(--muted)' }}>#{row.userId}</td>
                      <td>{row.userName}</td>
                      <td>{row.service}</td>
                      <td>{row.date}</td>
                      <td>
                        <span className={`report-badge ${row.outcome === 'served' ? 'badge-served' : 'badge-canceled'}`}>
                          {row.outcome === 'served' ? 'Served' : 'Left Queue'}
                        </span>
                      </td>
                      <td>{row.waitTime ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
