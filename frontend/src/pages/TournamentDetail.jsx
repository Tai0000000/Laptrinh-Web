import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const TournamentDetail = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [races, setRaces]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    // Lấy thông tin tournament từ public endpoint
    api.get(`/public/tournaments`)
      .then(res => {
        const data = res.data?.data ?? res.data ?? [];
        const t = data.find(t => String(t.id) === String(id));
        if (t) {
          setTournament(t);
          // Nếu tournament có races embedded thì dùng luôn
          if (t.races?.length) setRaces(t.races);
        } else {
          setError('Không tìm thấy giải đấu.');
        }
      })
      .catch(() => setError('Không thể tải thông tin giải đấu.'));

    // Thử lấy races theo tournament_id (endpoint public)
    api.get(`/public/races/live`)
      .then(res => {
        const all = res.data?.data ?? res.data ?? [];
        const filtered = all.filter(r => String(r.tournament_id) === String(id));
        if (filtered.length) setRaces(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const statusLabel = (s) => {
    switch (s) {
      case 'scheduled': return { text: 'Sắp bắt đầu', cls: 'bg-green-100 text-green-700' };
      case 'ongoing':   return { text: 'Đang diễn ra', cls: 'bg-sky-100 text-sky-700' };
      case 'finished':  return { text: 'Đã kết thúc', cls: 'bg-slate-100 text-slate-500' };
      case 'cancelled': return { text: 'Đã hủy', cls: 'bg-red-100 text-red-500' };
      default:          return { text: s, cls: 'bg-slate-100 text-slate-500' };
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-red-500 font-medium mb-4">{error}</p>
      <Link to="/tournaments" className="text-indigo-600 font-bold hover:underline">← Quay lại danh sách</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link to="/tournaments" className="text-indigo-600 font-bold flex items-center mb-6 hover:underline">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách giải đấu
        </Link>

        {tournament && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-8">
            <h1 className="text-4xl font-black text-slate-900 mb-3">{tournament.name}</h1>
            <div className="flex flex-wrap gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {tournament.location}
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(tournament.start_date).toLocaleDateString('vi-VN')} — {new Date(tournament.end_date).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Races list */}
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Danh sách các cuộc đua</h2>

      {races.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 text-slate-400">
          <p className="text-2xl mb-2">🏁</p>
          <p className="font-medium">Chưa có cuộc đua nào trong giải này.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {races.map((race) => {
            const st = statusLabel(race.status);
            return (
              <Link
                key={race.id}
                to={`/races/${race.id}`}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between group"
              >
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mr-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {race.name ?? race.round ?? `Cuộc đua #${race.id}`}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {race.race_time ? new Date(race.race_time).toLocaleString('vi-VN') : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-8 items-center">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cự ly</p>
                    <p className="text-sm font-black text-slate-700">{race.distance}m</p>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${st.cls}`}>
                      {st.text}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TournamentDetail;
