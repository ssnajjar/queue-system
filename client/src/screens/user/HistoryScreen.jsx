import { useEffect, useState } from 'react'
import { api } from '../../api'

export function HistoryScreen({ user }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!user?.id) return
    api.history.list(user.id)
      .then(setHistory)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="screen"><p>Loading history…</p></div>

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Queue History</h1>
        <p className="screen-sub">Your past queue activity</p>
      </div>

      {error && <div className="api-error">{error}</div>}

      <div className="card">
        {history.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">◎</div>
            <h3>No history yet</h3>
            <p>Your completed and left queues will appear here.</p>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Date</th>
                <th>Wait Time</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td>{h.service}</td>
                  <td>{h.date}</td>
                  <td>{h.waitTime} min</td>
                  <td>
                    <span className={`outcome ${h.outcome === 'Served' ? 'outcome-served' : 'outcome-left'}`}>
                      {h.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}