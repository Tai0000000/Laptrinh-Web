import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const RaceDetail = () => {
  const { id } = useParams();
  const [race, setRace]         = useState(null);
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/public/races/${id}`),
      api.get(`/public/race-results/${id}`).catch(() => ({ data: { data: [] } })),
    ]).then(([raceRes, resultRes]) => {
      const raceData = raceRes.data?.data ?? raceRes.data;
      setRace(raceData);
      setResults(resultRes.data?.data ?? resultRes.data ?? []);
    }).catch(() => setError('Không thể tải thông tin cuộc đua.'))
      .finally(() => setLoading(false));
  }, [id]);

  const statusLabel = (s) => {
    switch (s) {
      case 'scheduled': return { text: 'Sắp bắt đầu', cls: 'bg-green-100 text-green-700' };
      case 'ongoing':   return { text: 'Đang diễn ra', cls: 'bg-sky-100 text-sky-700' };
      case 'finished':  return { text: 'Đã kết thúc',  cls: 'bg-slate-100 text-slate-500' };
      case 'cancelled': return { text: 'Đã hủy',       cls: 'bg-red-100 text-red-500' };
      default:          return { text: s,               cls: 'bg-slate-100 text-slate-500' };
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
    </div>
  );

  if (error || !race) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-red-500 font-medium mb-4">{error || 'Không tìm thấy cuộc đua.'}</p>
      <Link to="/tournaments" className="text-indigo-600 font-bold hover:underline">← Quay lại</Link>
    </div>
  );

  const registrations = race.registrations ?? [];
  const st = statusLabel(race.status);
  const hasResults = results.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <div className="mb-10">
        <Link
          to={race.tournament_id ? `/tournaments/${race.tournament_id}` : '/tournaments'}
          className="text-indigo-600 font-bold flex items-center mb-6 hover:underline"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách cuộc đua
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-indigo-500 font-bold text-sm uppercase tracking-widest">
              {race.tournament?.name ?? 'Giải đấu'}
            </span>
            <h1 className="text-4xl font-black text-slate-900 mt-2">
              {race.name ?? race.round ?? `Cuộc đua #${race.id}`}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-slate-500 flex items-center text-sm">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {race.race_time ? new Date(race.race_time).toLocaleString('vi-VN') : '—'}
                {race.distance ? ` • ${race.distance}m` : ''}
              </p>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${st.cls}`}>{st.text}</span>
            </div>
          </div>
          {race.status === 'scheduled' && (
            <Link to="/predictions" className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all text-center">
              Đặt cược ngay
            </Link>
          )}
        </div>
      </div>

      {/* Results table — shown when race is finished */}
      {hasResults && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🏆 Kết quả chính thức</h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-slate-900 text-white">
                <tr>
                  {['Hạng', 'Làn', 'Ngựa', 'Nài ngựa', 'Thời gian', 'Ghi chú'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.map((r) => (
                  <tr key={r.registration_id} className="hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <span className={`font-black text-lg ${r.rank === 1 ? 'text-yellow-500' : r.rank === 2 ? 'text-slate-400' : r.rank === 3 ? 'text-amber-600' : 'text-slate-700'}`}>
                        #{r.rank ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-600">{r.registration?.lane ?? '—'}</td>
                    <td className="px-6 py-5 font-bold text-slate-900">{r.registration?.horse?.name ?? r.horse ?? '—'}</td>
                    <td className="px-6 py-5 text-slate-600">{r.registration?.jockey?.user?.name ?? r.registration?.jockey?.name ?? '—'}</td>
                    <td className="px-6 py-5 font-mono font-bold text-indigo-600">{r.finish_time ?? '—'}</td>
                    <td className="px-6 py-5 text-slate-400 text-sm italic">{r.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Participants table */}
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        {hasResults ? 'Danh sách tham gia' : 'Chiến mã tham dự'}
      </h2>

      {registrations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 text-slate-400">
          <p className="text-2xl mb-2">🐴</p>
          <p className="font-medium">Chưa có ngựa đăng ký tham gia cuộc đua này.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-slate-900 text-white">
                <tr>
                  {['Làn', 'Chiến mã', 'Nài ngựa', 'Giống', 'Tuổi', 'Hành động'].map(h => (
                    <th key={h} className="px-8 py-5 text-left text-xs font-black uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {reg.lane ?? '—'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-base font-bold text-slate-900">{reg.horse?.name ?? '—'}</span>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-600">
                      {reg.jockey?.user?.name ?? reg.jockey?.name ?? '—'}
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 italic">{reg.horse?.breed ?? '—'}</td>
                    <td className="px-8 py-6 text-sm text-slate-500">{reg.horse?.age ? `${reg.horse.age} tuổi` : '—'}</td>
                    <td className="px-8 py-6">
                      <Link to="/predictions" className="text-indigo-600 font-bold text-xs hover:text-indigo-800 uppercase tracking-tighter">
                        Đặt cược
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
          <h3 className="text-xl font-bold text-indigo-900 mb-4">Thông tin giải đấu</h3>
          <div className="space-y-2 text-sm text-indigo-700/80">
            <p>📍 {race.tournament?.location ?? '—'}</p>
            <p>📅 {race.tournament?.start_date ? new Date(race.tournament.start_date).toLocaleDateString('vi-VN') : '—'} — {race.tournament?.end_date ? new Date(race.tournament.end_date).toLocaleDateString('vi-VN') : '—'}</p>
            <p>🏇 Cự ly: {race.distance ?? '—'}m</p>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-3xl text-white">
          <h3 className="text-xl font-bold mb-4 text-white">Quy tắc cuộc đua</h3>
          <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
            <li>Nài ngựa phải mặc đúng trang phục bảo hộ của ban tổ chức.</li>
            <li>Ngựa vi phạm làn đua quá 3 lần sẽ bị loại trực tiếp.</li>
            <li>Kết quả cuối cùng dựa trên camera vạch đích (Photo Finish).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RaceDetail;
