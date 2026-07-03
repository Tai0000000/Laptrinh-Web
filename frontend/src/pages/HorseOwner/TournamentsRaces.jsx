import React, { useState, useEffect } from 'react';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';
import api from '../../api/axios';
import SuccessModal from '../../components/SuccessModal';

const TournamentsRaces = () => {
  // --- STATE ---
  const [tournaments, setTournaments] = useState([]);
  const [allHorses, setAllHorses] = useState([]);       // All owner's horses (unfiltered)
  const [allJockeys, setAllJockeys] = useState([]);     // All owner's active-contract jockeys
  const [raceRegistrations, setRaceRegistrations] = useState([]); // Registrations for current selected race
  const [successMessage, setSuccessMessage] = useState({ show: false, title: '', msg: '' });
  
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedRace, setSelectedRace] = useState(null);
  
  // Modals state
  const [showRegModal, setShowRegModal] = useState(false);
  const [showHorseModal, setShowHorseModal] = useState(false);
  const [showJockeyModal, setShowJockeyModal] = useState(false);
  const [loadingRaceRegs, setLoadingRaceRegs] = useState(false);

  // Read-only Details Modals State
  const [detailedHorse, setDetailedHorse] = useState(null);
  const [detailedJockey, setDetailedJockey] = useState(null);

  // Selected entities for registration
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [selectedJockey, setSelectedJockey] = useState(null);

  // --- API CALLS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch public tournaments (including eager loaded races)
      const tRes = await api.get('/public/tournaments');
      setTournaments(tRes.data ?? []);

      // 2. Fetch ALL owner's horses (unfiltered — we compute eligibility in UI)
      const hRes = await api.get('/horses');
      setAllHorses(hRes.data ?? []);

      // 3. Fetch owner's active-contract jockeys
      const jRes = await api.get('/contracts/owner');
      const allContracts = jRes.data?.data ?? [];
      setAllJockeys(allContracts.filter(c => c.contractStatus === 'active' || c.contractStatus === 'Active'));

    } catch (err) {
      console.error('Error fetching tournaments/races/jockeys data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current registrations for a specific race to check duplicates
  const fetchRaceRegistrations = async (raceId) => {
    setLoadingRaceRegs(true);
    try {
      const res = await api.get('/registrations/owner');
      const ownerRegs = res.data?.data ?? [];
      // Filter to only regs for this specific race
      setRaceRegistrations(ownerRegs.filter(r => r.race_id === raceId));
    } catch (err) {
      console.error('Error fetching race registrations:', err);
      setRaceRegistrations([]);
    } finally {
      setLoadingRaceRegs(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh selected tournament details when tournaments state updates
  useEffect(() => {
    if (selectedTournament) {
      const updated = tournaments.find(t => t.id === selectedTournament.id);
      if (updated) setSelectedTournament(updated);
    }
  }, [tournaments]);

  // --- HANDLERS ---
  const selectTournamentDetails = (tournament) => {
    setSelectedTournament(tournament);
    setViewMode('detail');
  };

  const goBackToList = () => {
    setSelectedTournament(null);
    setViewMode('list');
  };

  const openRegisterModal = (race) => {
    setSelectedRace(race);
    setSelectedHorse(null);
    setSelectedJockey(null);
    setRaceRegistrations([]);
    setShowRegModal(true);
    fetchRaceRegistrations(race.id);
  };

  // --- ELIGIBILITY HELPERS ---
  // Returns { disabled: bool, reason: string } for a horse
  const getHorseEligibility = (horse) => {
    const isInactive = horse.status !== 'active' && horse.status !== 'Active';
    if (isInactive) return { disabled: true, reason: 'Ngựa không ở trạng thái hoạt động' };
    const alreadyRegistered = raceRegistrations.some(r => r.horse_id === horse.id);
    if (alreadyRegistered) return { disabled: true, reason: 'Ngựa này đã được đăng ký vào cuộc đua này' };
    return { disabled: false, reason: null };
  };

  // Returns { disabled: bool, reason: string } for a jockey
  const getJockeyEligibility = (jockey) => {
    const alreadyAssigned = raceRegistrations.some(r => r.jockey_id === jockey.jockey_id);
    if (alreadyAssigned) return { disabled: true, reason: 'Jockey này đã được phân công trong cuộc đua này' };
    return { disabled: false, reason: null };
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!selectedHorse || !selectedJockey) {
      setSuccessMessage({
        show: true,
        title: 'Thông báo',
        msg: 'Vui lòng chọn đầy đủ ngựa và jockey!',
        type: 'error'
      });
      return;
    }

    try {
      const res = await api.post('/registrations', {
        race_id: selectedRace.id,
        horse_id: selectedHorse.id,
        jockey_id: selectedJockey.jockey_id
      });
      
      setSuccessMessage({
        show: true,
        title: 'Đăng Ký Thành Công!',
        msg: `Ngựa ${selectedHorse.name} và jockey ${selectedJockey.name} đã được đăng ký thành công vào cuộc đua ${selectedRace.name}!`,
        type: 'success'
      });
      setShowRegModal(false);
      
      // Reload tournaments to get fresh registration statuses
      const tRes = await api.get('/public/tournaments');
      setTournaments(tRes.data ?? []);
    } catch (err) {
      setSuccessMessage({
        show: true,
        title: 'Đăng ký thất bại',
        msg: err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện đăng ký.',
        type: 'error'
      });
    }
  };

  const selectHorseItem = (horse) => {
    setSelectedHorse(horse);
    setShowHorseModal(false);
  };

  const selectJockeyItem = (jockey) => {
    setSelectedJockey(jockey);
    setShowJockeyModal(false);
  };

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* --- VIEW MODE: LIST (TOURNEY LIST ONLY) --- */}
        {viewMode === 'list' && (
          <div>
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Danh Sách Giải Đấu</h1>
              <p className="text-slate-500 mt-2">Chọn một giải đấu để xem thông tin lịch đua và thực hiện đăng ký tham gia.</p>
            </div>

            {/* Loading / Grid */}
            {loading ? (
              <div className="text-center py-20 text-slate-400 font-medium">Đang tải danh sách giải đấu...</div>
            ) : tournaments.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-medium">Không có giải đấu nào hiện khả dụng.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tournaments.map((t) => {
                  const racesCount = t.races ? t.races.length : 0;
                  const isUpcoming = new Date(t.start_date) > new Date();
                  const isCompleted = new Date(t.end_date) < new Date();
                  return (
                    <div
                      key={t.id}
                      onClick={() => selectTournamentDetails(t)}
                      className="group cursor-pointer p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between min-h-[220px]"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            isUpcoming
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : isCompleted
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {isUpcoming ? 'Sắp diễn ra' : isCompleted ? 'Đã kết thúc' : 'Đang diễn ra'}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{racesCount} Vòng đua</span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-xl leading-snug group-hover:text-indigo-600 transition-colors mb-4">
                          {t.name}
                        </h3>
                      </div>

                      <div>
                        <div className="space-y-2 text-sm text-slate-500 mb-5 border-t border-slate-50 pt-4">
                          <div className="flex justify-between">
                            <span>Thời gian:</span>
                            <span className="font-medium text-slate-700">{t.start_date} - {t.end_date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Địa điểm:</span>
                            <span className="font-semibold text-slate-700">{t.location}</span>
                          </div>
                        </div>

                        <button className="w-full bg-slate-950 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-1">
                          Chi tiết vòng đua
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW MODE: DETAIL (RACES LIST ONLY) --- */}
        {viewMode === 'detail' && selectedTournament && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={goBackToList}
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-all bg-indigo-50 hover:bg-indigo-100/80 px-4 py-2.5 rounded-2xl"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách giải đấu
            </button>

            {/* Races list of the selected Tournament */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="pb-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">
                    Giải đấu: {selectedTournament.start_date} - {selectedTournament.end_date}
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 mt-1">{selectedTournament.name}</h2>
                  <p className="text-slate-500 text-sm mt-1">Đăng ký ngựa thi đấu và nài ngựa cho các vòng đua bên dưới.</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 px-5 py-3 rounded-2xl text-right">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Địa điểm</span>
                  <strong className="text-sm text-indigo-700 font-extrabold">{selectedTournament.location}</strong>
                </div>
              </div>

              <div className="space-y-4">
                {!selectedTournament.races || selectedTournament.races.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium">Chưa có vòng đua nào được thiết lập cho giải đấu này.</div>
                ) : (
                  selectedTournament.races.map((race) => {
                    const isRegistered = race.registrations && race.registrations.length > 0;
                    const registration = isRegistered ? race.registrations[0] : null;

                    return (
                      <div
                        key={race.id}
                        className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-900 text-lg">{race.name} ({race.round})</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              race.status === 'scheduled' || race.status === 'Open'
                                ? 'bg-green-50 text-green-600 border border-green-100'
                                : race.status === 'completed' || race.status === 'Completed'
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {race.status === 'scheduled' || race.status === 'Open' ? 'Mở đăng ký' : race.status === 'completed' || race.status === 'Completed' ? 'Đã kết thúc' : 'Đã khóa'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Cự ly: <strong className="text-slate-700">{race.distance}m</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Khởi tranh: <strong className="text-slate-700">{new Date(race.race_time).toLocaleString('vi-VN')}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Registration Info / Action */}
                        <div className="flex items-center">
                          {registration ? (
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between gap-6 text-sm text-indigo-900 min-w-[280px]">
                              <div>
                                <p className="text-xs font-black text-indigo-500 uppercase">Trạng thái đăng ký</p>
                                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold ${
                                  registration.status === 'confirmed'
                                    ? 'bg-green-200 text-green-800'
                                    : registration.status === 'rejected'
                                    ? 'bg-red-200 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {registration.status === 'confirmed' ? 'Đã duyệt' : registration.status === 'rejected' ? 'Bị từ chối' : 'Chờ duyệt'}
                                </span>
                              </div>
                            </div>
                          ) : race.status === 'scheduled' || race.status === 'Open' ? (
                            <button
                              onClick={() => openRegisterModal(race)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-95"
                            >
                              Đăng ký tham gia
                            </button>
                          ) : (
                            <button
                              disabled
                              className="bg-slate-200 text-slate-400 font-bold text-sm px-6 py-3 rounded-xl cursor-not-allowed"
                            >
                              Không khả dụng
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- MAIN REGISTRATION MODAL --- */}
        {showRegModal && selectedRace && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">Đăng ký tham gia</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedRace.name}</h3>
                </div>
                <button
                  onClick={() => setShowRegModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                {/* Custom Horse Selector */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ngựa tham gia</label>
                  {selectedHorse ? (
                    <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{selectedHorse.name}</p>
                        <p className="text-xs text-slate-500">{selectedHorse.breed} • {selectedHorse.age} tuổi</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowHorseModal(true)}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Thay đổi
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowHorseModal(true)}
                      className="w-full border-2 border-dashed border-slate-200 hover:border-indigo-400 p-5 rounded-2xl text-slate-500 font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Chọn ngựa của bạn
                    </button>
                  )}
                </div>

                {/* Custom Jockey Selector */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Jockey điều khiển</label>
                  {selectedJockey ? (
                    <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{selectedJockey.name}</p>
                        <p className="text-xs text-slate-500">Exp: {selectedJockey.experience} • Đánh giá: {selectedJockey.rating}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowJockeyModal(true)}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Thay đổi
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowJockeyModal(true)}
                      className="w-full border-2 border-dashed border-slate-200 hover:border-indigo-400 p-5 rounded-2xl text-slate-500 font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Chọn jockey đã ký hợp đồng
                    </button>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRegModal(false)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/10 transition active:scale-95"
                  >
                    Đăng ký tham gia
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- HORSE SELECTION MODAL --- */}
        {showHorseModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Chọn Ngựa Tham Gia</h3>
                  <p className="text-slate-500 text-xs mt-1">Tất cả ngựa của bạn. Ngựa không hợp lệ sẽ hiển thị lý do.</p>
                </div>
                <button
                  onClick={() => setShowHorseModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-3 pr-2 mb-4">
                {loadingRaceRegs ? (
                  <div className="text-center py-10 text-slate-400 font-medium">Đang kiểm tra tình trạng đăng ký...</div>
                ) : allHorses.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium">Bạn không có ngựa nào.</div>
                ) : (
                  allHorses.map(horse => {
                    const { disabled, reason } = getHorseEligibility(horse);
                    return (
                      <div
                        key={horse.id}
                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          disabled
                            ? 'border-slate-100 bg-slate-50/40 opacity-60'
                            : selectedHorse?.id === horse.id
                            ? 'border-indigo-600 bg-indigo-50/45'
                            : 'border-slate-100 bg-slate-50/20 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                            disabled ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white'
                          }`}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base">{horse.name}</h4>
                            <p className="text-xs text-slate-500">Giống: {horse.breed} • Tuổi: {horse.age} tuổi</p>
                            {disabled && reason && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                {reason}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setDetailedHorse(horse)}
                            className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => !disabled && selectHorseItem(horse)}
                            className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                              disabled
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            {disabled ? 'Không khả dụng' : 'Chọn'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- JOCKEY SELECTION MODAL --- */}
        {showJockeyModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Chọn Jockey Tham Gia</h3>
                  <p className="text-slate-500 text-xs mt-1">Tất cả jockey đã ký hợp đồng. Jockey không khả dụng sẽ hiển thị lý do.</p>
                </div>
                <button
                  onClick={() => setShowJockeyModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-3 pr-2 mb-4">
                {loadingRaceRegs ? (
                  <div className="text-center py-10 text-slate-400 font-medium">Đang kiểm tra tình trạng đăng ký...</div>
                ) : allJockeys.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium">Bạn chưa ký hợp đồng với jockey nào.</div>
                ) : (
                  allJockeys.map(jockey => {
                    const { disabled, reason } = getJockeyEligibility(jockey);
                    return (
                      <div
                        key={jockey.id}
                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          disabled
                            ? 'border-slate-100 bg-slate-50/40 opacity-60'
                            : selectedJockey?.id === jockey.id
                            ? 'border-indigo-600 bg-indigo-50/45'
                            : 'border-slate-100 bg-slate-50/20 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                            disabled ? 'bg-slate-200 text-slate-400' : 'bg-indigo-100 text-indigo-600'
                          }`}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base">{jockey.name}</h4>
                            <p className="text-xs text-slate-500">Giấy phép: {jockey.license} • Kinh nghiệm: {jockey.experience}</p>
                            {disabled && reason && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                {reason}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setDetailedJockey(jockey)}
                            className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => !disabled && selectJockeyItem(jockey)}
                            className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                              disabled
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            {disabled ? 'Không khả dụng' : 'Chọn'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- HORSE DETAILED WINDOW (ONLY VIEW) --- */}
        {detailedHorse && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Hồ Sơ Ngựa</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{detailedHorse.name}</h3>
                </div>
                <button
                  onClick={() => setDetailedHorse(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  ✕
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Giống ngựa', value: detailedHorse.breed },
                  { label: 'Tuổi', value: `${detailedHorse.age} tuổi` },
                  { label: 'Trạng thái', value: detailedHorse.status === 'active' || detailedHorse.status === 'Active' ? 'Đang hoạt động' : 'Nghỉ ngơi / Chấn thương', color: 'text-green-600 font-bold' }
                ].map((s, idx) => (
                  <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{s.label}</span>
                    <strong className={`text-slate-800 text-sm ${s.color || ''}`}>{s.value}</strong>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setDetailedHorse(null)}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* --- JOCKEY DETAILED WINDOW (ONLY VIEW) --- */}
        {detailedJockey && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Hồ Sơ Jockey</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{detailedJockey.name}</h3>
                </div>
                <button
                  onClick={() => setDetailedJockey(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  ✕
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Mã giấy phép', value: detailedJockey.license },
                  { label: 'Kinh nghiệm', value: detailedJockey.experience }
                ].map((s, idx) => (
                  <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{s.label}</span>
                    <strong className="text-slate-800 text-sm font-extrabold">{s.value}</strong>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl text-center mb-8">
                <span className="text-xs font-black text-indigo-500 uppercase tracking-wider block">Tổng số trận thắng sự nghiệp</span>
                <strong className="text-4xl text-emerald-600 font-black block mt-1">{detailedJockey.wins} trận</strong>
              </div>

              <button
                type="button"
                onClick={() => setDetailedJockey(null)}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
        {/* Success Modal */}
        <SuccessModal
          isOpen={successMessage.show}
          title={successMessage.title}
          message={successMessage.msg}
          type={successMessage.type || 'success'}
          onClose={() => setSuccessMessage({ show: false, title: '', msg: '', type: 'success' })}
        />
      </div>
    </HorseOwnerLayout>
  );
};

export default TournamentsRaces;
