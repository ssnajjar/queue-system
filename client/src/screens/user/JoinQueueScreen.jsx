import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Badge } from '../../components/shared'

export function JoinQueueScreen({ user, activeService, setActiveService, setPage, setInQueue, setCurrentQueueService, setQueueEntry }) {
  const [services, setServices]         = useState([])
  const [selected, setSelected]         = useState(activeService || null)
  const [joined, setJoined]             = useState(false)
  const [loading, setLoading]           = useState(true)
  const [joining, setJoining]           = useState(false)
  const [error, setError]               = useState('')
  const [smartData, setSmartData]       = useState(null)
  const [smartLoading, setSmartLoading] = useState(false)

  useEffect(() => {
    api.services.list()
      .then(setServices)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeService) setSelected(activeService)
  }, [activeService])

  // Fetch smart estimate whenever the user picks a service
  useEffect(() => {
    if (!selected) { setSmartData(null); return }
    setSmartLoading(true)
    api.smart.estimate(selected.id)
      .then(setSmartData)
      .catch(() => setSmartData(null))
      .finally(() => setSmartLoading(false))
  }, [selected])

  const handleJoin = async () => {
    if (!selected || !user) return
    setJoining(true)
    setError('')
    try {
      const data = await api.queue.join(selected.id, user.id, user.name)
      const entry = data.entry

      setJoined(true)
      setInQueue(true)
      setCurrentQueueService(selected.name)
      setQueueEntry({
        id:          entry.id,
        position:    entry.position,
        waitTime:    entry.waitTime,
        serviceId:   selected.id,
        serviceName: selected.name,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setJoining(false)
    }
  }

  const handleSelectAlternative = (alt) => {
    const altService = services.find(s => s.id === alt.id)
    if (altService) setSelected(altService)
  }

  if (loading) return <div className="screen"><p>Loading services…</p></div>

  const smartEstimate = smartData?.smartEstimate ?? (selected ? selected.queueLength * selected.duration : 0)
  const improvement   = smartData?.hasHistory && smartData.staticEstimate !== smartData.smartEstimate
    ? smartData.staticEstimate - smartData.smartEstimate
    : null

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Join a Queue</h1>
        <p className="screen-sub">Select a service to join</p>
      </div>

      {error && <div className="api-error">{error}</div>}

      {joined ? (
        <div className="card success-card">
          <div className="success-icon">✓</div>
          <h2>You're in line!</h2>
          <p>You joined <strong>{selected.name}</strong></p>
          <div className="queue-ticket">
            <div className="ticket-num">#{selected.queueLength + 1}</div>
            <div className="ticket-meta">
              <div>Estimated wait</div>
              <div className="ticket-time">~{smartEstimate} min</div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setPage('status')}>View Queue Status →</button>
        </div>
      ) : (
        <>
          <div className="service-grid">
            {services.map(s => (
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
            <>
              {/* Smart Estimate Panel */}
              <div className="smart-panel">
                <div className="smart-panel-header">
                  <span className="smart-badge">Smart Estimate</span>
                  <span className="smart-label">
                    {smartLoading
                      ? 'Calculating…'
                      : smartData?.hasHistory
                        ? `Based on ${smartData.sampleCount} historical visits`
                        : 'Based on service configuration'}
                  </span>
                </div>

                <div className="smart-stats">
                  <div className="smart-stat">
                    <div className="smart-num">~{smartLoading ? '…' : smartEstimate} min</div>
                    <div className="smart-stat-label">Smart Wait Estimate</div>
                  </div>
                  <div className="smart-stat">
                    <div className="smart-num">{selected.queueLength}</div>
                    <div className="smart-stat-label">Ahead of You</div>
                  </div>
                  {smartData?.hasHistory && (
                    <div className="smart-stat">
                      <div className="smart-num">{smartData.histAvgPerPerson} min</div>
                      <div className="smart-stat-label">Avg Actual Wait/Person</div>
                    </div>
                  )}
                  {improvement !== null && (
                    <div className="smart-stat">
                      <div className={`smart-num ${improvement > 0 ? 'green' : 'amber'}`}>
                        {improvement > 0 ? `${improvement} min faster` : `${Math.abs(improvement)} min longer`}
                      </div>
                      <div className="smart-stat-label">vs. Default Estimate</div>
                    </div>
                  )}
                </div>

                {/* Alternative Service Recommendation */}
                {!smartLoading && smartData?.alternative && (
                  <div className="alt-suggestion">
                    <div className="alt-icon">◎</div>
                    <div className="alt-body">
                      <div className="alt-title">Shorter wait available</div>
                      <div className="alt-desc">
                        <strong>{smartData.alternative.name}</strong> has only{' '}
                        <strong>{smartData.alternative.queueLength} people</strong> waiting
                        — estimated <strong>~{smartData.alternative.smartEstimate} min</strong> vs. your current {smartEstimate} min.
                      </div>
                    </div>
                    <button
                      className="btn-sm btn-alt"
                      onClick={() => handleSelectAlternative(smartData.alternative)}
                    >
                      Switch
                    </button>
                  </div>
                )}
              </div>

              {/* Join Bar */}
              <div className="join-bar">
                <div>
                  <strong>{selected.name}</strong>
                  <span> · {selected.queueLength} ahead of you · ~{smartEstimate} min wait</span>
                </div>
                <div className="join-actions">
                  <button className="btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
                  <button className="btn-primary" onClick={handleJoin} disabled={joining}>
                    {joining ? 'Joining…' : 'Join Queue'}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
