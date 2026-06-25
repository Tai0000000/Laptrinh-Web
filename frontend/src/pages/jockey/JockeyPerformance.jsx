import { useState, useEffect } from 'react'
import { useApi } from '../../context/AuthContext.jsx'
import { Icon, fmtDate } from '../../components/UI.jsx'

export default function JockeyPerformance() {
  const api = useApi()
  const [results, setResults]   = useState([])
  const [bestTimes, setBestTimes] = useState([])

  useEffect(() => {
    api.get('/jockey/performance/results').then(d => { if (d?.success) setResults(d.data) })
    api.get('/jockey/performance/best-times').then(d => { if (d?.success) setBestTimes(d.data) })
  }, [])

  const wins       = results.filter(r => +r.finish_position === 1).length
  const top3       = results.filter(r => +r.finish_position <= 3).length
  const total      = results.length
  const totalPrize = results.reduce((s,r) => s + (+r.prize_amount||0), 0)
  const posColor   = (p) => p == 1 ? '#FFD700' : p == 2 ? '#C0C0C0' : p == 3 ? '#CD7F32' : '#bccbb6'

  return (
    <div className="flex-1 ml-64 pt-16" style={{background:'#131315', minHeight:'100vh'}}>
      <header className="fixed top-0 left-64 right-0 h-16 z-40 flex items-center px-6" style={{background:'rgba(19,19,21,0.95)', borderBottom:'1px solid #3d4a3b'}}>
        <h2 style={{fontFamily:'Montserrat', fontWeight:700, fontSize:22, color:'#e4e2e4'}}>Thành tích</h2>
      </header>
      <main className="p-10 space-y-8 fade-in">
        <div className="grid grid-cols-4 gap-4">
          {[{l:'Tổng số trận',v:total,c:'#e4e2e4'},{l:'Vô địch',v:wins,c:'#5bf06c'},{l:'Top 3',v:top3,c:'#FFD700'},{l:'Tỉ lệ thắng',v:`${total?Math.round(wins/total*100):0}%`,c:'#5bf06c'}].map(c=>(
            <div key={c.l} style={{background:'#2C2C2E', padding:24, borderRadius:4, border:'1px solid #3d4a3b'}}>
              <p style={{fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#bccbb6', marginBottom:12}}>{c.l}</p>
              <p style={{fontFamily:'Montserrat', fontWeight:800, fontSize:40, lineHeight:1, color:c.c}}>{c.v}</p>
            </div>
          ))}
        </div>

        <div style={{background:'#2C2C2E', padding:24, borderRadius:4, border:'1px solid #3d4a3b', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <p style={{fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#bccbb6', marginBottom:8}}>Tổng tiền thưởng</p>
            <p style={{fontFamily:'Montserrat', fontWeight:800, fontSize:36, color:'#5bf06c'}}>{totalPrize.toLocaleString('vi-VN')} ₫</p>
          </div>
          <Icon name="emoji_events" size={56} style={{color:'rgba(91,240,108,0.2)'}}/>
        </div>

        {bestTimes.length > 0 && (
          <div style={{background:'#1f1f21', border:'1px solid #3d4a3b', borderRadius:4, overflow:'hidden'}}>
            <div style={{padding:'16px 24px', background:'#2a2a2c', borderBottom:'1px solid #3d4a3b', display:'flex', alignItems:'center', gap:10}}>
              <Icon name="timer" style={{color:'#5bf06c'}}/>
              <h3 style={{fontFamily:'Montserrat', fontWeight:700, fontSize:16, color:'#fff'}}>Thời gian tốt nhất</h3>
            </div>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #3d4a3b'}}>
                  {['Hạng','Cuộc đua','Ngựa','Thời gian (s)'].map(h => (
                    <th key={h} style={{padding:'12px 20px', textAlign:'left', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#bccbb6'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bestTimes.map(row => (
                  <tr key={row.rank} style={{borderBottom:'1px solid rgba(61,74,59,0.4)'}}>
                    <td style={{padding:'14px 20px', fontFamily:'Montserrat', fontWeight:800, fontSize:18, color:posColor(+row.rank)}}>#{row.rank}</td>
                    <td style={{padding:'14px 20px', fontFamily:'Montserrat', fontWeight:600, color:'#fff'}}>{row.race_name}</td>
                    <td style={{padding:'14px 20px', color:'#e4e2e4'}}>{row.horse_name}</td>
                    <td style={{padding:'14px 20px', fontFamily:'Montserrat', fontWeight:700, color:'#5bf06c'}}>{row.finish_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{background:'#1f1f21', border:'1px solid #3d4a3b', borderRadius:4, overflow:'hidden'}}>
          <div style={{padding:'16px 24px', background:'#2a2a2c', borderBottom:'1px solid #3d4a3b', display:'flex', alignItems:'center', gap:10}}>
            <Icon name="history" style={{color:'#5bf06c'}}/>
            <h3 style={{fontFamily:'Montserrat', fontWeight:700, fontSize:16, color:'#fff'}}>Lịch sử kết quả</h3>
          </div>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid #3d4a3b'}}>
                {['Cuộc đua','Ngựa','Ngày đua','Hạng','Thời gian','Tiền thưởng'].map(h=>(
                  <th key={h} style={{padding:'12px 20px', textAlign:'left', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#bccbb6'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={6} style={{padding:'32px', textAlign:'center', color:'#bccbb6'}}>Chưa có kết quả nào</td></tr>
              ) : results.map(r=>(
                <tr key={r.id} style={{borderBottom:'1px solid rgba(61,74,59,0.4)'}}>
                  <td style={{padding:'16px 20px', fontFamily:'Montserrat', fontWeight:600, color:'#fff'}}>{r.race_name}</td>
                  <td style={{padding:'16px 20px', fontWeight:600, color:'#e4e2e4'}}>{r.horse_name}</td>
                  <td style={{padding:'16px 20px', fontSize:13, color:'#bccbb6'}}>{fmtDate(r.race_date)}</td>
                  <td style={{padding:'16px 20px'}}>
                    <span style={{fontFamily:'Montserrat', fontSize:18, fontWeight:800, color:posColor(+r.finish_position)}}>#{r.finish_position}</span>
                  </td>
                  <td style={{padding:'16px 20px', fontFamily:'Montserrat', fontWeight:600, color:+r.finish_position<=3?'#5bf06c':'#e4e2e4'}}>{r.finish_time}</td>
                  <td style={{padding:'16px 20px', fontFamily:'Montserrat', fontWeight:700, color:+r.prize_amount>0?'#5bf06c':'#bccbb6'}}>
                    {+r.prize_amount>0?`${(+r.prize_amount).toLocaleString('vi-VN')} ₫`:'—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
