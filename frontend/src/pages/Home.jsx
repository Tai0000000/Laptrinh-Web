import React from 'react';

const Home = () => {
  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-indigo-600 rounded-2xl text-white shadow-xl">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Hệ Thống Đua Ngựa Chuyên Nghiệp</h1>
        <p className="text-xl opacity-90 mb-8">Theo dõi trực tiếp, đặt cược thông minh và trải nghiệm những giải đấu kịch tính nhất.</p>
        <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg">
          Khám phá ngay
        </button>
      </section>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Giải đấu sắp tới</h3>
          <p className="text-gray-600 mb-4">Xem danh sách các cuộc đua chuẩn bị diễn ra trong tuần này.</p>
          <a href="/tournaments" className="text-indigo-600 font-medium hover:underline">Xem chi tiết &rarr;</a>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Dự đoán & Đặt cược</h3>
          <p className="text-gray-600 mb-4">Phân tích phong độ ngựa và nài ngựa để đưa ra lựa chọn chính xác.</p>
          <a href="/predictions" className="text-indigo-600 font-medium hover:underline">Đặt cược ngay &rarr;</a>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Bảng xếp hạng</h3>
          <p className="text-gray-600 mb-4">Vinh danh những nài ngựa và chú ngựa có thành tích xuất sắc nhất.</p>
          <a href="/leaderboard" className="text-indigo-600 font-medium hover:underline">Xem bảng xếp hạng &rarr;</a>
        </div>
      </div>
    </div>
  );
};

export default Home;
