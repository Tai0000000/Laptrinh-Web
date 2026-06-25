import { useState, useEffect } from 'react'
import { useApi } from '../../context/AuthContext.jsx'
import { Badge } from '../../components/UI.jsx'

export default function JockeySchedule({ initialFilter = 'all' }) {
  const api = useApi()
  const [races, setRaces]   = useState([])
  const [filter, setFilter] = useState(initialFilter)

  useEffect(() => { setFilter(initialFilter) }, [initialFilter])

  useEffect(() => {
    api.get('/jockey/races').then(d => { if (d?.success) setRaces(d.data) })
  }, [])

  const filtered = filter === 'all' ? races : races.filter(r => r.status === filter)

  return (
    <div className="flex-1 ml-64 pt-16" style={{background:'#131315', minHeight:'100vh'}}>
      <header className="fixed top-0 left-64 right-0 h-16 z-40 flex items-center px-6" style={{background:'rgba(19,19,21,0.95)', borderBottom:'1px solid #3d4a3b'}}>
        <h2 style={{fontFamily:'Montserrat', fontWeight:700, fontSize:22, color:'#e4e2e4'}}>Lịch đua</h2>
      </header>
      <main className="p-10 fade-in">
        <div className="flex gap-3 mb-6 flex-wrap">
          {[['all','Tất cả'],['scheduled','Lịch đã lên'],['in_progress','Đang chạy'],['finished','Kết thúc']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{padding:'6px 16px', borderRadius:2, fontFamily:'Inter', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.2s',
                background:filter===v?'#5bf06c':'transparent', color:filter===v?'#00390c':'#bccbb6',
                border:filter===v?'none':'1px solid #3d4a3b'}}>
              {l}
            </button>
          ))}
        </div>
        <div style={{background:'#1f1f21', border:'1px solid #3d4a3b', borderRadius:4, overflow:'hidden'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#2a2a2c', borderBottom:'1px solid #3d4a3b'}}>
                {['Cuộc đua','Giải đấu','Ngày / Giờ','Cự ly','Ngựa','Làn','Trạng thái'].map(h => (
                  <th key={h} style={{padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#bccbb6'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{padding:'40px', textAlign:'center', color:'#bccbb6'}}>Chưa có lịch đua nào</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} style={{borderBottom:'1px solid rgba(61,74,59,0.4)'}}>
                  <td style={{padding:'18px 20px'}}>
                    <div style={{fontFamily:'Montserrat', fontWeight:600, fontSize:15, color:'#fff'}}>{r.race_name}</div>
                  </td>
                  <td style={{padding:'18px 20px', color:'#e4e2e4', fontSize:14}}>{r.tournament}</td>
                  <td style={{padding:'18px 20px'}}>
                    <div style={{fontWeight:600, color:'#fff', fontSize:14}}>{new Date(r.race_date).toLocaleDateString('vi-VN')}</div>
                    <div style={{fontSize:12, color:'#bccbb6'}}>{new Date(r.race_date).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</div>
                  </td>
                  <td style={{padding:'18px 20px', color:'#5bf06c', fontWeight:700, fontFamily:'Montserrat'}}>{r.distance}m</td>
                  <td style={{padding:'18px 20px', fontWeight:600, color:'#fff', fontSize:14}}>{r.horse_name}</td>
                  <td style={{padding:'18px 20px'}}>{r.lane_number ? <span style={{color:'#5bf06c', fontWeight:700}}>Lane {r.lane_number}</span> : <span style={{color:'#bccbb6'}}>—</span>}</td>
                  <td style={{padding:'18px 20px'}}><Badge status={r.reg_status==='approved'?'confirmed':r.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
