import { MOCK_HISTORY } from '../../data/mockData'

export function HistoryScreen() {
  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Queue History</h1>
        <p className="screen-sub">Your past queue activity</p>
      </div>
      <div className="card">
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
            {MOCK_HISTORY.map(h => (
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
      </div>
    </div>
  )
}