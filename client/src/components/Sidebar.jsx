export function Sidebar({ page, setPage, role, currentUser, onLogout }) {
    const userNav = [
      { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
      { key: 'join', label: 'Join Queue', icon: '＋' },
      { key: 'status', label: 'Queue Status', icon: '◎' },
      { key: 'history', label: 'History', icon: '◷' },
    ]
    const adminNav = [
      { key: 'admin-dashboard', label: 'Dashboard', icon: '⊞' },
      { key: 'admin-services', label: 'Services', icon: '⚙' },
      { key: 'admin-queue', label: 'Queue Mgmt', icon: '≡' },
    ]
    const nav = role === 'admin' ? adminNav : userNav
  
    const initials = currentUser.name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  
    return (
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-q">Q</span>
          <span className="logo-text">ueueSmart</span>
        </div>
        <nav className="sidebar-nav">
          {nav.map(item => (
            <button
              key={item.key}
              className={page === item.key ? 'nav-item active' : 'nav-item'}
              onClick={() => setPage(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div className="u-info">
              <div className="u-name">{currentUser.name}</div>
              <div className="u-role">{role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={onLogout}>Sign out</button>
        </div>
      </aside>
    )
  }