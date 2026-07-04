import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import api from '../api/axios';

// Admin tab components
import AdminUsers         from './Admin/AdminUsers';
import AdminRegistrations from './Admin/AdminRegistrations';
import AdminResultEntry   from './Admin/AdminResultEntry';
import AdminLeaderboard   from './Admin/AdminLeaderboard';

/* ═══════════════════════════════════════════════════════════
   MOCK DATA — dùng khi API chưa sẵn sàng
═══════════════════════════════════════════════════════════ */
const MOCK_STATS = {
    total_tournaments:     6,
    total_horses:          24,
    total_jockeys:         12,
    total_bets:            87,
    total_users:           142,
    active_races:          3,
    completed_races:       14,
    pending_registrations: 5,
    user_growth_percent:   18.5,
};

const MOCK_ACTIVITY = [
    { icon: '💸', color: 'amber',   badge: 'Cược mới',       description: 'Nguyễn Văn An đặt cược 500,000 VNĐ vào Golden Cup 2026',     time_ago: '2 phút trước'  },
    { icon: '👤', color: 'emerald', badge: 'Thành viên mới', description: 'Trần Thị Bình đăng ký tài khoản với vai trò Khán giả',        time_ago: '8 phút trước'  },
    { icon: '📋', color: 'blue',    badge: 'pending',         description: 'Ngựa "Thunder King" đăng ký tham gia Golden Cup 2026',       time_ago: '15 phút trước' },
    { icon: '💸', color: 'amber',   badge: 'Cược mới',       description: 'Lê Văn Cường đặt cược 1,200,000 VNĐ vào Spring Tournament',  time_ago: '22 phút trước' },
    { icon: '👤', color: 'emerald', badge: 'Thành viên mới', description: 'Phạm Thị Dung đăng ký tài khoản với vai trò Chủ ngựa',       time_ago: '35 phút trước' },
    { icon: '📋', color: 'blue',    badge: 'confirmed',       description: 'Ngựa "Storm Runner" đăng ký tham gia Spring Tournament',    time_ago: '1 giờ trước'   },
];

/* ═══════════════════════════════════════════════════════════
   KPI CARD
═══════════════════════════════════════════════════════════ */
const KPI_COLORS = {
    emerald: { border: 'border-emerald-500/40', from: 'from-emerald-500/20', to: 'to-emerald-500/5', glow: 'bg-emerald-400', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
    amber:   { border: 'border-amber-500/40',   from: 'from-amber-500/20',   to: 'to-amber-500/5',   glow: 'bg-amber-400',   text: 'text-amber-400',   ring: 'ring-amber-500/30'   },
    sky:     { border: 'border-sky-500/40',     from: 'from-sky-500/20',     to: 'to-sky-500/5',     glow: 'bg-sky-400',     text: 'text-sky-400',     ring: 'ring-sky-500/30'     },
    violet:  { border: 'border-violet-500/40',  from: 'from-violet-500/20',  to: 'to-violet-500/5',  glow: 'bg-violet-400',  text: 'text-violet-400',  ring: 'ring-violet-500/30'  },
    rose:    { border: 'border-rose-500/40',    from: 'from-rose-500/20',    to: 'to-rose-500/5',    glow: 'bg-rose-400',    text: 'text-rose-400',    ring: 'ring-rose-500/30'    },
    teal:    { border: 'border-teal-500/40',    from: 'from-teal-500/20',    to: 'to-teal-500/5',    glow: 'bg-teal-400',    text: 'text-teal-400',    ring: 'ring-teal-500/30'    },
};

const KpiCard = ({ icon, label, value, sub, color = 'emerald', loading }) => {
    const c = KPI_COLORS[color] ?? KPI_COLORS.emerald;
    return (
        <div className={`group relative overflow-hidden rounded-3xl border ${c.border} bg-gradient-to-br ${c.from} ${c.to} p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-1 ${c.ring}`}>
            <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${c.glow} opacity-10 blur-3xl transition-all duration-500 group-hover:opacity-20`} />
            <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 text-2xl shadow-inner">{icon}</div>
                {sub !== undefined && !loading && (
                    <span className={`mt-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold ${sub >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {sub >= 0 ? '▲' : '▼'} {Math.abs(sub)}%
                    </span>
                )}
            </div>
            <p className="mt-4 text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
            {loading ? (
                <div className="mt-2 h-9 w-24 animate-pulse rounded-xl bg-white/10" />
            ) : (
                <p className="mt-1 text-4xl font-black tracking-tight text-white">{value}</p>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   ACTIVITY BADGE
═══════════════════════════════════════════════════════════ */
const BADGE_COLORS = {
    amber:   'bg-amber-500/15   text-amber-300   border-amber-500/30',
    blue:    'bg-sky-500/15     text-sky-300     border-sky-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    rose:    'bg-rose-500/15    text-rose-300    border-rose-500/30',
};

const ActivityBadge = ({ color, text }) => (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_COLORS[color] ?? BADGE_COLORS.emerald}`}>
        {text}
    </span>
);

/* ═══════════════════════════════════════════════════════════
   ADMIN OVERVIEW TAB
═══════════════════════════════════════════════════════════ */
const AdminOverview = ({ onNavigate }) => {
    const [stats,        setStats]        = useState(null);
    const [activity,     setActivity]     = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingFeed,  setLoadingFeed]  = useState(true);
    const [usingMock,    setUsingMock]    = useState(false);

    const loadData = useCallback(async () => {
        setLoadingStats(true);
        setLoadingFeed(true);

        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
            setUsingMock(false);
        } catch {
            setStats(MOCK_STATS);
            setUsingMock(true);
        } finally {
            setLoadingStats(false);
        }

        try {
            const res = await api.get('/admin/recent-activity');
            setActivity(res.data?.length ? res.data : MOCK_ACTIVITY);
        } catch {
            setActivity(MOCK_ACTIVITY);
        } finally {
            setLoadingFeed(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const kpiCards = [
        { icon: '🏆', label: 'Tổng giải đấu',               value: stats?.total_tournaments      ?? '—', color: 'emerald' },
        { icon: '🐴', label: 'Ngựa đua',                     value: stats?.total_horses           ?? '—', color: 'amber'   },
        { icon: '🤠', label: 'Nài ngựa (Jockey)',            value: stats?.total_jockeys          ?? '—', color: 'sky'     },
        { icon: '💸', label: 'Dự đoán / Cược',               value: stats?.total_bets             ?? '—', color: 'violet'  },
        { icon: '👥', label: 'Người dùng',                   value: stats?.total_users            ?? '—', sub: stats?.user_growth_percent, color: 'teal' },
        { icon: '🚦', label: 'Cuộc đua đang / sắp diễn ra', value: stats?.active_races           ?? '—', color: 'rose'    },
        { icon: '✅', label: 'Cuộc đua hoàn thành',          value: stats?.completed_races        ?? '—', color: 'emerald' },
        { icon: '⏳', label: 'Đăng ký chờ duyệt',            value: stats?.pending_registrations  ?? '—', color: 'amber'   },
    ];

    const pending = stats?.pending_registrations ?? 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị hệ thống</p>
                    <h2 className="text-3xl font-black tracking-tight text-white">Tổng quan</h2>
                    <p className="mt-1 text-sm text-slate-400">Số liệu hoạt động theo thời gian thực · Điều khiển nhanh</p>
                </div>
                <div className="flex items-center gap-3">
                    {usingMock && (
                        <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400">
                            ⚠️ Dữ liệu mẫu — API chưa kết nối
                        </span>
                    )}
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2 text-xs text-slate-400">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        Live
                    </div>
                    <button onClick={loadData} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
                        🔄 Làm mới
                    </button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((card, i) => <KpiCard key={i} {...card} loading={loadingStats} />)}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                {/* Activity Feed */}
                <div className="xl:col-span-2 flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                        <div>
                            <h3 className="text-base font-bold text-white">Hoạt động gần đây</h3>
                            <p className="mt-0.5 text-xs text-slate-500">Các sự kiện mới nhất trên hệ thống</p>
                        </div>
                        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">● Live</span>
                    </div>
                    {loadingFeed ? (
                        <div className="space-y-4 p-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex animate-pulse items-center gap-4">
                                    <div className="h-11 w-11 shrink-0 rounded-2xl bg-white/8" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-3/4 rounded-full bg-white/8" />
                                        <div className="h-2.5 w-1/3 rounded-full bg-white/5" />
                                    </div>
                                    <div className="h-5 w-20 shrink-0 rounded-full bg-white/8" />
                                </div>
                            ))}
                        </div>
                    ) : activity.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center py-20 text-slate-600">
                            <span className="mb-3 text-5xl">📭</span>
                            <p className="text-sm">Chưa có hoạt động nào.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] max-h-[480px]">
                            {activity.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 px-6 py-4 transition-colors duration-150 hover:bg-white/[0.03]">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">{item.icon}</div>
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 text-sm leading-snug text-slate-200">{item.description}</p>
                                        <p className="mt-1 text-xs text-slate-500">{item.time_ago}</p>
                                    </div>
                                    <ActivityBadge color={item.color} text={item.badge} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-4">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">Thao tác nhanh</h3>
                        <p className="mb-5 mt-1 text-xs text-slate-500">Phím tắt chức năng quản trị</p>
                        <div className="flex flex-col gap-2.5">
                            <button
                                onClick={() => onNavigate('tournaments')}
                                className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5"
                            >
                                <span className="text-base">🏗️</span> Tạo giải đấu mới
                            </button>
                            <button
                                onClick={() => onNavigate('results')}
                                className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                            >
                                <span className="text-base">🏁</span> Nhập kết quả cuộc đua
                            </button>
                            <button
                                onClick={() => onNavigate('leaderboard')}
                                className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                            >
                                <span className="text-base">🥇</span> Xem bảng xếp hạng
                            </button>
                            <button
                                onClick={() => onNavigate('users')}
                                className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                            >
                                <span className="text-base">👥</span> Quản lý người dùng
                            </button>
                            <button
                                onClick={() => onNavigate('registrations')}
                                className="group relative flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                            >
                                <span className="text-base">⏳</span>
                                Duyệt đăng ký chờ
                                {pending > 0 && (
                                    <span className="ml-auto flex h-5 w-5 shrink-0 animate-bounce items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                                        {pending}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-300">Trạng thái hệ thống</h3>
                        <div className="space-y-3.5">
                            {[
                                { label: 'API Backend',     ok: !usingMock, status: usingMock ? 'Ngoại tuyến' : 'Hoạt động' },
                                { label: 'Cơ sở dữ liệu',  ok: !usingMock, status: usingMock ? 'Ngoại tuyến' : 'Hoạt động' },
                                { label: 'Đặt cược online', ok: true,       status: 'Đang bật' },
                                { label: 'Chế độ bảo trì',  ok: false,      status: 'Tắt'      },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">{s.label}</span>
                                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${s.ok ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${s.ok ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                        {s.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   ADMIN TOURNAMENTS TAB — CRUD đầy đủ
═══════════════════════════════════════════════════════════ */
const EMPTY_FORM = { name: '', location: '', start_date: '', end_date: '', description: '', prize_pool: '' };

const TournamentModal = ({ tournament, onClose, onSaved }) => {
    const isEdit = !!tournament?.id;
    const [form, setForm]     = useState(isEdit ? {
        name:        tournament.name        ?? '',
        location:    tournament.location    ?? '',
        start_date:  tournament.start_date  ? tournament.start_date.slice(0,10) : '',
        end_date:    tournament.end_date    ? tournament.end_date.slice(0,10)   : '',
        description: tournament.description ?? '',
        prize_pool:  tournament.prize_pool  ?? '',
    } : { ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(form.start_date) > new Date(form.end_date)) {
            setError('Ngày kết thúc phải sau ngày bắt đầu.'); return;
        }
        setSaving(true); setError('');
        try {
            if (isEdit) {
                await api.put(`/tournaments/${tournament.id}`, form);
            } else {
                await api.post('/tournaments', form);
            }
            onSaved();
        } catch (err) {
            const msg = err.response?.data?.message
                || Object.values(err.response?.data?.errors || {})[0]?.[0]
                || 'Lỗi không xác định.';
            setError(msg);
        } finally { setSaving(false); }
    };

    const field = (label, name, type = 'text', required = true) => (
        <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">{label}{required && ' *'}</label>
            <input
                type={type} value={form[name]} required={required}
                onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors placeholder:text-slate-600"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-white/5 px-7 py-5">
                    <div>
                        <h2 className="text-lg font-black text-white">{isEdit ? '✏️ Chỉnh sửa giải đấu' : '🏗️ Tạo giải đấu mới'}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{isEdit ? `ID: ${tournament.id}` : 'Điền đầy đủ thông tin bên dưới'}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white text-xl transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-7 space-y-4">
                    {error && (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>
                    )}
                    {field('Tên giải đấu', 'name')}
                    {field('Địa điểm', 'location')}
                    <div className="grid grid-cols-2 gap-4">
                        {field('Ngày bắt đầu', 'start_date', 'date')}
                        {field('Ngày kết thúc', 'end_date', 'date')}
                    </div>
                    {field('Tổng giải thưởng (VNĐ)', 'prize_pool', 'number', false)}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Mô tả</label>
                        <textarea
                            value={form.description} rows={3}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors placeholder:text-slate-600 resize-none"
                            placeholder="Mô tả ngắn về giải đấu (tuỳ chọn)"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={saving}
                            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-slate-950 shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50">
                            {saving ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Tạo giải đấu')}
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10">
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminTournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [modal, setModal]             = useState(null); // null | 'create' | tournament obj
    const [deleting, setDeleting]       = useState(null);
    const [toast, setToast]             = useState('');

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

    const load = () => {
        setLoading(true);
        api.get('/tournaments')
            .then(r => setTournaments(r.data?.data ?? r.data ?? []))
            .catch(() => setError('Không thể tải danh sách giải đấu.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (t) => {
        if (!window.confirm(`Xóa giải đấu "${t.name}"? Hành động này không thể hoàn tác.`)) return;
        setDeleting(t.id);
        try {
            await api.delete(`/tournaments/${t.id}`);
            showToast(`Đã xóa giải đấu "${t.name}"`);
            load();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa giải đấu.');
        } finally { setDeleting(null); }
    };

    const getStatus = (start, end) => {
        const now = Date.now();
        const s = new Date(start), e = new Date(end);
        if (now < s) return { label: 'Sắp diễn ra', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
        if (now > e) return { label: 'Hoàn thành',  cls: 'bg-slate-800 text-slate-400 border-slate-700' };
        return { label: 'Đang diễn ra', cls: 'bg-sky-500/20 text-sky-400 border-sky-500/30' };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị</p>
                    <h2 className="text-3xl font-black tracking-tight text-white">Giải đấu</h2>
                    <p className="text-sm text-slate-400 mt-1">{tournaments.length} giải đấu trong hệ thống</p>
                </div>
                <button
                    onClick={() => setModal('create')}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition-all hover:-translate-y-0.5"
                >
                    ＋ Tạo giải đấu mới
                </button>
            </div>

            {toast && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    ✅ {toast}
                </div>
            )}

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1,2,3].map(i => <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/5" />)}
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>
            ) : tournaments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-slate-500">
                    <p className="text-4xl mb-3">🏆</p>
                    <p className="text-sm">Chưa có giải đấu nào. Tạo giải đấu đầu tiên!</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tournaments.map(t => {
                        const st = getStatus(t.start_date, t.end_date);
                        return (
                            <div key={t.id} className="group rounded-2xl border border-white/10 bg-slate-950/60 p-5 hover:border-emerald-500/30 transition-all">
                                <div className="flex items-start justify-between mb-3 gap-2">
                                    <p className="font-bold text-white text-sm leading-snug">{t.name}</p>
                                    <span className={`shrink-0 text-[11px] font-semibold rounded-full border px-2.5 py-0.5 ${st.cls}`}>{st.label}</span>
                                </div>
                                <div className="space-y-1 text-xs text-slate-400 mb-4">
                                    <p>📍 {t.location || '—'}</p>
                                    <p>📅 {new Date(t.start_date).toLocaleDateString('vi-VN')} → {new Date(t.end_date).toLocaleDateString('vi-VN')}</p>
                                    {t.prize_pool && (
                                        <p className="text-emerald-400 font-semibold">🏅 {Number(t.prize_pool).toLocaleString('vi-VN')} ₫</p>
                                    )}
                                    {t.description && (
                                        <p className="text-slate-500 line-clamp-2 mt-1">{t.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-white/5">
                                    <button
                                        onClick={() => setModal(t)}
                                        className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 py-2 text-xs font-semibold text-slate-300 transition-colors"
                                    >
                                        ✏️ Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(t)}
                                        disabled={deleting === t.id}
                                        className="flex-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 py-2 text-xs font-semibold text-rose-400 transition-colors disabled:opacity-40"
                                    >
                                        {deleting === t.id ? '...' : '🗑️ Xóa'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {modal && (
                <TournamentModal
                    tournament={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={() => { setModal(null); showToast(modal === 'create' ? 'Đã tạo giải đấu thành công!' : 'Đã cập nhật giải đấu!'); load(); }}
                />
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   ADMIN SETTINGS TAB (placeholder)
═══════════════════════════════════════════════════════════ */
const AdminSettings = () => (
    <div className="space-y-6">
        <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị</p>
            <h2 className="text-3xl font-black tracking-tight text-white">Cài đặt hệ thống</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-center text-slate-500">
            <span className="text-4xl">⚙️</span>
            <p className="mt-3 text-sm">Tính năng cài đặt đang phát triển.</p>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD (Admin Panel)
═══════════════════════════════════════════════════════════ */
const AdminPanel = () => {
    const [activeTab, setActiveTab]     = useState('overview');
    const [pendingCount, setPendingCount] = useState(0);

    // Lấy số lượng pending để hiển thị badge trên sidebar
    useEffect(() => {
        api.get('/admin/stats')
            .then(r => setPendingCount(r.data?.pending_registrations ?? 0))
            .catch(() => {});
    }, []);

    const renderTab = () => {
        switch (activeTab) {
            case 'overview':      return <AdminOverview onNavigate={setActiveTab} />;
            case 'tournaments':   return <AdminTournaments />;
            case 'registrations': return <AdminRegistrations />;
            case 'users':         return <AdminUsers />;
            case 'results':       return <AdminResultEntry />;
            case 'leaderboard':   return <AdminLeaderboard />;
            case 'settings':      return <AdminSettings />;
            default:              return <AdminOverview onNavigate={setActiveTab} />;
        }
    };

    return (
        <AdminLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            pendingCount={pendingCount}
        >
            {renderTab()}
        </AdminLayout>
    );
};

export default AdminPanel;
