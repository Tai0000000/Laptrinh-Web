import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useSocket } from '../hooks/useSocket';

/* ── Countdown ── */
function Countdown({ target }) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(target) - Date.now();
      if (diff <= 0) return;
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [target]);

  return (
    <div className="flex gap-3">
      {[['d','Ngày'],['h','Giờ'],['m','Phút'],['s','Giây']].map(([k,l]) => (
        <div key={k} className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-xl p-3 min-w-[72px] border border-white/20">
          <span className="text-3xl font-black text-white tabular-nums">{String(left[k]).padStart(2,'0')}</span>
          <span className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold mt-1">{l}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Hero Banner ── */
function HeroBanner({ nextRace, totalHorses }) {
  const navigate = useNavigate();
  const target = nextRace?.race_time ?? new Date(Date.now() + 2 * 86400000);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 py-16 px-8 shadow-2xl">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div>
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-bold text-indigo-400 border border-indigo-500/20">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            SỰ KIỆN SẮP DIỄN RA
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {nextRace?.name ?? nextRace?.round ?? 'Giải Đua Ngựa Hoàng Gia 2026'}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Khởi tranh sau:</span>
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-xl leading-relaxed">
            Đừng bỏ lỡ cơ hội chứng kiến những chú ngựa xuất sắc nhất tranh tài. Đặt cược ngay để nhận ưu đãi hấp dẫn!
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/predictions" className="rounded-full bg-indigo-600 px-8 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-indigo-500">
              Đặt cược ngay
            </Link>
            <Link to="/tournaments" className="rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold text-white transition hover:bg-white/10">
              Xem lịch thi đấu
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-end gap-6">
          <Countdown target={target} />
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-sm">Thông tin cuộc đua</h3>
              {nextRace?.status === 'ongoing' && (
                <span className="text-green-400 text-xs font-bold uppercase animate-pulse">● Live</span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Số ngựa tham gia:</span>
                <span className="text-white font-bold">{totalHorses > 0 ? `${totalHorses} Chiến mã` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cự ly:</span>
                <span className="text-white font-bold">{nextRace?.distance ? `${nextRace.distance}m` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Giải đấu:</span>
                <span className="text-indigo-400 font-bold text-xs text-right max-w-[160px] truncate">
                  {nextRace?.tournament?.name ?? '—'}
                </span>
              </div>
            </div>
            {nextRace && (
              <button
                onClick={() => navigate(`/races/${nextRace.id}`)}
                className="mt-5 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
              >
                Xem chi tiết →
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Featured Tournaments ── */
function FeaturedTournaments({ tournaments }) {
  const fmtDate = (s, e) => {
    if (!s || !e) return '—';
    const sd = new Date(s), ed = new Date(e);
    return `${sd.getDate()}/${sd.getMonth()+1} - ${ed.getDate()}/${ed.getMonth()+1}/${ed.getFullYear()}`;
  };

  const getStatus = (start, end) => {
    const now = Date.now();
    const s = new Date(start), en = new Date(end);
    if (now < s) return { label: 'Sắp diễn ra', cls: 'text-green-500' };
    if (now > en) return { label: 'Đã kết thúc',  cls: 'text-slate-400' };
    return { label: 'Đang diễn ra', cls: 'text-sky-500' };
  };

  if (!tournaments.length) return null;

  return (
    <section className="py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Giải đấu nổi bật</h2>
          <p className="text-slate-500 mt-2">Khám phá các sự kiện đua ngựa đẳng cấp nhất.</p>
        </div>
        <Link to="/tournaments" className="text-indigo-600 font-bold hover:underline flex items-center group">
          Xem tất cả <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.slice(0, 6).map(t => {
          const st = getStatus(t.start_date, t.end_date);
          return (
            <Link key={t.id} to={`/tournaments/${t.id}`}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
              {/* Color strip */}
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">Giải đấu</span>
                  <span className={`text-[10px] font-bold uppercase ${st.cls}`}>{st.label}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                  {t.name}
                </h3>
                <div className="space-y-2 text-sm text-slate-500 flex-1">
                  {t.location && (
                    <p className="flex items-center gap-2">
                      <span>📍</span>{t.location}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <span>📅</span>{fmtDate(t.start_date, t.end_date)}
                  </p>
                  {(t.registrations_count != null || t.races_count != null) && (
                    <p className="flex items-center gap-2">
                      <span>🏇</span>
                      {t.races_count != null ? `${t.races_count} Cuộc đua` : ''}
                      {t.registrations_count != null ? ` • ${t.registrations_count} Chiến mã` : ''}
                    </p>
                  )}
                </div>
                <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">
                    {t.prize_pool != null
                      ? <>Giải thưởng: <span className="text-indigo-600">{Number(t.prize_pool).toLocaleString('vi-VN')} ₫</span></>
                      : <span className="text-slate-300">—</span>}
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors text-slate-600">→</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ── Upcoming Races ── */
function UpcomingRaces({ races }) {
  const [day, setDay]     = useState('today');
  const [showing, setShowing] = useState(5);

  const today    = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  const dayEnd   = (d) => { const e = new Date(d); e.setHours(23,59,59,999); return e; };

  const filtered = races.filter(r => {
    if (!r.race_time) return false;
    const t = new Date(r.race_time);
    return day === 'today'
      ? t >= today && t <= dayEnd(today)
      : t >= tomorrow && t <= dayEnd(tomorrow);
  });

  const visible = filtered.slice(0, showing);

  return (
    <section className="py-12 bg-slate-50/50 rounded-3xl px-8 border border-gray-100">
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Lịch đua sắp tới</h2>
          <p className="text-slate-500 mt-1">Theo dõi các cuộc đua kịch tính.</p>
        </div>
        <div className="flex gap-2">
          {[['today','Hôm nay'],['tomorrow','Ngày mai']].map(([v,l]) => (
            <button key={v} onClick={() => { setDay(v); setShowing(5); }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${day===v ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-gray-200 hover:border-slate-400'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center text-slate-400">
          <p className="text-3xl mb-2">🏁</p>
          <p className="font-medium">Không có cuộc đua nào {day === 'today' ? 'hôm nay' : 'ngày mai'}.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-slate-900 text-white">
                  {['Thời gian','Tên cuộc đua','Giải đấu','Khoảng cách','Hành động'].map((h,i) => (
                    <th key={h} className={`px-6 py-4 text-left text-xs font-black uppercase tracking-widest ${i>1 ? 'hidden md:table-cell' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map(race => (
                  <tr key={race.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-slate-900">
                        {new Date(race.race_time).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' })}
                      </div>
                      <div className="text-[10px] font-bold text-indigo-500 uppercase">
                        {race.status === 'scheduled' ? 'Sắp bắt đầu' : race.status === 'ongoing' ? 'Đang đua' : race.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${race.status === 'ongoing' ? 'bg-green-500 animate-pulse' : 'bg-indigo-500'}`} />
                        <span className="text-sm font-bold text-slate-900">{race.name ?? race.round ?? `Cuộc đua #${race.id}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-500">
                      {race.tournament?.name ?? '—'}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell font-mono text-sm text-slate-500">
                      {race.distance}m
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/races/${race.id}`}
                        className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black hover:bg-indigo-600 hover:text-white transition-all">
                        CHI TIẾT
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length > showing && (
            <div className="mt-6 text-center">
              <button onClick={() => setShowing(s => s + 5)}
                className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors px-6 py-2 rounded-full border border-gray-200 hover:border-indigo-300 bg-white">
                Tải thêm ({filtered.length - showing} cuộc đua) ↓
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ══════════ HOME PAGE ══════════ */
export default function Home() {
  const [loading, setLoading]   = useState(true);
  const [tournaments, setTournaments] = useState([]);
  const [races, setRaces]       = useState([]);
  const [nextRace, setNextRace] = useState(null);
  const { addMessageListener, removeMessageListener } = useSocket();

  const loadData = () => {
    Promise.all([
      api.get('/public/tournaments'),
      api.get('/public/races'),
    ]).then(([tRes, rRes]) => {
      const ts = tRes.data?.data ?? tRes.data ?? [];
      const rs = rRes.data?.data ?? rRes.data ?? [];

      setTournaments(ts);
      setRaces(rs);

      // next race = cuộc đua sắp tới gần nhất (scheduled/ongoing)
      const upcoming = rs
        .filter(r => r.status === 'scheduled' || r.status === 'ongoing')
        .sort((a, b) => new Date(a.race_time) - new Date(b.race_time));
      if (upcoming.length) setNextRace(upcoming[0]);
      else if (rs.length)  setNextRace(rs[0]);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Listen for real-time race results ───────────────────────────────────
  useEffect(() => {
    const handleRaceResult = () => {
      loadData();
    };
    addMessageListener('race_result', handleRaceResult);
    return () => {
      removeMessageListener('race_result', handleRaceResult);
    };
  }, [addMessageListener, removeMessageListener]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
    </div>
  );

  const totalHorses = nextRace?.registrations_count ?? nextRace?.registrations?.length ?? 0;

  return (
    <div className="space-y-16 pb-20">
      <HeroBanner nextRace={nextRace} totalHorses={totalHorses} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        <FeaturedTournaments tournaments={tournaments} />
        <UpcomingRaces races={races} />

        {/* Why us */}
        <section className="py-12 border-t border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900">Tại sao chọn chúng tôi?</h2>
            <p className="text-slate-500 mt-2">Nền tảng quản lý đua ngựa hàng đầu Việt Nam.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n:'01', color:'indigo', title:'Minh bạch', desc:'Mọi kết quả đều được trọng tài xác nhận và ghi lại trực tiếp trên hệ thống.' },
              { n:'02', color:'blue',   title:'Nhanh chóng', desc:'Cập nhật dữ liệu trực tiếp qua WebSocket với độ trễ cực thấp.' },
              { n:'03', color:'slate',  title:'An toàn', desc:'Hệ thống đặt cược bảo mật, nạp rút nhanh chóng và hỗ trợ 24/7.' },
            ].map(f => (
              <div key={f.n} className="text-center p-6">
                <div className={`w-16 h-16 bg-${f.color}-100 rounded-full flex items-center justify-center mx-auto mb-4 text-${f.color}-600 font-bold text-2xl`}>{f.n}</div>
                <h3 className="font-bold text-xl mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
