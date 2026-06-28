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
    <aside className="sticky top-0 md:fixed md:left-0 md:top-0 h-auto md:h-full w-full md:w-64 flex md:flex-col z-50 overflow-x-auto md:overflow-y-auto" style={{ background: '#131315' }}>
      <div className="hidden md:block px-6 py-8">
        <h1 className="font-headline-md text-headline-md" style={{ color: '#5bf06c', fontFamily: 'Montserrat' }}>RACE CONTROL</h1>
        <p className="text-xs mt-1 tracking-widest opacity-60" style={{ color: '#bccbb6' }}>ELITE DIVISION</p>
      </div>
      <nav className="flex md:block flex-1 min-w-max md:min-w-0">
        {nav.map(item => {
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              className="flex md:w-full items-center gap-3 px-4 py-3 text-left transition-all whitespace-nowrap"
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
      <div className="hidden md:block p-4" style={{ borderTop: '1px solid #3d4a3b' }}>
        <button type="button" style={{ width:'100%', padding:'12px', background:'#5bf06c', color:'#00390c', fontFamily:'Montserrat', fontWeight:800, fontSize:13, border:'none', borderRadius:4, cursor:'pointer', letterSpacing:'0.05em', marginBottom:12 }}>
          GO LIVE
        </button>
        <button type="button" onClick={logout} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'8px 16px', background:'none', border:'none', cursor:'pointer', color:'#bccbb6', fontFamily:'Inter', fontSize:14 }}>
          <Icon name="logout" size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
