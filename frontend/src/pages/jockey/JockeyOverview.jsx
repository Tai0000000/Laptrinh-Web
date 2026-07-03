import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon, Badge } from '../../components/UI';
import api from '../../api/axios';

export default function JockeyOverview() {
  const { user } = useAuth();
  const [stats, setStats]     = useState({
    total_races: 0, wins: 0, active_horses: 0,
    upcoming: 0, win_rate: 0, license_number: '—',
  });
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jockey/stats'),
      api.get('/jockey/races/upcoming'),
    ]).then(([sRes, uRes]) => {
      if (sRes.data?.success)  setStats(sRes.data.data);
      if (uRes.data?.success)  setUpcoming(uRes.data.data ?? []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 ml-64 pt-16" style={{ background: '#131315', minHeight: '100vh' }}>
      <header className="fixed top-0 left-64 right-0 h-16 z-40 flex items-center justify-between px-6"
        style={{ background: 'rgba(19,19,21,0.95)', borderBottom: '1px solid #3d4a3b' }}>
        <h2 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 22, color: '#e4e2e4' }}>Tổng quan</h2>
        <div className="flex items-center gap-4">
          <Icon name="notifications" style={{ color: '#bccbb6' }} />
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ border: '2px solid #5bf06c', background: '#2a2a2c' }}>
            <span style={{ color: '#5bf06c', fontWeight: 700, fontSize: 14 }}>{user?.name?.charAt(0)}</span>
          </div>
        </div>
      </header>

      <main className="p-10 space-y-10 fade-in">
        {/* Hero */}
        <section style={{ background: '#2C2C2E', padding: 32, borderRadius: 4, borderLeft: '4px solid #5bf06c' }}>
          <h2 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 40, color: '#fff', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Xin chào, {user?.name || 'Jockey'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ background: 'rgba(91,240,108,0.15)', color: '#5bf06c', padding: '4px 12px', border: '1px solid rgba(91,240,108,0.3)', fontSize: 12, fontWeight: 700, borderRadius: 2 }}>
              License: {stats.license_number}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#bccbb6', fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5bf06c', display: 'inline-block' }} />
              {stats.upcoming > 0 ? `Có ${stats.upcoming} cuộc đua sắp tới` : 'Sẵn sàng — chưa có lịch'}
            </span>
            {stats.total_races > 0 && (
              <span style={{ background: 'rgba(212,160,23,0.15)', color: '#D4A017', padding: '4px 12px', border: '1px solid rgba(212,160,23,0.3)', fontSize: 12, fontWeight: 700, borderRadius: 2 }}>
                Tỉ lệ thắng: {stats.win_rate}%
              </span>
            )}
          </div>
        </section>

        {/* Stats cards */}
        {loading ? (
          <div style={{ color: '#bccbb6', fontSize: 14 }}>Đang tải...</div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Tổng cuộc đua',   value: stats.total_races,   icon: 'leaderboard' },
              { label: 'Số lần vô địch',  value: stats.wins,          icon: 'workspace_premium' },
              { label: 'Ngựa điều khiển', value: stats.active_horses, icon: 'pets' },
              { label: 'Đua sắp tới',     value: stats.upcoming,      icon: 'schedule' },
            ].map((c, i) => (
              <div key={i}
                style={{ background: '#2C2C2E', padding: 24, borderRadius: 4, border: '1px solid #3d4a3b', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#5bf06c')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#3d4a3b')}>
                <div style={{ display: 'flex', justifycontent: 'space-between', marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bccbb6' }}>{c.label}</p>
                  <Icon name={c.icon} style={{ color: '#5bf06c' }} />
                </div>
                <p style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 40, lineHeight: 1, color: '#e4e2e4' }}>{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming races */}
        <section>
          <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="route" style={{ color: '#5bf06c' }} />Lịch đua sắp tới
          </h3>
          {upcoming.length === 0 ? (
            <div style={{ background: '#1f1f21', border: '1px solid #3d4a3b', padding: 40, textAlign: 'center', color: '#bccbb6', borderRadius: 4 }}>
              Chưa có lịch đua nào sắp tới
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map(r => (
                <div key={r.id} style={{ background: '#2C2C2E', padding: 24, borderRadius: 4, border: '1px solid #3d4a3b', display: 'flex', gap: 24 }}>
                  <div style={{ width: 80, height: 80, flexShrink: 0, background: '#353437', borderRadius: 4, border: '1px solid #3d4a3b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifycontent: 'center' }}>
                    <span style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 24, color: '#5bf06c' }}>
                      {new Date(r.race_date).getDate().toString().padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#bccbb6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      TH{new Date(r.race_date).getMonth() + 1}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifycontent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <h4 style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: 18, color: '#fff' }}>{r.race_name}</h4>
                        <p style={{ fontSize: 13, color: '#bccbb6' }}>{r.tournament}</p>
                      </div>
                      <Badge status={r.reg_status === 'confirmed' ? 'confirmed' : r.status} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, paddingTop: 12, borderTop: '1px solid #3d4a3b' }}>
                      {[['Ngựa', r.horse_name, '#fff'], ['Chủ sở hữu', r.owner_name, '#bccbb6'], ['Làn', r.lane_number ? `Lane ${r.lane_number}` : '—', '#5bf06c']].map(([l, v, c]) => (
                        <div key={l}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bccbb6', marginBottom: 4 }}>{l}</p>
                          <p style={{ fontWeight: 700, color: c, fontSize: 14 }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
