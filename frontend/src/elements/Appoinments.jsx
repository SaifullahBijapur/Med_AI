import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { IconCalendarEvent, IconPlus, IconRobot, IconUrgent } from '@tabler/icons-react'

const DEPARTMENTS = ['','Cardiology','Emergency','Orthopedics','Neurology','Gastroenterology','Pulmonology','Dermatology','Pediatrics','Gynecology','General Medicine']
const STATUSES = ['Pending','Scheduled','Completed','Cancelled']

const API = 'https://medai-production-8a03.up.railway.app'
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function MiniCalendar({ appointments }) {
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const first = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const apptDates = new Set(appointments.map(a => {
    const d = new Date(a.createdAt)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }))

  const prev = () => setView(v => v.month===0?{year:v.year-1,month:11}:{year:v.year,month:v.month-1})
  const next = () => setView(v => v.month===11?{year:v.year+1,month:0}:{year:v.year,month:v.month+1})

  const cells = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <button style={{background:'none',border:'none',cursor:'pointer',color:'#666c74',fontSize:14,padding:'2px 6px'}} onClick={prev}>‹</button>
        <span style={{fontSize:12,fontWeight:500}}>{MONTHS[view.month]} {view.year}</span>
        <button style={{background:'none',border:'none',cursor:'pointer',color:'#666c74',fontSize:14,padding:'2px 6px'}} onClick={next}>›</button>
      </div>
      <div className="calendar-grid">
        {DAYS.map(d => <div key={d} className="cal-day hdr">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`}/>
          const isToday = d===today.getDate() && view.month===today.getMonth() && view.year===today.getFullYear()
          const hasAppt = apptDates.has(`${view.year}-${view.month}-${d}`)
          return <div key={d} className={`cal-day${isToday?' today':''}${hasAppt&&!isToday?' has-appt':''}`}>{d}</div>
        })}
      </div>
    </div>
  )
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState({ patientName: '', patientPhone: '', symptoms: '', department: '', emergency: false, status: 'Pending' })
  const [submitting, setSubmitting] = useState(false)
  const [booked, setBooked] = useState(null)
  const [error, setError] = useState('')
  const [aiSuggestion] = useState('AI scheduling: Cardiology peak hours are 9–11 AM. Consider booking new cardiac patients after 2 PM for shorter wait times.')

  const fetchAppts = () => {
    axios.get(`${API}/api/appointments?limit=10`).then(r => setAppointments(r.data.appointments || [])).catch(() => {})
  }

  useEffect(() => { fetchAppts() }, [])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const validatePhone = (p) => !p || /^\+?[\d\s\-().]{7,15}$/.test(p.trim())

  const handleBook = async e => {
    e.preventDefault()
    if (!form.patientName.trim()) { setError('Patient name is required'); return }
    if (!form.symptoms.trim()) { setError('Symptoms are required for AI triage'); return }
    if (!validatePhone(form.patientPhone)) { setError('Invalid phone number (e.g. +91 98765 43210)'); return }
    setError('')
    setSubmitting(true)
    setBooked(null)
    try {
      const r = await axios.post(`${API}/api/appointments/book`, form)
      setBooked(r.data)
      setForm({ patientName: '', patientPhone: '', symptoms: '', department: '', emergency: false, status: 'Pending' })
      fetchAppts()
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'220px 1fr 260px',gap:10}}>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <div className="card">
          <div className="card-hdr"><span className="card-title">Calendar</span></div>
          <MiniCalendar appointments={appointments}/>
        </div>
        <div className="card">
          <div className="card-hdr"><span className="card-title">Today</span></div>
          {[
            { label: 'Total appointments', val: appointments.length, color: '#1a6fd4' },
            { label: 'Emergency', val: appointments.filter(a=>a.emergency).length, color: '#e24b4a' },
            { label: 'Pending', val: appointments.filter(a=>a.status==='Pending').length, color: '#ef9f27' },
            { label: 'Completed', val: appointments.filter(a=>a.status==='Completed').length, color: '#3b6d11' },
          ].map(({label,val,color}) => (
            <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'0.5px solid #e4e6ea'}}>
              <span className="text-muted">{label}</span>
              <span style={{fontSize:12,fontWeight:500,color}}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><IconCalendarEvent size={14} style={{color:'#1a6fd4'}}/>Appointment Queue</span>
            <span className="badge blue">{appointments.length} total</span>
          </div>
          <div style={{background:'#e8f1fc',border:'0.5px solid #b5d4f4',borderRadius:6,padding:'8px 12px',marginBottom:10,display:'flex',gap:8,alignItems:'flex-start'}}>
            <IconRobot size={13} style={{color:'#1a6fd4',flexShrink:0,marginTop:1}}/>
            <div style={{fontSize:11,color:'#185fa5'}}>{aiSuggestion}</div>
          </div>
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Patient</th><th>Department</th><th>Time</th><th>Wait</th><th>Status</th></tr>
              </thead>
              <tbody>
                {appointments.length === 0
                  ? <tr><td colSpan={6} style={{textAlign:'center',padding:'20px 0',color:'#adb3bb'}}>No appointments yet</td></tr>
                  : appointments.map((a, i) => (
                      <tr key={a._id}>
                        <td className="td-id">{a.queueNumber || i+1}</td>
                        <td>
                          <div style={{fontSize:12,fontWeight:500}}>{a.patientName}</div>
                          <div className="pat-detail">{a.patientPhone || ''}</div>
                        </td>
                        <td>{a.department}</td>
                        <td style={{whiteSpace:'nowrap'}}>{new Date(a.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</td>
                        <td>{a.estimatedWaitTime ? `${a.estimatedWaitTime} min` : '—'}</td>
                        <td><span className={`badge ${a.emergency?'red':a.status==='Completed'?'green':a.status==='Pending'?'amber':'blue'}`}>{a.emergency?'Emergency':a.status||'Pending'}</span></td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><IconPlus size={14} style={{color:'#1a6fd4'}}/>Book Appointment</span>
          </div>
          {error && <div style={{fontSize:11,color:'#a32d2d',marginBottom:8,padding:'6px 10px',background:'#fdeaea',borderRadius:4}}>{error}</div>}
          {booked?.success ? (
            <div style={{background:'#eaf3de',border:'0.5px solid #c0dd97',borderRadius:6,padding:'12px 14px'}}>
              <div style={{fontSize:12,fontWeight:500,color:'#3b6d11',marginBottom:8}}>Appointment Booked!</div>
              {[
                ['Queue #', booked.appointment?.queueNumber],
                ['Department', booked.appointment?.department],
                ['Doctor', booked.appointment?.doctorName || 'TBA'],
                ['Wait', `${booked.appointment?.estimatedWaitTime || '—'} min`],
                ['Severity', booked.appointment?.severity],
                ['Emergency', booked.appointment?.emergency ? 'Yes' : 'No'],
              ].filter(([,v])=>v!==undefined&&v!==null).map(([label,val]) => (
                <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}>
                  <span style={{fontSize:11,color:'#666c74'}}>{label}</span>
                  <span style={{fontSize:11,fontWeight:500}}>{val}</span>
                </div>
              ))}
              <button className="btn-outline" style={{marginTop:10,width:'100%',justifyContent:'center'}} onClick={()=>setBooked(null)}>Book Another</button>
            </div>
          ) : (
            <form onSubmit={handleBook}>
              <div className="form-group">
                <label className="form-label">Patient Name *</label>
                <input className="inp" name="patientName" value={form.patientName} onChange={handleChange} placeholder="Full name" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="inp" name="patientPhone" type="tel" value={form.patientPhone} onChange={handleChange} placeholder="+91 98765 43210"/>
              </div>
              <div className="form-group">
                <label className="form-label">Symptoms *</label>
                <textarea className="inp" name="symptoms" rows={3} value={form.symptoms} onChange={handleChange} placeholder="Describe symptoms for AI triage…" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Department <span style={{color:'#adb3bb'}}>(AI will assign if blank)</span></label>
                <select className="inp" name="department" value={form.department} onChange={handleChange}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d || '— Auto-assign by AI —'}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="inp" name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',marginBottom:10,background: form.emergency ? '#fdeaea' : 'transparent',borderRadius:6,paddingLeft: form.emergency ? 10 : 0,transition:'all .15s'}}>
                <input
                  type="checkbox"
                  id="emergency-chk"
                  name="emergency"
                  checked={form.emergency}
                  onChange={handleChange}
                  style={{width:14,height:14,cursor:'pointer',accentColor:'#e24b4a'}}
                />
                <label htmlFor="emergency-chk" style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer',fontSize:12,fontWeight:500,color: form.emergency ? '#a32d2d' : '#666c74'}}>
                  <IconUrgent size={13} style={{color: form.emergency ? '#e24b4a' : '#adb3bb'}}/>
                  Mark as Emergency
                </label>
                {form.emergency && <span className="badge red" style={{marginLeft:'auto'}}>Priority</span>}
              </div>
              <button className="btn-primary" type="submit" disabled={submitting} style={{width:'100%',justifyContent:'center', background: form.emergency ? '#e24b4a' : undefined}}>
                {submitting ? 'Booking…' : form.emergency ? 'Book Emergency' : 'Book Appointment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
