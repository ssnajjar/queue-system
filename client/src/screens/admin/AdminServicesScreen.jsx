import { useState } from 'react'
import { MOCK_SERVICES } from '../../data/mockData'
import { Badge } from '../../components/shared'

export function AdminServicesScreen() {
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