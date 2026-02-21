export function Badge({ priority }) {
    const colors = { high: 'badge-high', medium: 'badge-med', low: 'badge-low' }
    return <span className={`badge ${colors[priority]}`}>{priority}</span>
  }
  
  export function Notification({ notif }) {
    const icons = { alert: '⚡', info: 'ℹ', success: '✓' }
    return (
      <div className={`notif-item notif-${notif.type}`}>
        <span className="notif-icon">{icons[notif.type]}</span>
        <div>
          <p>{notif.message}</p>
          <span className="notif-time">{notif.time}</span>
        </div>
      </div>
    )
  }