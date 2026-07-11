import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";

/* ── helpers ── */
const STATUS_CFG = {
  scheduled: {
    label: "Sắp diễn ra",
    cls: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
  ongoing: {
    label: "Đang đua",
    cls: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  finished: {
    label: "Đã xong",
    cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  cancelled: {
    label: "Đã hủy",
    cls: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  },
};

/* ══ Modal đăng ký ngựa cho cuộc đua ══ */
function RegisterModal({ race, onClose, onSuccess }) {
  const [horses, setHorses] = useState([]);
  const [selectedHorses, setSelectedHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/horses")
      .then((res) => {
        const allHorses = res.data?.data ?? res.data ?? [];
        // Filter out horses that are already registered
        const available = allHorses.filter(
          (h) => !race.registrations?.some((r) => r.horse_id === h.id),
        );
        setHorses(available);
      })
      .catch(() => setError("Không thể tải danh sách ngựa"))
      .finally(() => setLoading(false));
  }, [race.id, race.registrations]);

  const toggleHorse = (horseId) => {
    setSelectedHorses((prev) =>
      prev.includes(horseId)
        ? prev.filter((id) => id !== horseId)
        : [...prev, horseId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedHorses.length === 0) {
      setError("Vui lòng chọn ít nhất một ngựa.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await Promise.all(
        selectedHorses.map((horseId) =>
          api.post("/registrations", { horse_id: horseId, race_id: race.id }),
        ),
      );
      onSuccess();
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
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-7 py-5">
          <div>
            <h2 className="text-lg font-black text-white">
              📋 Đăng ký ngựa cho cuộc đua
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {race.round ?? race.name ?? `Cuộc đua #${race.id}`}
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

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-xl bg-white/5"
                />
              ))}
            </div>
          ) : horses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 py-8 text-center text-slate-500">
              <p className="text-sm">
                Tất cả ngựa đã được đăng ký hoặc không có ngựa nào khả dụng.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-3">
                Chọn ngựa để đăng ký ({selectedHorses.length}/{horses.length})
              </p>
              {horses.map((horse) => (
                <label
                  key={horse.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/[0.02] cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedHorses.includes(horse.id)}
                    onChange={() => toggleHorse(horse.id)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {horse.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      ID: {horse.id} · Owner: {horse.owner?.name ?? "—"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || selectedHorses.length === 0}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : `Đăng ký ${selectedHorses.length} ngựa`}
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
}

const StatusBadge = ({ status }) => {
  const s = STATUS_CFG[status] ?? {
    label: status,
    cls: "bg-slate-700 text-slate-400 border-slate-600",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

/* ══ Modal tạo / sửa cuộc đua ══ */
const EMPTY = {
  tournament_id: "",
  round: "",
  race_time: "",
  distance: "",
  max_horses: "",
  status: "scheduled",
};

function RaceModal({ race, tournaments, onClose, onSaved }) {
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
      : { ...EMPTY },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
              {isEdit ? "✏️ Chỉnh sửa cuộc đua" : "🏁 Tạo cuộc đua mới"}
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
              onChange={(e) => set("tournament_id", e.target.value)}
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
              Vòng / Tên cuộc đua *
            </label>
            <input
              type="text"
              value={form.round}
              onChange={(e) => set("round", e.target.value)}
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
              onChange={(e) => set("race_time", e.target.value)}
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
                onChange={(e) => set("distance", e.target.value)}
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
                onChange={(e) => set("max_horses", e.target.value)}
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
                onChange={(e) => set("status", e.target.value)}
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
                  : "Tạo cuộc đua"}
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
}

/* ══ Main Component ══ */
export default function AdminRaces() {
  const [races, setRaces] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | 'create' | race obj
  const [registerModal, setRegisterModal] = useState(null); // null | race obj for registration
  const [deleting, setDeleting] = useState(null);
  const [changingStatus, setChangingStatus] = useState(null);
  const [toast, setToast] = useState("");
  const [tournamentFilter, setTournamentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/admin/races"), api.get("/tournaments")])
      .then(([rRes, tRes]) => {
        setRaces(rRes.data?.data ?? rRes.data ?? []);
        setTournaments(tRes.data?.data ?? tRes.data ?? []);
      })
      .catch(() => setError("Không thể tải dữ liệu."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (race) => {
    if (!window.confirm(`Xóa cuộc đua "${race.round ?? race.name}"?`)) return;
    setDeleting(race.id);
    try {
      await api.delete(`/races/${race.id}`);
      showToast("Đã xóa cuộc đua.");
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa.");
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (race, newStatus) => {
    setChangingStatus(race.id);
    try {
      await api.put(`/races/${race.id}/status`, { status: newStatus });
      setRaces((prev) =>
        prev.map((r) => (r.id === race.id ? { ...r, status: newStatus } : r)),
      );
      showToast(`Đã đổi trạng thái → ${STATUS_CFG[newStatus]?.label}`);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể đổi trạng thái.");
    } finally {
      setChangingStatus(null);
    }
  };

  const displayed = races.filter((r) => {
    const matchT =
      !tournamentFilter || String(r.tournament_id) === tournamentFilter;
    const matchS = !statusFilter || r.status === statusFilter;
    return matchT && matchS;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">
            Quản trị
          </p>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Cuộc đua
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {races.length} cuộc đua · {displayed.length} đang hiển thị
          </p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5"
        >
          ＋ Tạo cuộc đua mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={tournamentFilter}
          onChange={(e) => setTournamentFilter(e.target.value)}
          className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
        >
          <option value="">Tất cả giải đấu</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="flex rounded-2xl border border-white/10 overflow-hidden">
          {[
            ["", "Tất cả"],
            ["scheduled", "Sắp diễn ra"],
            ["ongoing", "Đang đua"],
            ["finished", "Đã xong"],
            ["cancelled", "Đã hủy"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className={`px-3 py-2 text-xs font-bold transition ${statusFilter === v ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-950/40 text-slate-400 hover:text-slate-200"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
        >
          🔄 Làm mới
        </button>
      </div>

      {toast && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          ✅ {toast}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-slate-500">
          <p className="text-4xl mb-3">🏇</p>
          <p className="text-sm">
            Chưa có cuộc đua nào. Tạo cuộc đua đầu tiên!
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-950/70 border-b border-white/5">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {[
                    "ID",
                    "Tên / Vòng",
                    "Giải đấu",
                    "Thời gian",
                    "Cự ly",
                    "Ngựa",
                    "Trạng thái",
                    "Thao tác",
                  ].map((h) => (
                    <th key={h} className="px-4 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {displayed.map((race) => (
                  <tr
                    key={race.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-4 text-slate-500 font-mono text-xs">
                      #{race.id}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">
                        {race.name ?? race.round ?? `Cuộc đua #${race.id}`}
                      </p>
                      {race.round && race.name && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {race.round}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs">
                      {race.tournament?.name ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs">
                      {race.race_time
                        ? new Date(race.race_time).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-4 py-4 text-emerald-400 font-bold">
                      {race.distance}m
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {race.registrations_count ?? 0}/{race.max_horses ?? "?"}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={race.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Quick status change */}
                        {race.status === "scheduled" && (
                          <button
                            onClick={() => handleStatusChange(race, "ongoing")}
                            disabled={changingStatus === race.id}
                            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-amber-500/20 transition disabled:opacity-40"
                          >
                            ▶ Bắt đầu
                          </button>
                        )}
                        {race.status === "ongoing" && (
                          <button
                            onClick={() => handleStatusChange(race, "finished")}
                            disabled={changingStatus === race.id}
                            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-40"
                          >
                            ⏹ Kết thúc
                          </button>
                        )}
                        {/* Edit */}
                        <button
                          onClick={() => setModal(race)}
                          className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[11px] font-bold text-sky-400 hover:bg-sky-500/20 transition"
                        >
                          ✏️ Sửa
                        </button>
                        {/* Register */}
                        <button
                          onClick={() => setRegisterModal(race)}
                          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
                        >
                          📋 Đăng ký
                        </button>
                        {/* Delete */}
                        {race.status !== "finished" && (
                          <button
                            onClick={() => handleDelete(race)}
                            disabled={deleting === race.id}
                            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-bold text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-40"
                          >
                            {deleting === race.id ? "..." : "🗑️"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/5 px-5 py-3 text-xs text-slate-500">
            Tổng: {displayed.length} cuộc đua
          </div>
        </div>
      )}

      {modal && (
        <RaceModal
          race={modal === "create" ? null : modal}
          tournaments={tournaments}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            showToast(
              modal === "create"
                ? "Đã tạo cuộc đua thành công!"
                : "Đã cập nhật cuộc đua!",
            );
            load();
          }}
        />
      )}

      {registerModal && (
        <RegisterModal
          race={registerModal}
          onClose={() => setRegisterModal(null)}
          onSuccess={() => {
            setRegisterModal(null);
            showToast("✅ Đã đăng ký ngựa thành công!");
            load();
          }}
        />
      )}
    </div>
  );
}
