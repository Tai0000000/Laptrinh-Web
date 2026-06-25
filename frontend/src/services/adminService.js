import api from '../api/axios';

/**
 * Fetch high-level KPI stats for admin overview.
 * @returns {Promise<Object>} stats object
 */
export const fetchAdminStats = () =>
  api.get('/admin/stats').then((r) => r.data);

/**
 * Fetch merged recent activity feed for admin overview.
 * @returns {Promise<Array>} list of activity items
 */
export const fetchRecentActivity = () =>
  api.get('/admin/recent-activity').then((r) => r.data);
