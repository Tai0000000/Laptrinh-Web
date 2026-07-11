import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";
import api from "../api/axios";

// Admin tab components
import AdminUsers from "./Admin/AdminUsers";
import AdminRegistrations from "./Admin/AdminRegistrations";
import AdminHorses from "./Admin/AdminHorses";
import AdminJockeys from "./Admin/AdminJockeys";
import AdminFinance from "./Admin/AdminFinance";
import AdminResultEntry from "./Admin/AdminResultEntry";
import AdminLeaderboard from "./Admin/AdminLeaderboard";
import AdminRaces from "./Admin/AdminRaces";

const _DAYS = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const _MONTHS = [
  ["01", "Tháng 1"],
  ["02", "Tháng 2"],
  ["03", "Tháng 3"],
  ["04", "Tháng 4"],
  ["05", "Tháng 5"],
  ["06", "Tháng 6"],
  ["07", "Tháng 7"],
  ["08", "Tháng 8"],
  ["09", "Tháng 9"],
  ["10", "Tháng 10"],
  ["11", "Tháng 11"],
  ["12", "Tháng 12"],
];
const _curYear = new Date().getFullYear();
const _YEARS = Array.from({ length: 5 }, (_, i) => String(_curYear + i));
const _HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const _MINS = ["00", "15", "30", "45"];
const _selCls =
  "rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400 transition-colors cursor-pointer w-full";

function DatePicker({ label, value, onChange, required }) {
  const [iy = "", im = "", id_ = ""] = value ? value.split("-") : [];
  const [selY, setSelY] = useState(iy);
  const [selM, setSelM] = useState(im);
  const [selD, setSelD] = useState(id_);

  const emit = (y, m, d) => {
    if (y && m && d) onChange(y + "-" + m + "-" + d);
  };
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <div className="grid grid-cols-3 gap-2">
        <select
          className={_selCls}
          value={selD}
          onChange={(e) => {
            setSelD(e.target.value);
            emit(selY, selM, e.target.value);
          }}
        >
          <option value="">Ngày</option>
          {_DAYS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          className={_selCls}
          value={selM}
          onChange={(e) => {
            setSelM(e.target.value);
            emit(selY, e.target.value, selD);
          }}
        >
          <option value="">Tháng</option>
          {_MONTHS.map(([v, lbl]) => (
            <option key={v} value={v}>
              {lbl}
            </option>
          ))}
        </select>
        <select
          className={_selCls}
          value={selY}
          onChange={(e) => {
            setSelY(e.target.value);
            emit(e.target.value, selM, selD);
          }}
        >
          <option value="">Năm</option>
          {_YEARS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function DateTimePicker({ label, value, onChange, required }) {
  const [datePart = "", timePart = ""] = value ? value.split("T") : [];
  const [iy = "", im = "", id_ = ""] = datePart ? datePart.split("-") : [];
  const [ihh = "", imm = ""] = timePart ? timePart.split(":") : [];

  const [selY, setSelY] = useState(iy);
  const [selM, setSelM] = useState(im);
  const [selD, setSelD] = useState(id_);
  const [selH, setSelH] = useState(ihh);
  const [selMin, setSelMin] = useState(imm);

  const emit = (y, m, d, h, min) => {
    if (y && m && d && h && min)
      onChange(y + "-" + m + "-" + d + "T" + h + ":" + min);
  };
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <select
          className={_selCls}
          value={selD}
          onChange={(e) => {
            setSelD(e.target.value);
            emit(selY, selM, e.target.value, selH, selMin);
          }}
        >
          <option value="">Ngày</option>
          {_DAYS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          className={_selCls}
          value={selM}
          onChange={(e) => {
            setSelM(e.target.value);
            emit(selY, e.target.value, selD, selH, selMin);
          }}
        >
          <option value="">Tháng</option>
          {_MONTHS.map(([v, lbl]) => (
            <option key={v} value={v}>
              {lbl}
            </option>
          ))}
        </select>
        <select
          className={_selCls}
          value={selY}
          onChange={(e) => {
            setSelY(e.target.value);
            emit(e.target.value, selM, selD, selH, selMin);
          }}
        >
          <option value="">Năm</option>
          {_YEARS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          className={_selCls}
          value={selH}
          onChange={(e) => {
            setSelH(e.target.value);
            emit(selY, selM, selD, e.target.value, selMin);
          }}
        >
          <option value="">Giờ</option>
          {_HOURS.map((v) => (
            <option key={v} value={v}>
              {v}:00
            </option>
          ))}
        </select>
        <select
          className={_selCls}
          value={selMin}
          onChange={(e) => {
            setSelMin(e.target.value);
            emit(selY, selM, selD, selH, e.target.value);
          }}
        >
          <option value="">Phút</option>
          {_MINS.map((v) => (
            <option key={v} value={v}>
              :{v}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
const MOCK_STATS = {
  total_tournaments: 6,
  total_horses: 24,
  total_jockeys: 12,
  total_bets: 87,
  total_users: 142,
  active_races: 3,
  completed_races: 14,
  pending_registrations: 5,
  user_growth_percent: 18.5,
};

const MOCK_ACTIVITY = [
  {
    icon: "💸",
    color: "amber",
    badge: "Cược mới",
    description: "Nguyễn Văn An đặt cược 500,000 VNĐ vào Golden Cup 2026",
    time_ago: "2 phút trước",
  },
  {
    icon: "👤",
    color: "emerald",
    badge: "Thành viên mới",
    description: "Trần Thị Bình đăng ký tài khoản với vai trò Khán giả",
    time_ago: "8 phút trước",
  },
  {
    icon: "📋",
    color: "blue",
    badge: "pending",
    description: 'Ngựa "Thunder King" đăng ký tham gia Golden Cup 2026',
    time_ago: "15 phút trước",
  },
  {
    icon: "💸",
    color: "amber",
    badge: "Cược mới",
    description: "Lê Văn Cường đặt cược 1,200,000 VNĐ vào Spring Tournament",
    time_ago: "22 phút trước",
  },
  {
    icon: "👤",
    color: "emerald",
    badge: "Thành viên mới",
    description: "Phạm Thị Dung đăng ký tài khoản với vai trò Chủ ngựa",
    time_ago: "35 phút trước",
  },
  {
    icon: "📋",
    color: "blue",
    badge: "confirmed",
    description: 'Ngựa "Storm Runner" đăng ký tham gia Spring Tournament',
    time_ago: "1 giờ trước",
  },
];

/* ═══════════════════════════════════════════════════════════
   KPI CARD
═══════════════════════════════════════════════════════════ */
const KPI_COLORS = {
  emerald: {
    border: "border-emerald-500/40",
    from: "from-emerald-500/20",
    to: "to-emerald-500/5",
    glow: "bg-emerald-400",
    text: "text-emerald-400",
    ring: "ring-emerald-500/30",
  },
  amber: {
    border: "border-amber-500/40",
    from: "from-amber-500/20",
    to: "to-amber-500/5",
    glow: "bg-amber-400",
    text: "text-amber-400",
    ring: "ring-amber-500/30",
  },
  sky: {
    border: "border-sky-500/40",
    from: "from-sky-500/20",
    to: "to-sky-500/5",
    glow: "bg-sky-400",
    text: "text-sky-400",
    ring: "ring-sky-500/30",
  },
  violet: {
    border: "border-violet-500/40",
    from: "from-violet-500/20",
    to: "to-violet-500/5",
    glow: "bg-violet-400",
    text: "text-violet-400",
    ring: "ring-violet-500/30",
  },
  rose: {
    border: "border-rose-500/40",
    from: "from-rose-500/20",
    to: "to-rose-500/5",
    glow: "bg-rose-400",
    text: "text-rose-400",
    ring: "ring-rose-500/30",
  },
  teal: {
    border: "border-teal-500/40",
    from: "from-teal-500/20",
    to: "to-teal-500/5",
    glow: "bg-teal-400",
    text: "text-teal-400",
    ring: "ring-teal-500/30",
  },
};

const KpiCard = ({ icon, label, value, sub, color = "emerald", loading }) => {
  const c = KPI_COLORS[color] ?? KPI_COLORS.emerald;
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border ${c.border} bg-gradient-to-br ${c.from} ${c.to} p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-1 ${c.ring}`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${c.glow} opacity-10 blur-3xl transition-all duration-500 group-hover:opacity-20`}
      />
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 text-2xl shadow-inner">
          {icon}
        </div>
        {sub !== undefined && !loading && (
          <span
            className={`mt-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold ${sub >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {sub >= 0 ? "▲" : "▼"} {Math.abs(sub)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-medium tracking-wide text-slate-400 uppercase">
        {label}
      </p>
      {loading ? (
        <div className="mt-2 h-9 w-24 animate-pulse rounded-xl bg-white/10" />
      ) : (
        <p className="mt-1 text-4xl font-black tracking-tight text-white">
          {value}
        </p>
      )}
    </div>
  );
};

const BADGE_COLORS = {
  amber: "bg-amber-500/15   text-amber-300   border-amber-500/30",
  blue: "bg-sky-500/15     text-sky-300     border-sky-500/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rose: "bg-rose-500/15    text-rose-300    border-rose-500/30",
};

const ActivityBadge = ({ color, text }) => (
  <span
    className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_COLORS[color] ?? BADGE_COLORS.emerald}`}
  >
    {text}
  </span>
);

/* ═══════════════════════════════════════════════════════════
   ADMIN OVERVIEW TAB
═══════════════════════════════════════════════════════════ */
const AdminOverview = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const loadData = useCallback(async () => {
    setLoadingStats(true);
    setLoadingFeed(true);

    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
      setUsingMock(false);
    } catch {
      setStats(MOCK_STATS);
      setUsingMock(true);
    } finally {
      setLoadingStats(false);
    }

    try {
      const res = await api.get("/admin/recent-activity");
      setActivity(res.data?.length ? res.data : MOCK_ACTIVITY);
    } catch {
      setActivity(MOCK_ACTIVITY);
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const kpiCards = [
    {
      icon: "🏆",
      label: "Tổng giải đấu",
      value: stats?.total_tournaments ?? "—",
      color: "emerald",
    },
    {
      icon: "🐴",
      label: "Ngựa đua",
      value: stats?.total_horses ?? "—",
      color: "amber",
    },
    {
      icon: "🤠",
      label: "Nài ngựa (Jockey)",
      value: stats?.total_jockeys ?? "—",
      color: "sky",
    },
    {
      icon: "💸",
      label: "Dự đoán / Cược",
      value: stats?.total_bets ?? "—",
      color: "violet",
    },
    {
      icon: "👥",
      label: "Người dùng",
      value: stats?.total_users ?? "—",
      sub: stats?.user_growth_percent,
      color: "teal",
    },
    {
      icon: "🚦",
      label: "Cuộc đua đang / sắp diễn ra",
      value: stats?.active_races ?? "—",
      color: "rose",
    },
    {
      icon: "✅",
      label: "Cuộc đua hoàn thành",
      value: stats?.completed_races ?? "—",
      color: "emerald",
    },
    {
      icon: "⏳",
      label: "Đăng ký chờ duyệt",
      value: stats?.pending_registrations ?? "—",
      color: "amber",
    },
  ];

  const pending = stats?.pending_registrations ?? 0;

  return (
    <div className="space-y-8">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, i) => (
          <KpiCard key={i} {...card} loading={loadingStats} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Activity Feed */}
        <div className="xl:col-span-2 flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
            <div>
              <h3 className="text-base font-bold text-white">
                Hoạt động gần đây
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Các sự kiện mới nhất trên hệ thống
              </p>
            </div>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              ● Live
            </span>
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
                <div
                  key={idx}
                  className="flex items-start gap-4 px-6 py-4 transition-colors duration-150 hover:bg-white/[0.03]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm leading-snug text-slate-200">
                      {item.description}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.time_ago}
                    </p>
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
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">
              Thao tác nhanh
            </h3>
            <p className="mb-5 mt-1 text-xs text-slate-500">
              Phím tắt chức năng quản trị
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => onNavigate("tournaments")}
                className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className="text-base">🏗️</span> Tạo giải đấu mới
              </button>
              <button
                onClick={() => onNavigate("races")}
                className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className="text-base">🏁</span> Tạo cuộc đua mới
              </button>
              <button
                onClick={() => onNavigate("results")}
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
              >
                <span className="text-base">🏁</span> Nhập kết quả cuộc đua
              </button>
              <button
                onClick={() => onNavigate("leaderboard")}
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
              >
                <span className="text-base">🥇</span> Xem bảng xếp hạng
              </button>
              <button
                onClick={() => onNavigate("users")}
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
              >
                <span className="text-base">👥</span> Quản lý người dùng
              </button>
              <button
                onClick={() => onNavigate("registrations")}
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
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-300">
              Trạng thái hệ thống
            </h3>
            <div className="space-y-3.5">
              {[
                {
                  label: "API Backend",
                  ok: !usingMock,
                  status: usingMock ? "Ngoại tuyến" : "Hoạt động",
                },
                {
                  label: "Cơ sở dữ liệu",
                  ok: !usingMock,
                  status: usingMock ? "Ngoại tuyến" : "Hoạt động",
                },
                { label: "Đặt cược online", ok: true, status: "Đang bật" },
                { label: "Chế độ bảo trì", ok: false, status: "Tắt" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-semibold ${s.ok ? "text-emerald-400" : "text-slate-500"}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${s.ok ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`}
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
   ADMIN TOURNAMENTS TAB — CRUD đầy đủ
═══════════════════════════════════════════════════════════ */
const EMPTY_FORM = {
  name: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
  prize_pool: "",
};

const TournamentModal = ({ tournament, onClose, onSaved }) => {
  const isEdit = !!tournament?.id;
  const [form, setForm] = useState(
    isEdit
      ? {
          name: tournament.name ?? "",
          location: tournament.location ?? "",
          start_date: tournament.start_date
            ? tournament.start_date.slice(0, 10)
            : "",
          end_date: tournament.end_date ? tournament.end_date.slice(0, 10) : "",
          description: tournament.description ?? "",
          prize_pool: tournament.prize_pool ?? "",
        }
      : { ...EMPTY_FORM },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.start_date) > new Date(form.end_date)) {
      setError("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await api.put(`/tournaments/${tournament.id}`, form);
      } else {
        await api.post("/tournaments", form);
      }
      onSaved();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        "Lỗi không xác định.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, name, type = "text", required = true) => (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        value={form[name]}
        required={required}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors placeholder:text-slate-600"
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-7 py-5">
          <div>
            <h2 className="text-lg font-black text-white">
              {isEdit ? "✏️ Chỉnh sửa giải đấu" : "🏗️ Tạo giải đấu mới"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit
                ? `ID: ${tournament.id}`
                : "Điền đầy đủ thông tin bên dưới"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xl transition-colors"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </div>
          )}
          {field("Tên giải đấu", "name")}
          {field("Địa điểm", "location")}
          <div className="grid grid-cols-2 gap-4">
            {field("Ngày bắt đầu", "start_date", "date")}
            {field("Ngày kết thúc", "end_date", "date")}
          </div>
          {field("Tổng giải thưởng (VNĐ)", "prize_pool", "number", false)}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Mô tả
            </label>
            <textarea
              value={form.description}
              rows={3}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors placeholder:text-slate-600 resize-none"
              placeholder="Mô tả ngắn về giải đấu (tuỳ chọn)"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-slate-950 shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving
                ? "Đang lưu..."
                : isEdit
                  ? "Lưu thay đổi"
                  : "Tạo giải đấu"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ADMIN RACE MODAL — CRUD cho Vòng đua
═══════════════════════════════════════════════════════════ */
const AdminRaceModal = ({ race, tournaments, onClose, onSaved }) => {
  const isEdit = !!race?.id;
  const [form, setForm] = useState(
    isEdit
      ? {
          tournament_id: race.tournament_id ?? "",
          round: race.round ?? "",
          race_time: race.race_time ? race.race_time.slice(0, 16) : "",
          distance: race.distance ?? "",
          max_horses: race.max_horses ?? "",
          status: race.status ?? "scheduled",
        }
      : {
          tournament_id: tournaments?.[0]?.id ?? "",
          round: "",
          race_time: "",
          distance: "",
          max_horses: "",
          status: "scheduled",
        },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        tournament_id: +form.tournament_id,
        round: form.round,
        race_time: form.race_time,
        distance: +form.distance,
        max_horses: +form.max_horses,
        ...(isEdit ? { status: form.status } : {}),
      };
      if (isEdit) {
        await api.put(`/races/${race.id}`, payload);
      } else {
        await api.post("/races", payload);
      }
      onSaved();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        "Lỗi không xác định.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-7 py-5">
          <div>
            <h2 className="text-lg font-black text-white">
              {isEdit ? "✏️ Chỉnh sửa vòng đua" : "🏁 Tạo vòng đua mới"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? `ID: ${race.id}` : "Điền đầy đủ thông tin bên dưới"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Giải đấu *
            </label>
            <select
              value={form.tournament_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, tournament_id: e.target.value }))
              }
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
            >
              <option value="">-- Chọn giải đấu --</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Vòng / Tên vòng đua *
            </label>
            <input
              type="text"
              value={form.round}
              onChange={(e) =>
                setForm((f) => ({ ...f, round: e.target.value }))
              }
              required
              placeholder="Vòng loại Bảng A - Chặng 1"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Thời gian đua *
            </label>
            <input
              type="datetime-local"
              value={form.race_time}
              onChange={(e) =>
                setForm((f) => ({ ...f, race_time: e.target.value }))
              }
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Cự ly (m) *
              </label>
              <input
                type="number"
                min="100"
                max="5000"
                value={form.distance}
                onChange={(e) =>
                  setForm((f) => ({ ...f, distance: e.target.value }))
                }
                required
                placeholder="1000"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Số ngựa tối đa *
              </label>
              <input
                type="number"
                min="2"
                max="30"
                value={form.max_horses}
                onChange={(e) =>
                  setForm((f) => ({ ...f, max_horses: e.target.value }))
                }
                required
                placeholder="10"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 placeholder:text-slate-600"
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Trạng thái
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
              >
                <option value="scheduled">Sắp diễn ra</option>
                <option value="ongoing">Đang đua</option>
                <option value="finished">Đã xong</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving
                ? "Đang lưu..."
                : isEdit
                  ? "Lưu thay đổi"
                  : "Tạo vòng đua"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
            >
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
  const [races, setRaces] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [raceModal, setRaceModal] = useState(null);
  const [expandedTournament, setExpandedTournament] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingRace, setDeletingRace] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const load = () => {
    setLoading(true);
    api
      .get("/tournaments")
      .then((r) => setTournaments(r.data?.data ?? r.data ?? []))
      .catch(() => setError("Không thể tải danh sách giải đấu."))
      .finally(() => setLoading(false));
  };

  const loadRaces = async (tournamentId) => {
    if (races[tournamentId]) return;
    try {
      const res = await api.get(`/admin/races?tournament_id=${tournamentId}`);
      setRaces((prev) => ({
        ...prev,
        [tournamentId]: res.data?.data ?? res.data ?? [],
      }));
    } catch {
      setRaces((prev) => ({ ...prev, [tournamentId]: [] }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (t) => {
    if (
      !window.confirm(
        `Xóa giải đấu "${t.name}"? Hành động này không thể hoàn tác.`,
      )
    )
      return;
    setDeleting(t.id);
    try {
      await api.delete(`/tournaments/${t.id}`);
      showToast(`Đã xóa giải đấu "${t.name}"`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa giải đấu.");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteRace = async (race, tournamentId) => {
    if (
      !window.confirm(
        `Xóa cuộc đua "${race.round}"? Hành động này không thể hoàn tác.`,
      )
    )
      return;
    setDeletingRace(race.id);
    try {
      await api.delete(`/races/${race.id}`);
      showToast(`Đã xóa cuộc đua "${race.round}"`);
      setRaces((prev) => ({
        ...prev,
        [tournamentId]: prev[tournamentId].filter((r) => r.id !== race.id),
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa cuộc đua.");
    } finally {
      setDeletingRace(null);
    }
  };

  const getStatus = (start, end) => {
    const now = Date.now();
    const s = new Date(start),
      e = new Date(end);
    if (now < s)
      return {
        label: "Sắp diễn ra",
        cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      };
    if (now > e)
      return {
        label: "Hoàn thành",
        cls: "bg-slate-800 text-slate-400 border-slate-700",
      };
    return {
      label: "Đang diễn ra",
      cls: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">
            Quản trị
          </p>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Giải đấu
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {tournaments.length} giải đấu trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setModal("create")}
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
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-slate-500">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-sm">
            Chưa có giải đấu nào. Tạo giải đấu đầu tiên!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map((t) => {
            const st = getStatus(t.start_date, t.end_date);
            const isExpanded = expandedTournament === t.id;
            const tourRaces = races[t.id] ?? [];
            return (
              <div
                key={t.id}
                className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden hover:border-emerald-500/30 transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <p className="font-bold text-white text-sm leading-snug">
                      {t.name}
                    </p>
                    <span
                      className={`shrink-0 text-[11px] font-semibold rounded-full border px-2.5 py-0.5 ${st.cls}`}
                    >
                      {st.label}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400 mb-4">
                    <p>📍 {t.location || "—"}</p>
                    <p>
                      📅 {new Date(t.start_date).toLocaleDateString("vi-VN")} →{" "}
                      {new Date(t.end_date).toLocaleDateString("vi-VN")}
                    </p>
                    {t.prize_pool && (
                      <p className="text-emerald-400 font-semibold">
                        🏅 {Number(t.prize_pool).toLocaleString("vi-VN")} ₫
                      </p>
                    )}
                    {t.description && (
                      <p className="text-slate-500 line-clamp-2 mt-1">
                        {t.description}
                      </p>
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
                      onClick={() => {
                        setExpandedTournament(isExpanded ? null : t.id);
                        if (!isExpanded) loadRaces(t.id);
                      }}
                      className="flex-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 py-2 text-xs font-semibold text-sky-400 transition-colors"
                    >
                      🏁 Vòng đua ({tourRaces.length})
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      disabled={deleting === t.id}
                      className="flex-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 py-2 text-xs font-semibold text-rose-400 transition-colors disabled:opacity-40"
                    >
                      {deleting === t.id ? "..." : "🗑️ Xóa"}
                    </button>
                  </div>
                </div>

                {/* Races Section */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-slate-950/40 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-200">
                        Danh sách vòng đua
                      </h4>
                      <button
                        onClick={() =>
                          setRaceModal({ tournament_id: t.id, isNew: true })
                        }
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-semibold text-emerald-400 rounded-lg transition-colors"
                      >
                        ➕ Thêm vòng
                      </button>
                    </div>
                    {tourRaces.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">
                        Chưa có vòng đua nào
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {tourRaces.map((race) => (
                          <div
                            key={race.id}
                            className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">
                                {race.round}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {race.distance}m ·{" "}
                                {new Date(race.race_time).toLocaleString(
                                  "vi-VN",
                                )}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() =>
                                  setRaceModal({ ...race, tournament_id: t.id })
                                }
                                className="px-2 py-1 text-[10px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded transition-colors"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteRace(race, t.id)}
                                disabled={deletingRace === race.id}
                                className="px-2 py-1 text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded transition-colors disabled:opacity-40"
                              >
                                {deletingRace === race.id ? "..." : "Xóa"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <TournamentModal
          tournament={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            showToast(
              modal === "create"
                ? "Đã tạo giải đấu thành công!"
                : "Đã cập nhật giải đấu!",
            );
            load();
          }}
        />
      )}

      {raceModal && (
        <AdminRaceModal
          race={raceModal.isNew ? null : raceModal}
          tournaments={[
            {
              id: raceModal.tournament_id,
              name: tournaments.find((t) => t.id === raceModal.tournament_id)
                ?.name,
            },
          ]}
          onClose={() => setRaceModal(null)}
          onSaved={() => {
            setRaceModal(null);
            showToast("✅ Đã lưu vòng đua!");
            setRaces((prev) => ({
              ...prev,
              [raceModal.tournament_id]: undefined,
            }));
            loadRaces(raceModal.tournament_id);
          }}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ADMIN SETTINGS TAB (placeholder)
═══════════════════════════════════════════════════════════ */
const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    api.get('/admin/settings')
      .then(r => setSettings(r.data.settings))
      .catch(() => setError('Không thể tải cài đặt.'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key) => {
    try {
      const r = await api.put(`/admin/settings/${key}/toggle`);
      setSettings(prev => ({ ...prev, [key]: r.data.value }));
      setSuccess(`Đã cập nhật "${key}".`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.message || 'Toggle thất bại.');
    }
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const r = await api.put('/admin/settings', {
        betting_min_amount:     Number(settings.betting_min_amount),
        betting_max_amount:     Number(settings.betting_max_amount),
        max_horses_per_race:    Number(settings.max_horses_per_race),
        race_registration_days: Number(settings.race_registration_days),
        site_name:              settings.site_name,
      });
      setSettings(r.data.settings);
      setSuccess('Đã lưu cài đặt thành công.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.message || 'Lưu thất bại.');
    } finally { setSaving(false); }
  };

  const ToggleRow = ({ label, desc, settingKey }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => handleToggle(settingKey)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          settings?.[settingKey] ? 'bg-emerald-500' : 'bg-slate-700'
        }`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          settings?.[settingKey] ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị</p>
        <h2 className="text-3xl font-black tracking-tight text-white">Cài đặt hệ thống</h2>
        <p className="mt-1 text-sm text-slate-400">Cấu hình toàn bộ nền tảng đua ngựa</p>
      </div>

      {error   && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">✓ {success}</div>}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-center text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        </div>
      ) : settings && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Toggle settings */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
            <h3 className="text-sm font-bold text-white mb-2">🔧 Tính năng hệ thống</h3>
            <ToggleRow settingKey="allow_registration" label="Cho phép đăng ký"       desc="Cho phép tài khoản mới đăng ký vào hệ thống" />
            <ToggleRow settingKey="allow_betting"      label="Cho phép đặt cược"       desc="Bật/tắt toàn bộ tính năng cá cược" />
            <ToggleRow settingKey="maintenance_mode"   label="Chế độ bảo trì"          desc="Tạm dừng dịch vụ để bảo trì hệ thống" />
            <ToggleRow settingKey="results_auto_resolve" label="Tự động quyết toán cược" desc="Tự động quyết toán khi kết quả được công bố" />
          </div>

          {/* Numeric settings */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">⚙️ Thông số hệ thống</h3>
            {[
              { key: 'site_name',              label: 'Tên nền tảng',              type: 'text',   min: null  },
              { key: 'betting_min_amount',     label: 'Cược tối thiểu (VNĐ)',     type: 'number', min: 1000  },
              { key: 'betting_max_amount',     label: 'Cược tối đa (VNĐ)',        type: 'number', min: 10000 },
              { key: 'max_horses_per_race',    label: 'Ngựa tối đa / cuộc đua', type: 'number', min: 2     },
              { key: 'race_registration_days', label: 'Hạn đăng ký (ngày)',      type: 'number', min: 1     },
            ].map(({ key, label, type, min }) => (
              <div key={key}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
                <input
                  type={type}
                  min={min}
                  value={settings[key] ?? ''}
                  onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            ))}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-bold text-slate-950 shadow hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : '💾 Lưu cài đặt'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD (Admin Panel)
═══════════════════════════════════════════════════════════ */
const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingCount, setPendingCount] = useState(0);

  // Lấy số lượng pending để hiển thị badge trên sidebar
  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setPendingCount(r.data?.pending_registrations ?? 0))
      .catch(() => {});
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview onNavigate={setActiveTab} />;
      case "tournaments":
        return <AdminTournaments />;
      case "races":
        return <AdminRaces />;
      case "horses":
        return <AdminHorses />;
      case "jockeys":
        return <AdminJockeys />;
      case "registrations":
        return <AdminRegistrations />;
      case "users":
        return <AdminUsers />;
      case "results":
        return <AdminResultEntry />;
      case "leaderboard":
        return <AdminLeaderboard />;
      case "finance":
        return <AdminFinance />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminOverview onNavigate={setActiveTab} />;
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
