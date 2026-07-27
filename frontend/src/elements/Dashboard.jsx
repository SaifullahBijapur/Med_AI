import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js'
import { Line } from 'react-chartjs-2'
import {
  IconUsers, IconUrgent, IconBed, IconStethoscope, IconCalendarEvent,
  IconRobot, IconAlertTriangle, IconClock, IconTrendingUp, IconBrain, IconRefresh,
} from '@tabler/icons-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const API = 'https://medai-production-8a03.up.railway.app'
const AVATAR_COLORS = [
  { bg: '#e8f1fc', color: '#185fa5' }, { bg: '#fdeaea', color: '#a32d2d' },
  { bg: '#eaf3de', color: '#3b6d11' }, { bg: '#eeedfe', color: '#534ab7' },
  { bg: '#faeeda', color: '#854f0b' },
]
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

const chartData = {
  labels: ['6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM'],
  datasets: [
    { label: 'Admissions', data: [4,8,15,22,31,27,24,19,22,18,14], borderColor: '#1a6fd4', backgroundColor: 'rgba(26,111,212,0.08)', tension: 0.4, pointRadius: 3, fill: true },
    { label: 'Discharges', data: [1,3,6,9,14,18,21,16,12,10,8], borderColor: '#639922', backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, borderDash: [3,3], fill: false },
  ],
}
const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: {
    x: { ticks: { color: '#adb3bb', font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
    y: { ticks: { color: '#adb3bb', font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
  },
}

const INSIGHT_STYLES = [
  { bg: 'linear-gradient(135deg,#e8f1fc,#f0ebff)', border: '#b5d4f4', color: '#185fa5', strongColor: '#0c447c', icon: <IconAlertTriangle size={14} style={{color:'#1a6fd4'}} /> },
  { bg: 'linear-gradient(135deg,#faeeda,#fff8ed)', border: '#fac775', color: '#854f0b', strongColor: '#633806', icon: <IconClock size={14} style={{color:'#854f0b'}} /> },
  { bg: 'linear-gradient(135deg,#eaf3de,#f5ffed)', border: '#c0dd97', color: '#3b6d11', strongColor: '#27500a', icon: <IconTrendingUp size={14} style={{color:'#3b6d11'}} /> },
  { bg: 'linear-gradient(135deg,#eeedfe,#f5f3ff)', border: '#afa9ec', color: '#534ab7', strongColor: '#3c3489', icon: <IconBrain size={14} style={{color:'#534ab7'}} /> },
]

function parseInsights(text = '') {
  return text.split('\n').map(l => l.replace(/^[-*•\d.]+\s*/, '').trim()).filter(Boolean).slice(0, 4)
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000
const INSIGHTS_CACHE_KEY = 'medicore_insights'

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [insights, setInsights] = useState([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [deptLoad, setDeptLoad] = useState([])

  const fetchInsights = async (force = false) => {
    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(INSIGHTS_CACHE_KEY) || 'null')
        if (cached && Date.now() - cached.ts < TWO_DAYS_MS && cached.insights?.length > 0) {
          setInsights(cached.insights)
          return
        }
      } catch {}
    }
    setInsightsLoading(true)
    setInsights([])
    try {
      const r = await axios.post(`${API}/api/agent/chat`, {
        messages: [{ role: 'user', content: 'Give exactly 4 brief AI operational insights for the hospital. Format as 4 bullet lines, each as "Bold Title: one sentence."' }]
      })
      const lines = parseInsights(r.data?.reply || '')
      setInsights(lines)
      try { localStorage.setItem(INSIGHTS_CACHE_KEY, JSON.stringify({ ts: Date.now(), insights: lines })) } catch {}
    } catch {}
    setInsightsLoading(false)
  }

  useEffect(() => {
    axios.get(`${API}/api/analytics/dashboard`).then(r => setAnalytics(r.data.analytics)).catch(() => {})
    axios.get(`${API}/api/patients?limit=5`).then(r => setPatients(r.data.patients || [])).catch(() => {})
    axios.get(`${API}/api/appointments?limit=5&status=Pending`).then(r => setAppointments(r.data.appointments || [])).catch(() => {})
    axios.get(`${API}/api/appointments?limit=100`).then(r => {
      const appts = r.data.appointments || []
      const counts = {}
      appts.forEach(a => { if (a.department) counts[a.department] = (counts[a.department] || 0) + 1 })
      const total = Math.max(Object.values(counts).reduce((s, v) => s + v, 0), 1)
      setDeptLoad(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([dept, cnt]) => ({ dept, pct: Math.round((cnt / total) * 100) })))
    }).catch(() => {})
    // Load insights from cache only — AI runs only on manual refresh
    try {
      const cached = JSON.parse(localStorage.getItem(INSIGHTS_CACHE_KEY) || 'null')
      if (cached?.insights?.length > 0) setInsights(cached.insights)
    } catch {}
  }, [])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mt-5 ">
        {[
          { icon: <IconUsers size={18}/>, val: analytics?.totalDoctors !== undefined ? patients.length || '—' : '—', label: 'Total Patients', trend: '+4.2% this week', cls: 'blue', trendCls: 'up' },
          { icon: <IconUrgent size={18}/>, val: analytics?.emergencyAppointments ?? '—', label: 'Emergency Cases', trend: 'Critical cases', cls: 'red', trendCls: 'dn' },
          { icon: <IconBed size={18}/>, val: 47, label: 'Available Beds', trend: '12 ICU open', cls: 'green', trendCls: 'up' },
          { icon: <IconStethoscope size={18}/>, val: analytics?.totalDoctors ?? '—', label: 'Doctors On Duty', trend: '8 on call', cls: 'purple', trendCls: 'up' },
          { icon: <IconCalendarEvent size={18}/>, val: analytics?.totalAppointments ?? '—', label: 'Appointments Today', trend: 'Queue active', cls: 'amber', trendCls: 'up' },
        ].map(({ icon, val, label, trend, cls, trendCls }) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon ${cls}`}>{icon}</div>
            <div className="stat-val">{val}</div>
            <div className="stat-label">{label}</div>
            <div className={`stat-trend ${trendCls}`}>{trend}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><IconRobot size={14} style={{color:'#1a6fd4'}}/>AI Insights</span>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              {(() => {
                try {
                  const cached = JSON.parse(localStorage.getItem(INSIGHTS_CACHE_KEY) || 'null')
                  if (cached?.ts) {
                    const age = Date.now() - cached.ts
                    const hrs = Math.floor(age / 3600000)
                    const label = hrs < 1 ? 'Just now' : hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs/24)}d ago`
                    return <span className="text-tertiary" style={{fontSize:10}}>{label}</span>
                  }
                } catch {}
                return null
              })()}
              <button
                title="Refresh insights"
                onClick={() => fetchInsights(true)}
                disabled={insightsLoading}
                style={{background:'none',border:'none',cursor:insightsLoading?'not-allowed':'pointer',color:insightsLoading?'#adb3bb':'#1a6fd4',padding:2,display:'flex',alignItems:'center'}}
              >
                <IconRefresh size={13} style={{animation: insightsLoading ? 'spin 1s linear infinite' : 'none'}}/>
              </button>
            </div>
          </div>
          {insightsLoading && INSIGHT_STYLES.map((s, i) => (
            <div key={i} className="ai-insight" style={{background: s.bg, borderColor: s.border}}>
              {s.icon}
              <div className="ai-text" style={{color: s.color}}>
                <div className="skeleton" style={{height: 10, width: '60%', marginBottom: 4}}/>
                <div className="skeleton" style={{height: 8, width: '90%'}}/>
              </div>
            </div>
          ))}
          {!insightsLoading && insights.length === 0 && (
            <p className="text-muted" style={{textAlign:'center',padding:'20px 0'}}>Click <IconRefresh size={11} style={{verticalAlign:'middle'}}/> to generate AI insights</p>
          )}
          {!insightsLoading && insights.map((line, i) => {
                const s = INSIGHT_STYLES[i % INSIGHT_STYLES.length]
                const colonIdx = line.indexOf(':')
                const bold = colonIdx > -1 ? line.slice(0, colonIdx) : 'Insight'
                const rest = colonIdx > -1 ? line.slice(colonIdx + 1).trim() : line
                return (
                  <div key={i} className="ai-insight" style={{background: s.bg, borderColor: s.border}}>
                    {s.icon}
                    <div className="ai-text" style={{color: s.color}}>
                      <strong style={{color: s.strongColor}}>{bold}: </strong>{rest}
                    </div>
                  </div>
                )
              })
          }
        </div>

        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Recent Patients</span>
            <span className="card-action" style={{cursor:'pointer'}} onClick={() => window.location.assign('/patients')}>View all</span>
          </div>
          {patients.length === 0
            ? <p className="text-muted" style={{textAlign:'center',padding:'16px 0'}}>No patients yet</p>
            : patients.slice(0, 5).map((p, i) => (
                <div className="patient-row" key={p._id}>
                  <div className="pat-avatar" style={AVATAR_COLORS[i % 5]}>{initials(p.fullName)}</div>
                  <div className="pat-info">
                    <div className="pat-name">{p.fullName}</div>
                    <div className="pat-detail">Added {new Date(p.createdAt).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}</div>
                  </div>
                  <span className="badge green">Active</span>
                </div>
              ))
          }
        </div>

        <div className="card">
          <div className="card-hdr"><span className="card-title">Department Load</span></div>
          {deptLoad.length > 0
            ? deptLoad.map(({dept, pct}) => (
                <div className="dept-row" key={dept}>
                  <div className="dept-name">{dept}</div>
                  <div className="dept-bar-wrap">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width:`${pct}%`, background: pct>70?'#e24b4a':pct>50?'#ef9f27':'#1a6fd4'}}/>
                    </div>
                  </div>
                  <span className="text-muted" style={{marginLeft:6,whiteSpace:'nowrap'}}>{pct}%</span>
                </div>
              ))
            : [['Emergency',75,'#e24b4a'],['Cardiology',60,'#ef9f27'],['Orthopedics',45,'#1a6fd4'],['Pediatrics',30,'#639922']].map(([d,p,c]) => (
                <div className="dept-row" key={d}>
                  <div className="dept-name">{d}</div>
                  <div className="dept-bar-wrap"><div className="progress-bar"><div className="progress-fill" style={{width:`${p}%`,background:c}}/></div></div>
                  <span className="text-muted" style={{marginLeft:6}}>{p}%</span>
                </div>
              ))
          }
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 mt-5">
        <div className="card">
          <div className="card-hdr"><span className="card-title">Patient Activity — Today</span></div>
          <div className="chart-wrap"><Line data={chartData} options={chartOptions}/></div>
        </div>

        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Upcoming Appointments</span>
            <span className="card-action" onClick={() => window.location.assign('/appointments')}>View all</span>
          </div>
          {appointments.length === 0
            ? <p className="text-muted" style={{textAlign:'center',padding:'16px 0'}}>No pending appointments</p>
            : appointments.slice(0, 5).map(a => (
                <div className="appt-item" key={a._id}>
                  <div className="appt-time">{new Date(a.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                  <div className="appt-dot" style={{background: a.emergency ? '#e24b4a' : '#1a6fd4'}}/>
                  <div className="pat-info">
                    <div className="pat-name">{a.patientName}</div>
                    <div className="pat-detail">{a.department}</div>
                  </div>
                  <span className={`badge ${a.emergency?'red':a.status==='Pending'?'amber':'blue'}`}>{a.emergency?'Emergency':a.status}</span>
                </div>
              ))
          }
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
