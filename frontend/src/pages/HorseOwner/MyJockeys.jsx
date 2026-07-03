import React, { useState, useEffect } from 'react';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';
import api from '../../api/axios';
import SuccessModal from '../../components/SuccessModal';
import ConfirmModal from '../../components/ConfirmModal';

const MyJockeys = () => {
  // --- STATE ---
  const [jockeys, setJockeys] = useState([]);
  const [availableJockeys, setAvailableJockeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'active', 'pending'
  const [searchTerm, setSearchTerm] = useState('');
  const [detailedJockey, setDetailedJockey] = useState(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hiringLoading, setHiringLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, name: '' });
  const [successModal, setSuccessModal] = useState({ show: false, title: '', message: '' });

  // --- API CALLS ---
  const fetchMyJockeys = () => {
    setLoading(true);
    api.get('/contracts/owner')
      .then(res => {
        if (res.data?.success) {
          setJockeys(res.data.data ?? []);
        }
      })
      .catch(err => console.error('Error fetching contracts:', err))
      .finally(() => setLoading(false));
  };

  const fetchAvailableJockeys = () => {
    api.get('/jockeys')
      .then(res => {
        if (res.data?.success) {
          // Filter out jockeys who already have active/pending contracts
          const existingJockeyIds = jockeys
            .filter(j => j.contractStatus === 'active' || j.contractStatus === 'pending')
            .map(j => j.jockey_id);
          
          const filtered = (res.data.data ?? []).filter(j => !existingJockeyIds.includes(j.id));
          setAvailableJockeys(filtered);
        }
      })
      .catch(err => console.error('Error fetching available jockeys:', err));
  };

  useEffect(() => {
    fetchMyJockeys();
  }, []);

  useEffect(() => {
    if (showHireModal) {
      fetchAvailableJockeys();
    }
  }, [showHireModal, jockeys]);

  // --- HANDLERS ---
  const handleTerminateContract = (id, name) => {
    setConfirmModal({ show: true, id, name });
  };

  const executeTerminateContract = () => {
    const { id, name } = confirmModal;
    api.delete(`/contracts/${id}`)
      .then(res => {
        if (res.data?.success) {
          setSuccessModal({
            show: true,
            title: 'Chấm dứt hợp đồng thành công!',
            message: `Đã kết thúc hợp đồng với jockey ${name}.`,
            type: 'success'
          });
          fetchMyJockeys();
        }
      })
      .catch(err => {
        setSuccessModal({
          show: true,
          title: 'Lỗi chấm dứt hợp đồng',
          message: err.response?.data?.message || 'Có lỗi xảy ra khi chấm dứt hợp đồng.',
          type: 'error'
        });
      });
  };

  const handleHireSubmit = (jockeyId, name) => {
    setHiringLoading(true);
    api.post('/contracts', { jockey_id: jockeyId })
      .then(res => {
        if (res.data?.success) {
          setSuccessModal({
            show: true,
            title: 'Gửi đề xuất thành công!',
            message: `Đã gửi đề xuất hợp đồng thành công đến jockey ${name}!`,
            type: 'success'
          });
          setShowHireModal(false);
          fetchMyJockeys();
        }
      })
      .catch(err => {
        setSuccessModal({
          show: true,
          title: 'Lỗi gửi đề xuất',
          message: err.response?.data?.message || 'Có lỗi xảy ra khi đề xuất hợp đồng.',
          type: 'error'
        });
      })
      .finally(() => setHiringLoading(false));
  };

  // --- FILTERED LIST ---
  const filteredJockeys = jockeys.filter(j => {
    const matchesFilter = filterStatus === 'All' || j.contractStatus === filterStatus;
    const matchesSearch = j.name.toLowerCase().includes(searchTerm.toLowerCase()) || j.license.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Jockey Của Tôi</h1>
            <p className="text-slate-500 mt-2">Quản lý đội ngũ jockey đã ký hợp đồng dài hạn hoặc đang trong giao kèo chờ duyệt.</p>
          </div>
          <button
            onClick={() => setShowHireModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/10 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Ký hợp đồng jockey mới
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {[
              ['All', 'Tất cả'],
              ['active', 'Đã ký hợp đồng'],
              ['pending', 'Đang chờ duyệt'],
              ['terminated', 'Đã chấm dứt'],
              ['rejected', 'Đã từ chối']
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterStatus(val)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  filterStatus === val
                    ? 'bg-slate-950 text-white shadow-md'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm jockey..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Jockeys Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium">Đang tải danh sách jockey...</div>
        ) : filteredJockeys.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-medium">Không tìm thấy jockey nào phù hợp.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJockeys.map(jockey => (
              <div
                key={jockey.id}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-lg">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      jockey.contractStatus === 'active'
                        ? 'bg-green-50 text-green-600 border border-green-100'
                        : jockey.contractStatus === 'pending'
                        ? 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {jockey.contractStatus === 'active' ? 'Đã ký hợp đồng' : jockey.contractStatus === 'pending' ? 'Chờ phản hồi' : jockey.contractStatus === 'rejected' ? 'Bị từ chối' : 'Đã kết thúc'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{jockey.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Giấy phép: {jockey.license} • Exp: {jockey.experience}</p>

                  <div className="mt-5 pb-5 border-b border-slate-100">
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trận thắng sự nghiệp</span>
                      <strong className="text-lg text-emerald-600 font-extrabold block mt-0.5">{jockey.wins}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setDetailedJockey(jockey)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
                  >
                    Xem hồ sơ
                  </button>
                  {jockey.contractStatus === 'active' && (
                    <button
                      onClick={() => handleTerminateContract(jockey.id, jockey.name)}
                      className="flex-1 py-2.5 bg-red-50 hover:bg-red-100/80 text-red-600 font-bold text-xs rounded-xl transition"
                    >
                      Hủy hợp đồng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- DETAILED JOCKEY VIEW (ONLY VIEW) --- */}
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

        {/* --- HIRE JOCKEY MODAL --- */}
        {showHireModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-100 max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-150">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Chiêu Mộ Jockey Tự Do</h3>
                  <p className="text-slate-500 text-xs mt-1">Gửi lời mời hợp tác đến các jockey tự do trên hệ thống.</p>
                </div>
                <button
                  onClick={() => setShowHireModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-4 pr-2">
                {availableJockeys.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium">Không còn jockey tự do nào khả dụng.</div>
                ) : (
                  availableJockeys.map(j => (
                    <div
                      key={j.id}
                      className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base">{j.name}</h4>
                          <p className="text-xs text-slate-500">Exp: {j.experience_years} năm • Giấy phép: {j.license_number}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleHireSubmit(j.id, j.name)}
                        disabled={hiringLoading}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
                      >
                        Mời ký hợp đồng
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Confirm Terminate Modal */}
        <ConfirmModal
          isOpen={confirmModal.show}
          title="Xác nhận kết thúc hợp đồng"
          message={`Bạn có chắc chắn muốn kết thúc hợp đồng với jockey ${confirmModal.name}? Hành động này không thể hoàn tác.`}
          confirmText="Chấm dứt"
          cancelText="Bỏ qua"
          type="danger"
          onClose={() => setConfirmModal({ show: false, id: null, name: '' })}
          onConfirm={executeTerminateContract}
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={successModal.show}
          title={successModal.title}
          message={successModal.message}
          type={successModal.type || 'success'}
          onClose={() => setSuccessModal({ show: false, title: '', message: '', type: 'success' })}
        />
      </div>
    </HorseOwnerLayout>
  );
};

export default MyJockeys;
