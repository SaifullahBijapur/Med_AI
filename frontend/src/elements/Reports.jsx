import React, { useState } from 'react'
import axios from 'axios'
import { IconFileText, IconUpload, IconRobot, IconPdf } from '@tabler/icons-react'

const API = 'https://medai-production-8a03.up.railway.app'

const SAMPLE_REPORTS = [
  { name: 'Blood Panel — John Doe', date: 'Jun 5, 2026', type: 'Lab', status: 'green' },
  { name: 'MRI Scan — Sarah Lee', date: 'Jun 4, 2026', type: 'Imaging', status: 'blue' },
  { name: 'ECG Report — Mike Chen', date: 'Jun 3, 2026', type: 'Cardiac', status: 'amber' },
  { name: 'Chest X-Ray — Amy Wilson', date: 'Jun 2, 2026', type: 'Radiology', status: 'blue' },
  { name: 'Post-Op Report — Tom Brown', date: 'Jun 1, 2026', type: 'Surgery', status: 'green' },
]

export default function Reports() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!file) {
    setError("Please select a file");
    return;
  }

  setLoading(true);
  setError("");
  setSummary("");

  try {
    const formData = new FormData();
    formData.append("report", file);

    const response = await axios.post(
      `${API}/api/reports/upload-report`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setSummary(response.data.analysis);
  } catch (err) {
  console.error("FULL ERROR:", err);

  if (err.response) {
    console.error("Backend Response:", err.response.data);
    setError(JSON.stringify(err.response.data));
  } else {
    setError(err.message);
  }
}finally {
    setLoading(false);
  }
};
  const parseLines = (text) =>
  text
    .split('\n')
    .map(l =>
      l
        .replace(/[{}[\]",]/g, '')
        .replace(/^[-*•\d.]+\s*/, '')
        .trim()
    )
    .filter(Boolean);

  return (
    <div className="section-row">
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><IconFileText size={14} style={{color:'#1a6fd4'}}/>Medical Reports</span>
            <span className="badge blue">{SAMPLE_REPORTS.length} records</span>
          </div>
          {SAMPLE_REPORTS.map((r, i) => (
            <div className="report-item" key={i}>
              <div className="report-icon">
                <IconPdf size={14} style={{color: r.status==='green'?'#3b6d11':r.status==='amber'?'#854f0b':'#1a6fd4'}}/>
              </div>
              <div className="pat-info">
                <div className="pat-name">{r.name}</div>
                <div className="pat-detail">{r.type} · {r.date}</div>
              </div>
              <span className={`badge ${r.status}`}>{r.type}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><IconUpload size={14} style={{color:'#1a6fd4'}}/>Upload Report for AI Analysis</span>
          </div>
          {error && <div style={{fontSize:11,color:'#a32d2d',marginBottom:8,padding:'6px 10px',background:'#fdeaea',borderRadius:4}}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Report File (PDF, PNG, JPG)</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={e => setFile(e.target.files[0])}
                style={{display:'block',width:'100%',padding:'7px 10px',border:'0.5px solid #e4e6ea',borderRadius:6,background:'#f7f8fa',fontSize:11,cursor:'pointer'}}
              />
            </div>
            {file && <div className="text-muted" style={{marginBottom:10}}>Selected: {file.name} ({(file.size/1024).toFixed(1)} KB)</div>}
            <button className="btn-primary" type="submit" disabled={loading || !file} style={{width:'100%',justifyContent:'center'}}>
              {loading ? 'Analyzing…' : 'Analyze with AI'}
            </button>
          </form>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title"><IconRobot size={14} style={{color:'#1a6fd4'}}/>AI Report Summary</span>
            {loading && <span className="badge blue">Analyzing…</span>}
          </div>
          {summary ? (
            <div>
              {parseLines(summary).map((line, i) => {
                const styles = [
                  { bg:'#fdeaea',border:'#f7c1c1',color:'#a32d2d' },
                  { bg:'#eaf3de',border:'#c0dd97',color:'#3b6d11' },
                  { bg:'#e8f1fc',border:'#b5d4f4',color:'#185fa5' },
                ]
                const s = styles[i % 3]
                const colonIdx = line.indexOf(':')
                const bold = colonIdx>-1 ? line.slice(0,colonIdx) : null
                const rest = colonIdx>-1 ? line.slice(colonIdx+1).trim() : line
                return (
                  <div key={i} style={{background:s.bg,border:`0.5px solid ${s.border}`,borderRadius:6,padding:'10px 12px',marginBottom:8}}>
                    <div style={{fontSize:11,color:s.color,lineHeight:1.5}}>
                      {bold && <strong style={{display:'block',marginBottom:2}}>{bold}</strong>}
                      {rest}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : loading ? (
            [0,1,2].map(i => (
              <div key={i} style={{background:'#f7f8fa',borderRadius:6,padding:'10px 12px',marginBottom:8}}>
                <div className="skeleton" style={{height:10,width:'50%',marginBottom:6}}/>
                <div className="skeleton" style={{height:8,width:'90%'}}/>
              </div>
            ))
          ) : (
            <div style={{textAlign:'center',padding:'30px 0',color:'#adb3bb'}}>
              <IconRobot size={32} style={{color:'#e4e6ea',display:'block',margin:'0 auto 8px'}}/>
              <div style={{fontSize:12}}>Upload a report to get AI-powered clinical insights</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
