import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import api from '../api/axios';
import PredictionHistory from '../components/PredictionHistory';

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

    useEffect(() => {
        api.get('/user')
            .then(res => setUser(res.data))
            .catch(() => setError('Không thể tải thông tin người dùng.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="mx-auto max-w-4xl px-4 py-10 text-slate-600">Đang tải...</div>;
    if (error) return <div className="mx-auto max-w-4xl px-4 py-10 text-slate-600">{error}</div>;
    if (!user) return <div className="mx-auto max-w-4xl px-4 py-10 text-slate-600">Vui lòng đăng nhập trước.</div>;

    const renderRoleDashboard = () => {
        switch (user.role) {
            case 'horse_owner':
                return <HorseOwnerDashboard />;
            case 'jockey':
                return <JockeyDashboard />;
            case 'referee':
                return <RefereeDashboard />;
            case 'spectator':
                return <SpectatorDashboard />;
            case 'admin':
                return <AdminDashboard />;
            default:
                return <div>Vai trò không hợp lệ.</div>;
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur-xl">
                <h1 className="mb-4 text-2xl font-black text-slate-900">Bảng điều khiển</h1>
                <p className="mb-6 text-slate-600">Chào mừng, {user.name} ({user.role})</p>
                <hr className="my-6 border-slate-200" />
                {renderRoleDashboard()}
            </div>
            
            {renderRoleDashboard()}
        </div>
    );
};

// Các sub-component cho các vai trò khác nhau (thường nằm ở các file riêng biệt)
const HorseOwnerDashboard = () => (
    <div>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Quản lý Chủ ngựa</h2>
        <ul className="list-disc pl-5 space-y-2">
            <li>Quản lý ngựa</li>
            <li>Đăng ký giải đấu</li>
            <li>Thuê nài ngựa (Jockey)</li>
            <li>Xác nhận tham gia</li>
        </ul>
    </div>
);

const JockeyDashboard = () => (
    <div>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Bảng điều khiển Nài ngựa</h2>
        <ul className="list-disc pl-5 space-y-2">
            <li>Xem lời mời</li>
            <li>Lịch đua</li>
            <li>Thống kê thành tích</li>
        </ul>
    </div>
);

const RefereeDashboard = () => (
    <div>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Bảng điều khiển Trọng tài</h2>
        <ul className="list-disc pl-5 space-y-2">
            <li>Xác minh ngựa/nài ngựa</li>
            <li>Ghi nhận kết quả cuộc đua</li>
            <li>Gửi báo cáo sự cố</li>
        </ul>
    </div>
);

const SpectatorDashboard = () => (
    <div>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Giao diện Khán giả</h2>
        <ul className="list-disc pl-5 space-y-2">
            <li>Theo dõi cuộc đua trực tiếp</li>
            <li>Bảng xếp hạng giải đấu</li>
            <li>Dự đoán & Đặt cược</li>
        </ul>
    </div>
);

const AdminDashboard = () => (
    <div>
        <h2 className="mb-3 text-xl font-semibold text-slate-900">Quản trị hệ thống</h2>
        <ul className="list-disc pl-5 space-y-2">
            <li>Quản lý người dùng</li>
            <li>Thiết lập giải đấu</li>
            <li>Cấu hình hệ thống</li>
        </ul>
    </div>
);

export default Dashboard;
