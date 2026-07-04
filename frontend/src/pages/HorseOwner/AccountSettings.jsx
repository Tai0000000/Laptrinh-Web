import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import HorseOwnerLayout from '../../components/HorseOwner/HorseOwnerLayout';
import SuccessModal from '../../components/SuccessModal';

const AccountSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ show: false, title: '', msg: '' });

  useEffect(() => {
    api.get(`/owners/${user?.id}`)
      .then((response) => {
        const data = response.data?.data ?? response.data;
        setFormData({
          name:     data.name     ?? '',
          email:    data.email    ?? '',
          phone:    data.phone    ?? '',
          location: data.location ?? '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    api.put(`/owners/${user?.id}`, {
      name:     formData.name,
      email:    formData.email,
      phone:    formData.phone,
      location: formData.location,
    })
    .then((response) => {
      const data = response.data?.data ?? response.data;
      setFormData(prev => ({
        ...prev,
        name:     data.name     ?? prev.name,
        email:    data.email    ?? prev.email,
        phone:    data.phone    ?? prev.phone,
        location: data.location ?? prev.location,
      }));
      setSuccessMessage({
        show: true,
        title: 'Đã cập nhật',
        msg: 'Thông tin tài khoản đã được lưu thành công!',
      });
    })
    .catch((err) => {
      alert(err.response?.data?.message || 'Không thể cập nhật. Vui lòng thử lại.');
    })
    .finally(() => setSaving(false));
  };

  return (
    <HorseOwnerLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Cài đặt tài khoản</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin và tuỳ chọn tài khoản</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600 font-semibold">
            Đang tải thông tin...
          </div>
        ) : (
          <>
            {/* Thông tin cá nhân */}
            <div className="bg-white rounded-lg shadow p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin cá nhân</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Họ và tên</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Địa chỉ</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-8 rounded-lg transition-colors shadow-md disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>

            {/* Bảo mật */}
            <div className="bg-white rounded-lg shadow p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Bảo mật</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-800">Mật khẩu</p>
                    <p className="text-gray-500 text-sm">Thay đổi mật khẩu đăng nhập</p>
                  </div>
                  <button className="text-blue-500 hover:text-blue-700 font-semibold">Đổi mật khẩu</button>
                </div>
              </div>
            </div>

            {/* Thông báo */}
            <div className="bg-white rounded-lg shadow p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông báo</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input type="checkbox" id="email-notifications" className="w-4 h-4" defaultChecked />
                  <label htmlFor="email-notifications" className="ml-3 text-gray-800 font-semibold">
                    Email thông báo kết quả cuộc đua
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="horse-updates" className="w-4 h-4" defaultChecked />
                  <label htmlFor="horse-updates" className="ml-3 text-gray-800 font-semibold">
                    Cập nhật về ngựa của bạn
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="tournament-alerts" className="w-4 h-4" defaultChecked />
                  <label htmlFor="tournament-alerts" className="ml-3 text-gray-800 font-semibold">
                    Thông báo giải đấu và cuộc đua
                  </label>
                </div>
              </div>
            </div>

            {/* Vùng nguy hiểm */}
            <div className="bg-red-50 rounded-lg border-2 border-red-200 shadow p-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Vùng nguy hiểm</h2>
              <p className="text-red-500 text-sm mb-4">Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.</p>
              <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                Xóa tài khoản
              </button>
            </div>
          </>
        )}
      </div>

      <SuccessModal
        isOpen={successMessage.show}
        title={successMessage.title}
        message={successMessage.msg}
        onClose={() => setSuccessMessage(prev => ({ ...prev, show: false }))}
      />
    </HorseOwnerLayout>
  );
};

export default AccountSettings;
