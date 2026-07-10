import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RefereeLayout from '../../components/RefereeLayout';
import api from '../../api/axios';

const Monitor = () => {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);

  // Speed simulation state (visual only)
  const [speeds, setSpeeds] = useState({});
  const [progress, setProgress] = useState({});

  // Violations state
  const [violations, setViolations] = useState([]);
  const [loadingViolations, setLoadingViolations] = useState(false);

  // Log Violation Modal
  const [violationModal, setViolationModal] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [violationType, setViolationType] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingViolation, setSubmittingViolation] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchRace();
    fetchViolations();
  }, [raceId]);

  // Handle timer start/stop
  useEffect(() => {
    if (isStarted) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted]);

  // Initialize speeds/progress when race data is loaded
  useEffect(() => {
    if (!race) return;
    const initialSpeeds = {};
    const initialProgress = {};
    (race.registrations || []).forEach(reg => {
      initialSpeeds[reg.id] = 0;
      initialProgress[reg.id] = 0;
    });
    setSpeeds(initialSpeeds);
    setProgress(initialProgress);
  }, [race]);

  // Simulate progress/speeds when race is active and started
  useEffect(() => {
    if (!race || (race.status !== 'active' && race.status !== 'ongoing') || !isStarted) return;

    // Initialize speeds/progress
    const initialSpeeds = {};
    const initialProgress = {};
    (race.registrations || []).forEach(reg => {
      initialSpeeds[reg.id] = Math.floor(Math.random() * 15) + 45; // 45-60 km/h
      initialProgress[reg.id] = 0;
    });
    setSpeeds(initialSpeeds);
    setProgress(initialProgress);

    const simulationInterval = setInterval(() => {
      // Update speeds randomly
      setSpeeds(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          const delta = (Math.random() - 0.5) * 4; // change speed by -2 to +2
          next[id] = Math.max(40, Math.min(65, Math.round(next[id] + delta)));
        });
        return next;
      });

      // Update progress based on speed
      setProgress(prev => {
        const next = { ...prev };
        let finishedAll = true;
        Object.keys(next).forEach(id => {
          if (next[id] < 100) {
            // progress increments roughly by speed / 10 per tick
            const increment = (speeds[id] || 50) / 18; 
            next[id] = Math.min(100, parseFloat((next[id] + increment).toFixed(2)));
            finishedAll = false;
          }
        });
        return next;
      });
    }, 300);

    return () => clearInterval(simulationInterval);
  }, [race, speeds]);

  const fetchRace = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/referee/races/${raceId}`);
      if (response.data.success) {
        setRace(response.data.data);
      } else {
        setError('Không thể tải thông tin cuộc đua.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const fetchViolations = async () => {
    try {
      setLoadingViolations(true);
      const response = await api.get(`/referee/violations?race_id=${raceId}`);
      if (response.data.success !== false) {
        // filter client-side just in case backend query param didn't filter
        const list = response.data.data || response.data || [];
        const filtered = list.filter(v => String(v.race_id) === String(raceId));
        setViolations(filtered);
      }
    } catch (err) {
      console.error('Error fetching violations:', err);
    } finally {
      setLoadingViolations(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const formatTimer = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleOpenViolationModal = (reg) => {
    setSelectedReg(reg);
    setViolationType('lane_deviation');
    setNotes('');
    setViolationModal(true);
  };

  const handleLogViolation = async (e) => {
    e.preventDefault();
    if (!selectedReg) return;

    try {
      setSubmittingViolation(true);
      const response = await api.post('/referee/violations', {
        race_id: parseInt(raceId),
        registration_id: parseInt(selectedReg.id),
        violation_type: violationType,
        notes: notes,
      });

      if (response.data.success !== false) {
        showToast('Đã ghi nhận thẻ phạt vi phạm thành công!', 'success');
        setViolationModal(false);
        fetchViolations();
      } else {
        showToast('Ghi nhận vi phạm thất bại.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi ghi vi phạm.', 'error');
    } finally {
      setSubmittingViolation(false);
    }
  };

  const handleEndRace = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn kết thúc cuộc đua này để chuyển sang nhập kết quả xếp hạng?')) {
      return;
    }

    try {
      const response = await api.put(`/referee/races/${raceId}/status`, { status: 'finished' });
      if (response.data.success) {
        showToast('Đã kết thúc cuộc đua thành công!', 'success');
        // Redirect to result entry screen
        setTimeout(() => {
          navigate(`/referee/races/${raceId}/results`);
        }, 1000);
      } else {
        showToast('Có lỗi xảy ra khi kết thúc cuộc đua.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra khi kết thúc cuộc đua.', 'error');
    }
  };

  const getViolationTypeLabel = (type) => {
    switch (type) {
      case 'false_start': return 'Xuất phát lỗi';
      case 'lane_deviation': return 'Lấn làn đường';
      case 'jockey_conduct': return 'Hành vi nài ngựa';
      case 'equipment_violation': return 'Lỗi thiết bị';
      case 'disqualification': return 'Truất quyền thi đấu';
      default: return type;
    }
  };

  return (
    <RefereeLayout>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md border text-sm font-semibold transition-all duration-300 animate-slide-in ${
          toast.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link to="/referee/races" className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300">
              ← Quay lại danh sách cuộc đua
            </Link>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
              Giám sát Cuộc đua
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Giám sát tiến độ realtime, ghi nhận thẻ phạt vi phạm và tiến hành hoàn tất cuộc đua.
            </p>
          </div>

          {race && (race.status === 'active' || race.status === 'ongoing') && (
            isStarted ? (
              <button
                onClick={handleEndRace}
                className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-750 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-rose-500/15 active:scale-[0.98] flex items-center space-x-2 border border-rose-600/30"
              >
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping mr-1"></span>
                <span>Kết thúc cuộc đua</span>
              </button>
            ) : (
              <button
                onClick={() => setIsStarted(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-750 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-emerald-500/15 active:scale-[0.98] flex items-center space-x-2 border border-emerald-600/30 animate-pulse"
              >
                <span className="w-2.5 h-2.5 bg-white rounded-full mr-1"></span>
                <span>Bắt đầu cuộc đua (GO)</span>
              </button>
            )
          )}
        </div>

        {loading && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl py-20 text-center text-slate-400">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
            Đang tải thông tin cuộc đua...
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center">
            <p className="text-rose-300 font-semibold text-sm">{error}</p>
          </div>
        )}

        {!loading && race && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Middle: Live Track Simulation & Horse Lanes */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Simulation Header / Timer */}
              <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl flex justify-between items-center backdrop-blur-md">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                    {(race.status === 'active' || race.status === 'ongoing') ? 'Trực tiếp' : 'Trạng thái: ' + race.status}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{race.name}</h3>
                  <p className="text-slate-500 text-xs">Cự ly: {race.distance}m | {race.tournament?.name || 'Không xác định'}</p>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Thời gian trôi qua</span>
                  <span className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight block mt-0.5">
                    {formatTimer(elapsedTime)}
                  </span>
                </div>
              </div>

              {/* Weather & Track Condition */}
              <div className="bg-slate-900/30 border border-slate-850 p-5 rounded-2xl backdrop-blur-md">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Điều kiện môi trường</h4>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <span className="text-lg block">🌡️</span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-1">Nhiệt độ</span>
                    <span className="text-xs text-slate-200 font-bold mt-0.5 block">29°C</span>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <span className="text-lg block">💧</span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-1">Độ ẩm</span>
                    <span className="text-xs text-slate-200 font-bold mt-0.5 block">62%</span>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <span className="text-lg block">🌬️</span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-1">Sức gió</span>
                    <span className="text-xs text-slate-200 font-bold mt-0.5 block">10 km/h</span>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <span className="text-lg block">🛣️</span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-1">Mặt sân</span>
                    <span className="text-xs text-emerald-400 font-bold mt-0.5 block">Đạt chuẩn</span>
                  </div>
                </div>
              </div>

              {/* Lane Monitoring and Live Simulation */}
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <h3 className="text-md font-bold text-white">Giám sát các làn chạy</h3>
                  <span className="text-xs text-slate-500">Mô phỏng tốc độ & tiến độ</span>
                </div>

                <div className="space-y-6">
                  {(race.registrations || []).map((reg) => {
                    const currentSpeed = speeds[reg.id] || 0;
                    const currentProgress = progress[reg.id] || 0;
                    return (
                      <div key={reg.id} className="space-y-2 bg-slate-950/30 p-4 border border-slate-850 rounded-xl hover:border-slate-800/80 transition group">
                        
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold flex items-center justify-center">
                              {reg.lane}
                            </span>
                            <div>
                              <span 
                                onClick={() => handleOpenViolationModal(reg)}
                                className="text-slate-100 font-bold cursor-pointer hover:text-rose-400 hover:underline transition-colors"
                                title="Nhấp để ghi nhận vi phạm nhanh cho ngựa này"
                              >
                                {reg.horse?.name || 'N/A'}
                              </span>
                              <span className="text-slate-500 text-[11px] ml-2">({reg.jockey?.name || reg.jockey?.user?.name || 'Jockey N/A'})</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded text-[11px] border border-slate-800">
                              {currentSpeed} km/h
                            </span>
                            <button
                              onClick={() => handleOpenViolationModal(reg)}
                              className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1 rounded-lg font-bold transition"
                            >
                              Ghi vi phạm
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar (Visual representation of race progress) */}
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-slate-900 border border-slate-850">
                            <div
                              style={{ width: `${currentProgress}%` }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 rounded-full ${
                                currentProgress >= 100 
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/15' 
                                  : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                              }`}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                            <span>Xuất phát</span>
                            <span className="text-slate-400 font-bold">{currentProgress}%</span>
                            <span>Đích ({race.distance}m)</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {(!race.registrations || race.registrations.length === 0) && (
                    <p className="text-center text-slate-500 py-6 text-sm">Chưa có ngựa đăng ký tham gia cuộc đua này.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Right: Recorded Violations Live Log */}
            <div className="space-y-6">
              
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <h3 className="text-md font-bold text-white">Biên bản vi phạm</h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                    {violations.length} ĐÃ GHI
                  </span>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {loadingViolations ? (
                    <p className="text-center text-xs text-slate-500 py-10">Đang tải danh sách vi phạm...</p>
                  ) : violations.length === 0 ? (
                    <div className="text-center py-12 bg-slate-950/20 border border-dashed border-slate-850 rounded-xl">
                      <svg className="w-8 h-8 mx-auto text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-slate-500 font-medium">Chưa ghi nhận vi phạm nào</p>
                    </div>
                  ) : (
                    violations.map((v) => (
                      <div key={v.id} className="bg-rose-500/5 border border-rose-500/20 p-3.5 rounded-xl space-y-2">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <span className="font-bold text-rose-400">Làn {v.registration?.lane || '-'}: {v.registration?.horse?.name || 'Ngựa'}</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">{v.registration?.jockey?.name || 'Nài ngựa'}</p>
                          </div>
                          <span className="bg-rose-500/10 text-rose-400 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {getViolationTypeLabel(v.violation_type)}
                          </span>
                        </div>
                        {v.notes && (
                          <p className="text-slate-400 text-xs bg-slate-950/40 p-2 rounded border border-slate-900/60 leading-relaxed font-sans">
                            {v.notes}
                          </p>
                        )}
                        <div className="text-[9px] text-slate-500 font-mono text-right">
                          {new Date(v.created_at).toLocaleTimeString('vi-VN')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Log Violation Modal */}
      {violationModal && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Ghi nhận Thẻ phạt Vi phạm</h3>
                <p className="text-rose-400 font-bold text-xs mt-1">Làn {selectedReg.lane}: {selectedReg.horse?.name || 'N/A'}</p>
              </div>
              <button
                onClick={() => setViolationModal(false)}
                className="text-slate-500 hover:text-slate-300 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleLogViolation}>
              <div className="p-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Loại vi phạm</label>
                  <select
                    value={violationType}
                    onChange={(e) => setViolationType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition"
                    required
                  >
                    <option value="lane_deviation">Lấn làn đường (Lane Deviation)</option>
                    <option value="false_start">Xuất phát lỗi (False Start)</option>
                    <option value="jockey_conduct">Hành vi nài ngựa không đúng mực (Jockey Conduct)</option>
                    <option value="equipment_violation">Thiết bị không hợp lệ (Equipment Violation)</option>
                    <option value="disqualification">Truất quyền thi đấu (Disqualification)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chi tiết vi phạm</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    placeholder="Mô tả cụ thể hành vi vi phạm của ngựa/nài ngựa..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition placeholder-slate-655 resize-none"
                    required
                  ></textarea>
                </div>

              </div>

              <div className="p-6 bg-slate-950/40 border-t border-slate-800/80 flex space-x-3">
                <button
                  type="submit"
                  disabled={submittingViolation}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-rose-600/10 active:scale-[0.98] disabled:opacity-60"
                >
                  {submittingViolation ? 'Đang ghi nhận...' : 'Xác nhận Thẻ phạt'}
                </button>
                <button
                  type="button"
                  onClick={() => setViolationModal(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition"
                >
                  Hủy
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </RefereeLayout>
  );
};

export default Monitor;
