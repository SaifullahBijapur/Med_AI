import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { IconUserPlus, IconTrash, IconSearch, IconUrgent } from '@tabler/icons-react'

const STATUSES = ['Pending', 'Scheduled', 'Completed', 'Cancelled']

const API = 'https://medai-production-8a03.up.railway.app'
const AVATAR_COLORS = [
  { bg: '#e8f1fc', color: '#185fa5' }, { bg: '#fdeaea', color: '#a32d2d' },
  { bg: '#eaf3de', color: '#3b6d11' }, { bg: '#eeedfe', color: '#534ab7' },
  { bg: '#faeeda', color: '#854f0b' },
]
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
const DEPARTMENTS = ['Cardiology','Emergency','Orthopedics','Neurology','Gastroenterology','Pulmonology','Pediatrics','Gynecology','General Medicine']

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ fullName: '', age: '', gender: 'Male', phone: '', symptoms: '', department: '', emergency: false, status: 'Pending' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const fetchPatients = () => {
    axios.get(`${API}/api/patients`).then(r => setPatients(r.data.patients || [])).catch(() => {})
  }

  useEffect(() => { fetchPatients() }, [])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const validatePhone = (p) => !p || /^\+?[\d\s\-().]{7,15}$/.test(p.trim())

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.fullName.trim()) { setError('Patient name is required'); return }
    if (!validatePhone(form.phone)) { setError('Invalid phone number (e.g. +91 98765 43210)'); return }
    setError('')
    setSubmitting(true)
    setResult(null)
    try {
      await axios.post(`${API}/api/patients/register`, { fullName: form.fullName, age: form.age, gender: form.gender, phone: form.phone })
      const bookRes = await axios.post(`${API}/api/appointments/book`, {
        patientName: form.fullName,
        patientPhone: form.phone,
        symptoms: form.symptoms || form.fullName,
        department: form.department || undefined,
        emergency: form.emergency,
        status: form.status,
      })
      setResult(bookRes.data)
      setForm({ fullName: '', age: '', gender: 'Male', phone: '', symptoms: '', department: '', emergency: false, status: 'Pending' })
      fetchPatients()
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check backend is running.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return
    try {
      await axios.delete(`${API}/api/patients/${id}`)
      fetchPatients()
    } catch { alert('Delete failed') }
  }

  const filtered = patients.filter(p => p.fullName?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><IconUserPlus size={14} style={{color:'#1a6fd4'}}/>Register Patient</span>
          </div>
          {error && <div className="alert-item red" style={{marginBottom:10}}><span style={{fontSize:11,color:'#a32d2d'}}>{error}</span></div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="inp" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Patient full name" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="inp" name="age" type="number" value={form.age} onChange={handleChange} placeholder="Age" min={0} max={120}/>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="inp" name="gender" value={form.gender} onChange={handleChange}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="inp" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Chief Complaint / Symptoms</label>
              <textarea className="inp" name="symptoms" rows={3} value={form.symptoms} onChange={handleChange} placeholder="Describe symptoms for AI triage…"/>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preferred Dept <span style={{color:'#adb3bb'}}>(optional)</span></label>
                <select className="inp" name="department" value={form.department} onChange={handleChange}>
                  <option value="">— AI assigns —</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Appointment Status</label>
                <select className="inp" name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',marginBottom:10,borderRadius:6,background: form.emergency ? '#fdeaea' : '#f7f8fa',border:`0.5px solid ${form.emergency ? '#f7c1c1' : '#e4e6ea'}`,transition:'all .15s'}}>
              <input type="checkbox" id="pat-emergency" name="emergency" checked={form.emergency} onChange={handleChange} style={{width:14,height:14,cursor:'pointer',accentColor:'#e24b4a'}}/>
              <label htmlFor="pat-emergency" style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer',fontSize:12,fontWeight:500,color: form.emergency ? '#a32d2d' : '#666c74',flex:1}}>
                <IconUrgent size={13} style={{color: form.emergency ? '#e24b4a' : '#adb3bb'}}/>
                Mark as Emergency Case
              </label>
              {form.emergency && <span className="badge red">Priority</span>}
            </div>
            <button className="btn-primary" type="submit" disabled={submitting} style={{width:'100%',justifyContent:'center', background: form.emergency ? '#e24b4a' : undefined}}>
              {submitting ? 'Registering…' : form.emergency ? 'Register Emergency' : 'Register & Book Appointment'}
            </button>
          </form>

          {result?.success && (
            <div style={{marginTop:12,background:'#eaf3de',border:'0.5px solid #c0dd97',borderRadius:6,padding:'12px 14px'}}>
              <div style={{fontSize:12,fontWeight:500,color:'#3b6d11',marginBottom:6}}>Registration successful</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                {[
                  ['Department', result.appointment?.department],
                  ['Assigned Doctor', result.appointment?.doctorName || result.appointment?.doctorId || 'TBA'],
                  ['Queue #', result.appointment?.queueNumber],
                  ['Est. Wait', `${result.appointment?.estimatedWaitTime || '—'} min`],
                  ['Severity', result.appointment?.severity],
                  ['Emergency', result.appointment?.emergency ? 'Yes' : 'No'],
                ].filter(([,v]) => v !== undefined && v !== null).map(([label, val]) => (
                  <div key={label}>
                    <div style={{fontSize:10,color:'#666c74'}}>{label}</div>
                    <div style={{fontSize:12,fontWeight:500,color:'#1a1c1e'}}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Patient Records</span>
            <span className="text-muted">{filtered.length} patients</span>
          </div>
          <div style={{position:'relative',marginBottom:10}}>
            <span style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'#adb3bb',display:'flex'}}>
              <IconSearch size={13}/>
            </span>
            <input className="inp" style={{paddingLeft:28}} placeholder="Search patients…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Patient</th><th>Age</th><th>Gender</th><th>Admitted</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={7} style={{textAlign:'center',padding:'20px 0',color:'#adb3bb'}}>No patients found</td></tr>
                  : filtered.map((p, i) => (
                      <tr key={p._id}>
                        <td className="td-id">#{String(i+1).padStart(3,'0')}</td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:7}}>
                            <div className="pat-avatar" style={AVATAR_COLORS[i%5]}>{initials(p.fullName)}</div>
                            <div>
                              <div style={{fontSize:12,fontWeight:500}}>{p.fullName}</div>
                              <div className="pat-detail">{p.phone || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.age || '—'}</td>
                        <td>{p.gender || '—'}</td>
                        <td>{new Date(p.createdAt).toLocaleDateString('en-IN',{month:'short',day:'numeric',year:'numeric'})}</td>
                        <td><span className="badge green">Active</span></td>
                        <td>
                          <button style={{background:'none',border:'none',cursor:'pointer',color:'#adb3bb',padding:4}} onClick={() => handleDelete(p._id)} title="Delete">
                            <IconTrash size={13}/>
                          </button>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card w/3" style={{alignSelf:'start',position:'sticky',top:0,}}>
        <div className="card-hdr"><span className="card-title">Quick Stats</span></div>
        {[
          { label: 'Total registered', val: patients.length, color: '#1a6fd4' },
          { label: 'Active today', val: Math.min(patients.length, 12), color: '#3b6d11' },
          { label: 'New this week', val: patients.filter(p => Date.now()-new Date(p.createdAt)<7*86400000).length, color: '#854f0b' },
          { label: 'Emergency patients', val: 3, color: '#e24b4a' },
        ].map(({label,val,color}) => (
          <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'0.5px solid #e4e6ea'}}>
            <span className="text-muted">{label}</span>
            <span style={{fontSize:14,fontWeight:500,color}}>{val}</span>
          </div>
        ))}
        <hr className="divider"/>
        <div style={{fontSize:11,color:'#adb3bb',lineHeight:1.6}}>
          Registering a patient automatically runs AI triage and assigns the most suitable available doctor.
        </div>
      </div>
    </div>
  )
}
