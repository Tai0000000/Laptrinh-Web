import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-10 text-slate-600">
                Please log in to view the dashboard.
            </div>
        );
    }

    const renderRoleDashboard = () => {
        switch (user.role) {
            case 'horse_owner':
                return <HorseOwnerDashboard />;
            case 'jockey':
                return <JockeyDashboard />;
            case 'race_referee':
                return <RefereeDashboard />;
            case 'spectator':
                return <SpectatorDashboard />;
            case 'admin':
                return <AdminDashboard />;
            default:
                return <div className="text-rose-600 font-medium">Invalid account role detected.</div>;
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur-xl">
                <h1 className="mb-2 text-3xl font-black text-slate-900">Dashboard</h1>
                <p className="mb-6 text-slate-600">
                    Welcome back, <strong className="text-slate-950">{user.name}</strong>! You are logged in as{' '}
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 capitalize">
                        {user.role?.replace('_', ' ')}
                    </span>
                </p>
                <hr className="my-6 border-slate-200" />
                {renderRoleDashboard()}
            </div>
        </div>
    );
};

// Sub-dashboards for specific roles
const HorseOwnerDashboard = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Horse Owner Management</h2>
        <p className="text-sm text-slate-600">Access and coordinate your racing horses, hire jockeys, and apply for upcoming races.</p>
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">🐴 Manage Horses</h3>
                <p className="mt-1 text-xs text-slate-500">Register new horses and update existing stables.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">🏆 Race Sign Up</h3>
                <p className="mt-1 text-xs text-slate-500">Enroll your horses into Spring Tournament or Golden Cup.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">🤠 Hire Jockeys</h3>
                <p className="mt-1 text-xs text-slate-500">Send racing proposals to active jockeys.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">💰 Track Earnings</h3>
                <p className="mt-1 text-xs text-slate-500">View tournament rewards and leaderboard placements.</p>
            </div>
        </div>
    </div>
);

const JockeyDashboard = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Jockey Racing Center</h2>
        <p className="text-sm text-slate-600">Review pending ride offers from owners, view schedule, and track racing career highlights.</p>
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">✉️ Pending Invitations</h3>
                <p className="mt-1 text-xs text-slate-500">Accept or reject ride offers from horse owners.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">📅 Race Schedule</h3>
                <p className="mt-1 text-xs text-slate-500">Check dates, times, and race locations.</p>
            </div>
        </div>
    </div>
);

const RefereeDashboard = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Race Referee Hub</h2>
        <p className="text-sm text-slate-600">Validate horse/jockey details on track, enter official finish times, and submit incident logs.</p>
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">📝 Record Race Results</h3>
                <p className="mt-1 text-xs text-slate-500">Input race rankings, final times, and official comments.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">🚦 Live Status Controls</h3>
                <p className="mt-1 text-xs text-slate-500">Mark races as ongoing, finished, or cancelled.</p>
            </div>
        </div>
    </div>
);

const SpectatorDashboard = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Spectator Portal</h2>
        <p className="text-sm text-slate-600">Watch live races, check tournament tables, and place predictions on upcoming contests.</p>
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">💸 Prediction & Betting</h3>
                <p className="mt-1 text-xs text-slate-500">Place cược (bets) on your favorite horse & jockey duos.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">📊 Live Rankings</h3>
                <p className="mt-1 text-xs text-slate-500">Check current season standings and leaderboard status.</p>
            </div>
        </div>
    </div>
);

const AdminDashboard = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">System Admin Control Room</h2>
        <p className="text-sm text-slate-600">Oversee users, setup racing tournaments, declare races, and manage global system variables.</p>
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">👥 User Directory</h3>
                <p className="mt-1 text-xs text-slate-500">Inspect and coordinate spectator, jockey, and owner accounts.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">🏗️ Create Tournaments</h3>
                <p className="mt-1 text-xs text-slate-500">Configure new tournaments, schedules, and race details.</p>
            </div>
        </div>
    </div>
);

export default Dashboard;
