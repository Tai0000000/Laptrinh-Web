import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RefereeLayout from '../../components/RefereeLayout';
import api from '../../api/axios';

const Races = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pre-race checklist modal state
  const [checklistModal, setChecklistModal] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [checklistState, setChecklistState] = useState({});
  const [checklistNotes, setChecklistNotes] = useState('');

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/referee/races');
      const data = response.data;
      if (data.success) {
        setRaces(data.data);
      } else {
        setError('Không thể tải danh sách cuộc đua.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const updateRaceStatus = async (raceId, status) => {
    try {
      await api.put(`/referee/races/${raceId}/status`, { status });
      if (status === 'active') {
        navigate(`/referee/races/${raceId}/monitor`);
      } else {
        fetchRaces(); // reload
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái cuộc đua.');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Đã hoàn thành';
      case 'active':
      case 'ongoing': return 'Đang diễn ra';
      case 'scheduled': return 'Đã lên lịch';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusFilter = (status) => {
    if (status === 'active' || status === 'ongoing') return 'active';
    return status;
  };

  const formatTime = (raceTime) => {
    if (!raceTime) return '--:--';
    try {
      const date = new Date(raceTime);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '--:--';
    }
  };

  const filteredRaces = races
    .filter(r => filter === 'all' || getStatusFilter(r.status) === filter)
    .filter(r => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.name?.toLowerCase().includes(q) ||
        r.tournament?.name?.toLowerCase().includes(q)
      );
    });

  const openChecklist = (race) => {
    setSelectedRace(race);
    // Initialize checklist state for each registration
    const initialState = {};
    (race.registrations || []).forEach((reg) => {
      initialState[reg.id] = { weight: false, equipment: false, health: false };
    });
    setChecklistState(initialState);
    setChecklistNotes('');
    setChecklistModal(true);
  };

  const toggleCheck = (regId, field) => {
    setChecklistState(prev => ({
      ...prev,
      [regId]: {
        ...prev[regId],
        [field]: !prev[regId]?.[field],
      },
    }));
  };

  const handleChecklistSubmit = () => {
    alert('Kiểm tra trước đua hoàn tất!');
    setChecklistModal(false);
  };

  return (
    <RefereeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
            Cuộc đua phân công
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Giám sát và ghi nhận kết quả cho các cuộc đua được chỉ định. Chọn một cuộc đua để quản lý checklist và xếp hạng vị trí.
          </p>
        </div>

        {/* Filters & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl backdrop-blur-md">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'scheduled', label: 'Đã lên lịch' },
              { key: 'active', label: 'Đang diễn ra' },
              { key: 'completed', label: 'Đã hoàn thành' }
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setFilter(type.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  filter === type.key
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm cuộc đua..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4 text-sm">Đang tải danh sách cuộc đua...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center backdrop-blur-md">
            <svg className="w-10 h-10 mx-auto text-rose-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-rose-300 font-semibold text-sm">{error}</p>
            <button
              onClick={fetchRaces}
              className="mt-4 px-6 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all duration-200 border border-rose-500/30"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRaces.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm">Không tìm thấy cuộc đua nào.</p>
          </div>
        )}

        {/* Races Grid */}
        {!loading && !error && filteredRaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRaces.map((race) => (
              <div
                key={race.id}
                className="bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm group shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                      Mã: #{race.id}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      race.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : (race.status === 'active' || race.status === 'ongoing')
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse'
                        : race.status === 'cancelled'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                    }`}>
                      {getStatusLabel(race.status)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors duration-250">
                      {race.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">{race.tournament?.name || 'Không xác định'}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Giờ chạy</span>
                      <span className="text-slate-300 font-semibold mt-0.5 block">{formatTime(race.race_time)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Cự ly</span>
                      <span className="text-slate-300 font-semibold mt-0.5 block">{race.distance}m</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Số ngựa</span>
                      <span className="text-slate-300 font-semibold mt-0.5 block">{race.registrations?.length || 0} làn</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 flex space-x-2">
                  {race.status === 'completed' ? (
                    <button
                      onClick={() => navigate(`/referee/races/${race.id}/results`)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 border border-slate-700/50"
                    >
                      Xem báo cáo
                    </button>
                  ) : (race.status === 'active' || race.status === 'ongoing') ? (
                    <div className="flex gap-2 w-full flex-wrap">
                      <button
                        onClick={() => navigate(`/referee/races/${race.id}/monitor`)}
                        className="flex-1 min-w-[70px] bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all duration-300"
                      >
                        Giám sát
                      </button>
                      <button
                        onClick={() => navigate(`/referee/races/${race.id}/results`)}
                        className="flex-1 min-w-[75px] bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs transition-all duration-300"
                      >
                        Ghi kết quả
                      </button>
                      <button
                        onClick={() => updateRaceStatus(race.id, 'completed')}
                        className="bg-slate-800 hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-400 font-bold p-2.5 rounded-xl border border-slate-700/50 transition text-xs px-2.5"
                        title="Kết thúc cuộc đua"
                      >
                        ■ Kết thúc
                      </button>
                    </div>
                  ) : race.status === 'cancelled' ? (
                    <button disabled className="w-full bg-slate-800/50 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs cursor-not-allowed border border-slate-800">
                      Đã hủy
                    </button>
                  ) : (
                    /* scheduled */
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => openChecklist(race)}
                        className="flex-1 bg-slate-800/80 hover:bg-slate-800 text-amber-400 border border-slate-700/50 font-bold py-2.5 px-3 rounded-xl text-xs transition duration-200"
                      >
                        Kiểm tra
                      </button>
                      <button
                        onClick={() => updateRaceStatus(race.id, 'active')}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs transition-all duration-200"
                      >
                        ▶ Bắt đầu
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pre-race Checklist Modal */}
      {checklistModal && selectedRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/80">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Kiểm tra trước đua</h2>
                  <p className="text-amber-400 font-semibold text-sm mt-1">{selectedRace.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{selectedRace.tournament?.name || 'Không xác định'}</p>
                </div>
                <button
                  onClick={() => setChecklistModal(false)}
                  className="text-slate-500 hover:text-slate-300 transition p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Weather Info */}
            <div className="p-6 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Thông tin thời tiết</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Nhiệt độ', value: '28°C', icon: '🌡️' },
                  { label: 'Độ ẩm', value: '65%', icon: '💧' },
                  { label: 'Gió', value: '12 km/h', icon: '🌬️' },
                  { label: 'Tình trạng đường đua', value: 'Tốt', icon: '🏁' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 text-center">
                    <span className="text-lg block">{item.icon}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mt-1">{item.label}</span>
                    <span className="text-sm text-slate-200 font-semibold block mt-0.5">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Horse Inspection Table */}
            <div className="p-6 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Kiểm tra ngựa & nài ngựa</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Làn</th>
                      <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngựa</th>
                      <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nài ngựa</th>
                      <th className="text-center py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cân nặng</th>
                      <th className="text-center py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thiết bị</th>
                      <th className="text-center py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sức khỏe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedRace.registrations || []).map((reg) => (
                      <tr key={reg.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition">
                        <td className="py-3 px-3 text-amber-400 font-bold">{reg.lane || '-'}</td>
                        <td className="py-3 px-3 text-slate-200 font-semibold">{reg.horse?.name || 'N/A'}</td>
                        <td className="py-3 px-3 text-slate-400">{reg.jockey?.user?.name || reg.jockey?.name || 'N/A'}</td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={checklistState[reg.id]?.weight || false}
                            onChange={() => toggleCheck(reg.id, 'weight')}
                            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={checklistState[reg.id]?.equipment || false}
                            onChange={() => toggleCheck(reg.id, 'equipment')}
                            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={checklistState[reg.id]?.health || false}
                            onChange={() => toggleCheck(reg.id, 'health')}
                            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                    {(!selectedRace.registrations || selectedRace.registrations.length === 0) && (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-500 text-xs">
                          Không có ngựa đăng ký trong cuộc đua này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes & Actions */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú</label>
                <textarea
                  value={checklistNotes}
                  onChange={(e) => setChecklistNotes(e.target.value)}
                  rows="3"
                  placeholder="Nhập ghi chú về tình trạng trước cuộc đua..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition placeholder-slate-600 resize-none"
                ></textarea>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleChecklistSubmit}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all duration-300 shadow-md shadow-amber-500/10 active:scale-[0.98]"
                >
                  Xác nhận kiểm tra
                </button>
                <button
                  onClick={() => setChecklistModal(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition duration-200 border border-slate-700/50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RefereeLayout>
  );
};

export default Races;
