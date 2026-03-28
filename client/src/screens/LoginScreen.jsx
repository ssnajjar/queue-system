import { useState } from 'react'
import { api } from '../api'

function RegisterForm({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    setApiError('')
    try {
      const data = await api.auth.register(form.name, form.email, form.password)
      onLogin(data.user.role, { id: data.user.id, name: data.user.name, email: data.user.email })
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>Create account</h2>
      <p className="auth-sub">Join the smart queue today</p>
      {apiError && <div className="api-error">{apiError}</div>}
      {[
        { key: 'name',     label: 'Full Name',         type: 'text',     ph: 'Jane Doe' },
        { key: 'email',    label: 'Email Address',      type: 'email',    ph: 'jane@example.com' },
        { key: 'password', label: 'Password',           type: 'password', ph: '••••••••' },
        { key: 'confirm',  label: 'Confirm Password',   type: 'password', ph: '••••••••' },
      ].map(f => (
        <div className="field-group" key={f.key}>
          <label>{f.label}</label>
          <input
            type={f.type}
            placeholder={f.ph}
            value={form[f.key]}
            onChange={e => update(f.key, e.target.value)}
            className={errors[f.key] ? 'input-err' : ''}
          />
          {errors[f.key] && <span className="err-msg">{errors[f.key]}</span>}
        </div>
      ))}
      <button type="submit" className="btn-primary full-width" disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}

export function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)
  const [view, setView]         = useState('login')

  // Live queue counts from the backend for the ticker
  const [services, setServices] = useState([])
  useState(() => {
    fetch('http://localhost:3000/api/services')
      .then(r => r.json())
      .then(setServices)
      .catch(() => {}) // silently fail — ticker is cosmetic
  }, [])

  const validate = () => {
    const e = {}
    if (!email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    setApiError('')
    try {
      const data = await api.auth.login(email, password)
      onLogin(data.user.role, { id: data.user.id, name: data.user.name, email: data.user.email })
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
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
          {services.map(s => (
            <div key={s.id} className="ticker-item">
              <span>{s.name}</span>
              <span className="ticker-count">{s.queueLength} waiting</span>
            </div>
          ))}
        </div>
        <div className="auth-creds-hint">
          <p className="creds-label">Demo credentials</p>
          <div className="creds-row"><span>Admin:</span><code>admin@queuesmart.com</code><code>admin123</code></div>
          <div className="creds-row"><span>User:</span><code>alice@example.com</code><code>password123</code></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={view === 'login' ? 'auth-tab active' : 'auth-tab'}
              onClick={() => { setView('login'); setErrors({}); setApiError('') }}
            >Sign In</button>
            <button
              className={view === 'register' ? 'auth-tab active' : 'auth-tab'}
              onClick={() => { setView('register'); setErrors({}); setApiError('') }}
            >Register</button>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleSubmit} noValidate>
              <h2>Welcome back</h2>
              <p className="auth-sub">Sign in to manage your queues</p>
              {apiError && <div className="api-error">{apiError}</div>}
              <div className="field-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={errors.email ? 'input-err' : ''}
                />
                {errors.email && <span className="err-msg">{errors.email}</span>}
              </div>
              <div className="field-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={errors.password ? 'input-err' : ''}
                />
                {errors.password && <span className="err-msg">{errors.password}</span>}
              </div>
              <button type="submit" className="btn-primary full-width" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <RegisterForm onLogin={onLogin} />
          )}
        </div>
      </div>
    </div>
  )
}