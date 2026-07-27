import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AppSidebar from './elements/AppSidebar'
import { IconBell, IconMessage, IconSearch, IconSun, IconMoon } from '@tabler/icons-react'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/emergency': 'Emergency',
  '/doctors': 'Doctors',
  '/appointments': 'Appointments',
  '/reports': 'Reports',
  '/bedmanagement': 'Bed Management',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/assistant': 'AI Assistant',
  '/': 'Dashboard',
}

const Layout = () => {
  const { pathname } = useLocation()
  const [time, setTime] = useState('')
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const update = () => {
      const d = new Date()
      const date = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
      const t = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      setTime(`${date} · ${t}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const title = PAGE_TITLES[pathname] || 'Dashboard'

  return (
    <div className="dash">
      <AppSidebar />
      <main className="main">
        <div className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="search-wrap">
            <span className="search-icon"><IconSearch size={14} /></span>
            <input type="text" placeholder="Search patients, doctors..." aria-label="Search" />
          </div>
          <div className="topbar-right">
            <div className="icon-btn" title={dark ? 'Light mode' : 'Dark mode'} onClick={() => setDark(d => !d)}>
              {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
            </div>
            <div className="icon-btn" title="Notifications">
              <IconBell size={16} />
              <div className="notif-dot" />
            </div>
            <div className="icon-btn" title="Messages">
              <IconMessage size={16} />
            </div>
            <span className="time-display">{time}</span>
            <div className="avatar" title="Admin">AD</div>
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
