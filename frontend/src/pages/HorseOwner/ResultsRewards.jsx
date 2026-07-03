import React, { useState, useEffect } from 'react';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';
import api from '../../api/axios';

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

const ResultsRewards = () => {
  // --- STATE ---
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  // --- API CALLS ---
  useEffect(() => {
    const fetchAllResultsAndRewards = async () => {
      setLoading(true);
      try {
        // 1. Fetch owner's horses
        const horsesRes = await api.get('/horses');
        const horsesList = horsesRes.data ?? [];

        // 2. Fetch results for each horse concurrently
        const resultsPromises = horsesList.map(async (horse) => {
          try {
            const res = await api.get(`/horses/${horse.id}/results`);
            // Map the results to match table structure
            const horseResults = res.data ?? [];
            return horseResults.map(item => ({
              id: item.id,
              horseName: horse.name,
              race: item.race?.name ?? `Race #${item.race_id}`,
              tournament: item.race?.tournament?.name ?? '—',
              date: item.race?.race_time ? new Date(item.race.race_time).toLocaleDateString('vi-VN') : '—',
              position: item.rank ? `${item.rank}` : '—',
              rawRank: item.rank,
              prize: item.rank === 1 ? '10,000,000đ' : item.rank === 2 ? '5,000,000đ' : item.rank === 3 ? '2,000,000đ' : '—',
              rawPrize: item.rank === 1 ? 10000000 : item.rank === 2 ? 5000000 : item.rank === 3 ? 2000000 : 0
            }));
          } catch (e) {
            console.error(`Error fetching results for horse ${horse.id}:`, e);
            return [];
          }
        });

        const allResultsNested = await Promise.all(resultsPromises);
        const compiledResults = allResultsNested.flat();

        // Sort by date descending (assuming we can convert the date back or sort by ID)
        compiledResults.sort((a, b) => b.id - a.id);

        setResults(compiledResults);
      } catch (err) {
        console.error('Error fetching results and rewards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllResultsAndRewards();
  }, []);

  // --- STATISTICS ---
  const totalRaces = results.length;
  const firstPlaces = results.filter(r => r.rawRank === 1).length;
  const totalWinnings = results.reduce((acc, curr) => acc + curr.rawPrize, 0);

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Kết Quả & Giải Thưởng</h1>
          <p className="text-slate-500 mt-2">Thống kê thành tích thi đấu và tiền thưởng tích lũy từ các ngựa của bạn.</p>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-100 h-28 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng số chặng đua</p>
                <p className="text-3xl font-black text-slate-950 mt-1">{totalRaces}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Số lần vô địch (Hạng 1)</p>
                <p className="text-3xl font-black text-slate-950 mt-1">{firstPlaces}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng tiền thưởng nhận được</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">{totalWinnings.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium">Đang tải kết quả thi đấu...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-12 text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold text-lg">Chưa có kết quả chặng đua nào.</p>
            <p className="text-sm mt-1 text-slate-500">Kết quả sẽ được cập nhật tự động sau khi ban trọng tài xác nhận kết quả các giải đua.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100">
                    {['Ngựa', 'Vòng đua', 'Giải đấu', 'Ngày đua', 'Thứ hạng', 'Tiền thưởng'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((result) => {
                    const { text: rkText, cls: rkCls } = rankBadge(result.rawRank);
                    const isSelected = selectedResult?.id === result.id;
                    return (
                      <tr
                        key={result.id}
                        onClick={() => setSelectedResult(isSelected ? null : result)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50/40'
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-slate-900">{result.horseName}</td>
                        <td className="px-6 py-4 text-slate-700 font-semibold">{result.race}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{result.tournament}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{result.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${rkCls}`}>
                            {rkText}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600 text-sm">
                          {result.prize !== '—' ? `+${result.prize}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- DETAIL SIDE PANEL --- */}
        {selectedResult && (
          <div
            className="fixed inset-0 bg-slate-900/20 z-40"
            onClick={() => setSelectedResult(null)}
          />
        )}
        <div
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
            selectedResult ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedResult && (() => {
            const { text: rkText, cls: rkCls } = rankBadge(selectedResult.rawRank);
            return (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Chi Tiết Kết Quả</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedResult.horseName}</p>
                  </div>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                  {/* Rank hero */}
                  <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center gap-2">
                    <span className={`px-5 py-2 rounded-full text-base font-black ${rkCls}`}>{rkText}</span>
                    <p className="text-xs text-slate-400 mt-1">Thứ hạng đạt được</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                    <DetailRow label="Ngựa" value={selectedResult.horseName} />
                    <DetailRow label="Vòng đua" value={selectedResult.race} />
                    <DetailRow label="Giải đấu" value={selectedResult.tournament} />
                    <DetailRow label="Ngày đua" value={selectedResult.date} />
                  </div>

                  <div className="bg-emerald-50 rounded-2xl p-5">
                    <DetailRow
                      label="Tiền thưởng"
                      value={selectedResult.prize !== '—' ? `+${selectedResult.prize}` : 'Không có thưởng'}
                      highlight={selectedResult.rawPrize > 0}
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </HorseOwnerLayout>
  );
};

export default ResultsRewards;
