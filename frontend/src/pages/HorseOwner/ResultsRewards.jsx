import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';

// Helper: a label + value row inside the detail panel
const DetailRow = ({ label, value, highlight }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">{label}</span>
    <span className={`text-sm font-semibold text-right ${highlight ? 'text-indigo-600' : 'text-slate-700'}`}>{value}</span>
  </div>
);

const rankBadge = (rawRank) => {
  if (rawRank === 1) return { text: 'Hạng 1', cls: 'bg-yellow-50 text-yellow-600 border border-yellow-100' };
  if (rawRank === 2) return { text: 'Hạng 2', cls: 'bg-slate-100 text-slate-700' };
  if (rawRank === 3) return { text: 'Hạng 3', cls: 'bg-orange-50 text-orange-600 border border-orange-100' };
  return { text: rawRank ? `Hạng ${rawRank}` : '—', cls: 'bg-slate-50 text-slate-500' };
};

const posColor = (p) => {
  const n = parseInt(p);
  if (n === 1) return 'bg-yellow-100 text-yellow-700';
  if (n === 2) return 'bg-gray-100 text-gray-600';
  if (n === 3) return 'bg-orange-100 text-orange-700';
  return 'bg-slate-100 text-slate-600';
};

const posLabel = (p) => {
  const n = parseInt(p);
  if (n === 1) return '🥇 1st';
  if (n === 2) return '🥈 2nd';
  if (n === 3) return '🥉 3rd';
  return `#${p}`;
};

const ResultsRewards = () => {
  const { user } = useAuth();
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState('all'); // all | wins

  useEffect(() => {
    // Lấy kết quả từ tất cả ngựa của owner
    api.get('/horse-owner/horses')
      .then(async hRes => {
        const horses = hRes.data?.data ?? hRes.data ?? [];
        if (horses.length === 0) { setLoading(false); return; }

        // Fetch results cho từng ngựa song song
        const resultsArrays = await Promise.all(
          horses.map(h =>
            api.get(`/horse-owner/horses/${h.id}/results`)
              .then(r => (r.data?.data ?? r.data ?? []).map(row => ({ ...row, horse_name: h.name })))
              .catch(() => [])
          )
        );
        setResults(resultsArrays.flat().sort((a, b) => new Date(b.race_date ?? b.created_at) - new Date(a.race_date ?? a.created_at)));
      })
      .catch(() => setError('Không thể tải kết quả.'))
      .finally(() => setLoading(false));
  }, [user]);

  const displayed  = filter === 'wins' ? results.filter(r => parseInt(r.finish_position ?? r.rank) === 1) : results;
  const wins       = results.filter(r => parseInt(r.finish_position ?? r.rank) === 1).length;
  const totalPrize = results.reduce((s, r) => s + (parseFloat(r.prize_amount) || 0), 0);

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Kết quả & Phần thưởng</h1>
          <p className="text-gray-500 mt-1 text-sm">Thành tích thi đấu của đàn ngựa</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Tổng trận đua</p>
            <p className="text-3xl font-bold text-gray-800">{loading ? '—' : results.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-400">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Số lần vô địch 🥇</p>
            <p className="text-3xl font-bold text-gray-800">{loading ? '—' : wins}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Tổng tiền thưởng</p>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '—' : `${totalPrize.toLocaleString('vi-VN')} ₫`}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-5">
          {[['all','Tất cả'], ['wins','Chỉ vô địch']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${filter === v ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-center">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Ngựa', 'Cuộc đua', 'Ngày đua', 'Hạng', 'Thời gian', 'Tiền thưởng'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <p className="text-4xl mb-3">🏁</p>
                      <p className="text-gray-400 text-sm">
                        {filter === 'wins' ? 'Chưa có lần vô địch nào' : 'Chưa có kết quả nào'}
                      </p>
                    </td>
                  </tr>
                ) : displayed.map((r, idx) => {
                  const pos   = r.finish_position ?? r.rank ?? '—';
                  const prize = parseFloat(r.prize_amount) || 0;
                  const date  = r.race_date ?? r.created_at;
                  return (
                    <tr key={r.id ?? idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-800 text-sm">{r.horse_name}</td>
                      <td className="px-5 py-4 text-gray-700 text-sm">{r.race_name ?? `Cuộc đua #${r.race_id}`}</td>
                      <td className="px-5 py-4 text-gray-400 text-sm">
                        {date ? new Date(date).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${posColor(pos)}`}>
                          {posLabel(pos)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-sm font-mono">{r.finish_time ?? '—'}</td>
                      <td className="px-5 py-4 font-bold text-sm">
                        {prize > 0
                          ? <span className="text-green-600">{prize.toLocaleString('vi-VN')} ₫</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </HorseOwnerLayout>
  );
};

export default ResultsRewards;
