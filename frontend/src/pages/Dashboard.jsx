import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import api from '../api/axios';

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
    { icon: '💸', color: 'amber',   badge: 'Cược mới',       description: 'Nguyễn Văn An đặt cược 500,000 VNĐ vào Golden Cup 2026',        time_ago: '2 phút trước'   },
    { icon: '👤', color: 'emerald', badge: 'Thành viên mới', description: 'Trần Thị Bình đăng ký tài khoản với vai trò Khán giả',             time_ago: '8 phút trước'   },
    { icon: '📋', color: 'blue',    badge: 'pending',         description: 'Ngựa "Thunder King" đăng ký tham gia Golden Cup 2026',            time_ago: '15 phút trước'  },
    { icon: '💸', color: 'amber',   badge: 'Cược mới',       description: 'Lê Văn Cường đặt cược 1,200,000 VNĐ vào Spring Tournament',       time_ago: '22 phút trước'  },
    { icon: '👤', color: 'emerald', badge: 'Thành viên mới', description: 'Phạm Thị Dung đăng ký tài khoản với vai trò Chủ ngựa',            time_ago: '35 phút trước'  },
    { icon: '📋', color: 'blue',    badge: 'confirmed',       description: 'Ngựa "Storm Runner" đăng ký tham gia Spring Tournament 2026',     time_ago: '1 giờ trước'    },
    { icon: '💸', color: 'amber',   badge: 'Cược mới',       description: 'Hoàng Văn Em đặt cược 300,000 VNĐ vào cuộc đua buổi sáng',        time_ago: '1 giờ 20 phút'  },
    { icon: '👤', color: 'emerald', badge: 'Thành viên mới', description: 'Vũ Thị Giang đăng ký tài khoản với vai trò Nài ngựa',             time_ago: '2 giờ trước'    },
    { icon: '📋', color: 'blue',    badge: 'pending',         description: 'Ngựa "Golden Flash" đăng ký tham gia Golden Cup 2026',            time_ago: '2 giờ 45 phút'  },
    { icon: '💸', color: 'amber',   badge: 'Cược mới',       description: 'Đỗ Văn Hải đặt cược 750,000 VNĐ vào cuộc đua chiều',             time_ago: '3 giờ trước'    },
    { icon: '👤', color: 'emerald', badge: 'Thành viên mới', description: 'Ngô Thị Hoa đăng ký tài khoản với vai trò Trọng tài',             time_ago: '4 giờ trước'    },
    { icon: '📋', color: 'blue',    badge: 'rejected',        description: 'Ngựa "Dark Shadow" đăng ký tham gia Spring Tournament 2026',     time_ago: '5 giờ trước'    },
];

/* ═══════════════════════════════════════════════════════════
   KPI CARD COMPONENT
═══════════════════════════════════════════════════════════ */
const KPI_COLORS = {
    emerald: {
        border:  'border-emerald-500/40',
        from:    'from-emerald-500/20',
        to:      'to-emerald-500/5',
        glow:    'bg-emerald-400',
        text:    'text-emerald-400',
        ring:    'ring-emerald-500/30',
    },
    amber: {
        border:  'border-amber-500/40',
        from:    'from-amber-500/20',
        to:      'to-amber-500/5',
        glow:    'bg-amber-400',
        text:    'text-amber-400',
        ring:    'ring-amber-500/30',
    },
    sky: {
        border:  'border-sky-500/40',
        from:    'from-sky-500/20',
        to:      'to-sky-500/5',
        glow:    'bg-sky-400',
        text:    'text-sky-400',
        ring:    'ring-sky-500/30',
    },
    violet: {
        border:  'border-violet-500/40',
        from:    'from-violet-500/20',
        to:      'to-violet-500/5',
        glow:    'bg-violet-400',
        text:    'text-violet-400',
        ring:    'ring-violet-500/30',
    },
    rose: {
        border:  'border-rose-500/40',
        from:    'from-rose-500/20',
        to:      'to-rose-500/5',
        glow:    'bg-rose-400',
        text:    'text-rose-400',
        ring:    'ring-rose-500/30',
    },
    teal: {
        border:  'border-teal-500/40',
        from:    'from-teal-500/20',
        to:      'to-teal-500/5',
        glow:    'bg-teal-400',
        text:    'text-teal-400',
        ring:    'ring-teal-500/30',
    },
};

const KpiCard = ({ icon, label, value, sub, color = 'emerald', loading }) => {
    const c = KPI_COLORS[color] ?? KPI_COLORS.emerald;
    return (
        <div
            className={`group relative overflow-hidden rounded-3xl border ${c.border}
                        bg-gradient-to-br ${c.from} ${c.to}
                        p-6 backdrop-blur-xl
                        transition-all duration-300
                        hover:-translate-y-1 hover:shadow-2xl hover:ring-1 ${c.ring}`}
        >
            {/* Animated glow orb */}
            <div
                className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32
                            rounded-full ${c.glow} opacity-10 blur-3xl
                            transition-all duration-500 group-hover:opacity-20`}
            />

            {/* Header row */}
            <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 text-2xl shadow-inner">
                    {icon}
                </div>
                {sub !== undefined && !loading && (
                    <span
                        className={`mt-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold
                                    ${sub >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                        {sub >= 0 ? '▲' : '▼'} {Math.abs(sub)}%
                    </span>
                )}
            </div>

            {/* Label */}
            <p className="mt-4 text-xs font-medium tracking-wide text-slate-400 uppercase">
                {label}
            </p>

            {/* Value */}
            {loading ? (
                <div className="mt-2 h-9 w-24 animate-pulse rounded-xl bg-white/10" />
            ) : (
                <p className={`mt-1 text-4xl font-black tracking-tight text-white`}>
                    {value}
                </p>
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
    <span
        className={`inline-flex shrink-0 items-center rounded-full border
                    px-2.5 py-0.5 text-[11px] font-semibold
                    ${BADGE_COLORS[color] ?? BADGE_COLORS.emerald}`}
    >
        {text}
    </span>
);

/* ═══════════════════════════════════════════════════════════
   ADMIN OVERVIEW TAB
═══════════════════════════════════════════════════════════ */
const AdminOverview = () => {
    const [stats,         setStats]         = useState(null);
    const [activity,      setActivity]      = useState([]);
    const [loadingStats,  setLoadingStats]  = useState(true);
    const [loadingFeed,   setLoadingFeed]   = useState(true);
    const [usingMock,     setUsingMock]     = useState(false);

    const loadData = useCallback(async () => {
        setLoadingStats(true);
        setLoadingFeed(true);

        // ── Stats ──
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

        // ── Activity feed ──
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

    /* KPI definitions */
    const kpiCards = [
        { icon: '🏆', label: 'Tổng giải đấu',              value: stats?.total_tournaments       ?? '—', color: 'emerald' },
        { icon: '🐴', label: 'Ngựa đua',                    value: stats?.total_horses            ?? '—', color: 'amber'   },
        { icon: '🤠', label: 'Nài ngựa (Jockey)',           value: stats?.total_jockeys           ?? '—', color: 'sky'     },
        { icon: '💸', label: 'Dự đoán / Cược',              value: stats?.total_bets              ?? '—', color: 'violet'  },
        { icon: '👥', label: 'Người dùng',                  value: stats?.total_users             ?? '—', sub: stats?.user_growth_percent, color: 'teal' },
        { icon: '🚦', label: 'Cuộc đua đang / sắp diễn ra', value: stats?.active_races           ?? '—', color: 'rose'    },
        { icon: '✅', label: 'Cuộc đua hoàn thành',         value: stats?.completed_races        ?? '—', color: 'emerald' },
        { icon: '⏳', label: 'Đăng ký chờ duyệt',           value: stats?.pending_registrations  ?? '—', color: 'amber'   },
    ];

    const pending = stats?.pending_registrations ?? 0;

    return (
        <div className="space-y-8">

            {/* ── Page header ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">
                        Quản trị hệ thống
                    </p>
                    <h2 className="text-3xl font-black tracking-tight text-white">
                        Tổng quan
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Số liệu hoạt động theo thời gian thực · Điều khiển nhanh
                    </p>
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
                    <button
                        onClick={loadData}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                        🔄 Làm mới
                    </button>
                </div>
            </div>

            {/* ── KPI Grid (4 cols) ── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((card, i) => (
                    <KpiCard key={i} {...card} loading={loadingStats} />
                ))}
            </div>

            {/* ── Bottom row ── */}
            <div className="grid gap-6 xl:grid-cols-3">

                {/* ─ Activity Feed (2/3) ─ */}
                <div className="xl:col-span-2 flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur-xl">

                    {/* Feed header */}
                    <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                        <div>
                            <h3 className="text-base font-bold text-white">Hoạt động gần đây</h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Các sự kiện mới nhất trên hệ thống
                            </p>
                        </div>
                        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                            ● Live
                        </span>
                    </div>

                    {/* Feed body */}
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
                                <div
                                    key={idx}
                                    className="flex items-start gap-4 px-6 py-4 transition-colors duration-150 hover:bg-white/[0.03]"
                                >
                                    {/* Icon */}
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
                                        {item.icon}
                                    </div>

                                    {/* Text */}
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 text-sm leading-snug text-slate-200">
                                            {item.description}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {item.time_ago}
                                        </p>
                                    </div>

                                    {/* Badge */}
                                    <ActivityBadge color={item.color} text={item.badge} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─ Right column (1/3) ─ */}
                <div className="flex flex-col gap-4">

                    {/* Quick Actions */}
                    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">
                            Thao tác nhanh
                        </h3>
                        <p className="mb-5 mt-1 text-xs text-slate-500">
                            Phím tắt chức năng quản trị
                        </p>

                        <div className="flex flex-col gap-2.5">
                            {/* Primary CTA */}
                            <button className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-emerald-500/30">
                                <span className="text-base transition-transform group-hover:scale-110">🏗️</span>
                                Tạo giải đấu mới
                            </button>

                            <button className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10">
                                <span className="text-base transition-transform group-hover:scale-110">🚦</span>
                                Cấu hình cuộc đua
                            </button>

                            <button className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10">
                                <span className="text-base transition-transform group-hover:scale-110">👮</span>
                                Phân công trọng tài
                            </button>

                            <button className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10">
                                <span className="text-base transition-transform group-hover:scale-110">📊</span>
                                Báo cáo giải đấu
                            </button>

                            {/* Pending badge button */}
                            <button className="group relative flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10">
                                <span className="text-base transition-transform group-hover:scale-110">⏳</span>
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
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-300">
                            Trạng thái hệ thống
                        </h3>
                        <div className="space-y-3.5">
                            {[
                                { label: 'API Backend',      ok: !usingMock, status: usingMock ? 'Ngoại tuyến' : 'Hoạt động' },
                                { label: 'Cơ sở dữ liệu',   ok: !usingMock, status: usingMock ? 'Ngoại tuyến' : 'Hoạt động' },
                                { label: 'Đặt cược online',  ok: true,        status: 'Đang bật'   },
                                { label: 'Chế độ bảo trì',   ok: false,       status: 'Tắt'        },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">{s.label}</span>
                                    <span
                                        className={`flex items-center gap-1.5 text-xs font-semibold
                                                    ${s.ok ? 'text-emerald-400' : 'text-slate-500'}`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full
                                                        ${s.ok ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}
                                        />
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
   ADMIN TOURNAMENTS TAB
═══════════════════════════════════════════════════════════ */
const getTournamentStatus = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (today < start) {
        return {
            key: 'scheduled',
            label: 'Sắp diễn ra',
            cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        };
    } else if (today > end) {
        return {
            key: 'completed',
            label: 'Hoàn thành',
            cls: 'bg-slate-800 text-slate-400 border-slate-700'
        };
    } else {
        return {
            key: 'ongoing',
            label: 'Đang diễn ra',
            cls: 'bg-sky-500/20 text-sky-400 border-sky-500/30'
        };
    }
};

const AdminTournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [currentTournament, setCurrentTournament] = useState(null); // null = create, object = edit
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        location: ''
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchTournaments = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/tournaments');
            setTournaments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch tournaments', err);
            setError(err.response?.data?.message || 'Không thể tải danh sách giải đấu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    const openCreateModal = () => {
        setCurrentTournament(null);
        setFormData({
            name: '',
            start_date: '',
            end_date: '',
            location: ''
        });
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (t) => {
        setCurrentTournament(t);
        // Format dates to YYYY-MM-DD for HTML5 date input
        const formatDateForInput = (dStr) => {
            if (!dStr) return '';
            const date = new Date(dStr);
            if (isNaN(date.getTime())) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        setFormData({
            name: t.name || '',
            start_date: formatDateForInput(t.start_date),
            end_date: formatDateForInput(t.end_date),
            location: t.location || ''
        });
        setFormError('');
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa giải đấu "${name}"? Tất cả thông tin cuộc đua liên quan sẽ bị xóa. Thao tác này không thể khôi phục.`)) {
            return;
        }
        try {
            await api.delete(`/tournaments/${id}`);
            fetchTournaments();
        } catch (err) {
            console.error('Failed to delete tournament', err);
            alert(err.response?.data?.message || 'Không thể xóa giải đấu.');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);

        if (!formData.name.trim() || !formData.start_date || !formData.end_date || !formData.location.trim()) {
            setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
            setSubmitting(false);
            return;
        }

        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setFormError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
            setSubmitting(false);
            return;
        }

        try {
            if (currentTournament) {
                await api.put(`/tournaments/${currentTournament.id}`, formData);
            } else {
                await api.post('/tournaments', formData);
            }
            setShowModal(false);
            fetchTournaments();
        } catch (err) {
            console.error('Failed to save tournament', err);
            setFormError(err.response?.data?.message || 'Lỗi khi lưu thông tin giải đấu.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTournaments = tournaments.filter(t => {
        const statusObj = getTournamentStatus(t.start_date, t.end_date);
        if (filterStatus !== 'all' && statusObj.key !== filterStatus) {
            return false;
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return (t.name?.toLowerCase().includes(query) || t.location?.toLowerCase().includes(query));
        }
        return true;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white">Quản lý Giải đấu</h2>
                    <p className="text-sm text-slate-400">Thêm, sửa, xóa và theo dõi tiến trình các giải đua ngựa.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="self-start rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30"
                >
                    + Thêm giải đấu
                </button>
            </div>

            {/* Controls Row: Search & Filter Tabs */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur-xl">
                {/* Search bar */}
                <div className="relative w-full md:w-80">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc địa điểm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-2xl text-sm text-slate-200 outline-none transition focus:border-emerald-400"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                    {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'scheduled', label: 'Sắp diễn ra' },
                        { id: 'ongoing', label: 'Đang diễn ra' },
                        { id: 'completed', label: 'Hoàn thành' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                                filterStatus === tab.id
                                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List/Table content */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-28 w-full animate-pulse rounded-3xl bg-white/5 border border-white/5" />
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-400">
                    <p className="font-semibold">{error}</p>
                    <button
                        onClick={fetchTournaments}
                        className="mt-3 rounded-2xl border border-rose-500/20 bg-rose-500/20 px-4 py-2 text-xs font-bold transition hover:bg-rose-500/30"
                    >
                        🔄 Thử lại
                    </button>
                </div>
            ) : filteredTournaments.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-12 text-center text-slate-500">
                    <span className="mb-3 block text-4xl">🏆</span>
                    <p className="text-sm font-medium">Không tìm thấy giải đấu nào.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/20">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-slate-950/50 text-xs font-bold uppercase tracking-wide text-slate-400">
                                <th className="px-6 py-4">Tên giải đấu</th>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4">Địa điểm</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04] text-slate-200">
                            {filteredTournaments.map((t) => {
                                const statusObj = getTournamentStatus(t.start_date, t.end_date);
                                return (
                                    <tr key={t.id} className="transition-colors duration-150 hover:bg-white/[0.02]">
                                        <td className="px-6 py-5 font-bold text-white">{t.name}</td>
                                        <td className="px-6 py-5 text-slate-300">
                                            {formatDate(t.start_date)} – {formatDate(t.end_date)}
                                        </td>
                                        <td className="px-6 py-5 text-slate-400">{t.location}</td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusObj.cls}`}>
                                                {statusObj.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right space-x-2">
                                            <button
                                                onClick={() => openEditModal(t)}
                                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                                            >
                                                ✏️ Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id, t.name)}
                                                className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20"
                                            >
                                                🗑️ Xóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CREATE / EDIT MODAL OVERLAY */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl md:p-8 animate-scale-up">
                        {/* Modal Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                {currentTournament ? '✏️ Sửa giải đấu' : '🏗️ Tạo giải đấu mới'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="h-8 w-8 rounded-full bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSave} className="space-y-4">
                            {formError && (
                                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-medium text-rose-400">
                                    ⚠️ {formError}
                                </div>
                            )}

                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Tên giải đấu <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ví dụ: Golden Cup 2026"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Ngày bắt đầu <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Ngày kết thúc <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Địa điểm tổ chức <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ví dụ: Đại Nam, Bình Dương"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-emerald-400"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {submitting ? 'Đang lưu...' : 'Lưu lại'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   ADMIN USERS TAB
═══════════════════════════════════════════════════════════ */
const AdminUsers = () => {
    const users = [
        { name: 'Nguyen Van An',   email: 'an.owner@horse.vn',     role: 'Chủ ngựa',   roleColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30'   },
        { name: 'Tran Thi Binh',   email: 'binh.owner@horse.vn',   role: 'Chủ ngựa',   roleColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30'   },
        { name: 'Le Van Cuong',    email: 'cuong.jockey@horse.vn', role: 'Nài ngựa',   roleColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30'         },
        { name: 'Pham Thi Dung',   email: 'dung.jockey@horse.vn',  role: 'Nài ngựa',   roleColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30'         },
        { name: 'Hoang Van Em',    email: 'em.referee@horse.vn',   role: 'Trọng tài',  roleColor: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
        { name: 'Vu Thi Giang',    email: 'giang.spec@horse.vn',   role: 'Khán giả',   roleColor: 'bg-slate-700 text-slate-300 border-slate-600'         },
    ];
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-white">Danh sách người dùng</h2>
                <p className="text-sm text-slate-400">Xem và thay đổi quyền tài khoản trên hệ thống.</p>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/30">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/10 bg-slate-900/60 text-xs font-bold uppercase tracking-wide text-slate-400">
                            <th className="px-6 py-4">Tên</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Vai trò</th>
                            <th className="px-6 py-4">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] text-slate-200">
                        {users.map((u, i) => (
                            <tr key={i} className="transition-colors duration-150 hover:bg-white/[0.03]">
                                <td className="px-6 py-4 font-semibold">{u.name}</td>
                                <td className="px-6 py-4 text-slate-400">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${u.roleColor}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-xs font-bold text-emerald-400 transition hover:text-emerald-300">
                                        Chi tiết →
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   ADMIN SETTINGS TAB
═══════════════════════════════════════════════════════════ */
const AdminSettings = () => (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-black text-white">Cài đặt hệ thống</h2>
            <p className="text-sm text-slate-400">Cấu hình các thông số và tính năng quản lý cốt lõi.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 space-y-6">
            <div className="flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-bold text-white">Phí hoa hồng cược (%)</h3>
                    <p className="text-xs text-slate-500">Tỷ lệ hoa hồng trích từ mỗi lượt đặt cược.</p>
                </div>
                <input type="number" defaultValue={10}
                    className="w-24 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-center font-bold text-emerald-400 outline-none focus:border-emerald-400" />
            </div>
            <div className="flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-bold text-white">Trạng thái đặt cược trực tuyến</h3>
                    <p className="text-xs text-slate-500">Cho phép hoặc chặn khán giả đặt cược vào cuộc đua.</p>
                </div>
                <span className="self-start rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-400">
                    Đang hoạt động
                </span>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-bold text-white">Live Stream cuộc đua</h3>
                    <p className="text-xs text-slate-500">Bật luồng phát trực tiếp cho các cuộc đua.</p>
                </div>
                <button className="self-start rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold transition hover:bg-slate-700">
                    Kích hoạt
                </button>
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════
   ROLE DASHBOARDS (non-admin)
═══════════════════════════════════════════════════════════ */
const HorseOwnerDashboard = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Quản lý Ngựa đua</h2>
        <p className="text-sm text-slate-600">Điều phối ngựa đua, thuê nài ngựa và đăng ký các giải đấu sắp tới.</p>
        <div className="grid gap-4 pt-2 sm:grid-cols-2">
            {[
                { icon: '🐴', title: 'Quản lý Ngựa',   desc: 'Đăng ký ngựa mới và cập nhật thông tin chuồng trại.' },
                { icon: '🏆', title: 'Đăng ký Giải',    desc: 'Ghi danh ngựa vào Spring Tournament hoặc Golden Cup.' },
                { icon: '🤠', title: 'Thuê Nài ngựa',   desc: 'Gửi lời mời hợp tác tới các nài ngựa đang hoạt động.' },
                { icon: '💰', title: 'Theo dõi Doanh thu', desc: 'Xem thưởng giải đấu và xếp hạng bảng điểm.' },
            ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-slate-900">{c.icon} {c.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{c.desc}</p>
                </div>
            ))}
        </div>
    </div>
);

const JockeyDashboard = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Trung tâm Nài ngựa</h2>
        <p className="text-sm text-slate-600">Xem lời mời tham gia đua, lịch thi đấu và thành tích cá nhân.</p>
        <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">✉️ Lời mời chờ xử lý</h3>
                <p className="mt-1 text-xs text-slate-500">Chấp nhận hoặc từ chối đề xuất đua từ chủ ngựa.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">📅 Lịch thi đấu</h3>
                <p className="mt-1 text-xs text-slate-500">Kiểm tra ngày, giờ và địa điểm các cuộc đua.</p>
            </div>
        </div>
    </div>
);

const RefereeDashboard = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Cổng Trọng tài</h2>
        <p className="text-sm text-slate-600">Xác nhận thông tin ngựa/nài, nhập thời gian kết thúc chính thức và ghi nhật ký sự cố.</p>
        <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">📝 Ghi kết quả đua</h3>
                <p className="mt-1 text-xs text-slate-500">Nhập xếp hạng, thời gian chạy và ghi chú chính thức.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">🚦 Điều khiển trạng thái</h3>
                <p className="mt-1 text-xs text-slate-500">Đánh dấu cuộc đua đang diễn ra, hoàn thành hoặc hủy bỏ.</p>
            </div>
        </div>
    </div>
);

const SpectatorDashboard = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Cổng Khán giả</h2>
        <p className="text-sm text-slate-600">Xem đua trực tiếp, kiểm tra bảng giải đấu và đặt dự đoán cho các cuộc thi sắp tới.</p>
        <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">💸 Dự đoán &amp; Đặt cược</h3>
                <p className="mt-1 text-xs text-slate-500">Đặt cược vào cặp ngựa &amp; nài ngựa yêu thích của bạn.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">📊 Bảng xếp hạng Live</h3>
                <p className="mt-1 text-xs text-slate-500">Xem thứ hạng mùa giải hiện tại và bảng điểm.</p>
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
═══════════════════════════════════════════════════════════ */
const Dashboard = () => {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-10 text-slate-600">
                Vui lòng đăng nhập để xem dashboard.
            </div>
        );
    }

    const role = user.role?.value ?? user.role;

    if (role === 'admin') {
        return (
            <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
                {activeTab === 'overview'    && <AdminOverview />}
                {activeTab === 'tournaments' && <AdminTournaments />}
                {activeTab === 'users'       && <AdminUsers />}
                {activeTab === 'settings'    && <AdminSettings />}
            </AdminLayout>
        );
    }

    const renderRole = () => {
        switch (role) {
            case 'horse_owner':  return <HorseOwnerDashboard />;
            case 'jockey':       return <JockeyDashboard />;
            case 'race_referee': return <RefereeDashboard />;
            case 'spectator':    return <SpectatorDashboard />;
            default:             return <div className="text-rose-600 font-medium">Vai trò tài khoản không hợp lệ.</div>;
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur-xl">
                <h1 className="mb-2 text-3xl font-black text-slate-900">Dashboard</h1>
                <p className="mb-6 text-slate-600">
                    Xin chào, <strong className="text-slate-950">{user.name}</strong>! Bạn đang đăng nhập với vai trò{' '}
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 capitalize">
                        {role?.replace('_', ' ')}
                    </span>
                </p>
                <hr className="my-6 border-slate-200" />
                {renderRole()}
            </div>
        </div>
    );
};

export default Dashboard;
