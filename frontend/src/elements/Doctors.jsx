import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { IconStethoscope, IconUserPlus, IconCalendar, IconX } from '@tabler/icons-react'

const API = 'https://medai-production-8a03.up.railway.app'
const DOC_COLORS = [
  { bg: '#e8f1fc', color: '#185fa5' }, { bg: '#eaf3de', color: '#3b6d11' },
  { bg: '#eeedfe', color: '#534ab7' }, { bg: '#fdeaea', color: '#a32d2d' },
  { bg: '#faeeda', color: '#854f0b' },
]
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
const DEPARTMENTS = ['Cardiology','Emergency','Orthopedics','Neurology','Gastroenterology','Pulmonology','Pediatrics','Gynecology','General Medicine']

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [selected, setSelected] = useState(null)
  const [selectedAppts, setSelectedAppts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ doctorname: '', email: '', department: 'Cardiology', experience: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchDoctors = () => {
    axios.get(`${API}/api/doctors`).then(r => setDoctors(r.data.doctors || [])).catch(() => {})
  }

  useEffect(() => { fetchDoctors() }, [])

  const selectDoctor = (doc) => {
    setSelected(doc)
    axios.get(`${API}/api/appointments?doctorId=${doc._id}&limit=5`)
      .then(r => setSelectedAppts(r.data.appointments || [])).catch(() => setSelectedAppts([]))
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleRegister = async e => {
    e.preventDefault()
    if (!form.doctorname.trim()) { setError('Name required'); return }
    setError('')
    setSubmitting(true)
    try {
      await axios.post(`${API}/api/doctors/register`, form)
      setShowForm(false)
      setForm({ doctorname: '', email: '', department: 'Cardiology', experience: '' })
      fetchDoctors()
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="section-row">
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><IconStethoscope size={14} style={{color:'#1a6fd4'}}/>Doctor Directory</span>
            <button className="btn-outline" style={{padding:'5px 10px',fontSize:11}} onClick={()=>setShowForm(s=>!s)}>
              <IconUserPlus size={13}/>{showForm ? 'Cancel' : 'Add Doctor'}
            </button>
          </div>

          {showForm && (
            <div className="form-wrapper">
              {error && (
                <div className="form-wrapper">
                  {error}
                </div>
              )}
              <form onSubmit={handleRegister}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="inp" name="doctorname" value={form.doctorname} onChange={handleChange} placeholder="Dr. Full Name" required/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span style={{color:'#adb3bb'}}>(optional)</span></label>
                    <input className="inp" name="email" type="email" value={form.email} onChange={handleChange} placeholder="doctor@hospital.com"/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select className="inp" name="department" value={form.department} onChange={handleChange}>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience <span style={{color:'#adb3bb'}}>(years)</span></label>
                    <input className="inp" name="experience" type="number" min="0" max="50" value={form.experience} onChange={handleChange} placeholder="e.g. 8"/>
                  </div>
                </div>
                <button className="btn-primary" type="submit" disabled={submitting} style={{width:'100%',justifyContent:'center'}}>
                  {submitting ? 'Registering…' : 'Register Doctor'}
                </button>
              </form>
            </div>
          )}

          {doctors.length === 0
            ? <p className="text-muted" style={{textAlign:'center',padding:'20px 0'}}>No doctors registered yet</p>
            : doctors.map((doc, i) => (
                <div
                  className={`doctor-row${selected?._id === doc._id ? ' active' : ''}`}
                  key={doc._id}
                  onClick={() => selectDoctor(doc)}
                  style={selected?._id === doc._id ? {background:'#e8f1fc',margin:'0 -14px',padding:'7px 14px'} : {}}
                >
                  <div className="doc-avatar" style={DOC_COLORS[i%5]}>{initials(doc.name || doc.doctorname)}</div>
                  <div className="doc-info">
                    <div className="doc-name">{doc.name || doc.doctorname}</div>
                    <div className="doc-dept">{doc.department}{doc.experience ? ` · ${doc.experience}yr exp` : ''}</div>
                  </div>
                  <div className={`status-dot ${doc.available !== false ? 'on' : 'off'}`}/>
                </div>
              ))
          }
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {selected ? (
          <div className="card">
            <div className="card-hdr">
              <span className="card-title"><IconCalendar size={14} style={{color:'#1a6fd4'}}/>Schedule — {selected.doctorname}</span>
              <button style={{background:'none',border:'none',cursor:'pointer',color:'#adb3bb'}} onClick={()=>setSelected(null)}><IconX size={14}/></button>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0 12px',borderBottom:'0.5px solid #e4e6ea',marginBottom:12}}>
              <div className="doc-avatar" style={{...DOC_COLORS[0],width:40,height:40,fontSize:14}}>{initials(selected.doctorname)}</div>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>{selected.name || selected.doctorname}</div>
                <div className="text-muted">{selected.department}</div>
                {selected.email && <div style={{fontSize:10,color:'#adb3bb'}}>{selected.email}</div>}
              </div>
              <span className={`badge ${selected.available!==false?'green':'gray'}`} style={{marginLeft:'auto'}}>{selected.available!==false?'Available':'Unavailable'}</span>
            </div>
            <div style={{fontSize:11,fontWeight:500,color:'#666c74',marginBottom:8}}>Today's Appointments</div>
            {selectedAppts.length === 0
              ? <p className="text-muted" style={{padding:'12px 0'}}>No appointments today</p>
              : selectedAppts.map(a => (
                  <div className="appt-item" key={a._id}>
                    <div className="appt-time">{new Date(a.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                    <div className="appt-dot" style={{background: a.emergency?'#e24b4a':'#1a6fd4'}}/>
                    <div className="pat-info">
                      <div className="pat-name">{a.patientName}</div>
                      <div className="pat-detail">{a.symptoms?.slice(0,40) || a.department}</div>
                    </div>
                    <span className={`badge ${a.emergency?'red':'blue'}`}>{a.emergency?'Emergency':a.status}</span>
                  </div>
                ))
            }
          </div>
        ) : (
          <div className="card" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:200,gap:10}}>
            <IconStethoscope size={32} style={{color:'#e4e6ea'}}/>
            <div style={{fontSize:13,color:'#adb3bb'}}>Select a doctor to view schedule</div>
          </div>
        )}

        <div className="card">
          <div className="card-hdr"><span className="card-title">Department Summary</span></div>
          {(() => {
            const deptCount = {}
            doctors.forEach(d => { deptCount[d.department] = (deptCount[d.department]||0)+1 })
            return Object.entries(deptCount).slice(0,6).map(([dept, cnt]) => (
              <div className="dept-row" key={dept}>
                <div className="dept-name">{dept}</div>
                <div className="dept-bar-wrap">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width:`${Math.min((cnt/Math.max(doctors.length,1))*100*3,100)}%`,background:'#1a6fd4'}}/>
                  </div>
                </div>
                <span className="text-muted" style={{marginLeft:6}}>{cnt} dr{cnt!==1?'s':''}</span>
              </div>
            ))
          })()}
          {doctors.length === 0 && <p className="text-muted" style={{textAlign:'center',padding:'12px 0'}}>No data</p>}
        </div>
      </div>
    </div>
  )
}
