import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { IconUrgent, IconAlertTriangle, IconClock, IconBrain, IconActivity, IconRefresh } from '@tabler/icons-react'

const API = 'https://medai-production-8a03.up.railway.app'
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

const PRIORITY_MAP = { Critical: 'crit', High: 'crit', Medium: 'high', Low: 'med' }
const CACHE_KEY = 'medicore_emergency_analysis'
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

export default function Emergency() {
  const [queue, setQueue] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [analyses, setAnalyses] = useState([])
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [cacheTs, setCacheTs] = useState(null)
  const queueRef = useRef([])

  useEffect(() => {
    axios.get(`${API}/api/appointments?emergency=true&limit=10`)
      .then(r => {
        const appts = r.data.appointments || []
        setQueue(appts)
        queueRef.current = appts
      }).catch(() => {})

    axios.get(`${API}/api/analytics/dashboard`)
      .then(r => setAnalytics(r.data.analytics)).catch(() => {})

    // Load from cache only — never auto-run AI
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
      if (cached?.analyses?.length > 0) {
        setAnalyses(cached.analyses)
        setCacheTs(cached.ts)
      }
    } catch {}
  }, [])

  const analyzeTop = async () => {
    const appts = queueRef.current
    if (appts.length === 0) return
    setLoadingAnalysis(true)
    setAnalyses([])
    const top = appts.slice(0, 2)
    const results = []
    for (const a of top) {
      try {
        const r = await axios.post(`${API}/api/agent/chat`, {
          messages: [{ role: 'user', content: `Briefly analyze these symptoms: "${a.symptoms || a.patientName}". What is the likely condition and immediate action needed? One sentence each.` }]
        })
        results.push({ name: a.patientName, reply: r.data?.reply || '' })
      } catch { results.push({ name: a.patientName, reply: 'Analysis unavailable.' }) }
    }
    setAnalyses(results)
    const ts = Date.now()
    setCacheTs(ts)
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts, analyses: results })) } catch {}
    setLoadingAnalysis(false)
  }

  const cacheLabel = cacheTs
    ? (() => { const hrs = Math.floor((Date.now() - cacheTs) / 3600000); return hrs < 1 ? 'Just now' : hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs/24)}d ago` })()
    : null

  const priorityLabel = (a) => a.severity || (a.emergency ? 'High' : 'Medium')

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5" >
        {[
          { icon: <IconUrgent size={18}/>, val: analytics?.emergencyAppointments ?? queue.length, label: 'Active Emergencies', cls: 'red' },
          { icon: <IconClock size={18}/>, val: `${analytics ? Math.round((analytics.averageQueueLoad||0)*15) : 45} min`, label: 'Avg Wait Time', cls: 'amber' },
          { icon: <IconActivity size={18}/>, val: 4, label: 'ER Rooms Active', cls: 'blue' },
          { icon: <IconAlertTriangle size={18}/>, val: 2, label: 'Critical Alerts', cls: 'red' },
        ].map(({icon,val,label,cls}) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon ${cls}`}>{icon}</div>
            <div className="stat-val">{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 '>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><IconUrgent size={14} style={{color:'#e24b4a'}}/>Emergency Queue</span>
            <span className="badge red">{queue.length} Active</span>
          </div>
          {queue.length === 0
            ? <p className="text-muted" style={{textAlign:'center',padding:'20px 0'}}>No active emergency cases</p>
            : queue.map((a, i) => {
                const prio = priorityLabel(a)
                return (
                  <div className="emr-item" key={a._id}>
                    <div className={`priority-bar ${PRIORITY_MAP[prio] || 'med'}`}/>
                    <div className="doc-avatar" style={{background:'#fdeaea',color:'#a32d2d',fontSize:10}}>{initials(a.patientName)}</div>
                    <div className="pat-info">
                      <div className="pat-name">{a.patientName}</div>
                      <div className="pat-detail">{a.symptoms || a.department}</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3}}>
                      <span className={`badge ${prio==='Critical'||prio==='High'?'red':prio==='Medium'?'amber':'blue'}`}>{prio}</span>
                      <span className="text-muted">{a.department}</span>
                    </div>
                  </div>
                )
              })
          }
        </div>

        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><IconBrain size={14} style={{color:'#1a6fd4'}}/>AI Severity Analysis</span>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              {cacheLabel && <span className="text-tertiary" style={{fontSize:10}}>{cacheLabel}</span>}
              <button
                title="Run analysis"
                onClick={analyzeTop}
                disabled={loadingAnalysis}
                style={{background:'none',border:'none',cursor:loadingAnalysis?'not-allowed':'pointer',color:loadingAnalysis?'#adb3bb':'#1a6fd4',padding:2,display:'flex',alignItems:'center'}}
              >
                <IconRefresh size={13} style={{animation:loadingAnalysis?'spin 1s linear infinite':'none'}}/>
              </button>
            </div>
          </div>
          {loadingAnalysis && [0,1].map(i => (
            <div key={i} style={{background:i===0?'#fdeaea':'#faeeda',border:`0.5px solid ${i===0?'#f7c1c1':'#fac775'}`,borderRadius:6,padding:'10px 12px',marginBottom:8}}>
              <div className="skeleton" style={{height:10,width:'50%',marginBottom:6}}/>
              <div className="skeleton" style={{height:8,width:'90%'}}/>
            </div>
          ))}
          {!loadingAnalysis && analyses.length === 0 && (
            <p className="text-muted" style={{textAlign:'center',padding:'20px 0'}}>Click <IconRefresh size={11} style={{verticalAlign:'middle'}}/> to run AI analysis</p>
          )}
          {!loadingAnalysis && analyses.map((a, i) => {
            const styles = [
              { bg: '#fdeaea', border: '#f7c1c1', color: '#a32d2d' },
              { bg: '#faeeda', border: '#fac775', color: '#854f0b' },
            ]
            const s = styles[i % 2]
            return (
              <div key={i} style={{background:s.bg,border:`0.5px solid ${s.border}`,borderRadius:6,padding:'10px 12px',marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:500,color:s.color,marginBottom:4}}>{a.name}</div>
                <div style={{fontSize:11,color:'#0f172a',lineHeight:1.5}}>{a.reply}</div>
              </div>
            )
          })}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div className="card">
            <div className="card-hdr"><span className="card-title">ER Stats</span></div>
            {[
              { label: 'Emergency cases today', val: analytics?.emergencyAppointments ?? queue.length, color: '#e24b4a' },
              { label: 'Avg response time', val: '8 min', color: '#1a6fd4' },
              { label: 'Avg wait time', val: `${analytics ? Math.round((analytics.averageQueueLoad||0)*15) : 45} min`, color: '#ef9f27' },
              { label: 'ER rooms available', val: '2 / 6', color: '#3b6d11' },
            ].map(({label, val, color}) => (
              <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'0.5px solid #e4e6ea'}}>
                <span className="text-muted">{label}</span>
                <span style={{fontSize:12,fontWeight:500,color}}>{val}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-hdr"><span className="card-title">Alerts</span></div>
            <div className="alert-item red">
              <IconAlertTriangle size={13} style={{color:'#a32d2d',flexShrink:0}}/>
              <div style={{fontSize:11,color:'#a32d2d'}}>ICU bed capacity at 85%</div>
            </div>
            <div className="alert-item amber">
              <IconClock size={13} style={{color:'#854f0b',flexShrink:0}}/>
              <div style={{fontSize:11,color:'#854f0b'}}>High patient queue in Cardiology</div>
            </div>
            <div className="alert-item blue">
              <IconActivity size={13} style={{color:'#185fa5',flexShrink:0}}/>
              <div style={{fontSize:11,color:'#185fa5'}}>3 doctors on emergency call</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
