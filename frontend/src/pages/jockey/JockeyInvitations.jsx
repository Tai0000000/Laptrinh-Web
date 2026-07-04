import { useState, useEffect } from 'react';
import { Icon, Badge, fmtDate } from '../../components/UI';
import api from '../../api/axios';

export default function JockeyInvitations() {
  const [pending, setPending]       = useState([]);
  const [history, setHistory]       = useState([]);
  const [responding, setResponding] = useState(null);
  const [error, setError]           = useState(null);

  const loadInvitations = () => {
    api.get('/jockey/invitations/pending')
      .then(r => { if (r.data?.success) setPending(r.data.data ?? []); });
    api.get('/jockey/invitations/history')
      .then(r => { if (r.data?.success) setHistory(r.data.data ?? []); });
  };

  useEffect(() => { loadInvitations(); }, []);

  const respond = async (id, status) => {
    setResponding(id);
    setError(null);
    try {
      const res = await api.put(`/jockey/invitations/${id}/respond`, { status });
      if (!res.data?.success) {
        setError(res.data?.message || 'Không thể phản hồi lời mời.');
        return;
      }
      loadInvitations();
    } catch (e) {
      setError(e.response?.data?.message || 'Không thể phản hồi lời mời. Vui lòng thử lại.');
    } finally {
      setResponding(null);
    }
  };

  return (
    <div className="flex-1 ml-64 pt-16" style={{ background: '#131315', minHeight: '100vh' }}>
      <header className="fixed top-0 left-64 right-0 h-16 z-40 flex items-center px-6"
        style={{ background: 'rgba(19,19,21,0.95)', borderBottom: '1px solid #3d4a3b' }}>
        <h2 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 22, color: '#e4e2e4' }}>Lời mời</h2>
      </header>

      <main className="p-10 space-y-10 fade-in">
        {error && (
          <div style={{ background: 'rgba(255,180,171,0.12)', border: '1px solid #ffb4ab', color: '#ffb4ab', padding: '12px 16px', borderRadius: 4, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Pending invitations */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 22, color: '#e4e2e4', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 4, height: 32, background: '#5bf06c', display: 'inline-block' }} />
              Lời mời đang chờ
            </h2>
            {pending.length > 0 && (
              <span style={{ background: 'rgba(91,240,108,0.15)', color: '#5bf06c', padding: '4px 12px', borderRadius: 2, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5bf06c', display: 'inline-block' }} />
                {pending.length} Mới
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div style={{ background: '#1f1f21', border: '1px solid #3d4a3b', padding: 40, textAlign: 'center', color: '#bccbb6', borderRadius: 4 }}>
              Không có lời mời nào đang chờ
            </div>
          ) : pending.map(inv => (
            <div key={inv.id} style={{ background: '#1f1f21', border: '1px solid #3d4a3b', borderRadius: 4, overflow: 'hidden', position: 'relative', marginBottom: 16 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#5bf06c' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
                {/* Horse info */}
                <div style={{ background: 'linear-gradient(135deg,#1a2a1a 0%,#131315 100%)', padding: 32, borderRight: '1px solid #3d4a3b' }}>
                  <h3 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 28, color: '#fff' }}>{inv.horse_name}</h3>
                  <p style={{ color: '#5bf06c', fontWeight: 700, fontSize: 14, marginTop: 4 }}>{inv.breed} • {inv.age} Tuổi</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
                    {[['Cân nặng', `${inv.weight}kg`], ['Trận thắng', inv.wins]].map(([l, v]) => (
                      <div key={l} style={{ background: '#0e0e10', padding: '10px 14px', borderRadius: 2, border: '1px solid #3d4a3b', textAlign: 'center' }}>
                        <p style={{ fontSize: 10, color: '#bccbb6', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</p>
                        <p style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 18, color: l === 'Trận thắng' ? '#5bf06c' : '#fff', marginTop: 4 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Race info + actions */}
                <div style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bccbb6', marginBottom: 6 }}>Chủ sở hữu</p>
                        <p style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: 18, color: '#fff' }}>{inv.owner_name}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bccbb6', marginBottom: 6 }}>Cuộc đua</p>
                        <p style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: 16, color: '#fff' }}>{inv.race_name}</p>
                        <p style={{ fontSize: 13, color: '#5bf06c', marginTop: 4 }}>{inv.tournament}</p>
                      </div>
                    </div>
                    <div style={{ background: '#2a2a2c', padding: 16, borderRadius: 2, border: '1px solid #3d4a3b', height: 'fit-content' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bccbb6' }}>Ngày đua</p>
                      <p style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: 18, color: '#fff', marginTop: 4 }}>{fmtDate(inv.race_date)}</p>
                      <p style={{ color: '#5bf06c', fontSize: 13, marginTop: 4 }}>{inv.distance}m</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, paddingTop: 24, borderTop: '1px solid #3d4a3b', marginTop: 24 }}>
                    <button disabled={!!responding} onClick={() => respond(inv.id, 'accepted')}
                      style={{ flex: 1, padding: 14, background: '#5bf06c', color: '#00390c', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 14, border: 'none', borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: responding ? 0.6 : 1 }}>
                      <Icon name="check_circle" fill size={18} />Chấp nhận
                    </button>
                    <button disabled={!!responding} onClick={() => respond(inv.id, 'rejected')}
                      style={{ flex: 1, padding: 14, background: 'transparent', color: '#ffb4ab', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 14, border: '1px solid #ffb4ab', borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: responding ? 0.6 : 1 }}>
                      <Icon name="cancel" size={18} />Từ chối
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* History */}
        <section>
          <h2 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 22, color: '#e4e2e4', marginBottom: 20 }}>Lịch sử lời mời</h2>
          <div style={{ background: '#1f1f21', border: '1px solid #3d4a3b', borderRadius: 4, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#2a2a2c', borderBottom: '1px solid #3d4a3b' }}>
                  {['Tên ngựa', 'Cuộc đua', 'Ngày mời', 'Phản hồi', 'Kết quả'].map(h => (
                    <th key={h} style={{ padding: '14px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bccbb6' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#bccbb6' }}>Chưa có lịch sử</td></tr>
                ) : history.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(61,74,59,0.4)' }}>
                    <td style={{ padding: '16px 24px', fontFamily: 'Montserrat', fontWeight: 600, color: '#fff' }}>{row.horse_name}</td>
                    <td style={{ padding: '16px 24px', color: '#e4e2e4' }}>{row.race_name}</td>
                    <td style={{ padding: '16px 24px', color: '#bccbb6', fontSize: 13 }}>{fmtDate(row.invited_at)}</td>
                    <td style={{ padding: '16px 24px' }}><Badge status={row.status} /></td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      {row.result
                        ? <span style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#5bf06c' }}>{row.result}</span>
                        : <span style={{ color: '#bccbb6' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
