import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RefereeLayout from "../../components/RefereeLayout";
import api from "../../api/axios";

const Races = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pre-race checklist modal state
  const [checklistModal, setChecklistModal] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [checklistState, setChecklistState] = useState({});
  const [checklistNotes, setChecklistNotes] = useState("");
  const [checklistSaving, setChecklistSaving] = useState(false);

  // Lane assignment state
  const [laneMap, setLaneMap] = useState({});        // { registration_id: lane_number }
  const [savingLanes, setSavingLanes] = useState(false);
  const [laneError, setLaneError] = useState("");

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/referee/races");
      const data = response.data;
      if (data.success) {
        setRaces(data.data);
      } else {
        setError("Không thể tải danh sách cuộc đua.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  // FIX: đổi "active" → "ongoing" để khớp với backend validation
  const updateRaceStatus = async (raceId, status) => {
    try {
      await api.put(`/referee/races/${raceId}/status`, { status });
      fetchRaces();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Không thể cập nhật trạng thái cuộc đua.",
      );
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "finished":
      case "completed":
        return "Đã hoàn thành";
      case "active":
      case "ongoing":
        return "Đang diễn ra";
      case "scheduled":
        return "Đã lên lịch";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // FIX: map "finished" → "completed" để tab filter hoạt động đúng
  const getStatusFilter = (status) => {
    if (status === "active" || status === "ongoing") return "active";
    if (status === "finished" || status === "completed") return "completed";
    return status;
  };

  const formatTime = (raceTime) => {
    if (!raceTime) return "--:--";
    try {
      const date = new Date(raceTime);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "--:--";
    }
  };

  const filteredRaces = races
    .filter((r) => filter === "all" || getStatusFilter(r.status) === filter)
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.name?.toLowerCase().includes(q) ||
        r.round?.toLowerCase().includes(q) ||
        r.tournament?.name?.toLowerCase().includes(q)
      );
    });

  const openChecklist = (race) => {
    setSelectedRace(race);
    const initialState = {};
    const initialLanes = {};
    (race.registrations || []).forEach((reg) => {
      initialState[reg.id] = { weight: false, equipment: false, health: false };
      initialLanes[reg.id] = reg.lane || "";
    });
    setChecklistState(initialState);
    setLaneMap(initialLanes);
    setLaneError("");
    setChecklistNotes("");
    setChecklistModal(true);
  };

  const toggleCheck = (regId, field) => {
    setChecklistState((prev) => ({
      ...prev,
      [regId]: {
        ...prev[regId],
        [field]: !prev[regId]?.[field],
      },
    }));
  };

  // FIX: Sau khi xác nhận checklist → tự động bắt đầu race (ongoing)
  const handleChecklistSubmit = async () => {
    if (!selectedRace) return;
    setChecklistSaving(true);
    try {
      // Bắt đầu race
      await api.put(`/referee/races/${selectedRace.id}/status`, { status: "ongoing" });
      setChecklistModal(false);
      fetchRaces();
    } catch (err) {
      alert(
        err.response?.data?.message || "Không thể bắt đầu cuộc đua. Vui lòng thử lại.",
      );
    } finally {
      setChecklistSaving(false);
    }
  };

  // ── Chia lane ngẫu nhiên ─────────────────────────────────────────────
  const handleAutoAssignLanes = () => {
    const regs = selectedRace?.registrations || [];
    if (regs.length === 0) return;
    // Tạo mảng làn ngẫu nhiên (shuffle)
    const laneNumbers = regs.map((_, i) => i + 1);
    for (let i = laneNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [laneNumbers[i], laneNumbers[j]] = [laneNumbers[j], laneNumbers[i]];
    }
    const newLaneMap = {};
    regs.forEach((reg, i) => { newLaneMap[reg.id] = laneNumbers[i]; });
    setLaneMap(newLaneMap);
    setLaneError("");
  };

  // ── Lưu lane xuống backend ───────────────────────────────────────────
  const handleSaveLanes = async () => {
    const regs = selectedRace?.registrations || [];
    if (regs.length === 0) return;

    // Validate: tất cả phải có lane, không trùng
    const values = regs.map(r => Number(laneMap[r.id]));
    if (values.some(v => !v || v < 1)) {
      setLaneError("Vui lòng nhập làn hợp lệ (≥ 1) cho tất cả ngựa.");
      return;
    }
    if (new Set(values).size !== values.length) {
      setLaneError("Các làn không được trùng nhau.");
      return;
    }

    setSavingLanes(true);
    setLaneError("");
    try {
      await api.post(`/referee/races/${selectedRace.id}/assign-lanes`, {
        lanes: regs.map(r => ({
          registration_id: r.id,
          lane: Number(laneMap[r.id]),
        })),
      });
      // Cập nhật local selectedRace để bảng hiển thị lane mới ngay
      setSelectedRace(prev => ({
        ...prev,
        registrations: prev.registrations.map(r => ({
          ...r,
          lane: Number(laneMap[r.id]),
        })),
      }));
    } catch (err) {
      setLaneError(err.response?.data?.message || "Không thể lưu làn. Vui lòng thử lại.");
    } finally {
      setSavingLanes(false);
    }
  };

  // Kiểm tra tất cả checklist đã tích chưa
  const isChecklistComplete = () => {
    const regs = selectedRace?.registrations || [];
    if (regs.length === 0) return true;
    return regs.every(
      (reg) =>
        checklistState[reg.id]?.weight &&
        checklistState[reg.id]?.equipment &&
        checklistState[reg.id]?.health,
    );
  };

  return (
    <RefereeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
            Cuộc đua phân công
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Giám sát và ghi nhận kết quả cho các cuộc đua được chỉ định. Chọn
            một cuộc đua để quản lý checklist và xếp hạng vị trí.
          </p>
        </div>

        {/* Filters & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl backdrop-blur-md">
          <div className="flex space-x-2">
            {[
              { key: "all",       label: "Tất cả" },
              { key: "scheduled", label: "Đã lên lịch" },
              { key: "active",    label: "Đang diễn ra" },
              { key: "completed", label: "Đã hoàn thành" },
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setFilter(type.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  filter === type.key
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm cuộc đua..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4 text-sm">
              Đang tải danh sách cuộc đua...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center backdrop-blur-md">
            <p className="text-rose-300 font-semibold text-sm">{error}</p>
            <button
              onClick={fetchRaces}
              className="mt-4 px-6 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all duration-200 border border-rose-500/30"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRaces.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm">
              Không tìm thấy cuộc đua nào.
            </p>
          </div>
        )}

        {/* Races Grid */}
        {!loading && !error && filteredRaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRaces.map((race) => (
              <div
                key={race.id}
                className="bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm group shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                      Mã: #{race.id}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        race.status === "finished" || race.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : race.status === "active" || race.status === "ongoing"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse"
                            : race.status === "cancelled"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700/50"
                      }`}
                    >
                      {getStatusLabel(race.status)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors duration-250">
                      {race.name ?? race.round ?? `Cuộc đua #${race.id}`}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">
                      {race.tournament?.name || "Không xác định"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Giờ chạy</span>
                      <span className="text-slate-300 font-semibold mt-0.5 block">{formatTime(race.race_time)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Cự ly</span>
                      <span className="text-slate-300 font-semibold mt-0.5 block">{race.distance}m</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Số ngựa</span>
                      <span className="text-slate-300 font-semibold mt-0.5 block">
                        {race.registrations_count ?? race.registrations?.length ?? 0} lần
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 flex space-x-2">
                  {race.status === "finished" || race.status === "completed" ? (
                    <button
                      onClick={() => navigate(`/referee/races/${race.id}/results`)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 border border-slate-700/50"
                    >
                      Xem báo cáo
                    </button>
                  ) : race.status === "active" || race.status === "ongoing" ? (
                    <>
                      <button
                        onClick={() => navigate(`/referee/races/${race.id}/monitor`)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-300"
                        title="Giám sát cuộc đua"
                      >
                        📡 Giám sát
                      </button>
                      <button
                        onClick={() => navigate(`/referee/races/${race.id}/results`)}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-300"
                      >
                        Ghi kết quả
                      </button>
                      <button
                        onClick={() => updateRaceStatus(race.id, "finished")}
                        className="bg-slate-800 hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-400 font-bold p-2.5 rounded-xl border border-slate-700/50 transition text-xs px-3"
                        title="Kết thúc cuộc đua"
                      >
                        ■ Kết thúc
                      </button>
                    </>
                  ) : race.status === "cancelled" ? (
                    <button
                      disabled
                      className="w-full bg-slate-800/50 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs cursor-not-allowed border border-slate-800"
                    >
                      Đã hủy
                    </button>
                  ) : (
                    /* scheduled */
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => openChecklist(race)}
                        className="flex-1 bg-slate-800/80 hover:bg-slate-800 text-amber-400 border border-slate-700/50 font-bold py-2.5 px-3 rounded-xl text-xs transition duration-200"
                      >
                        Kiểm tra
                      </button>
                      {/* FIX: đổi "active" → "ongoing" */}
                      <button
                        onClick={() => updateRaceStatus(race.id, "ongoing")}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs transition-all duration-200"
                      >
                        ▶ Bắt đầu
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pre-race Checklist Modal */}
      {checklistModal && selectedRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/80">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    Kiểm tra trước đua
                  </h2>
                  <p className="text-amber-400 font-semibold text-sm mt-1">
                    {selectedRace.name ?? selectedRace.round ?? `Cuộc đua #${selectedRace.id}`}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {selectedRace.tournament?.name || "Không xác định"}
                  </p>
                </div>
                <button
                  onClick={() => setChecklistModal(false)}
                  className="text-slate-500 hover:text-slate-300 transition p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Race Info */}
            <div className="p-6 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                Thông tin cuộc đua
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Cự ly",      value: `${selectedRace.distance}m`,                                 icon: "🏁" },
                  { label: "Giờ đua",    value: selectedRace.race_time ? new Date(selectedRace.race_time).toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'}) : '—', icon: "🕐" },
                  { label: "Số ngựa",   value: `${selectedRace.registrations?.length ?? 0} ngựa`,           icon: "🐴" },
                  { label: "Tình trạng", value: "Sẵn sàng",                                                 icon: "✅" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 text-center">
                    <span className="text-lg block">{item.icon}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mt-1">{item.label}</span>
                    <span className="text-sm text-slate-200 font-semibold block mt-0.5">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Horse Inspection Table */}
            <div className="p-6 border-b border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Kiểm tra ngựa & nài ngựa
                </h3>
                <div className="flex items-center gap-2">
                  {selectedRace.registrations?.length > 0 && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      isChecklistComplete()
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}>
                      {isChecklistComplete() ? "✓ Hoàn tất" : "Chưa đủ"}
                    </span>
                  )}
                </div>
              </div>

              {/* Lane assignment toolbar */}
              <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                <span className="text-xs text-slate-400 font-semibold">🏁 Xếp làn:</span>
                <button
                  type="button"
                  onClick={handleAutoAssignLanes}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition"
                >
                  🎲 Chia lane ngẫu nhiên
                </button>
                <button
                  type="button"
                  onClick={handleSaveLanes}
                  disabled={savingLanes}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition disabled:opacity-50"
                >
                  {savingLanes ? "Đang lưu..." : "💾 Lưu làn"}
                </button>
                {laneError && (
                  <span className="text-xs text-rose-400 font-semibold">⚠ {laneError}</span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Làn</th>
                      <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngựa</th>
                      <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nài ngựa</th>
                      <th className="text-center py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cân nặng</th>
                      <th className="text-center py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thiết bị</th>
                      <th className="text-center py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sức khỏe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedRace.registrations || [])
                      .slice()
                      .sort((a, b) => (Number(laneMap[a.id]) || 999) - (Number(laneMap[b.id]) || 999))
                      .map((reg) => (
                      <tr key={reg.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition">
                        {/* Lane input */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={laneMap[reg.id] ?? ""}
                            onChange={e => {
                              setLaneMap(prev => ({ ...prev, [reg.id]: e.target.value }));
                              setLaneError("");
                            }}
                            className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-amber-400 font-bold text-center text-sm outline-none focus:border-amber-500 transition"
                            placeholder="—"
                          />
                        </td>
                        <td className="py-3 px-3 text-slate-200 font-semibold">{reg.horse?.name || "N/A"}</td>
                        <td className="py-3 px-3 text-slate-400">
                          {reg.jockey?.user?.name || reg.jockey?.name || "Chưa có"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={checklistState[reg.id]?.weight || false}
                            onChange={() => toggleCheck(reg.id, "weight")}
                            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={checklistState[reg.id]?.equipment || false}
                            onChange={() => toggleCheck(reg.id, "equipment")}
                            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={checklistState[reg.id]?.health || false}
                            onChange={() => toggleCheck(reg.id, "health")}
                            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                    {(!selectedRace.registrations || selectedRace.registrations.length === 0) && (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-500 text-xs">
                          Không có ngựa đăng ký trong cuộc đua này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes & Actions */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Ghi chú trước đua
                </label>
                <textarea
                  value={checklistNotes}
                  onChange={(e) => setChecklistNotes(e.target.value)}
                  rows="3"
                  placeholder="Nhập ghi chú về tình trạng trước cuộc đua..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-amber-500 transition placeholder-slate-600 resize-none"
                />
              </div>

              {!isChecklistComplete() && selectedRace.registrations?.length > 0 && (
                <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  ⚠️ Vui lòng tích đầy đủ cân nặng, thiết bị và sức khỏe cho tất cả ngựa trước khi bắt đầu.
                </p>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleChecklistSubmit}
                  disabled={checklistSaving}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all duration-300 shadow-md shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-60"
                >
                  {checklistSaving ? "Đang bắt đầu..." : "▶ Xác nhận & Bắt đầu cuộc đua"}
                </button>
                <button
                  onClick={() => setChecklistModal(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition duration-200 border border-slate-700/50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RefereeLayout>
  );
};

export default Races;
