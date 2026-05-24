import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user')
            .then(res => setUser(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Đang tải...</div>;
    if (!user) return <div>Vui lòng đăng nhập trước.</div>;

    const renderRoleDashboard = () => {
        switch (user.role) {
            case 'horse_owner':
                return <HorseOwnerDashboard />;
            case 'jockey':
                return <JockeyDashboard />;
            case 'referee':
                return <RefereeDashboard />;
            case 'spectator':
                return <SpectatorDashboard />;
            case 'admin':
                return <AdminDashboard />;
            default:
                return <div>Vai trò không hợp lệ.</div>;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Bảng điều khiển</h1>
            <p className="mb-6">Chào mừng, {user.name} ({user.role})</p>
            <hr className="my-6" />
            {renderRoleDashboard()}
        </div>
    );
};

// Các sub-component cho các vai trò khác nhau (thường nằm ở các file riêng biệt)
const HorseOwnerDashboard = () => (
    <div>
        <h2 className="text-xl font-semibold mb-3">Quản lý Chủ ngựa</h2>
        <ul className="list-disc pl-5 space-y-2">
            <li>Quản lý ngựa</li>
            <li>Đăng ký giải đấu</li>
            <li>Thuê nài ngựa (Jockey)</li>
            <li>Xác nhận tham gia</li>
        </ul>
    </div>
);

const JockeyDashboard = () => (
    <div>
        <h2 className="text-xl font-semibold mb-3">Bảng điều khiển Nài ngựa</h2>
        <ul className="list-disc pl-5 space-y-2">
            <li>Xem lời mời</li>
            <li>Lịch đua</li>
            <li>Thống kê thành tích</li>
        </ul>
    </div>
);

const RefereeDashboard = () => (
    <div>
        <h2 className="text-xl font-semibold mb-3">Bảng điều khiển Trọng tài</h2>
        <ul className="list-disc pl-5 space-y-2">
            <li>Xác minh ngựa/nài ngựa</li>
            <li>Ghi nhận kết quả cuộc đua</li>
            <li>Gửi báo cáo sự cố</li>
        </ul>
    </div>
);

const SpectatorDashboard = () => (
    <div>
        <h2 className="text-xl font-semibold mb-3">Giao diện Khán giả</h2>
        <ul className="list-disc pl-5 space-y-2">
            <li>Theo dõi cuộc đua trực tiếp</li>
            <li>Bảng xếp hạng giải đấu</li>
            <li>Dự đoán & Đặt cược</li>
        </ul>
    </div>
);

const AdminDashboard = () => (
    <div>
        <h2 className="text-xl font-semibold mb-3">Quản trị hệ thống</h2>
        <ul className="list-disc pl-5 space-y-2">
            <li>Quản lý người dùng</li>
            <li>Thiết lập giải đấu</li>
            <li>Cấu hình hệ thống</li>
        </ul>
    </div>
);

export default Dashboard;
