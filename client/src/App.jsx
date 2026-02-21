import { useState } from 'react'
import './App.css'

// mock data
const MOCK_SERVICES = [
  { id: 1, name: 'Academic Advising', description: 'Course planning and degree requirements', duration: 30, priority: 'high', queueLength: 8 },
  { id: 2, name: 'Financial Aid Office', description: 'Scholarships, bursaries, and payment plans', duration: 20, priority: 'medium', queueLength: 5 },
  { id: 3, name: 'IT Help Desk', description: 'Technical support for students and staff', duration: 15, priority: 'low', queueLength: 3 },
  { id: 4, name: 'Registrar Office', description: 'Enrollment, transcripts, and official documents', duration: 25, priority: 'medium', queueLength: 12 },
]

const MOCK_QUEUES_BY_SERVICE = {
  1: [ // academic advising — 8 people
    { id: 101, name: 'Alice Johnson', position: 1, waitTime: 30, status: 'almost-ready' },
    { id: 102, name: 'Bob Smith', position: 2, waitTime: 60, status: 'waiting' },
    { id: 103, name: 'Carol White', position: 3, waitTime: 90, status: 'waiting' },
    { id: 104, name: 'David Lee', position: 4, waitTime: 120, status: 'waiting' },
    { id: 105, name: 'Eva Martinez', position: 5, waitTime: 150, status: 'waiting' },
    { id: 106, name: 'Frank Zhang', position: 6, waitTime: 180, status: 'waiting' },
    { id: 107, name: 'Grace Kim', position: 7, waitTime: 210, status: 'waiting' },
    { id: 108, name: 'Henry Park', position: 8, waitTime: 240, status: 'waiting' },
  ],
  2: [ // financial aid — 5 people
    { id: 201, name: 'Isla Torres', position: 1, waitTime: 20, status: 'almost-ready' },
    { id: 202, name: 'James Patel', position: 2, waitTime: 40, status: 'waiting' },
    { id: 203, name: 'Karen Nguyen', position: 3, waitTime: 60, status: 'waiting' },
    { id: 204, name: 'Liam Chen', position: 4, waitTime: 80, status: 'waiting' },
    { id: 205, name: 'Maya Singh', position: 5, waitTime: 100, status: 'waiting' },
  ],
  3: [ // IT help desk — 3 people
    { id: 301, name: 'Noah Brown', position: 1, waitTime: 15, status: 'almost-ready' },
    { id: 302, name: 'Olivia Davis', position: 2, waitTime: 30, status: 'waiting' },
    { id: 303, name: 'Pedro Lopez', position: 3, waitTime: 45, status: 'waiting' },
  ],
  4: [ // registrar — 12 people
    { id: 401, name: 'Quinn Wilson', position: 1, waitTime: 25, status: 'almost-ready' },
    { id: 402, name: 'Rachel Moore', position: 2, waitTime: 50, status: 'waiting' },
    { id: 403, name: 'Sam Taylor', position: 3, waitTime: 75, status: 'waiting' },
    { id: 404, name: 'Tina Anderson', position: 4, waitTime: 100, status: 'waiting' },
    { id: 405, name: 'Uma Jackson', position: 5, waitTime: 125, status: 'waiting' },
    { id: 406, name: 'Victor Harris', position: 6, waitTime: 150, status: 'waiting' },
    { id: 407, name: 'Wendy Martin', position: 7, waitTime: 175, status: 'waiting' },
    { id: 408, name: 'Xander Garcia', position: 8, waitTime: 200, status: 'waiting' },
    { id: 409, name: 'Yara Robinson', position: 9, waitTime: 225, status: 'waiting' },
    { id: 410, name: 'Zoe Clark', position: 10, waitTime: 250, status: 'waiting' },
    { id: 411, name: 'Aaron Lewis', position: 11, waitTime: 275, status: 'waiting' },
    { id: 412, name: 'Beth Walker', position: 12, waitTime: 300, status: 'waiting' },
  ],
}

const MOCK_HISTORY = [
  { id: 1, service: 'Academic Advising', date: '2025-06-10', outcome: 'Served', waitTime: 22 },
  { id: 2, service: 'IT Help Desk', date: '2025-06-08', outcome: 'Served', waitTime: 10 },
  { id: 3, service: 'Financial Aid Office', date: '2025-05-30', outcome: 'Left Queue', waitTime: 45 },
  { id: 4, service: 'Registrar Office', date: '2025-05-22', outcome: 'Served', waitTime: 18 },
]

const MOCK_NOTIFICATIONS = [
  { id: 1, message: "You're 2nd in line at Academic Advising!", type: 'alert', time: '2 min ago' },
  { id: 2, message: 'IT Help Desk queue is now open.', type: 'info', time: '1 hr ago' },
  { id: 3, message: 'Your turn at Registrar Office was served.', type: 'success', time: 'Yesterday' },
]

// components that can be reused 

function Badge({ priority }) {
  const colors = { high: 'badge-high', medium: 'badge-med', low: 'badge-low' }
  return <span className={`badge ${colors[priority]}`}>{priority}</span>
}

function Notification({ notif }) {
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

function Sidebar({ page, setPage, role, currentUser, onLogout }) {
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

// auth screens

// preset admin account
const ADMIN_ACCOUNT = { email: 'admin@queuesmart.com', password: 'admin123', name: 'Admin User' }

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [view, setView] = useState('login') // login | register

  const validate = () => {
    const e = {}
    if (!email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    // check for admin credentials
    if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      onLogin('admin', { name: ADMIN_ACCOUNT.name, email })
    } else {
      // any other valid email/password logs in as a regular user
      // in real app this would validate against DB; here we just use the email prefix as name
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      onLogin('user', { name, email })
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">Q</div>
          <h1>QueueSmart</h1>
          <p>Intelligent queue management for modern organizations.</p>
        </div>
        <div className="auth-ticker">
          {MOCK_SERVICES.map(s => (
            <div key={s.id} className="ticker-item">
              <span>{s.name}</span>
              <span className="ticker-count">{s.queueLength} waiting</span>
            </div>
          ))}
        </div>
        <div className="auth-creds-hint">
          <p className="creds-label">Demo credentials</p>
          <div className="creds-row"><span>Admin:</span><code>admin@queuesmart.com</code><code>admin123</code></div>
          <div className="creds-row"><span>User:</span><span>Any valid email + 6+ char password</span></div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={view === 'login' ? 'auth-tab active' : 'auth-tab'} onClick={() => { setView('login'); setErrors({}) }}>Sign In</button>
            <button className={view === 'register' ? 'auth-tab active' : 'auth-tab'} onClick={() => { setView('register'); setErrors({}) }}>Register</button>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleSubmit} noValidate>
              <h2>Welcome back</h2>
              <p className="auth-sub">Sign in to manage your queues</p>
              <div className="field-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className={errors.email ? 'input-err' : ''} />
                {errors.email && <span className="err-msg">{errors.email}</span>}
              </div>
              <div className="field-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className={errors.password ? 'input-err' : ''} />
                {errors.password && <span className="err-msg">{errors.password}</span>}
              </div>
              <button type="submit" className="btn-primary full-width">Sign In</button>
            </form>
          ) : (
            <RegisterForm onLogin={onLogin} />
          )}
        </div>
      </div>
    </div>
  )
}

function RegisterForm({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name) e.name = 'Full name is required'
    else if (form.name.length > 100) e.name = 'Max 100 characters'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onLogin('user', { name: form.name, email: form.email })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>Create account</h2>
      <p className="auth-sub">Join the smart queue today</p>
      {[
        { key: 'name', label: 'Full Name', type: 'text', ph: 'Jane Doe' },
        { key: 'email', label: 'Email Address', type: 'email', ph: 'jane@example.com' },
        { key: 'password', label: 'Password', type: 'password', ph: '••••••••' },
        { key: 'confirm', label: 'Confirm Password', type: 'password', ph: '••••••••' },
      ].map(f => (
        <div className="field-group" key={f.key}>
          <label>{f.label}</label>
          <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => update(f.key, e.target.value)} className={errors[f.key] ? 'input-err' : ''} />
          {errors[f.key] && <span className="err-msg">{errors[f.key]}</span>}
        </div>
      ))}
      <button type="submit" className="btn-primary full-width">Create Account</button>
    </form>
  )
}

// user screen

function UserDashboard({ setPage, setActiveService, inQueue, currentQueueService, queueEntry }) {
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

function JoinQueueScreen({ activeService, setActiveService, setPage, setInQueue, setCurrentQueueService, setQueueEntry }) {
  const [selected, setSelected] = useState(activeService || null)
  const [joined, setJoined] = useState(false)

  const handleJoin = () => {
    if (!selected) return
    const position = selected.queueLength + 1
    const waitTime = selected.queueLength * selected.duration
    setJoined(true)
    setInQueue(true)
    setCurrentQueueService(selected.name)
    setQueueEntry({ position, waitTime, serviceId: selected.id, serviceName: selected.name })
  }

  const handleGoToStatus = () => {
    setPage('status')
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Join a Queue</h1>
        <p className="screen-sub">Select a service to join</p>
      </div>

      {joined ? (
        <div className="card success-card">
          <div className="success-icon">✓</div>
          <h2>You're in line!</h2>
          <p>You joined <strong>{selected.name}</strong></p>
          <div className="queue-ticket">
            <div className="ticket-num">#{selected.queueLength + 1}</div>
            <div className="ticket-meta">
              <div>Estimated wait</div>
              <div className="ticket-time">~{selected.queueLength * selected.duration} min</div>
            </div>
          </div>
          <button className="btn-primary" onClick={handleGoToStatus}>View Queue Status →</button>
        </div>
      ) : (
        <>
          <div className="service-grid">
            {MOCK_SERVICES.map(s => (
              <div
                key={s.id}
                className={`service-card ${selected?.id === s.id ? 'selected' : ''}`}
                onClick={() => setSelected(s)}
              >
                <div className="sc-top">
                  <Badge priority={s.priority} />
                  <span className="sc-wait">~{s.duration} min/person</span>
                </div>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className="sc-footer">
                  <span className="sc-count">{s.queueLength} in queue</span>
                  <span className="sc-total">~{s.queueLength * s.duration} min total wait</span>
                </div>
              </div>
            ))}
          </div>
          {selected && (
            <div className="join-bar">
              <div>
                <strong>{selected.name}</strong>
                <span> · {selected.queueLength} ahead of you · ~{selected.queueLength * selected.duration} min wait</span>
              </div>
              <div className="join-actions">
                <button className="btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleJoin}>Join Queue</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function QueueStatusScreen({ inQueue, setInQueue, currentQueueService, setCurrentQueueService, queueEntry, setQueueEntry }) {
  const [status, setStatus] = useState('waiting')

  const leaveQueue = () => {
    setInQueue(false)
    setCurrentQueueService(null)
    setQueueEntry(null)
    setStatus('waiting')
  }

  // this is the queue previe, meaning existing queue + you
  const baseQueue = queueEntry ? (MOCK_QUEUES_BY_SERVICE[queueEntry.serviceId] || []) : []
  const previewQueue = queueEntry
    ? [...baseQueue, { id: 9999, name: 'You', position: queueEntry.position, waitTime: queueEntry.waitTime, status: 'waiting', isYou: true }]
    : []

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Queue Status</h1>
        <p className="screen-sub">{currentQueueService || 'No active queue'}</p>
      </div>

      {!inQueue ? (
        <div className="card empty-card">
          <div className="empty-icon">◎</div>
          <h3>You're not in any queue</h3>
          <p>Join a service to track your position here.</p>
        </div>
      ) : (
        <>
          <div className="status-hero">
            <div className="position-ring">
              <div className="position-inner">
                <div className="pos-num">{queueEntry.position}</div>
                <div className="pos-label">position</div>
              </div>
            </div>
            <div className="status-info">
              <div className={`status-badge status-${status}`}>
                {status === 'waiting' && '⏳ Waiting'}
                {status === 'almost-ready' && '⚡ Almost Ready'}
                {status === 'served' && '✓ Served'}
              </div>
              <div className="wait-display">
                <span className="wait-num">~{queueEntry.waitTime}</span>
                <span className="wait-unit">minutes</span>
              </div>
              <p className="wait-note">Estimated time until your turn</p>
            </div>
          </div>

          <div className="queue-list card">
            <div className="card-header"><h3>Queue Preview</h3></div>
            {previewQueue.map(person => (
              <div key={person.id} className={`queue-row ${person.isYou ? 'you' : ''}`}>
                <div className="q-pos">#{person.position}</div>
                <div className="q-name">{person.isYou ? 'You' : person.name}</div>
                <div className="q-wait">~{person.waitTime} min</div>
                <div className={`q-status-dot dot-${person.isYou ? status : person.status}`}></div>
              </div>
            ))}
          </div>

          <div className="status-sim-controls card">
            <div className="card-header"><h3>Simulate Status Change</h3><span className="sim-label">Demo only</span></div>
            <div className="sim-btns">
              <button className="btn-ghost" onClick={() => setStatus('waiting')}>Waiting</button>
              <button className="btn-ghost" onClick={() => setStatus('almost-ready')}>Almost Ready</button>
              <button className="btn-ghost" onClick={() => setStatus('served')}>Served</button>
            </div>
          </div>

          <button className="btn-danger" onClick={leaveQueue}>Leave Queue</button>
        </>
      )}
    </div>
  )
}

function HistoryScreen() {
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

// admin pages

function AdminDashboard({ setPage }) {
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

function AdminServicesScreen() {
  const [services, setServices] = useState(MOCK_SERVICES)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', duration: '', priority: 'medium' })
  const [errors, setErrors] = useState({})
  const [showForm, setShowForm] = useState(false)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name) e.name = 'Service name is required'
    else if (form.name.length > 100) e.name = 'Max 100 characters'
    if (!form.description) e.description = 'Description is required'
    if (!form.duration) e.duration = 'Duration is required'
    else if (isNaN(form.duration) || +form.duration <= 0) e.duration = 'Must be a positive number'
    return e
  }

  const handleEdit = (s) => {
    setEditing(s.id)
    setForm({ name: s.name, description: s.description, duration: String(s.duration), priority: s.priority })
    setShowForm(true)
    setErrors({})
  }

  const handleNew = () => {
    setEditing(null)
    setForm({ name: '', description: '', duration: '', priority: 'medium' })
    setShowForm(true)
    setErrors({})
  }

  const handleSave = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (editing) {
      setServices(sv => sv.map(s => s.id === editing ? { ...s, ...form, duration: +form.duration } : s))
    } else {
      setServices(sv => [...sv, { id: Date.now(), ...form, duration: +form.duration, queueLength: 0 }])
    }
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Service Management</h1>
        <button className="btn-primary" onClick={handleNew}>+ New Service</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Service' : 'Create Service'}</h2>
            <form onSubmit={handleSave} noValidate>
              <div className="field-group">
                <label>Service Name <span className="req">*</span></label>
                <input type="text" maxLength={100} placeholder="e.g. Academic Advising" value={form.name} onChange={e => update('name', e.target.value)} className={errors.name ? 'input-err' : ''} />
                <span className="char-count">{form.name.length}/100</span>
                {errors.name && <span className="err-msg">{errors.name}</span>}
              </div>
              <div className="field-group">
                <label>Description <span className="req">*</span></label>
                <textarea rows={3} placeholder="Describe this service..." value={form.description} onChange={e => update('description', e.target.value)} className={errors.description ? 'input-err' : ''} />
                {errors.description && <span className="err-msg">{errors.description}</span>}
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>Expected Duration (min) <span className="req">*</span></label>
                  <input type="number" min={1} placeholder="30" value={form.duration} onChange={e => update('duration', e.target.value)} className={errors.duration ? 'input-err' : ''} />
                  {errors.duration && <span className="err-msg">{errors.duration}</span>}
                </div>
                <div className="field-group">
                  <label>Priority Level</label>
                  <select value={form.priority} onChange={e => update('priority', e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Create Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="services-list card">
        {services.map(s => (
          <div key={s.id} className="admin-service-row">
            <div className="asr-left">
              <div className="asr-name">{s.name}</div>
              <div className="asr-desc">{s.description}</div>
              <div className="asr-meta">{s.duration} min · {s.queueLength} in queue</div>
            </div>
            <Badge priority={s.priority} />
            <button className="btn-sm btn-edit" onClick={() => handleEdit(s)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminQueueScreen() {
  const [selected, setSelected] = useState(1)
  // Each service gets its own independent queue state
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

// root app

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [role, setRole] = useState('user')
  const [currentUser, setCurrentUser] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [activeService, setActiveService] = useState(null)
  const [inQueue, setInQueue] = useState(false)
  const [currentQueueService, setCurrentQueueService] = useState(null)
  const [queueEntry, setQueueEntry] = useState(null) // { position, waitTime, serviceId }

  const handleLogin = (r, user) => {
    setRole(r)
    setCurrentUser(user)
    setPage(r === 'admin' ? 'admin-dashboard' : 'dashboard')
    setLoggedIn(true)
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setCurrentUser(null)
    setRole('user')
    setPage('dashboard')
    setInQueue(false)
    setCurrentQueueService(null)
    setQueueEntry(null)
  }

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return (
        <UserDashboard
          setPage={setPage}
          setActiveService={setActiveService}
          inQueue={inQueue}
          currentQueueService={currentQueueService}
          queueEntry={queueEntry}
        />
      )
      case 'join': return (
        <JoinQueueScreen
          activeService={activeService}
          setActiveService={setActiveService}
          setPage={setPage}
          setInQueue={setInQueue}
          setCurrentQueueService={setCurrentQueueService}
          setQueueEntry={setQueueEntry}
        />
      )
      case 'status': return (
        <QueueStatusScreen
          inQueue={inQueue}
          setInQueue={setInQueue}
          currentQueueService={currentQueueService}
          setCurrentQueueService={setCurrentQueueService}
          queueEntry={queueEntry}
          setQueueEntry={setQueueEntry}
        />
      )
      case 'history': return <HistoryScreen />
      case 'admin-dashboard': return <AdminDashboard setPage={setPage} />
      case 'admin-services': return <AdminServicesScreen />
      case 'admin-queue': return <AdminQueueScreen />
      default: return (
        <UserDashboard
          setPage={setPage}
          setActiveService={setActiveService}
          inQueue={inQueue}
          currentQueueService={currentQueueService}
          queueEntry={queueEntry}
        />
      )
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        page={page}
        setPage={setPage}
        role={role}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}