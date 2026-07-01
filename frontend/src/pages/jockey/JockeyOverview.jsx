import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/UI';
import api from '../../api/axios';

/* ── nhỏ gọn: stat card ── */
function StatCard({ label, value, accent = '#5bf06c', loading }) {
  return (
    <div
      style={{
        background: '#1f1f21', padding: '24px 20px', borderRadius: 8,
        border: '1px solid #3d4a3b', transition: 'border-color 0.2s, transform 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d4a3b'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#869582', marginBottom: 14 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 42, lineHeight: 1, color: loading ? '#3d4a3b' : accent }}>
        {loading ? '—' : value}
      </p>
    </div>
  );
}

export default function JockeyOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_races: 0, wins: 0, active_horses: 0,
    upcoming: 0, win_rate: 0, license_number: '—',
  });
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/jockey/stats'),
      api.get('/jockey/races/upcoming'),
    ]).then(([sRes, uRes]) => {
      if (sRes.data?.success) setStats(sRes.data.data);
      if (uRes.data?.success) setUpcoming(uRes.data.data ?? []);
    }).catch(err => {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error(err);
    }).finally(() => setLoading(false));
  }, []);

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="flex-1 ml-64 pt-16" style={{ background: '#131315', minHeight: '100vh' }}>

      {/* ── header ── */}
      <header
        className="fixed top-0 left-64 right-0 h-16 z-40 flex items-center justify-between px-6"
        style={{ background: 'rgba(19,19,21,0.96)', borderBottom: '1px solid #2a2a2c', backdropFilter: 'blur(12px)' }}
      >
        <h2 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 20, color: '#e4e2e4', letterSpacing: '-0.01em' }}>
          Tổng quan
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg,#5bf06c,#2ecc71)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Montserrat', fontWeight: 800, fontSize: 15, color: '#00390c',
          }}>
            {initial}
          </div>
          <div>
            <p style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, color: '#fff', lineHeight: 1.2 }}>{user?.name}</p>
            <p style={{ fontSize: 11, color: '#5bf06c', lineHeight: 1.2 }}>Nài ngựa</p>
          </div>
        </div>
      </header>

      <main style={{ padding: '32px 40px', maxWidth: 1100 }}>

        {/* ── error banner ── */}
        {error && (
          <div style={{ background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.3)', color: '#ffb4ab', padding: '12px 16px', borderRadius: 6, marginBottom: 24, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── hero ── */}
        <section style={{
          background: 'linear-gradient(135deg, #1a2a1a 0%, #1f1f21 100%)',
          padding: '28px 32px', borderRadius: 10,
          borderLeft: '4px solid #5bf06c', marginBottom: 28,
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <h1 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 32, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
            Xin chào, {user?.name || 'Jockey'} 👋
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(91,240,108,0.12)', color: '#5bf06c', padding: '4px 12px', border: '1px solid rgba(91,240,108,0.25)', fontSize: 12, fontWeight: 700, borderRadius: 20, letterSpacing: '0.04em' }}>
              🪪 License: {stats.license_number}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#bccbb6', fontSize: 13 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5bf06c', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
              {stats.upcoming > 0 ? `${stats.upcoming} cuộc đua sắp tới` : 'Sẵn sàng — chưa có lịch'}
            </span>
            {stats.total_races > 0 && (
              <span style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017', padding: '4px 12px', border: '1px solid rgba(212,160,23,0.25)', fontSize: 12, fontWeight: 700, borderRadius: 20 }}>
                🏆 Tỉ lệ thắng: {stats.win_rate}%
              </span>
            )}
          </div>
        </section>

        {/* ── stats grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 36 }}>
          <StatCard label="Tổng cuộc đua"    value={stats.total_races}   accent="#e4e2e4" loading={loading} />
          <StatCard label="Vô địch"          value={stats.wins}          accent="#5bf06c" loading={loading} />
          <StatCard label="Ngựa điều khiển"  value={stats.active_horses} accent="#60b8ff" loading={loading} />
          <StatCard label="Đua sắp tới"      value={stats.upcoming}      accent="#FFD700" loading={loading} />
        </div>

        {/* ── upcoming races ── */}
        <section>
          <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            🏇 Lịch đua sắp tới
          </h3>

          {loading ? (
            <div style={{ background: '#1f1f21', border: '1px solid #2a2a2c', borderRadius: 8, padding: 40, textAlign: 'center', color: '#bccbb6' }}>
              Đang tải...
            </div>
          ) : upcoming.length === 0 ? (
            <div style={{ background: '#1f1f21', border: '1px solid #2a2a2c', borderRadius: 8, padding: 48, textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🗓️</p>
              <p style={{ color: '#bccbb6', fontSize: 14 }}>Chưa có lịch đua nào sắp tới</p>
              <p style={{ color: '#869582', fontSize: 12, marginTop: 6 }}>Các cuộc đua đã xác nhận sẽ xuất hiện ở đây</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcoming.map((r, idx) => {
                const d       = new Date(r.race_date);
                const day     = d.getDate().toString().padStart(2, '0');
                const month   = d.toLocaleString('vi-VN', { month: 'short' });
                const time    = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const isFirst = idx === 0;

                return (
                  <div key={r.id} style={{
                    background: isFirst ? 'linear-gradient(135deg,#1a2a1a,#1f1f21)' : '#1f1f21',
                    border: `1px solid ${isFirst ? 'rgba(91,240,108,0.3)' : '#2a2a2c'}`,
                    borderRadius: 8, padding: '20px 24px',
                    display: 'flex', gap: 20, alignItems: 'flex-start',
                    transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#5bf06c'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = isFirst ? 'rgba(91,240,108,0.3)' : '#2a2a2c'}
                  >
                    {/* date box */}
                    <div style={{
                      width: 64, flexShrink: 0, background: '#131315',
                      border: `1px solid ${isFirst ? 'rgba(91,240,108,0.3)' : '#3d4a3b'}`,
                      borderRadius: 6, textAlign: 'center', padding: '10px 0',
                    }}>
                      <p style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 26, color: '#5bf06c', lineHeight: 1 }}>{day}</p>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#bccbb6', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{month}</p>
                      <p style={{ fontSize: 10, color: '#869582', marginTop: 4 }}>{time}</p>
                    </div>

                    {/* info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <p style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 3 }}>{r.race_name}</p>
                          <p style={{ fontSize: 13, color: '#bccbb6' }}>{r.tournament}</p>
                        </div>
                        <Badge status={r.reg_status === 'confirmed' ? 'confirmed' : r.status} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, paddingTop: 12, borderTop: '1px solid #2a2a2c' }}>
                        {[
                          ['🐴 Ngựa',       r.horse_name,                       '#fff'],
                          ['👤 Chủ ngựa',   r.owner_name,                       '#bccbb6'],
                          ['🛣️ Cự ly',       `${r.distance}m`,                  '#5bf06c'],
                          ['🚦 Làn',         r.lane_number ? `Lane ${r.lane_number}` : '—', '#FFD700'],
                        ].map(([lbl, val, clr]) => (
                          <div key={lbl}>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#869582', marginBottom: 4 }}>{lbl}</p>
                            <p style={{ fontWeight: 700, color: clr, fontSize: 13 }}>{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
