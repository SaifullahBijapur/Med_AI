import React, { useState } from 'react'
import { IconBed, IconPlus } from '@tabler/icons-react'

const BEDS = [
  ...Array(18).fill('occupied'),
  ...Array(8).fill('reserved'),
  ...Array(6).fill('icu'),
  ...Array(32).fill('available'),
].slice(0, 64)

const WARDS = [
  { name: 'General Ward', total: 40, occupied: 28, color: '#1a6fd4' },
  { name: 'ICU', total: 12, occupied: 8, color: '#e24b4a' },
  { name: 'Emergency', total: 8, occupied: 6, color: '#ef9f27' },
  { name: 'Pediatrics', total: 16, occupied: 9, color: '#3b6d11' },
  { name: 'Maternity', total: 10, occupied: 4, color: '#534ab7' },
]

const LEGEND = [
  { type: 'occupied', label: 'Occupied', cls: 'occupied' },
  { type: 'available', label: 'Available', cls: 'available' },
  { type: 'reserved', label: 'Reserved', cls: 'reserved' },
  { type: 'icu', label: 'ICU', cls: 'icu' },
]

export default function BedManagement() {
  const [form, setForm] = useState({ patient: '', ward: 'General Ward', bed: '' })
  const [assigned, setAssigned] = useState(false)

  const counts = BEDS.reduce((a,b) => { a[b]=(a[b]||0)+1; return a }, {})

  return (
    <>
      <div className="stats-row">
        {[
          { label: 'Available Beds', val: counts.available || 0, cls: 'green' },
          { label: 'Occupied', val: counts.occupied || 0, cls: 'red' },
          { label: 'Reserved', val: counts.reserved || 0, cls: 'amber' },
          { label: 'ICU', val: counts.icu || 0, cls: 'purple' },
          { label: 'Total Capacity', val: BEDS.length, cls: 'blue' },
        ].map(({label,val,cls}) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon ${cls}`}><IconBed size={18}/></div>
            <div className="stat-val">{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="row3">
        <div className="card">
          <div className="card-hdr"><span className="card-title">Bed Map — All Wards</span></div>
          <div className="bed-grid">
            {BEDS.map((type, i) => (
              <div key={i} className={`bed-cell ${type}`} title={`Bed ${i+1} — ${type}`}>
                {i+1}
              </div>
            ))}
          </div>
          <div className="bed-legend">
            {LEGEND.map(({cls,label}) => (
              <div key={cls} className="bed-legend-item">
                <div className={`bed-legend-dot bed-cell ${cls}`} style={{width:10,height:10,display:'inline-block'}}/>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div className="card">
            <div className="card-hdr"><span className="card-title">Ward Allocation</span></div>
            {WARDS.map(({name,total,occupied,color}) => {
              const pct = Math.round((occupied/total)*100)
              return (
                <div className="dept-row" key={name}>
                  <div className="dept-name">{name}</div>
                  <div className="dept-bar-wrap">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width:`${pct}%`,background:color}}/>
                    </div>
                  </div>
                  <span className="text-muted" style={{marginLeft:6,whiteSpace:'nowrap'}}>{occupied}/{total}</span>
                </div>
              )
            })}
          </div>

          <div className="card">
            <div className="card-hdr">
              <span className="card-title"><IconPlus size={14} style={{color:'#1a6fd4'}}/>Assign Bed</span>
            </div>
            {assigned ? (
              <div style={{background:'#eaf3de',border:'0.5px solid #c0dd97',borderRadius:6,padding:'10px 14px'}}>
                <div style={{fontSize:12,fontWeight:500,color:'#3b6d11',marginBottom:4}}>Bed assigned successfully</div>
                <div className="text-muted">Patient admitted to {form.ward}</div>
                <button className="btn-outline" style={{marginTop:8,width:'100%',justifyContent:'center'}} onClick={()=>setAssigned(false)}>
                  Assign Another
                </button>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setAssigned(true) }}>
                <div className="form-group">
                  <label className="form-label">Patient Name</label>
                  <input className="inp" value={form.patient} onChange={e=>setForm(f=>({...f,patient:e.target.value}))} placeholder="Patient full name" required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Ward</label>
                  <select className="inp" value={form.ward} onChange={e=>setForm(f=>({...f,ward:e.target.value}))}>
                    {WARDS.map(w=><option key={w.name}>{w.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bed Number</label>
                  <input className="inp" type="number" value={form.bed} onChange={e=>setForm(f=>({...f,bed:e.target.value}))} placeholder="e.g. 12" min={1} max={BEDS.length}/>
                </div>
                <button className="btn-primary" type="submit" style={{width:'100%',justifyContent:'center'}}>Assign Bed</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
