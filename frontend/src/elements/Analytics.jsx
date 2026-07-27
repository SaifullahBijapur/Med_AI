import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Filler, Tooltip, Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { IconTrendingUp, IconUsers, IconClock, IconStarFilled, IconBrain, IconRefresh } from '@tabler/icons-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend)

const API = 'https://medai-production-8a03.up.railway.app'

const chartOpts = (yLabel = '') => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#adb3bb', font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
    y: { ticks: { color: '#adb3bb', font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
  },
})

const patientTrendsData = {
  labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  datasets: [{
    label: 'Admissions', data: [42,38,51,47,63,29,35],
    borderColor: '#1a6fd4', backgroundColor: 'rgba(26,111,212,0.08)', tension: 0.4, fill: true, pointRadius: 3,
  }, {
    label: 'Discharges', data: [38,41,44,39,55,31,28],
    borderColor: '#639922', backgroundColor: 'transparent', tension: 0.4, fill: false, pointRadius: 3, borderDash: [3,3],
  }],
}

const deptPerfData = {
  labels: ['Cardiology','Emergency','Ortho','Neuro','Pediatrics','Gastro'],
  datasets: [{
    label: 'Patients', data: [45,78,32,28,55,21],
    backgroundColor: ['#e8f1fc','#fdeaea','#eaf3de','#eeedfe','#faeeda','#e4e6ea'].map(c=>c),
    borderColor: ['#1a6fd4','#e24b4a','#639922','#534ab7','#ef9f27','#adb3bb'],
    borderWidth: 1,
  }],
}

const emergencyData = {
  labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
  datasets: [{
    label: 'Emergency', data: [12,18,14,22,19,28,24],
    backgroundColor: '#fdeaea', borderColor: '#e24b4a', borderWidth: 1,
  }],
}

const FORECAST_STYLES = [
  { bg: '#e8f1fc', border: '#b5d4f4', color: '#185fa5', strongColor: '#0c447c' },
  { bg: '#faeeda', border: '#fac775', color: '#854f0b', strongColor: '#633806' },
  { bg: '#eaf3de', border: '#c0dd97', color: '#3b6d11', strongColor: '#27500a' },
]

function parseForecasts(text = '') {
  return text.split('\n').map(l => l.replace(/^[-*•\d.]+\s*/, '').trim()).filter(Boolean).slice(0, 3)
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000
const CACHE_KEY = 'medicore_forecast'

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [forecasts, setForecasts] = useState([])
  const [forecastLoading, setForecastLoading] = useState(false)
  const analyticsRef = React.useRef(null)

  const fetchForecast = async (a, force = false) => {
    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
        if (cached && Date.now() - cached.ts < TWO_DAYS_MS && cached.forecasts?.length > 0) {
          setForecasts(cached.forecasts)
          return
        }
      } catch {}
    }
    setForecastLoading(true)
    setForecasts([])
    try {
      const stats = a || analyticsRef.current || {}
      const r2 = await axios.post(`${API}/api/agent/chat`, {
        messages: [{ role: 'user', content: `Hospital stats: ${stats.totalDoctors} doctors, ${stats.totalAppointments} appointments, ${stats.emergencyAppointments} emergencies, top dept: ${stats.topDepartment}. Give 3 one-sentence forecast predictions for next 7 days. Format as 3 bullet lines with a bold title.` }]
      })
      const lines = parseForecasts(r2.data?.reply || '')
      setForecasts(lines)
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), forecasts: lines })) } catch {}
    } catch {}
    setForecastLoading(false)
  }

  useEffect(() => {
    axios.get(`${API}/api/analytics/dashboard`).then(r => {
      const a = r.data.analytics
      analyticsRef.current = a
      setAnalytics(a)
    }).catch(() => {})

    // Load from cache only — AI runs only on manual refresh
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
      if (cached?.forecasts?.length > 0) setForecasts(cached.forecasts)
    } catch {}
  }, [])

  return (
    <>
      <div className="stats-row">
        {[
          { icon: <IconTrendingUp size={18}/>, val: analytics ? `+${Math.min((analytics.totalAppointments||0)%20+4,25)}%` : '—', label: 'Patient Growth', cls: 'blue' },
          { icon: <IconClock size={18}/>, val: analytics ? `${Math.round((analytics.averageQueueLoad||0)*24+2.5)}h` : '—', label: 'Avg Stay Duration', cls: 'amber' },
          { icon: <IconUsers size={18}/>, val: analytics?.totalDoctors ?? '—', label: 'Doctors Active', cls: 'purple' },
          { icon: <IconUsers size={18}/>, val: analytics?.totalAppointments ?? '—', label: 'Total Appointments', cls: 'green' },
          { icon: <IconStarFilled size={18}/>, val: '4.8', label: 'Patient Satisfaction', cls: 'amber' },
        ].map(({icon,val,label,cls}) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon ${cls}`}>{icon}</div>
            <div className="stat-val">{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="card">
          <div className="card-hdr"><span className="card-title">Patient Trends (7-day)</span></div>
          <div className="chart-wrap"><Line data={patientTrendsData} options={chartOpts()}/></div>
          <div style={{display:'flex',gap:14,marginTop:8}}>
            <div style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:'#666c74'}}>
              <div style={{width:20,height:2,background:'#1a6fd4',borderRadius:1}}/>Admissions
            </div>
            <div style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:'#666c74'}}>
              <div style={{width:20,height:2,background:'#639922',borderRadius:1,borderTop:'2px dashed #639922'}}/>Discharges
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hdr"><span className="card-title">Department Performance</span></div>
          <div className="chart-wrap"><Bar data={deptPerfData} options={chartOpts()}/></div>
        </div>

        <div className="card">
          <div className="card-hdr"><span className="card-title">Emergency Statistics</span></div>
          <div className="mini-chart"><Bar data={emergencyData} options={chartOpts()}/></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginTop:10}}>
            {[
              { label: 'This month', val: analytics?.emergencyAppointments ?? 24, color: '#e24b4a' },
              { label: 'Critical', val: Math.round((analytics?.emergencyAppointments||24)*0.3), color: '#a32d2d' },
              { label: 'Resolved', val: Math.round((analytics?.emergencyAppointments||24)*0.85), color: '#3b6d11' },
            ].map(({label,val,color}) => (
              <div key={label} className="metric-mini">
                <div className="metric-mini-val" style={{color}}>{val}</div>
                <div className="metric-mini-lbl">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><IconBrain size={14} style={{color:'#1a6fd4'}}/>AI Forecast — Next 7 Days</span>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              {(() => {
                try {
                  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
                  if (cached?.ts) {
                    const hrs = Math.floor((Date.now() - cached.ts) / 3600000)
                    const label = hrs < 1 ? 'Just now' : hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs/24)}d ago`
                    return <span className="text-tertiary" style={{fontSize:10}}>{label}</span>
                  }
                } catch {}
                return null
              })()}
              <button
                title="Refresh forecast"
                onClick={() => fetchForecast(analyticsRef.current, true)}
                disabled={forecastLoading}
                style={{background:'none',border:'none',cursor:forecastLoading?'not-allowed':'pointer',color:forecastLoading?'#adb3bb':'#1a6fd4',padding:2,display:'flex',alignItems:'center'}}
              >
                <IconRefresh size={13} style={{animation:forecastLoading?'spin 1s linear infinite':'none'}}/>
              </button>
            </div>
          </div>
          {forecastLoading && FORECAST_STYLES.map((s,i) => (
            <div key={i} style={{background:s.bg,border:`0.5px solid ${s.border}`,borderRadius:6,padding:'10px 12px',marginBottom:8}}>
              <div className="skeleton" style={{height:10,width:'55%',marginBottom:6}}/>
              <div className="skeleton" style={{height:8,width:'90%'}}/>
            </div>
          ))}
          {!forecastLoading && forecasts.length === 0 && (
            <p className="text-muted" style={{textAlign:'center',padding:'20px 0'}}>Click <IconRefresh size={11} style={{verticalAlign:'middle'}}/> to generate AI forecast</p>
          )}
          {!forecastLoading && forecasts.map((line, i) => {
                const s = FORECAST_STYLES[i]
                const colonIdx = line.indexOf(':')
                const bold = colonIdx>-1 ? line.slice(0,colonIdx) : 'Forecast'
                const rest = colonIdx>-1 ? line.slice(colonIdx+1).trim() : line
                return (
                  <div key={i} style={{background:s.bg,border:`0.5px solid ${s.border}`,borderRadius:6,padding:'10px 12px',marginBottom:8}}>
                    <div style={{fontSize:11,color:s.color,lineHeight:1.5}}>
                      <strong style={{color:s.strongColor,display:'block',marginBottom:2}}>{bold}</strong>{rest}
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
