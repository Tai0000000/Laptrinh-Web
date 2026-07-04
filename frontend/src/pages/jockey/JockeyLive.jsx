import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon, Badge } from '../../components/UI';
import api from '../../api/axios';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080';

/* ── helpers ── */
const posColor = (p) =>
  p === 1 ? '#FFD700' : p === 2 ? '#C0C0C0' : p === 3 ? '#CD7F32' : '#bccbb6';

const posLabel = (p) =>
  p === 1 ? '🥇 1st' : p === 2 ? '🥈 2nd' : p === 3 ? '🥉 3rd' : `#${p}`;

/* ── horse progress bar ── */
function HorseBar({ horse, totalDistance, index }) {
  const pct = totalDistance > 0
    ? Math.min(100, ((totalDistance - horse.distance_left) / totalDistance) * 100)
    : 0;

  const barColors = ['#5bf06c', '#FFD700', '#C0C0C0', '#CD7F32', '#60b8ff', '#ff7a6e', '#d0a3ff', '#ffcb6b'];
  const color = barColors[index % barColors.length];

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'Montserrat', fontWeight: 800, fontSize: 16,
            color: posColor(horse.position), minWidth: 36,
          }}>{posLabel(horse.position)}</span>
          <span style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 15, color: '#fff' }}>
            {horse.name}
          </span>
          {horse.jockey && (
            <span style={{ fontSize: 12, color: '#bccbb6' }}>· {horse.jockey}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#bccbb6' }}>
            {horse.speed ? `${horse.speed} km/h` : '—'}
          </span>
          <span style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, color }}>
            {pct.toFixed(1)}%
          </span>
        </div>
      </div>
      <div style={{ height: 10, background: '#2a2a2c', borderRadius: 5, overflow: 'hidden', border: '1px solid #3d4a3b' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 5,
          transition: 'width 0.4s ease',
          boxShadow: `0 0 8px ${color}60`,
        }} />
      </div>
    </div>
  );
}

/* ── race selector modal ── */
function RaceSelector({ races, onSelect, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#1f1f21', border: '1px solid #3d4a3b', borderRadius: 8,
        width: 560, maxHeight: '80vh', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>
        {/* header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #3d4a3b',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 4, height: 28, background: '#5bf06c', display: 'inline-block', borderRadius: 2 }} />
            <h2 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 18, color: '#fff' }}>
              Chọn cuộc đua để theo dõi
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bccbb6', padding: 4 }}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* body */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 80px)', padding: '12px 0' }}>
          {races.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#bccbb6' }}>
              <Icon name="sports_score" size={40} style={{ color: '#3d4a3b', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14 }}>Không có cuộc đua nào đang diễn ra</p>
              <p style={{ fontSize: 12, marginTop: 8, opacity: 0.7 }}>Các cuộc đua cần có trạng thái "ongoing" để xem live</p>
            </div>
          ) : races.map(race => (
            <button key={race.id} onClick={() => onSelect(race)}
              style={{
                width: '100%', padding: '16px 24px', background: 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                borderBottom: '1px solid rgba(61,74,59,0.4)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#2a2a2c'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 4 }}>
                    {race.name || race.round || `Cuộc đua #${race.id}`}
                  </p>
                  <p style={{ fontSize: 13, color: '#bccbb6' }}>
                    {race.tournament?.name || '—'} · {race.distance}m
                  </p>
                </div>
                <Badge status={race.status} />
              </div>
              {race.registrations_count != null && (
                <p style={{ fontSize: 12, color: '#5bf06c', marginTop: 6 }}>
                  {race.registrations_count} ngựa tham gia
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function JockeyLive() {
  const [liveRaces, setLiveRaces]       = useState([]);
  const [myRaces, setMyRaces]           = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [activeRace, setActiveRace]     = useState(null);
  const [wsStatus, setWsStatus]         = useState('disconnected'); // disconnected | connecting | connected | error
  const [horses, setHorses]             = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [raceFinished, setRaceFinished] = useState(false);
  const [finalResult, setFinalResult]   = useState([]);
  const [tick, setTick]                 = useState(0);

  const wsRef      = useRef(null);
  const pingRef    = useRef(null);

  /* load live races & jockey's races */
  const loadRaces = useCallback(() => {
    // Public live races (status=ongoing)
    api.get('/public/races/live')
      .then(r => { if (r.data?.success) setLiveRaces(r.data.data ?? []); })
      .catch(() => {});

    // Jockey's own races (to filter)
    api.get('/jockey/races')
      .then(r => { if (r.data?.success) setMyRaces(r.data.data ?? []); })
      .catch(() => {});
  }, []);

  useEffect(() => { loadRaces(); }, [loadRaces]);

  /* merge: show all ongoing live races, highlight jockey's own */
  const racesForSelector = liveRaces.length > 0
    ? liveRaces
    : myRaces.filter(r => r.status === 'ongoing' || r.status === 'scheduled');

  /* ── WebSocket connection ── */
  const connectWs = useCallback((race) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setActiveRace(race);
    setHorses([]);
    setRaceFinished(false);
    setFinalResult([]);
    setWsStatus('connecting');

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
      ws.send(JSON.stringify({ action: 'subscribe_race', race_id: race.id }));
      // keepalive ping every 20s
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: 'ping' }));
        }
      }, 20000);
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.action === 'race_update' || data.horses) {
          const updatedHorses = data.horses ?? [];
          setHorses(updatedHorses);
          setTotalDistance(data.total_distance ?? 1000);
          setTick(t => t + 1);

          // check if race finished
          const allDone = updatedHorses.every(h => h.distance_left <= 0);
          if (allDone && updatedHorses.length > 0) {
            setRaceFinished(true);
            const sorted = [...updatedHorses].sort((a, b) => a.position - b.position);
            setFinalResult(sorted);
          }
        }
      } catch { /* ignore malformed */ }
    };

    ws.onerror = () => {
      setWsStatus('error');
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
      clearInterval(pingRef.current);
    };
  }, []);

  const disconnect = useCallback(() => {
    clearInterval(pingRef.current);
    if (wsRef.current) {
      if (activeRace) {
        try {
          wsRef.current.send(JSON.stringify({ action: 'unsubscribe_race', race_id: activeRace.id }));
        } catch { /* ignore */ }
      }
      wsRef.current.close();
    }
    setActiveRace(null);
    setHorses([]);
    setRaceFinished(false);
    setWsStatus('disconnected');
  }, [activeRace]);

  useEffect(() => () => {
    clearInterval(pingRef.current);
    wsRef.current?.close();
  }, []);

  /* ── WS status badge ── */
  const wsStatusCfg = {
    disconnected: { color: '#bccbb6', label: 'Chưa kết nối', dot: false },
    connecting:   { color: '#FFD700', label: 'Đang kết nối...', dot: true },
    connected:    { color: '#5bf06c', label: 'Đang live', dot: true },
    error:        { color: '#ffb4ab', label: 'Lỗi kết nối', dot: false },
  }[wsStatus];

  /* ══ RENDER ══ */
  return (
    <div className="flex-1 ml-64 pt-16" style={{ background: '#131315', minHeight: '100vh' }}>
      {/* header */}
      <header className="fixed top-0 left-64 right-0 h-16 z-40 flex items-center justify-between px-6"
        style={{ background: 'rgba(19,19,21,0.95)', borderBottom: '1px solid #3d4a3b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 22, color: '#e4e2e4' }}>Live Racing</h2>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px', borderRadius: 2, fontSize: 11, fontWeight: 700,
            background: wsStatus === 'connected' ? 'rgba(91,240,108,0.15)' : 'rgba(134,149,130,0.1)',
            color: wsStatusCfg.color,
            border: `1px solid ${wsStatusCfg.color}40`,
          }}>
            {wsStatusCfg.dot && (
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: wsStatusCfg.color,
                display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite',
              }} />
            )}
            {wsStatusCfg.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {activeRace && (
            <button onClick={disconnect}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ffb4ab', color: '#ffb4ab', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 12, borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="stop_circle" size={16} />
              Ngắt kết nối
            </button>
          )}
          <button onClick={() => { loadRaces(); setShowSelector(true); }}
            style={{ padding: '8px 20px', background: '#5bf06c', color: '#00390c', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 13, border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.04em' }}>
            <Icon name="live_tv" size={16} />
            GO LIVE
          </button>
        </div>
      </header>

      <main className="p-10 fade-in" style={{ maxWidth: 900 }}>

        {/* ── no active race ── */}
        {!activeRace && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 480, gap: 20 }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: 'rgba(91,240,108,0.08)', border: '2px solid rgba(91,240,108,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 2s ease-in-out infinite',
            }}>
              <Icon name="live_tv" size={52} style={{ color: '#5bf06c' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 28, color: '#fff', marginBottom: 8 }}>
                Chưa có cuộc đua nào
              </h2>
              <p style={{ color: '#bccbb6', fontSize: 15, marginBottom: 28 }}>
                Nhấn GO LIVE để theo dõi một cuộc đua theo thời gian thực
              </p>
              <button onClick={() => { loadRaces(); setShowSelector(true); }}
                style={{ padding: '14px 36px', background: '#5bf06c', color: '#00390c', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 16, border: 'none', borderRadius: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, letterSpacing: '0.06em', boxShadow: '0 0 30px rgba(91,240,108,0.3)' }}>
                <Icon name="live_tv" size={20} />
                GO LIVE
              </button>
            </div>
            {liveRaces.length > 0 && (
              <p style={{ color: '#5bf06c', fontSize: 13, fontWeight: 700 }}>
                {liveRaces.length} cuộc đua đang diễn ra
              </p>
            )}
          </div>
        )}

        {/* ── active race view ── */}
        {activeRace && (
          <>
            {/* Race info banner */}
            <div style={{
              background: '#1f1f21', border: '1px solid #3d4a3b', borderRadius: 6,
              padding: '20px 24px', marginBottom: 24,
              borderLeft: '4px solid #5bf06c',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 22, color: '#fff' }}>
                    {activeRace.name || activeRace.round || `Cuộc đua #${activeRace.id}`}
                  </h3>
                  <Badge status={activeRace.status} />
                </div>
                <p style={{ color: '#bccbb6', fontSize: 13 }}>
                  {activeRace.tournament?.name || '—'} · {activeRace.distance}m
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bccbb6', marginBottom: 4 }}>Cập nhật</p>
                <p style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 20, color: '#5bf06c' }}>#{tick}</p>
              </div>
            </div>

            {/* connecting state */}
            {wsStatus === 'connecting' && (
              <div style={{ background: '#1f1f21', border: '1px solid #3d4a3b', borderRadius: 6, padding: 40, textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(91,240,108,0.2)', borderTop: '3px solid #5bf06c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#bccbb6', fontSize: 14 }}>Đang kết nối đến WebSocket server...</p>
                <p style={{ color: '#869582', fontSize: 12, marginTop: 6 }}>ws://localhost:8080</p>
              </div>
            )}

            {/* error state */}
            {wsStatus === 'error' && (
              <div style={{ background: 'rgba(255,180,171,0.08)', border: '1px solid rgba(255,180,171,0.3)', borderRadius: 6, padding: 32, textAlign: 'center' }}>
                <Icon name="wifi_off" size={40} style={{ color: '#ffb4ab', display: 'block', margin: '0 auto 12px' }} />
                <p style={{ color: '#ffb4ab', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Không thể kết nối WebSocket</p>
                <p style={{ color: '#bccbb6', fontSize: 13, marginBottom: 20 }}>Đảm bảo container <code style={{ background: '#2a2a2c', padding: '2px 6px', borderRadius: 2 }}>horse_racing_websocket</code> đang chạy trên port 8080</p>
                <button onClick={() => connectWs(activeRace)}
                  style={{ padding: '10px 24px', background: '#5bf06c', color: '#00390c', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 13, border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                  Thử lại
                </button>
              </div>
            )}

            {/* waiting for data */}
            {wsStatus === 'connected' && horses.length === 0 && !raceFinished && (
              <div style={{ background: '#1f1f21', border: '1px solid #3d4a3b', borderRadius: 6, padding: 40, textAlign: 'center' }}>
                <Icon name="hourglass_empty" size={40} style={{ color: '#5bf06c', display: 'block', margin: '0 auto 12px', animation: 'spin 2s linear infinite' }} />
                <p style={{ color: '#bccbb6', fontSize: 14 }}>Đã kết nối — chờ dữ liệu đua...</p>
                <p style={{ color: '#869582', fontSize: 12, marginTop: 6 }}>Cuộc đua sẽ bắt đầu khi referee khởi động</p>
              </div>
            )}

            {/* live race progress */}
            {wsStatus === 'connected' && horses.length > 0 && !raceFinished && (
              <div style={{ background: '#1f1f21', border: '1px solid #3d4a3b', borderRadius: 6, padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5bf06c', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
                  <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 16, color: '#fff' }}>
                    Đang đua — {horses.length} ngựa tham gia
                  </h3>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#bccbb6' }}>
                    Cự ly: {totalDistance}m
                  </span>
                </div>
                {[...horses]
                  .sort((a, b) => a.position - b.position)
                  .map((horse, idx) => (
                    <HorseBar key={horse.id} horse={horse} totalDistance={totalDistance} index={idx} />
                  ))
                }
              </div>
            )}

            {/* finished — podium */}
            {raceFinished && finalResult.length > 0 && (
              <div style={{ background: '#1f1f21', border: '1px solid #3d4a3b', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,#1a2a1a,#131315)', borderBottom: '1px solid #3d4a3b', textAlign: 'center' }}>
                  <Icon name="emoji_events" size={40} style={{ color: '#FFD700', display: 'block', margin: '0 auto 8px' }} />
                  <h3 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 24, color: '#fff' }}>Kết quả cuộc đua</h3>
                  <p style={{ color: '#bccbb6', fontSize: 13, marginTop: 4 }}>{activeRace.name || `Cuộc đua #${activeRace.id}`}</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#2a2a2c', borderBottom: '1px solid #3d4a3b' }}>
                      {['Hạng', 'Tên ngựa', 'Nài ngựa', 'Tốc độ TB'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bccbb6' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {finalResult.map((horse, idx) => (
                      <tr key={horse.id} style={{
                        borderBottom: '1px solid rgba(61,74,59,0.4)',
                        background: idx === 0 ? 'rgba(255,215,0,0.06)' : 'transparent',
                      }}>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 20, color: posColor(horse.position) }}>
                            {posLabel(horse.position)}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 15, color: '#fff' }}>{horse.name}</td>
                        <td style={{ padding: '16px 20px', color: '#bccbb6', fontSize: 14 }}>{horse.jockey || '—'}</td>
                        <td style={{ padding: '16px 20px', fontFamily: 'Montserrat', fontWeight: 700, color: '#5bf06c' }}>{horse.speed ? `${horse.speed} km/h` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: 20, display: 'flex', gap: 10, justifyContent: 'center', borderTop: '1px solid #3d4a3b' }}>
                  <button onClick={() => { loadRaces(); setShowSelector(true); }}
                    style={{ padding: '10px 24px', background: '#5bf06c', color: '#00390c', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 13, border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="live_tv" size={16} />
                    Xem cuộc đua khác
                  </button>
                  <button onClick={disconnect}
                    style={{ padding: '10px 24px', background: 'transparent', color: '#bccbb6', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, border: '1px solid #3d4a3b', borderRadius: 4, cursor: 'pointer' }}>
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Race selector modal ── */}
      {showSelector && (
        <RaceSelector
          races={racesForSelector}
          onSelect={(race) => { setShowSelector(false); connectWs(race); }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}

 