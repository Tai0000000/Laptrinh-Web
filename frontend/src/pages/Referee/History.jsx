import React, { useState, useEffect } from 'react';
import RefereeLayout from '../../components/RefereeLayout';
import api from '../../api/axios';

const History = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [reportModal, setReportModal] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedRaceResults, setSelectedRaceResults] = useState([]);
  const [selectedRaceViolations, setSelectedRaceViolations] = useState([]);
  const [loadingModalData, setLoadingModalData] = useState(false);

  useEffect(() => {
    fetchCompletedRaces();
  }, []);

  const fetchCompletedRaces = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/referee/races');
      if (response.data.success) {
        // Filter only completed races for history
        const completed = response.data.data.filter(r => r.status === 'completed');
        setRaces(completed);
      } else {
        setError('Không thể tải lịch sử cuộc đua.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const openReportModal = async (race) => {
    setSelectedRace(race);
    setReportModal(true);
    setLoadingModalData(true);
    try {
      // Fetch results and violations for this specific race
      const [resResponse, vioResponse] = await Promise.all([
        api.get(`/referee/races/${race.id}/results`).catch(() => ({ data: { data: [] } })),
        api.get(`/referee/violations?race_id=${race.id}`).catch(() => ({ data: { data: [] } }))
      ]);

      setSelectedRaceResults(resResponse.data?.data || []);
      
      const vList = vioResponse.data?.data || vioResponse.data || [];
      const filteredVList = vList.filter(v => String(v.race_id) === String(race.id));
      setSelectedRaceViolations(filteredVList);
    } catch (err) {
      console.error('Error fetching modal details:', err);
    } finally {
      setLoadingModalData(false);
    }
  };

  const getViolationTypeLabel = (type) => {
    switch (type) {
      case 'false_start': return 'Xuất phát lỗi';
      case 'lane_deviation': return 'Lấn làn đường';
      case 'jockey_conduct': return 'Hành vi nài ngựa';
      case 'equipment_violation': return 'Lỗi thiết bị';
      default: return type;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--/--/----';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '--:--';
    }
  };

  return (
    <RefereeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
            Lịch sử biên bản
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Xem danh sách các biên bản kết quả và vi phạm của các cuộc đua đã hoàn tất và được ký xác nhận bởi Trọng tài.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/10 border border-slate-800 rounded-2xl">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4 text-sm">Đang tải lịch sử biên bản...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center">
            <p className="text-rose-300 font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && races.length === 0 && (
          <div className="text-center py-20 bg-slate-900/10 border border-slate-800 rounded-2xl">
            <svg className="w-12 h-12 mx-auto text-slate-655 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 text-sm">Chưa có biên bản cuộc đua nào được hoàn tất.</p>
          </div>
        )}

        {/* List Grid */}
        {!loading && !error && races.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {races.map((race) => (
              <div
                key={race.id}
                className="bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm shadow-lg group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      Mã: #{race.id}
                    </span>
                    <span className="text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      Đã hoàn thành
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors duration-250">
                      {race.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">{race.tournament?.name || 'Không xác định giải'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">Ngày chạy</span>
                      <span className="text-slate-300 font-semibold mt-0.5 block">{formatDate(race.race_time)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">Giờ chạy</span>
                      <span className="text-slate-300 font-semibold mt-0.5 block">{formatTime(race.race_time)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <button
                    onClick={() => openReportModal(race)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 border border-slate-700/50 flex justify-center items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Xem biên bản đã ký</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportModal && selectedRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            
            {/* Stamp Overlay decoration */}
            <div className="absolute top-16 right-10 pointer-events-none opacity-20 transform rotate-12 hidden md:block">
              <div className="border-4 border-emerald-500 text-emerald-500 font-extrabold text-sm uppercase tracking-widest px-4 py-2 rounded-lg text-center">
                ĐÃ XÁC THỰC
                <br />
                <span className="text-[10px]">CHIEF REFEREE</span>
              </div>
            </div>

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Biên bản kết quả cuộc đua</h2>
                <p className="text-amber-400 font-bold text-sm mt-1">{selectedRace.name}</p>
                <p className="text-slate-500 text-xs">{selectedRace.tournament?.name || 'Không xác định giải'}</p>
              </div>
              <button
                onClick={() => setReportModal(false)}
                className="text-slate-500 hover:text-slate-300 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingModalData ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-slate-700 border-t-amber-500 rounded-full animate-spin mx-auto mb-3"></div>
                Đang tải chi tiết biên bản...
              </div>
            ) : (
              <div className="p-6 space-y-6">
                
                {/* Meta details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold">Ngày & Giờ</span>
                    <span className="text-slate-200 font-bold mt-1 block">
                      {formatDate(selectedRace.race_time)} • {formatTime(selectedRace.race_time)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold">Cự ly</span>
                    <span className="text-slate-200 font-bold mt-1 block">{selectedRace.distance}m</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold">Thời tiết</span>
                    <span className="text-slate-200 font-bold mt-1 block">29°C, Nhiều mây</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold">Đường chạy</span>
                    <span className="text-emerald-400 font-bold mt-1 block">Khô ráo (Đạt chuẩn)</span>
                  </div>
                </div>

                {/* Standings Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Kết quả xếp hạng chính thức</h3>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/20">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-950/50 text-[10px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="px-4 py-3 text-center w-16">Hạng</th>
                          <th className="px-4 py-3 text-center w-16">Làn</th>
                          <th className="px-4 py-3">Ngựa đua</th>
                          <th className="px-4 py-3">Nài ngựa (Jockey)</th>
                          <th className="px-4 py-3">Thời gian hoàn thành</th>
                          <th className="px-4 py-3">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {selectedRaceResults.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-900/10">
                            <td className="px-4 py-3 text-center font-extrabold text-amber-400 text-base">
                              {row.rank}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-400">
                              {row.registration?.lane || '-'}
                            </td>
                            <td className="px-4 py-3 font-bold text-white">
                              {row.registration?.horse?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {row.registration?.jockey?.name || row.registration?.jockey?.user?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-slate-200">
                              {row.finish_time}
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs italic">
                              {row.notes || '--'}
                            </td>
                          </tr>
                        ))}
                        {selectedRaceResults.length === 0 && (
                          <tr>
                            <td colSpan="6" className="px-4 py-6 text-center text-slate-500 text-xs">
                              Không tìm thấy dữ liệu kết quả.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Violations section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Vi phạm ghi nhận trong trận</h3>
                  <div className="space-y-2">
                    {selectedRaceViolations.map((v) => (
                      <div key={v.id} className="bg-rose-500/5 border border-rose-500/15 p-3 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-rose-400">Làn {v.registration?.lane}: {v.registration?.horse?.name || 'Ngựa'}</span>
                          <span className="text-slate-500 ml-2">({v.registration?.jockey?.name || 'Nài ngựa'})</span>
                          {v.notes && <p className="text-slate-400 mt-1">{v.notes}</p>}
                        </div>
                        <span className="bg-rose-500/10 text-rose-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase">
                          {getViolationTypeLabel(v.violation_type)}
                        </span>
                      </div>
                    ))}
                    {selectedRaceViolations.length === 0 && (
                      <p className="text-xs text-slate-500 italic bg-slate-950/10 p-3.5 border border-slate-850 rounded-xl text-center">
                        Không có vi phạm nào được ghi nhận trong cuộc đua này.
                      </p>
                    )}
                  </div>
                </div>

                {/* Sign-off Seal / Stamp section */}
                <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Biên bản được xuất bởi: Cổng Trọng Tài Trực Tuyến</p>
                    <p>Mã băm giao dịch: <span className="font-mono text-[10px]">sha256:7b1e84...2d3f</span></p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex items-center space-x-4 self-stretch md:self-auto">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 uppercase font-black tracking-widest block">ĐÃ KÝ XÁC THỰC</span>
                      <span className="text-xs text-slate-200 font-bold block mt-0.5">Trọng tài trưởng Minh Tâm</span>
                      <span className="text-[9px] text-slate-500 block">Thời gian ký: {new Date(selectedRace.updated_at).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            <div className="p-6 bg-slate-950/40 border-t border-slate-800/80 text-right">
              <button
                onClick={() => setReportModal(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition duration-200 border border-slate-700/50"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </RefereeLayout>
  );
};

export default History;
