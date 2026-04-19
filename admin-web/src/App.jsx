import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [totalDensity, setTotalDensity] = useState(68)
  const [activeGates, setActiveGates] = useState(24)
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'critical', msg: 'Zone A Capacity Exceeded (86%)', time: 'Just now' },
    { id: 2, type: 'info', msg: 'Gate 4 Manual Override Activated', time: '2m ago' }
  ])

  // Simulate real-time data influx
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalDensity(prev => {
        const newDensity = prev + (Math.random() > 0.5 ? 1 : -1)
        return Math.min(Math.max(newDensity, 0), 100)
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="dashboard-container">
      {/* Top Navigation / Status */}
      <header className="topbar glass-panel">
        <div>
          <h1 className="gradient-text">Sentinel Engine</h1>
          <p className="topbar-subtitle">Real-Time Crowd Intelligence & Decision System</p>
        </div>
        <div className="status-indicator">
          <div className="pulse"></div>
          Streaming Live
        </div>
      </header>

      {/* Primary Metrics */}
      <section className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span>Global Floor Density</span>
            <span>%</span>
          </div>
          <div className={`metric-value ${totalDensity > 80 ? 'critical' : totalDensity > 60 ? 'warning' : 'normal'}`}>
            {totalDensity}
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span>Active Smart Gates</span>
            <span>Gates</span>
          </div>
          <div className="metric-value normal">
            {activeGates}<span style={{fontSize: '1.5rem', color: 'var(--text-muted)'}}>/30</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span>Active Inference Models</span>
            <span>Models</span>
          </div>
          <div className="metric-value normal">
            4
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="zone-container">
        
        {/* Heatmap / Camera UI */}
        <div className="heatmap-panel glass-panel">
          <h2>Live Density Heatmap</h2>
          <div className="map-placeholder">
            <span className="map-text">Camera / Floorplan Stream Offline (Awaiting AWS Core Integration)</span>
          </div>
        </div>

        {/* Action Panel / Event Feed */}
        <div className="alerts-panel glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Decision Engine Logs</h2>
            <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>View All</button>
          </div>
          
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                <div className="alert-title">
                  <span>{alert.msg}</span>
                  <span className="alert-time">{alert.time}</span>
                </div>
                <div className="alert-desc">Auto-action: {alert.type === 'critical' ? 'Redirect deployed' : 'Logged to audit'}</div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  )
}

export default App
