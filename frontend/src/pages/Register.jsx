import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const { register, error, setError } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('spectator');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password, passwordConfirmation, role);
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration error', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur-xl sm:p-10">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Create Account</h1>
                <p className="mt-3 text-slate-600">Register and choose a demo role to test role-based features.</p>

                {error && (
                    <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-600 border border-rose-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Full Name</span>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Email Address</span>
                        <input
                            type="email"
                            required
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Demo Role Selection</span>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 text-slate-700"
                        >
                            <option value="spectator">Spectator</option>
                            <option value="horse_owner">Horse Owner</option>
                            <option value="jockey">Jockey</option>
                            <option value="race_referee">Race Referee</option>
                            <option value="admin">System Admin</option>
                        </select>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</span>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />
                    </label>

                    <div className="pt-2 flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-full bg-slate-900 px-6 py-3 font-medium text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? 'Creating account...' : 'Register'}
                        </button>
                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 underline">
                            Already have an account? Log in
                        </Link>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default Register;
