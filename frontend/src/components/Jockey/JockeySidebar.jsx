import { useAuth } from '../../context/AuthContext.jsx'
import { Icon } from '../UI.jsx'

export default function JockeySidebar({ active, setPage }) {
  const { logout } = useAuth()
  const nav = [
    { id: 'overview',    icon: 'dashboard',      label: 'Tổng quan' },
    { id: 'schedule',    icon: 'calendar_month', label: 'Lịch đua' },
    { id: 'invitations', icon: 'rebase_edit',    label: 'Lời mời' },
    { id: 'performance', icon: 'equalizer',      label: 'Thành tích' },
  ]
  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-50 overflow-y-auto" style={{ background: '#131315' }}>
      <div className="px-6 py-8">
        <h1 className="font-headline-md text-headline-md" style={{ color: '#5bf06c', fontFamily: 'Montserrat' }}>RACE CONTROL</h1>
        <p className="text-xs mt-1 tracking-widest opacity-60" style={{ color: '#bccbb6' }}>ELITE DIVISION</p>
      </div>
      <nav className="flex-grow">
        {nav.map(item => {
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
              style={{
                color: isActive ? '#5bf06c' : '#bccbb6',
                borderLeft: isActive ? '4px solid #5bf06c' : '4px solid transparent',
                background: isActive ? '#2a2a2c' : 'transparent',
                fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
              }}>
              <Icon name={item.icon} fill={isActive} size={20} />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="p-4" style={{ borderTop: '1px solid #3d4a3b' }}>
        <button style={{ width:'100%', padding:'12px', background:'#5bf06c', color:'#00390c', fontFamily:'Montserrat', fontWeight:800, fontSize:13, border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'0.05em', marginBottom:12 }}>
          GO LIVE
        </button>
        <button onClick={logout} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'8px 16px', background:'none', border:'none', cursor:'pointer', color:'#bccbb6', fontFamily:'Inter', fontSize:14 }}>
          <Icon name="logout" size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
