import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import RefereeLayout from '../../components/RefereeLayout';

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  scheduled:  { label: 'Sắp diễn ra', cls: 'bg-slate-800 text-slate-400 border border-slate-700/50' },
  ongoing:    { label: 'Đang đua',     cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  completed:  { label: 'Đã hoàn thành',cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  cancelled:  { label: 'Đã hủy',       cls: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
};

const fmtTime = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—';

const fmtDayLabel = (dateStr) => {
  if (!dateStr) return '—';
  const d     = new Date(dateStr);
  const today = new Date();
  const diff  = Math.floor((d.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / 86400000);

  const base = new Date(dateStr).toLocaleDateString('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (diff === 0)  return `Hôm nay - ${base}`;
  if (diff === 1)  return `Ngày mai - ${base}`;
  if (diff === -1) return `Hôm qua - ${base}`;
  return base;
};

const fmtDayKey = (dateStr) =>
  dateStr ? new Date(dateStr).toISOString().slice(0, 10) : 'unknown';

// ── Component ──────────────────────────────────────────────────────────────
const Schedule = () => {
  const [scheduleDays, setScheduleDays] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    api.get('/referee/races')
      .then(res => {
        const races = res.data?.data ?? res.data ?? [];

        // Nhóm races theo ngày
        const grouped = {};
        races.forEach(race => {
          const key = fmtDayKey(race.race_time);
          if (!grouped[key]) grouped[key] = { dateStr: race.race_time, races: [] };
          grouped[key].races.push(race);
        });

        // Sắp xếp ngày tăng dần
        const sorted = Object.values(grouped)
          .sort((a, b) => new Date(a.dateStr) - new Date(b.dateStr))
          .map(group => ({
            date:  fmtDayLabel(group.dateStr),
            races: group.races.sort((a, b) => new Date(a.race_time) - new Date(b.race_time)),
          }));

        setScheduleDays(sorted);
      })
      .catch(e => {
        setError(e.response?.data?.message || 'Không thể tải lịch đua.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <RefereeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
            Lịch phân công của tôi
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Xem lịch trình làm việc và các cuộc đua được phân công.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : scheduleDays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-500">
            <span className="text-4xl">📋</span>
            <p className="text-sm">Chưa có lịch đua nào được phân công.</p>
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl">
            {scheduleDays.map((day, dIdx) => (
              <div key={dIdx} className="space-y-4">
                {/* Day label */}
                <h3 className="text-sm font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 rounded-lg px-4 py-2 self-start inline-block tracking-wider uppercase">
                  {day.date}
                </h3>

                {/* Timeline */}
                <div className="border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
                  {day.races.map((race, rIdx) => {
                    const s   = STATUS_MAP[race.status] ?? STATUS_MAP.scheduled;
                    const tournament = race.tournament?.name ?? '—';
                    const distance   = race.distance ? `${race.distance}m` : '—';

                    return (
                      <div key={rIdx}
                        className="relative bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/60 p-5 rounded-2xl backdrop-blur-sm transition duration-300 group">
                        {/* Timeline dot */}
                        <span className="absolute -left-[35px] top-6 w-4.5 h-4.5 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center group-hover:border-amber-500 transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-amber-400" />
                        </span>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs font-bold text-white bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                                {fmtTime(race.race_time)}
                              </span>
                              <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors duration-200">
                                {race.name ?? `${tournament} - ${race.round ?? 'Vòng đua'}`}
                              </h4>
                            </div>
                            <p className="text-slate-400 text-xs mt-1">
                              Giải đấu: <span className="text-amber-400/90 font-semibold">{tournament}</span>
                              {race.round && <> • Vòng: <span className="text-slate-300 font-semibold">{race.round}</span></>}
                              {' '}• Cự ly: <span className="text-slate-300">{distance}</span>
                              {' '}• Ngựa tham gia: <span className="text-slate-300">{race.registrations?.length ?? 0}</span>
                            </p>
                          </div>

                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider self-start sm:self-auto ${s.cls}`}>
                            {s.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RefereeLayout>
  );
};

export default Schedule;
