import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RefereeLayout from '../../components/RefereeLayout';
import api from '../../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [races, setRaces]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/referee/races')
      .then(r => { if (r.data?.success) setRaces(r.data.data ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── stats tính từ data thật ── */
  const todayStr   = new Date().toISOString().slice(0, 10);
  const todayRaces = races.filter(r => r.race_time?.startsWith(todayStr));
  const done       = races.filter(r => r.status === 'finished').length;
  const ongoing    = races.filter(r => r.status === 'ongoing').length;
  const scheduled  = races.filter(r => r.status === 'scheduled').length;

  const stats = [
    { label: 'Cuộc đua hôm nay',    value: todayRaces.length,   change: `${done} đã hoàn thành`,    color: 'from-amber-500 to-yellow-600' },
    { label: 'Đang diễn ra',        value: ongoing,             change: 'Đang theo dõi',             color: 'from-orange-500 to-amber-600' },
    { label: 'Chờ bắt đầu',         value: scheduled,           change: 'Đã lên lịch',               color: 'from-sky-500 to-blue-600' },
    { label: 'Tổng cuộc đua',       value: races.length,        change: 'Toàn bộ',                   color: 'from-emerald-500 to-teal-600' },
  ];

  const statusLabel = (s) => ({
    finished:  { text: 'Đã hoàn thành', cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
    ongoing:   { text: 'Đang diễn ra',  cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' },
    scheduled: { text: 'Đã lên lịch',  cls: 'bg-slate-800 text-slate-400 border border-slate-700/50' },
    cancelled: { text: 'Đã hủy',       cls: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
  }[s] ?? { text: s, cls: 'bg-slate-800 text-slate-400 border border-slate-700/50' });

  return (
    <RefereeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
              Bảng điều khiển Trọng tài
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Quản lý và giám sát các cuộc đua. Giữ vững tính công bằng và minh bạch.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-2 text-xs font-semibold text-amber-400 self-start md:self-auto shadow-inner backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Phiên hoạt động Trực tiếp</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md hover:border-slate-700/60 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
              <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color}`} />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline space-x-2 mt-4">
                <span className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
                  {loading ? '—' : stat.value}
                </span>
                <span className="text-slate-500 text-xs font-medium">({stat.change})</span>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Race list */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white tracking-wide">Danh sách cuộc đua</h2>
              <button
                onClick={() => navigate('/referee/races')}
                className="text-slate-400 text-xs hover:text-amber-400 cursor-pointer transition-colors duration-200"
              >
                Xem tất cả →
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <p className="text-slate-500 text-sm text-center py-8">Đang tải...</p>
              ) : races.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">Chưa có cuộc đua nào</p>
              ) : races.slice(0, 5).map((race, idx) => {
                const { text, cls } = statusLabel(race.status);
                const raceTime = race.race_time
                  ? new Date(race.race_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                  : '—';
                return (
                  <div key={race.id ?? idx}
                    className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl hover:bg-slate-900/30 transition-colors duration-300 group cursor-pointer"
                    onClick={() => navigate(`/referee/races`)}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-bold text-amber-500 bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-lg">
                        {raceTime}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors duration-200">
                          {race.name ?? race.round ?? `Cuộc đua #${race.id}`}
                        </h4>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {race.tournament?.name ?? '—'} · {race.distance}m
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${cls}`}>
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white tracking-wide">Điều khiển nhanh</h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/referee/schedule')}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md shadow-amber-500/15 active:scale-[0.98]"
                >
                  Xem lịch phân công
                </button>
                <button
                  onClick={() => navigate('/referee/races')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 border border-slate-700/50 active:scale-[0.98]"
                >
                  Nhập kết quả cuộc đua
                </button>
                <button
                  onClick={() => navigate('/referee/violations')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 border border-slate-700/50 active:scale-[0.98]"
                >
                  Ghi thẻ lỗi vi phạm
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 mt-6 lg:mt-0">
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
                <p className="text-slate-400 text-xs font-semibold">Quy tắc điều hành</p>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Tất cả kết quả phải được xác nhận bởi ít nhất hai trọng tài chính thức trước khi lưu và xuất bản báo cáo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RefereeLayout>
  );
};

export default Dashboard;
