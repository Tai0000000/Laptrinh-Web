import api from '../api/axios';

// ── Overview ─────────────────────────────────────────────────
export const fetchAdminStats = () =>
    api.get('/admin/stats').then(r => r.data);

export const fetchRecentActivity = () =>
    api.get('/admin/recent-activity').then(r => r.data);

// ── User Management ──────────────────────────────────────────
export const fetchUsers = (search = '', role = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role)   params.append('role',   role);
    return api.get(`/admin/users?${params}`).then(r => r.data);
};

export const changeUserRole = (userId, role) =>
    api.put(`/admin/users/${userId}/role`, { role }).then(r => r.data);

export const toggleUserLock = (userId) =>
    api.put(`/admin/users/${userId}/toggle-lock`).then(r => r.data);

// ── Registration Approval ────────────────────────────────────
export const fetchRegistrations = ({ status = 'pending', tournamentId = '', raceId = '' } = {}) => {
    const params = new URLSearchParams();
    if (status)       params.append('status',        status);
    if (tournamentId) params.append('tournament_id', tournamentId);
    if (raceId)       params.append('race_id',       raceId);
    return api.get(`/admin/registrations?${params}`).then(r => r.data);
};

export const updateRegistrationStatus = (id, status) =>
    api.put(`/admin/registrations/${id}/status`, { status }).then(r => r.data);

// ── Races (for dropdowns & result entry) ─────────────────────
export const fetchAdminRaces = () =>
    api.get('/admin/races').then(r => r.data);

// ── Result Entry ─────────────────────────────────────────────
export const submitRaceResults = (raceId, results) =>
    api.post(`/admin/races/${raceId}/results`, { results }).then(r => r.data);

export const fetchRaceResults = (raceId) =>
    api.get(`/admin/races/${raceId}/results`).then(r => r.data);

// ── Leaderboard ───────────────────────────────────────────────
export const fetchLeaderboard = ({ tournamentId = '', round = '', raceId = '' } = {}) => {
    const params = new URLSearchParams();
    if (tournamentId) params.append('tournament_id', tournamentId);
    if (round)        params.append('round',         round);
    if (raceId)       params.append('race_id',       raceId);
    return api.get(`/admin/leaderboard?${params}`).then(r => r.data);
};
