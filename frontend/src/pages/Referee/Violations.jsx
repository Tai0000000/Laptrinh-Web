import React, { useState, useEffect } from 'react';
import RefereeLayout from '../../components/RefereeLayout';
import api from '../../api/axios';

const Violations = () => {
  const [selectedRace, setSelectedRace] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState('');
  const [violationType, setViolationType] = useState('');
  const [notes, setNotes] = useState('');

  // API data
  const [races, setRaces] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [violations, setViolations] = useState([]);

  // Loading states
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingViolations, setLoadingViolations] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Fetch races on mount (only active/ongoing)
  useEffect(() => {
    fetchRaces();
    fetchViolations();
  }, []);

  // When a race is selected, update registrations
  useEffect(() => {
    if (selectedRace) {
      const race = races.find(r => String(r.id) === String(selectedRace));
      setRegistrations(race?.registrations || []);
    } else {
      setRegistrations([]);
    }
    setSelectedRegistration('');
  }, [selectedRace, races]);

  const fetchRaces = async () => {
    try {
      setLoadingRaces(true);
      const response = await api.get('/referee/races');
      if (response.data.success) {
        // Filter only active/ongoing races for violation reporting
        const activeRaces = response.data.data.filter(
          r => r.status === 'active' || r.status === 'ongoing'
        );
        setRaces(activeRaces);
      }
    } catch (err) {
      showToast('Không thể tải danh sách cuộc đua.', 'error');
    } finally {
      setLoadingRaces(false);
    }
  };

  const fetchViolations = async () => {
    try {
      setLoadingViolations(true);
      const response = await api.get('/referee/violations');
      if (response.data.success !== false) {
        setViolations(response.data.data || response.data || []);
      }
    } catch (err) {
      showToast('Không thể tải danh sách vi phạm.', 'error');
    } finally {
      setLoadingViolations(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getViolationTypeLabel = (type) => {
    switch (type) {
      case 'false_start': return 'Xuất phát lỗi';
      case 'lane_deviation': return 'Lấn làn đường';
      case 'jockey_conduct': return 'Hành vi nài ngựa không chuẩn mực';
      case 'equipment_violation': return 'Thiết bị không đúng quy định';
      case 'disqualification': return 'Truất quyền thi đấu';
      default: return type;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/referee/violations', {
        race_id: parseInt(selectedRace),
        registration_id: parseInt(selectedRegistration),
        violation_type: violationType,
        notes: notes,
      });
      showToast('Ghi nhận vi phạm thành công!', 'success');
      setSelectedRace('');
      setSelectedRegistration('');
      setViolationType('');
      setNotes('');
      // Refresh violations list
      fetchViolations();
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi khi ghi nhận vi phạm. Vui lòng thử lại.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      return isToday ? `Hôm nay, ${time}` : date.toLocaleDateString('vi-VN') + ', ' + time;
    } catch {
      return dateStr;
    }
  };

  return (
    <RefereeLayout>
      <div className="space-y-8">
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

        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
            Nhật ký Vi phạm
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Báo cáo các hành vi vi phạm quy tắc, đi sai làn đường hoặc hành vi không đúng mực của nài ngựa trong cuộc đua.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-6">
            <h2 className="text-lg font-bold text-white tracking-wide border-b border-slate-800 pb-3">Ghi nhận vi phạm mới</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chọn cuộc đua</label>
                <select
                  value={selectedRace}
                  onChange={(e) => setSelectedRace(e.target.value)}
                  required
                  disabled={loadingRaces}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
                >
                  <option value="">
                    {loadingRaces ? 'Đang tải cuộc đua...' : '-- Chọn cuộc đua đang hoạt động --'}
                  </option>
                  {races.map((race) => (
                    <option key={race.id} value={race.id}>
                      {race.name} {race.tournament ? `(${race.tournament.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ngựa & Nài ngựa</label>
                <select
                  value={selectedRegistration}
                  onChange={(e) => setSelectedRegistration(e.target.value)}
                  required
                  disabled={!selectedRace || registrations.length === 0}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
                >
                  <option value="">
                    {!selectedRace ? '-- Chọn cuộc đua trước --' : '-- Chọn Ngựa / Làn chạy --'}
                  </option>
                  {registrations.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      Làn {reg.lane || '?'}: {reg.horse?.name || 'N/A'} (Nài ngựa: {reg.jockey?.user?.name || reg.jockey?.name || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Loại vi phạm</label>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition"
                >
                  <option value="">-- Chọn loại vi phạm --</option>
                  <option value="false_start">Xuất phát lỗi (False Start)</option>
                  <option value="lane_deviation">Lấn làn đường (Lane Infraction)</option>
                  <option value="jockey_conduct">Hành vi nài ngựa không chuẩn mực</option>
                  <option value="equipment_violation">Thiết bị không đúng quy định</option>
                  <option value="disqualification">Truất quyền thi đấu (Disqualification)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mô tả sự cố</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Nhập thông tin chi tiết, mốc thời gian hoặc vị trí xảy ra sự việc..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition placeholder-slate-600 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all duration-300 shadow-md shadow-amber-500/10 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang gửi...</span>
                  </span>
                ) : (
                  'Ghi nhận vi phạm'
                )}
              </button>
            </form>
          </div>

          {/* List of Recent Violations */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-6">
            <h2 className="text-lg font-bold text-white tracking-wide border-b border-slate-800 pb-3">Các vi phạm đã ghi nhận</h2>

            {loadingViolations ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 mt-3 text-xs">Đang tải vi phạm...</p>
              </div>
            ) : violations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">Chưa có vi phạm nào được ghi nhận.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {violations.map((v) => (
                  <div key={v.id} className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl flex justify-between items-center hover:bg-slate-900/30 transition duration-300">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>
                        <h4 className="text-sm font-bold text-white">
                          {getViolationTypeLabel(v.violation_type || v.type)}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300">
                        {v.registration
                          ? `${v.registration.horse?.name || 'N/A'} (Nài ngựa: ${v.registration.jockey?.user?.name || v.registration.jockey?.name || 'N/A'})`
                          : v.target || 'N/A'
                        }
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {v.race?.name || v.race || 'Cuộc đua không xác định'} • {formatDate(v.created_at || v.date)}
                      </p>
                      {v.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-1">"{v.notes}"</p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                      {v.status === 'approved' || v.status === 'Đã duyệt'
                        ? 'Đã duyệt'
                        : v.status === 'pending'
                        ? 'Chờ duyệt'
                        : v.status === 'rejected'
                        ? 'Từ chối'
                        : v.status || 'Chờ duyệt'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RefereeLayout>
  );
};

export default Violations;
