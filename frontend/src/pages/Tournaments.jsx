import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    api.get('/public/tournaments')
      .then(res => setTournaments(res.data?.data ?? res.data ?? []))
      .catch(() => setError('Không thể tải danh sách giải đấu.'))
      .finally(() => setLoading(false));
  }, []);

  const getStatus = (start, end) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const s = new Date(start); s.setHours(0, 0, 0, 0);
    const e = new Date(end);   e.setHours(0, 0, 0, 0);
    if (today < s) return { label: 'Sắp diễn ra', cls: 'text-green-600' };
    if (today > e) return { label: 'Đã kết thúc',  cls: 'text-slate-400' };
    return { label: 'Đang diễn ra', cls: 'text-sky-600' };
  };

  const fmtRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.getDate()}/${s.getMonth()+1} - ${e.getDate()}/${e.getMonth()+1}/${e.getFullYear()}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Tất cả Giải đấu</h1>
        <p className="text-lg text-slate-600">Khám phá và theo dõi các giải đấu đua ngựa kịch tính trên toàn quốc.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      {!error && tournaments.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-2xl mb-2">🏇</p>
          <p className="font-medium">Chưa có giải đấu nào được tổ chức.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {tournaments.map((t) => {
          const st = getStatus(t.start_date, t.end_date);
          return (
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col h-full"
            >
              {/* Color bar */}
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />

              <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Giải đấu
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${st.cls}`}>{st.label}</span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  {t.name}
                </h3>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center text-sm text-slate-500">
                    <svg className="h-5 w-5 mr-3 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t.location}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <svg className="h-5 w-5 mr-3 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {fmtRange(t.start_date, t.end_date)}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mã giải đấu</p>
                    <p className="text-lg font-black text-indigo-600">#{t.id}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-lg">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Tournaments;
