import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { IconRobot, IconUser, IconSend, IconLoader2 } from '@tabler/icons-react'

const SUGGESTIONS = [
  "What's the current hospital load and busiest department?",
  'Which Cardiology doctors are available right now?',
  'Triage: severe chest pain, shortness of breath, sweating',
  'Show me the 5 most recent emergency appointments',
]

export default function Assistant() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi, I'm MedAI. I can triage symptoms, book appointments, check doctor availability, and pull up analytics. How can I help?",
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    try {
      const response = await axios.post('https://medai-production-8a03.up.railway.app/api/agent/chat', {
        messages: nextMessages.filter((m, i) => !(i === 0 && m.role === 'assistant')),
      })
      setMessages([...nextMessages, {
        role: 'assistant',
        content: response.data?.reply || 'Sorry, I could not generate a response.',
      }])
    } catch {
      setMessages([...nextMessages, {
        role: 'assistant',
        content: 'Something went wrong reaching the assistant. Make sure the backend is running on port 5000.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 120px)',gap:10}}>
      <div className="card" style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',padding:0}}>
        <div className="card-hdr" style={{padding:'12px 14px',borderBottom:'0.5px solid #e4e6ea',flexShrink:0}}>
          <span className="card-title"><IconRobot size={14} style={{color:'#1a6fd4'}}/>MediHive AI Assistant</span>
          <span className="badge green">Online</span>
        </div>

        <div ref={scrollRef} style={{flex:1,overflowY:'auto',padding:'14px',display:'flex',flexDirection:'column',gap:10}}>
          {messages.map((m, i) => (
            <div key={i} style={{display:'flex',gap:8,justifyContent:m.role==='user'?'flex-end':'flex-start',alignItems:'flex-end'}}>
              {m.role === 'assistant' && (
                <div style={{width:28,height:28,borderRadius:'50%',background:'#e8f1fc',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <IconRobot size={14} style={{color:'#1a6fd4'}}/>
                </div>
              )}
              <div style={{
                maxWidth:'72%',padding:'9px 12px',borderRadius:10,fontSize:12,lineHeight:1.6,
                background: m.role==='user' ? '#1a6fd4' : '#f7f8fa',
                color: m.role==='user' ? '#fff' : '#1a1c1e',
                border: m.role==='user' ? 'none' : '0.5px solid #e4e6ea',
                borderBottomRightRadius: m.role==='user' ? 2 : 10,
                borderBottomLeftRadius: m.role==='assistant' ? 2 : 10,
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
              {m.role === 'user' && (
                <div style={{width:28,height:28,borderRadius:'50%',background:'#e4e6ea',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <IconUser size={14} style={{color:'#666c74'}}/>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:'#e8f1fc',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <IconRobot size={14} style={{color:'#1a6fd4'}}/>
              </div>
              <div style={{background:'#f7f8fa',border:'0.5px solid #e4e6ea',borderRadius:10,borderBottomLeftRadius:2,padding:'9px 14px',display:'flex',alignItems:'center',gap:6}}>
                <div style={{display:'flex',gap:3}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:5,height:5,borderRadius:'50%',background:'#adb3bb',animation:`bounce 1s ease-in-out ${i*0.15}s infinite`}}/>
                  ))}
                </div>
                <span style={{fontSize:11,color:'#adb3bb'}}>Thinking…</span>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div style={{padding:'0 14px 10px',display:'flex',flexWrap:'wrap',gap:6}}>
            {SUGGESTIONS.map(s => (
              <button key={s} className="btn-outline" style={{fontSize:10,padding:'5px 10px'}} onClick={() => send(s)} disabled={loading}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={{padding:'10px 14px',borderTop:'0.5px solid #e4e6ea',display:'flex',gap:8,alignItems:'flex-end',flexShrink:0}}>
          <textarea
            className="inp  chat-input"
            style={{flex:1,resize:'none',maxHeight:120,minHeight:36}}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about triage, booking, doctors, or analytics…"
            disabled={loading}
          />
          <button
            className="btn-primary"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{padding:'8px 12px',alignSelf:'flex-end'}}
          >
            {loading ? <IconLoader2 size={14} style={{animation:'spin 1s linear infinite'}}/> : <IconSend size={14}/>}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
