import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

/* ── Helpers ──────────────────────────────────────────────── */
const ROLE_MAP = {
    admin:        { label: 'Admin',       cls: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    horse_owner:  { label: 'Chủ ngựa',   cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    jockey:       { label: 'Nài ngựa',   cls: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    race_referee: { label: 'Trọng tài',  cls: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    spectator:    { label: 'Khán giả',   cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
};

const RoleBadge = ({ role }) => {
    const r = ROLE_MAP[role] ?? { label: role, cls: 'bg-slate-700 text-slate-300 border-slate-600' };
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${r.cls}`}>
            {r.label}
        </span>
    );
};

const ALL_ROLES = Object.entries(ROLE_MAP).map(([val, { label }]) => ({ val, label }));

/* ── Main Component ──────────────────────────────────────── */
export default function AdminUsers() {
    const [users, setUsers]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [search, setSearch]         = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [actionLoading, setActionLoading] = useState(null); // userId đang xử lý

    // Modal đổi role
    const [roleModal, setRoleModal] = useState(null); // { user }
    const [newRole, setNewRole]     = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (search)     params.append('search', search);
            if (roleFilter) params.append('role',   roleFilter);
            const res = await api.get(`/admin/users?${params}`);
            setUsers(res.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    /* Khoá / Mở khoá */
    const handleToggleLock = async (user) => {
        setActionLoading(user.id);
        try {
            await api.put(`/admin/users/${user.id}/toggle-lock`);
            setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, is_locked: !u.is_locked } : u
            ));
        } catch (e) {
            alert(e.response?.data?.message || 'Thao tác thất bại.');
        } finally {
            setActionLoading(null);
        }
    };

    /* Mở modal đổi role */
    const openRoleModal = (user) => {
        setRoleModal({ user });
        setNewRole(user.role);
    };

    /* Xác nhận đổi role */
    const confirmChangeRole = async () => {
        if (!roleModal) return;
        setActionLoading(roleModal.user.id);
        try {
            await api.put(`/admin/users/${roleModal.user.id}/role`, { role: newRole });
            setUsers(prev => prev.map(u =>
                u.id === roleModal.user.id ? { ...u, role: newRole } : u
            ));
            setRoleModal(null);
        } catch (e) {
            alert(e.response?.data?.message || 'Đổi role thất bại.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Quản trị</p>
                <h2 className="text-3xl font-black tracking-tight text-white">Quản lý Người dùng</h2>
                <p className="mt-1 text-sm text-slate-400">Tìm kiếm, lọc, đổi vai trò và khoá tài khoản</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-2xl text-sm text-slate-200 outline-none focus:border-emerald-400 placeholder:text-slate-500 transition-colors"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400 cursor-pointer"
                >
                    <option value="">Tất cả vai trò</option>
                    {ALL_ROLES.map(r => (
                        <option key={r.val} value={r.val}>{r.label}</option>
                    ))}
                </select>
                <button
                    onClick={fetchUsers}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
                >
                    🔄 Làm mới
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                        <thead className="bg-slate-950/70 border-b border-white/5">
                            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4">ID</th>
                                <th className="px-5 py-4">Tên</th>
                                <th className="px-5 py-4">Email</th>
                                <th className="px-5 py-4">Vai trò</th>
                                <th className="px-5 py-4">Trạng thái</th>
                                <th className="px-5 py-4">Ngày tạo</th>
                                <th className="px-5 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(7)].map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 rounded-xl bg-white/8 animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                                        Không tìm thấy người dùng nào.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-4 text-slate-500 font-mono text-xs">#{user.id}</td>
                                        <td className="px-5 py-4 font-semibold text-white">{user.name}</td>
                                        <td className="px-5 py-4 text-slate-400">{user.email}</td>
                                        <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                                        <td className="px-5 py-4">
                                            {user.is_locked ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
                                                    🔒 Đã khoá
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                                                    ✓ Hoạt động
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 text-xs">
                                            {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openRoleModal(user)}
                                                    disabled={actionLoading === user.id}
                                                    className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition disabled:opacity-50"
                                                >
                                                    Đổi role
                                                </button>
                                                <button
                                                    onClick={() => handleToggleLock(user)}
                                                    disabled={actionLoading === user.id}
                                                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                                                        user.is_locked
                                                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                            : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                                    }`}
                                                >
                                                    {actionLoading === user.id ? '...' : user.is_locked ? 'Mở khoá' : 'Khoá'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && (
                    <div className="border-t border-white/5 px-5 py-3 text-xs text-slate-500">
                        Tổng: {users.length} người dùng
                    </div>
                )}
            </div>

            {/* Role Change Modal */}
            {roleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="text-base font-bold text-white">Đổi vai trò</h3>
                            <p className="mt-1 text-sm text-slate-400">
                                Người dùng: <span className="font-semibold text-white">{roleModal.user.name}</span>
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vai trò mới</label>
                                <select
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value)}
                                    className="mt-2 w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400"
                                >
                                    {ALL_ROLES.map(r => (
                                        <option key={r.val} value={r.val}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={() => setRoleModal(null)}
                                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10 transition"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={confirmChangeRole}
                                disabled={actionLoading === roleModal.user.id || newRole === roleModal.user.role}
                                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-bold text-slate-950 shadow-lg hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading === roleModal.user.id ? 'Đang lưu...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
