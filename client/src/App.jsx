import { useState } from 'react'
import './App.css'

import { Sidebar } from './components/Sidebar'
import { LoginScreen } from './screens/LoginScreen'
import { UserDashboard } from './screens/user/UserDashboard'
import { JoinQueueScreen } from './screens/user/JoinQueueScreen'
import { QueueStatusScreen } from './screens/user/QueueStatusScreen'
import { HistoryScreen } from './screens/user/HistoryScreen'
import { AdminDashboard } from './screens/admin/AdminDashboard'
import { AdminServicesScreen } from './screens/admin/AdminServicesScreen'
import { AdminQueueScreen } from './screens/admin/AdminQueueScreen'

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