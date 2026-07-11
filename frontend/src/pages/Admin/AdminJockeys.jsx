import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

function JockeyModal({ jockey, onClose, onSaved }) {
  const isEdit = !!jockey?.id;
  const [form, setForm] = useState(isEdit
    ? { name: jockey.name ?? '', email: jockey.email ?? '', experience_years: jockey.experience_years ?? '', license_number: jockey.license_number ?? '' }
    : { name: '', email: '', password: '', experience_years: '', license_number: '' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (isEdit) await api.put(`/admin/jockeys/${jockey.id}`, { experience_years: +form.experience_years, license_number: form.license_number });
      else        await api.post('/admin/jockeys', { ...form, experience_years: +form.experience_years });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})[0]?.[0] || 'Lỗi không xác định.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/5 px-7 py-5">
          <h2 className="text-lg font-black text-white">{isEdit ? '✏️ Sửa thông tin nài ngựa' : '🤠 Thêm nài ngựa mới'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}
          {!isEdit && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Họ tên *</label>
                <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Email *</label>
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Mật khẩu *</label>
                <input type="password" required value={form.password} onChange={e => set('password', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500" />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Kinh nghiệm (năm)</label>
            <input type="number" min="0" value={form.experience_years} onChange={e => set('experience_years', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Số giấy phép</label>
            <input type="text" value={form.license_number} onChange={e => set('license_number', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 placeholder:text-slate-600"
              placeholder="JL-2024-001" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50">
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm nài ngựa'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminJockeys() {
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/admin/jockeys');
      setJockeys(res.data?.data ?? res.data ?? []);
    } catch (e) { setError(e.response?.data?.message || 'Không thể tải danh sách nài ngựa.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (j) => {
    if (!window.confirm(`Xóa nài ngựa "${j.name}"?`)) return;
    setDeleting(j.id);
    try {
      await api.delete(`/admin/jockeys/${j.id}`);
      showToast(`Đã xóa nài ngựa "${j.name}"`);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Không thể xóa.'); }
    finally { setDeleting(null); }
  };

  const displayed = jockeys.filter(j => !search ||
    j.name?.toLowerCase().includes(search.toLowerCase()) ||
    j.license_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị</p>
          <h2 className="text-3xl font-black tracking-tight text-white">Quản lý Nài ngựa</h2>
          <p className="text-sm text-slate-400 mt-1">{jockeys.length} nài ngựa trong hệ thống</p>
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5">
          ＋ Thêm nài ngựa
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input type="text" placeholder="Tìm theo tên, số giấy phép..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-2xl text-sm text-slate-200 outline-none focus:border-emerald-400 placeholder:text-slate-500 transition" />
        </div>
        <button onClick={load} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition">🔄 Làm mới</button>
      </div>

      {toast && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">✅ {toast}</div>}
      {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm">
            <thead className="bg-slate-950/70 border-b border-white/5">
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {['ID', 'Họ tên', 'Email', 'Giấy phép', 'Kinh nghiệm', 'Số lần thắng', 'Tổng race', 'Thao tác'].map(h => (
                  <th key={h} className="px-4 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 rounded-xl bg-white/8 animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : displayed.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                  <p className="text-4xl mb-2">🤠</p><p className="text-sm">Không có nài ngựa nào.</p>
                </td></tr>
              ) : displayed.map(j => (
                <tr key={j.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-4 text-slate-500 font-mono text-xs">#{j.id}</td>
                  <td className="px-4 py-4 font-semibold text-white">{j.name}</td>
                  <td className="px-4 py-4 text-slate-400 text-xs">{j.email ?? '—'}</td>
                  <td className="px-4 py-4 text-amber-400 font-mono text-xs">{j.license_number ?? '—'}</td>
                  <td className="px-4 py-4 text-slate-300">{j.experience_years ?? 0} năm</td>
                  <td className="px-4 py-4 text-emerald-400 font-bold">{j.wins ?? 0}</td>
                  <td className="px-4 py-4 text-slate-400">{j.total_races ?? 0}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal(j)}
                        className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[11px] font-bold text-sky-400 hover:bg-sky-500/20 transition">✏️ Sửa</button>
                      <button onClick={() => handleDelete(j)} disabled={deleting === j.id}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-bold text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-40">
                        {deleting === j.id ? '...' : '🗑️ Xóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <div className="border-t border-white/5 px-5 py-3 text-xs text-slate-500">Tổng: {displayed.length} nài ngựa</div>}
      </div>

      {modal && (
        <JockeyModal
          jockey={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); showToast(modal === 'create' ? 'Đã thêm nài ngựa!' : 'Đã cập nhật!'); load(); }}
        />
      )}
    </div>
  );
}
