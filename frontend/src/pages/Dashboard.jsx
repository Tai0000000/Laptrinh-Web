import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PredictionHistory from '../components/PredictionHistory';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        // Giả lập lấy thông tin user (trong thực tế sẽ gọi api.get('/user'))
        const mockUser = { name: 'Nguyễn Văn Khán Giả', role: 'spectator', balance: 500 };
        setUser(mockUser);

        // Lấy lịch sử dự đoán
        api.get('/bets')
            .then(res => {
                // Nếu backend trả về dữ liệu mẫu (Stub)
                if (res.data.data.length === 0) {
                    const mockPredictions = [
                        { id: 1, race_name: "Vòng loại Bảng A - Sprint", tournament_name: "Grand Royal Derby 2026", horse_name: "Thần Gió", lane: 1, prediction_type: "win", status: "won", payout: 25.0 },
                        { id: 2, race_name: "Vòng loại Bảng B", tournament_name: "Grand Royal Derby 2026", horse_name: "Xích Thố", lane: 2, prediction_type: "place", status: "lost", payout: 0 },
                        { id: 3, race_name: "Chung kết Cup Mùa Hè", tournament_name: "Summer Sprint Cup", horse_name: "Bạch Mã", lane: 3, prediction_type: "show", status: "pending", payout: 0 },
                    ];
                    setPredictions(mockPredictions);
                } else {
                    setPredictions(res.data.data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );
    
    if (!user) return <div className="text-center py-20">Vui lòng đăng nhập trước.</div>;

    const renderRoleDashboard = () => {
        switch (user.role) {
            case 'horse_owner':
                return <HorseOwnerDashboard />;
            case 'jockey':
                return <JockeyDashboard />;
            case 'referee':
                return <RefereeDashboard />;
            case 'spectator':
                return <SpectatorDashboard predictions={predictions} />;
            case 'admin':
                return <AdminDashboard />;
            default:
                return <div>Vai trò không hợp lệ.</div>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Bảng điều khiển</h1>
                    <p className="text-slate-500">Chào mừng trở lại, <span className="font-bold text-indigo-600">{user.name}</span></p>
                </div>
                <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số dư tài khoản</span>
                    <span className="text-2xl font-black text-green-400">${user.balance.toFixed(2)}</span>
                </div>
            </div>
            
            {renderRoleDashboard()}
        </div>
    );
};

// Các sub-component cho các vai trò khác nhau
const HorseOwnerDashboard = () => (
    <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Quản lý Chủ ngựa</h2>
            <ul className="space-y-3">
                <li className="flex items-center text-slate-600"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>Quản lý ngựa</li>
                <li className="flex items-center text-slate-600"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>Đăng ký giải đấu</li>
                <li className="flex items-center text-slate-600"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>Thuê nài ngựa (Jockey)</li>
            </ul>
        </div>
    </div>
);

const JockeyDashboard = () => (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Bảng điều khiển Nài ngựa</h2>
        <p className="text-slate-500">Xem lịch đua và thống kê thành tích của bạn.</p>
    </div>
);

const RefereeDashboard = () => (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Bảng điều khiển Trọng tài</h2>
        <p className="text-slate-500">Xác minh thông tin và ghi nhận kết quả cuộc đua.</p>
    </div>
);

const SpectatorDashboard = ({ predictions }) => (
    <div className="space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-lg">
                <h3 className="text-sm font-bold opacity-80 uppercase mb-2">Tổng số dự đoán</h3>
                <p className="text-4xl font-black">{predictions.length}</p>
            </div>
            <div className="bg-green-500 p-8 rounded-3xl text-white shadow-lg">
                <h3 className="text-sm font-bold opacity-80 uppercase mb-2">Số lần thắng</h3>
                <p className="text-4xl font-black">{predictions.filter(p => p.status === 'won').length}</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-lg">
                <h3 className="text-sm font-bold opacity-80 uppercase mb-2">Tỷ lệ thắng</h3>
                <p className="text-4xl font-black">
                    {predictions.length > 0 
                        ? Math.round((predictions.filter(p => p.status === 'won').length / predictions.length) * 100) 
                        : 0}%
                </p>
            </div>
        </div>
        
        <PredictionHistory predictions={predictions} />
    </div>
);

const AdminDashboard = () => (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Quản trị hệ thống</h2>
        <p className="text-slate-500">Quản lý người dùng và cấu hình hệ thống.</p>
    </div>
);

export default Dashboard;
