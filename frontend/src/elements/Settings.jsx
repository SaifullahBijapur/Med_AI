import React, { useState } from 'react'
import { IconBuildingHospital, IconBell, IconBrain, IconShield, IconDatabase } from '@tabler/icons-react'

const MENU = [
  { id: 'hospital', icon: <IconBuildingHospital size={14}/>, label: 'Hospital Info' },
  { id: 'notifications', icon: <IconBell size={14}/>, label: 'Notifications' },
  { id: 'ai', icon: <IconBrain size={14}/>, label: 'AI Features' },
  { id: 'security', icon: <IconShield size={14}/>, label: 'Security' },
  { id: 'data', icon: <IconDatabase size={14}/>, label: 'Data & Backup' },
]

function Toggle({ label, desc, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'0.5px solid var(--color-border-tertiary)'}}>
      <div>
        <div style={{fontSize:12,fontWeight:500,color:'var(--color-text-primary)'}}>{label}</div>
        {desc && <div className="text-muted" style={{marginTop:2}}>{desc}</div>}
      </div>
      <div className={`toggle ${on?'on':'off'}`} onClick={()=>setOn(v=>!v)} style={{cursor:'pointer'}}>
        <div className="toggle-thumb"/>
      </div>
    </div>
  )
}

export default function Settings() {
  const [active, setActive] = useState('hospital')
  const [saved, setSaved] = useState(false)
  const [hospital, setHospital] = useState({
    name: 'MediCore General Hospital',
    address: '123 Healthcare Avenue, Medical District',
    phone: '+91 (22) 4567-8900',
    email: 'admin@medicore.hospital',
    beds: '220',
    founded: '1985',
    type: 'Multi-Specialty',
  })

  const handleSave = e => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="section-row">
      <div className="card" style={{alignSelf:'start'}}>
        <div style={{fontSize:12,fontWeight:500,marginBottom:8,color:'var(--color-text-primary)'}}>Settings</div>
        {MENU.map(({id,icon,label}) => (
          <div
            key={id}
            className={`nav-item${active===id?' active':''}`}
            style={{borderRadius:6,marginBottom:2}}
            onClick={()=>setActive(id)}
          >
            {icon}{label}
          </div>
        ))}
      </div>

      <div className="card">
        {active === 'hospital' && (
          <>
            <div className="card-hdr">
              <span className="card-title"><IconBuildingHospital size={14} style={{color:'#1a6fd4'}}/>Hospital Information</span>
              {saved && <span className="badge green">Saved</span>}
            </div>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hospital Name</label>
                  <input className="inp" value={hospital.name} onChange={e=>setHospital(h=>({...h,name:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="inp" value={hospital.type} onChange={e=>setHospital(h=>({...h,type:e.target.value}))}>
                    <option>Multi-Specialty</option>
                    <option>General</option>
                    <option>Specialty</option>
                    <option>Teaching</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="inp" value={hospital.address} onChange={e=>setHospital(h=>({...h,address:e.target.value}))}/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="inp" value={hospital.phone} onChange={e=>setHospital(h=>({...h,phone:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="inp" type="email" value={hospital.email} onChange={e=>setHospital(h=>({...h,email:e.target.value}))}/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Beds</label>
                  <input className="inp" type="number" value={hospital.beds} onChange={e=>setHospital(h=>({...h,beds:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Founded</label>
                  <input className="inp" value={hospital.founded} onChange={e=>setHospital(h=>({...h,founded:e.target.value}))}/>
                </div>
              </div>
              <button className="btn-primary" type="submit">Save Changes</button>
            </form>
          </>
        )}

        {active === 'notifications' && (
          <>
            <div className="card-hdr"><span className="card-title"><IconBell size={14} style={{color:'#1a6fd4'}}/>Notification Settings</span></div>
            <Toggle label="Emergency Alerts" desc="Receive immediate alerts for critical cases" defaultOn={true}/>
            <Toggle label="Appointment Reminders" desc="Notify staff 30 min before appointments" defaultOn={true}/>
            <Toggle label="Bed Status Updates" desc="Alert when bed availability drops below 20%" defaultOn={false}/>
            <Toggle label="Doctor Schedule Conflicts" desc="Flag overlapping appointment bookings" defaultOn={true}/>
            <Toggle label="System Maintenance Alerts" desc="Notify about planned maintenance windows" defaultOn={false}/>
          </>
        )}

        {active === 'ai' && (
          <>
            <div className="card-hdr"><span className="card-title"><IconBrain size={14} style={{color:'#1a6fd4'}}/>AI Feature Settings</span></div>
            <Toggle label="AI Triage" desc="Automatically assess patient severity on admission" defaultOn={true}/>
            <Toggle label="Smart Scheduling" desc="AI-optimized appointment slot recommendations" defaultOn={true}/>
            <Toggle label="Predictive Analytics" desc="Forecast patient volume and resource needs" defaultOn={true}/>
            <Toggle label="Report Summarization" desc="Auto-generate summaries for uploaded reports" defaultOn={false}/>
            <Toggle label="Doctor Assistant" desc="AI chat assistant for clinical decision support" defaultOn={true}/>
            <div className="form-group" style={{marginTop:14}}>
              <label className="form-label">AI Model</label>
              <select className="inp">
                <option>Gemini 2.5 Flash (Recommended)</option>
                <option>Gemini 2.5 Flash Lite</option>
              </select>
            </div>
          </>
        )}

        {active === 'security' && (
          <>
            <div className="card-hdr"><span className="card-title"><IconShield size={14} style={{color:'#1a6fd4'}}/>Security Settings</span></div>
            <Toggle label="Two-Factor Authentication" desc="Require 2FA for admin accounts" defaultOn={false}/>
            <Toggle label="Session Timeout" desc="Auto-logout after 30 minutes of inactivity" defaultOn={true}/>
            <Toggle label="Audit Logging" desc="Log all access to patient records" defaultOn={true}/>
            <Toggle label="Data Encryption" desc="Encrypt all patient data at rest" defaultOn={true}/>
            <div className="form-group" style={{marginTop:14}}>
              <label className="form-label">Session Timeout (minutes)</label>
              <input className="inp" type="number" defaultValue={30} min={5} max={120}/>
            </div>
          </>
        )}

        {active === 'data' && (
          <>
            <div className="card-hdr"><span className="card-title"><IconDatabase size={14} style={{color:'#1a6fd4'}}/>Data & Backup</span></div>
            <Toggle label="Automatic Backups" desc="Daily backup to secure cloud storage" defaultOn={true}/>
            <Toggle label="HIPAA Compliance Mode" desc="Enforce strict data handling policies" defaultOn={true}/>
            <Toggle label="Data Retention Policy" desc="Auto-archive records older than 7 years" defaultOn={false}/>
            <div style={{marginTop:14,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <button className="btn-outline">Export Patient Data</button>
              <button className="btn-outline">Export Reports</button>
              <button className="btn-outline">Backup Now</button>
              <button className="btn-outline" style={{color:'#e24b4a',borderColor:'#e24b4a'}}>Clear Test Data</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
