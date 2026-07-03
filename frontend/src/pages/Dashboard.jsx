import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import api from '../api/axios';

// Admin tab components
import AdminUsers         from './Admin/AdminUsers';
import AdminRegistrations from './Admin/AdminRegistrations';


const _DAYS   = Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0'));
const _MONTHS = [
    ['01','Tháng 1'],['02','Tháng 2'],['03','Tháng 3'],['04','Tháng 4'],
    ['05','Tháng 5'],['06','Tháng 6'],['07','Tháng 7'],['08','Tháng 8'],
    ['09','Tháng 9'],['10','Tháng 10'],['11','Tháng 11'],['12','Tháng 12'],
];
const _curYear = new Date().getFullYear();
const _YEARS   = Array.from({length: 5}, (_, i) => String(_curYear + i));
const _HOURS   = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));
const _MINS    = ['00', '15', '30', '45'];
const _selCls  = 'rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400 transition-colors cursor-pointer w-full';

function DatePicker({ label, value, onChange, required }) {
    const [iy = '', im = '', id_ = ''] = value ? value.split('-') : [];
    const [selY, setSelY] = useState(iy);
    const [selM, setSelM] = useState(im);
    const [selD, setSelD] = useState(id_);

    const emit = (y, m, d) => { if (y && m && d) onChange(y + '-' + m + '-' + d); };
    return (
        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
            </label>
            <div className="grid grid-cols-3 gap-2">
                <select className={_selCls} value={selD}
                    onChange={e => { setSelD(e.target.value); emit(selY, selM, e.target.value); }}>
                    <option value="">Ngày</option>
                    {_DAYS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <select className={_selCls} value={selM}
                    onChange={e => { setSelM(e.target.value); emit(selY, e.target.value, selD); }}>
                    <option value="">Tháng</option>
                    {_MONTHS.map(([v, lbl]) => <option key={v} value={v}>{lbl}</option>)}
                </select>
                <select className={_selCls} value={selY}
                    onChange={e => { setSelY(e.target.value); emit(e.target.value, selM, selD); }}>
                    <option value="">Năm</option>
                    {_YEARS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>
        </div>
    );
}

function DateTimePicker({ label, value, onChange, required }) {
    const [datePart = '', timePart = ''] = value ? value.split('T') : [];
    const [iy = '', im = '', id_ = ''] = datePart ? datePart.split('-') : [];
    const [ihh = '', imm = ''] = timePart ? timePart.split(':') : [];

    const [selY,   setSelY]   = useState(iy);
    const [selM,   setSelM]   = useState(im);
    const [selD,   setSelD]   = useState(id_);
    const [selH,   setSelH]   = useState(ihh);
    const [selMin, setSelMin] = useState(imm);

    const emit = (y, m, d, h, min) => {
        if (y && m && d && h && min) onChange(y + '-' + m + '-' + d + 'T' + h + ':' + min);
    };
    return (
        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
                <select className={_selCls} value={selD}
                    onChange={e => { setSelD(e.target.value); emit(selY, selM, e.target.value, selH, selMin); }}>
                    <option value="">Ngày</option>
                    {_DAYS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <select className={_selCls} value={selM}
                    onChange={e => { setSelM(e.target.value); emit(selY, e.target.value, selD, selH, selMin); }}>
                    <option value="">Tháng</option>
                    {_MONTHS.map(([v, lbl]) => <option key={v} value={v}>{lbl}</option>)}
                </select>
                <select className={_selCls} value={selY}
                    onChange={e => { setSelY(e.target.value); emit(e.target.value, selM, selD, selH, selMin); }}>
                    <option value="">Năm</option>
                    {_YEARS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <select className={_selCls} value={selH}
                    onChange={e => { setSelH(e.target.value); emit(selY, selM, selD, e.target.value, selMin); }}>
                    <option value="">Giờ</option>
                    {_HOURS.map(v => <option key={v} value={v}>{v}:00</option>)}
                </select>
                <select className={_selCls} value={selMin}
                    onChange={e => { setSelMin(e.target.value); emit(selY, selM, selD, selH, e.target.value); }}>
                    <option value="">Phút</option>
                    {_MINS.map(v => <option key={v} value={v}>:{v}</option>)}
                </select>
            </div>
        </div>
    );
}
import AdminResultEntry   from './Admin/AdminResultEntry';
import AdminLeaderboard   from './Admin/AdminLeaderboard';


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
   ADMIN TOURNAMENTS TAB — Tạo / Sửa giải đấu + Thêm cuộc đua
═══════════════════════════════════════════════════════════ */
const EMPTY_TOURNAMENT = { name: '', start_date: '', end_date: '', location: '' };
const EMPTY_RACE       = { name: '', round: '', race_time: '', distance: '', max_horses: 8 };

const AdminTournaments = () => {
    const [tournaments, setTournaments]     = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState('');

    // Tournament form modal
    const [tModal, setTModal]   = useState(false);   // open/close
    const [tEdit, setTEdit]     = useState(null);    // null = create, object = edit
    const [tForm, setTForm]     = useState(EMPTY_TOURNAMENT);
    const [tSaving, setTSaving] = useState(false);
    const [tErr, setTErr]       = useState('');

    // Race form modal
    const [rModal, setRModal]     = useState(false);
    const [rParent, setRParent]   = useState(null);  // tournament for new race
    const [rForm, setRForm]       = useState(EMPTY_RACE);
    const [rSaving, setRSaving]   = useState(false);
    const [rErr, setRErr]         = useState('');

    // Detail expand
    const [expanded, setExpanded] = useState(null);

    // ── loaders ───────────────────────────────────────────────────────────
    const load = () => {
        setLoading(true);
        api.get('/tournaments')
            .then(r => setTournaments(r.data ?? []))
            .catch(() => setError('Không thể tải danh sách giải đấu.'))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    // ── helpers ───────────────────────────────────────────────────────────
    const statusBadge = (start, end) => {
        const today = new Date(); today.setHours(0,0,0,0);
        const s = new Date(start); const e = new Date(end);
        if (today < s) return { label: 'Sắp diễn ra', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
        if (today > e) return { label: 'Hoàn thành',  cls: 'bg-slate-800 text-slate-400 border-slate-700' };
        return          { label: 'Đang diễn ra', cls: 'bg-sky-500/20 text-sky-400 border-sky-500/30' };
    };

    const raceStatusBadge = (s) => {
        const m = { scheduled: ['Sắp đua','bg-emerald-500/15 text-emerald-400'], ongoing: ['Đang đua','bg-amber-500/15 text-amber-400'], completed: ['Xong','bg-slate-700 text-slate-400'], cancelled: ['Hủy','bg-rose-500/15 text-rose-400'] };
        const [label, cls] = m[s] ?? ['—','text-slate-500'];
        return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
    };

    // ── Tournament CRUD ───────────────────────────────────────────────────
    const openCreateTournament = () => {
        setTEdit(null); setTForm(EMPTY_TOURNAMENT); setTErr(''); setTModal(true);
    };
    const openEditTournament = (t) => {
        setTEdit(t);
        setTForm({ name: t.name, start_date: t.start_date, end_date: t.end_date, location: t.location ?? '' });
        setTErr(''); setTModal(true);
    };
    const saveTournament = async (e) => {
        e.preventDefault(); setTSaving(true); setTErr('');
        try {
            if (tEdit) {
                await api.put(`/tournaments/${tEdit.id}`, tForm);
            } else {
                await api.post('/tournaments', tForm);
            }
            setTModal(false); load();
        } catch (err) {
            setTErr(err.response?.data?.message || Object.values(err.response?.data?.errors ?? {})[0]?.[0] || 'Lưu thất bại.');
        } finally { setTSaving(false); }
    };
    const deleteTournament = async (id) => {
        if (!window.confirm('Xóa giải đấu này? Tất cả cuộc đua sẽ bị xóa theo.')) return;
        try { await api.delete(`/tournaments/${id}`); load(); }
        catch (err) { alert(err.response?.data?.message || 'Không thể xóa.'); }
    };

    // ── Race CRUD ─────────────────────────────────────────────────────────
    const openAddRace = (tournament) => {
        setRParent(tournament); setRForm(EMPTY_RACE); setRErr(''); setRModal(true);
    };
    const saveRace = async (e) => {
        e.preventDefault(); setRSaving(true); setRErr('');
        try {
            await api.post('/races', {
                tournament_id: rParent.id,
                name:          rForm.name,
                round:         rForm.round,
                race_time:     rForm.race_time,
                distance:      Number(rForm.distance),
                max_horses:    Number(rForm.max_horses),
            });
            setRModal(false); load();
        } catch (err) {
            setRErr(err.response?.data?.message || Object.values(err.response?.data?.errors ?? {})[0]?.[0] || 'Lưu thất bại.');
        } finally { setRSaving(false); }
    };
    const deleteRace = async (raceId) => {
        if (!window.confirm('Xóa cuộc đua này?')) return;
        try { await api.delete(`/races/${raceId}`); load(); }
        catch (err) { alert(err.response?.data?.message || 'Không thể xóa.'); }
    };

    // ── field helper ──────────────────────────────────────────────────────
    const Field = ({ label, type = 'text', name, value, onChange, required, placeholder }) => (
        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
            <input
                type={type} name={name} value={value} onChange={onChange}
                required={required} placeholder={placeholder}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400 placeholder:text-slate-600 transition-colors"
            />
        </div>
    );

    // ── render ────────────────────────────────────────────────────────────
    if (loading) return <div className="py-20 text-center text-slate-500">Đang tải...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị</p>
                    <h2 className="text-3xl font-black tracking-tight text-white">Giải đấu</h2>
                </div>
                <button onClick={openCreateTournament}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-95">
                    <span className="text-lg leading-none">＋</span> Tạo giải đấu mới
                </button>
            </div>

            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}

            {/* Tournament list */}
            {tournaments.length === 0 ? (
                <div className="py-20 text-center text-slate-500 rounded-2xl border border-white/5 bg-slate-950/30">
                    <p className="text-4xl mb-3">🏆</p>
                    <p>Chưa có giải đấu nào. Nhấn "Tạo giải đấu mới" để bắt đầu.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tournaments.map(t => {
                        const st   = statusBadge(t.start_date, t.end_date);
                        const open = expanded === t.id;
                        const races = t.races ?? [];
                        return (
                            <div key={t.id} className="rounded-2xl border border-white/10 bg-slate-950/50 overflow-hidden">
                                {/* Tournament row */}
                                <div className="flex items-center gap-4 p-5">
                                    <button onClick={() => setExpanded(open ? null : t.id)}
                                        className="text-slate-500 hover:text-slate-300 transition-colors text-lg w-6 shrink-0">
                                        {open ? '▼' : '▶'}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p className="font-bold text-white">{t.name}</p>
                                            <span className={`text-[11px] font-semibold rounded-full border px-2.5 py-0.5 ${st.cls}`}>{st.label}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            📍 {t.location || '—'} &nbsp;·&nbsp;
                                            📅 {new Date(t.start_date).toLocaleDateString('vi-VN')} → {new Date(t.end_date).toLocaleDateString('vi-VN')} &nbsp;·&nbsp;
                                            🏇 {races.length} cuộc đua
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => openAddRace(t)}
                                            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition">
                                            + Thêm cuộc đua
                                        </button>
                                        <button onClick={() => openEditTournament(t)}
                                            className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition">
                                            Sửa
                                        </button>
                                        <button onClick={() => deleteTournament(t.id)}
                                            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition">
                                            Xóa
                                        </button>
                                    </div>
                                </div>

                                {/* Races list — expand */}
                                {open && (
                                    <div className="border-t border-white/5 bg-slate-950/70">
                                        {races.length === 0 ? (
                                            <p className="px-8 py-6 text-sm text-slate-600">Chưa có cuộc đua nào. Nhấn "+ Thêm cuộc đua" để tạo.</p>
                                        ) : (
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-white/5">
                                                        {['Tên / Vòng', 'Thời gian', 'Cự ly', 'Max ngựa', 'Trạng thái', ''].map(h => (
                                                            <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {races.map(r => (
                                                        <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                                            <td className="px-5 py-3">
                                                                <p className="font-semibold text-slate-200">{r.name || `Vòng ${r.round}`}</p>
                                                                {r.round && r.name && <p className="text-xs text-slate-500">Vòng {r.round}</p>}
                                                            </td>
                                                            <td className="px-5 py-3 text-slate-400 text-xs">
                                                                {r.race_time ? new Date(r.race_time).toLocaleString('vi-VN') : '—'}
                                                            </td>
                                                            <td className="px-5 py-3 text-emerald-400 font-bold">{r.distance}m</td>
                                                            <td className="px-5 py-3 text-slate-400">{r.max_horses}</td>
                                                            <td className="px-5 py-3">{raceStatusBadge(r.status)}</td>
                                                            <td className="px-5 py-3">
                                                                <button onClick={() => deleteRace(r.id)}
                                                                    className="text-[11px] font-bold text-rose-500 hover:text-rose-400 transition">Xóa</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Tournament Modal ── */}
            {tModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                        <div className="border-b border-white/5 px-6 py-5 flex items-center justify-between">
                            <h3 className="font-bold text-white">{tEdit ? 'Sửa giải đấu' : 'Tạo giải đấu mới'}</h3>
                            <button onClick={() => setTModal(false)} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
                        </div>
                        <form onSubmit={saveTournament} className="p-6 space-y-4">
                            <Field label="Tên giải đấu" name="name" value={tForm.name} required
                                onChange={e => setTForm(f => ({...f, name: e.target.value}))}
                                placeholder="Grand Heritage Cup 2026" />
                            <div className="grid grid-cols-2 gap-3">
                                <DatePicker label="Ngày bắt đầu" value={tForm.start_date} required
                                    onChange={v => setTForm(f => ({...f, start_date: v}))} />
                                <DatePicker label="Ngày kết thúc" value={tForm.end_date} required
                                    onChange={v => setTForm(f => ({...f, end_date: v}))} />
                            </div>
                            <Field label="Địa điểm" name="location" value={tForm.location}
                                onChange={e => setTForm(f => ({...f, location: e.target.value}))}
                                placeholder="Trường đua Phú Thọ" />
                            {tErr && <p className="text-xs text-rose-400">{tErr}</p>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setTModal(false)}
                                    className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/5 transition">Hủy</button>
                                <button type="submit" disabled={tSaving}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50 transition">
                                    {tSaving ? 'Đang lưu...' : (tEdit ? 'Cập nhật' : 'Tạo mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Race Modal ── */}
            {rModal && rParent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                        <div className="border-b border-white/5 px-6 py-5 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-white">Thêm cuộc đua</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{rParent.name}</p>
                            </div>
                            <button onClick={() => setRModal(false)} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
                        </div>
                        <form onSubmit={saveRace} className="p-6 space-y-4">
                            <Field label="Tên cuộc đua" name="name" value={rForm.name}
                                onChange={e => setRForm(f => ({...f, name: e.target.value}))}
                                placeholder="Chung kết mùa xuân" />
                            <Field label="Vòng (round)" name="round" value={rForm.round} required
                                onChange={e => setRForm(f => ({...f, round: e.target.value}))}
                                placeholder="Vòng 1" />
                            <DateTimePicker label="Thời gian đua" value={rForm.race_time} required
                                onChange={v => setRForm(f => ({...f, race_time: v}))} />
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Cự ly (mét)" type="number" name="distance" value={rForm.distance} required
                                    onChange={e => setRForm(f => ({...f, distance: e.target.value}))}
                                    placeholder="1600" />
                                <Field label="Số ngựa tối đa" type="number" name="max_horses" value={rForm.max_horses}
                                    onChange={e => setRForm(f => ({...f, max_horses: e.target.value}))}
                                    placeholder="8" />
                            </div>
                            {rErr && <p className="text-xs text-rose-400">{rErr}</p>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setRModal(false)}
                                    className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/5 transition">Hủy</button>
                                <button type="submit" disabled={rSaving}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50 transition">
                                    {rSaving ? 'Đang lưu...' : 'Thêm cuộc đua'}
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
