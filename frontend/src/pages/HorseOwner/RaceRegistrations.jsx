import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';
import api from '../../api/axios';
import SuccessModal from '../../components/SuccessModal';
import ConfirmModal from '../../components/ConfirmModal';


// Helper: a label + value row inside the detail panel
const DetailRow = ({ label, value, highlight }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">{label}</span>
    <span className={`text-sm font-semibold text-right ${highlight ? 'text-indigo-600' : 'text-slate-700'}`}>{value}</span>
  </div>
);

const RaceRegistrations = () => {

  // --- STATE ---
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, raceName: '', horseName: '' });
  const [successModal, setSuccessModal] = useState({ show: false, title: '', message: '' });

  // --- API CALLS ---
  const fetchRegistrations = () => {
    setLoading(true);
    api.get('/registrations/owner')
      .then(res => {
        if (res.data?.success) {
          setRegistrations(res.data.data ?? []);
        }
      })
      .catch(err => console.error('Error fetching registrations:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // --- HANDLERS ---
  const handleCancelRegistration = (id, raceName, horseName) => {
    setConfirmModal({ show: true, id, raceName, horseName });
  };

  const executeCancelRegistration = () => {
    const { id, raceName, horseName } = confirmModal;
    api.delete(`/registrations/${id}`)
      .then(res => {
        if (res.data?.success) {
          setSuccessModal({
            show: true,
            title: 'Hủy đăng ký thành công!',
            message: `Đã hủy đơn đăng ký của ngựa ${horseName} tại chặng đua ${raceName}.`,
            type: 'success'
          });
          // Also close detail panel if it was the cancelled reg
          if (selectedReg?.id === id) setSelectedReg(null);
          fetchRegistrations();
        }
      })
      .catch(err => {
        setSuccessModal({
          show: true,
          title: 'Hủy đăng ký thất bại',
          message: err.response?.data?.message || 'Có lỗi xảy ra khi hủy đăng ký.',
          type: 'error'
        });
      });
  };

  const statusLabel = (status) => {
    if (status === 'confirmed') return { text: 'Đã duyệt', cls: 'bg-green-50 text-green-600 border border-green-100' };
    if (status === 'rejected')  return { text: 'Từ chối',  cls: 'bg-red-50 text-red-600 border border-red-100' };
    if (status === 'withdrawn') return { text: 'Đã hủy',   cls: 'bg-slate-100 text-slate-500' };
    return { text: 'Chờ duyệt', cls: 'bg-yellow-50 text-yellow-600 border border-yellow-100' };
  };

  return (
    <HorseOwnerLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Đăng Ký Đua Ngựa</h1>
            <p className="text-slate-500 mt-2">Theo dõi và quản lý các yêu cầu đăng ký tham gia thi đấu của đội ngựa của bạn.</p>
          </div>
          <Link
            to="/horse-owner/tournaments-races"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/10 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Đăng ký giải đấu mới
          </Link>
        </div>

        {/* Registrations List */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium">Đang tải danh sách đăng ký...</div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-semibold text-lg">Chưa có đăng ký thi đấu nào.</p>
            <p className="text-sm mt-1 text-slate-500">Nhấn nút bên trên để chọn một giải đấu và tiến hành đăng ký.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100">
                    {['Ngựa', 'Jockey', 'Vòng đua', 'Giải đấu', 'Thời gian', 'Làn đua', 'Trạng thái', 'Hành động'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((reg) => {
                    const { text: stText, cls: stCls } = statusLabel(reg.status);
                    const isSelected = selectedReg?.id === reg.id;
                    return (
                      <tr
                        key={reg.id}
                        onClick={() => setSelectedReg(isSelected ? null : reg)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50/40'
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-slate-900">{reg.horse_name}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm">{reg.jockey_name ?? '—'}</td>
                        <td className="px-6 py-4 text-slate-700 font-medium">{reg.race_name}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{reg.tournament_name}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">
                          {reg.race_date ? new Date(reg.race_date).toLocaleString('vi-VN') : '—'}
                        </td>
                        <td className="px-6 py-4">
                          {reg.lane ? (
                            <span className="font-bold text-indigo-600">Làn {reg.lane}</span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Chưa xếp làn</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${stCls}`}>
                            {stText}
                          </span>
                        </td>
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          {reg.status === 'pending' ? (
                            <button
                              onClick={() => handleCancelRegistration(reg.id, reg.race_name, reg.horse_name)}
                              className="bg-red-50 hover:bg-red-100/80 text-red-600 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                            >
                              Hủy đăng ký
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Không thể hủy</span>
                          )}
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
        {/* Backdrop */}
        {selectedReg && (
          <div
            className="fixed inset-0 bg-slate-900/20 z-40"
            onClick={() => setSelectedReg(null)}
          />
        )}
        {/* Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
            selectedReg ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedReg && (() => {
            const { text: stText, cls: stCls } = statusLabel(selectedReg.status);
            return (
              <>
                {/* Panel Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Chi Tiết Đăng Ký</h2>
                    <p className="text-xs text-slate-400 mt-0.5">#{selectedReg.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedReg(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                  {/* Status badge */}
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${stCls}`}>{stText}</span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                    <DetailRow icon="horse" label="Ngựa" value={selectedReg.horse_name} />
                    <DetailRow icon="jockey" label="Jockey" value={selectedReg.jockey_name ?? '—'} />
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                    <DetailRow icon="race" label="Vòng đua" value={selectedReg.race_name} />
                    <DetailRow icon="tournament" label="Giải đấu" value={selectedReg.tournament_name} />
                    <DetailRow
                      icon="time"
                      label="Thời gian đua"
                      value={selectedReg.race_date ? new Date(selectedReg.race_date).toLocaleString('vi-VN') : '—'}
                    />
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5">
                    <DetailRow
                      icon="lane"
                      label="Làn đua"
                      value={selectedReg.lane ? `Làn ${selectedReg.lane}` : 'Chưa được xếp làn'}
                      highlight={!!selectedReg.lane}
                    />
                  </div>
                </div>

                {/* Panel Footer */}
                {selectedReg.status === 'pending' && (
                  <div className="px-6 py-5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        handleCancelRegistration(selectedReg.id, selectedReg.race_name, selectedReg.horse_name);
                        setSelectedReg(null);
                      }}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition"
                    >
                      Hủy đăng ký này
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
        
        {/* Confirm Cancel Modal */}
        <ConfirmModal
          isOpen={confirmModal.show}
          title="Xác nhận hủy đăng ký"
          message={`Bạn có chắc chắn muốn hủy đăng ký thi đấu của ngựa ${confirmModal.horseName} tại vòng ${confirmModal.raceName}?`}
          confirmText="Hủy đăng ký"
          cancelText="Bỏ qua"
          type="danger"
          onClose={() => setConfirmModal({ show: false, id: null, raceName: '', horseName: '' })}
          onConfirm={executeCancelRegistration}
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

export default RaceRegistrations;
