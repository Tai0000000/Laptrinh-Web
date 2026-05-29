import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur-xl sm:p-12">
            <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
              Hệ Thống Đua Ngựa Chuyên Nghiệp
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl leading-tight">
              Quản lý giải đua ngựa <br />
              <span className="text-indigo-600">Gọn, Rõ và Hiện đại.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Theo dõi trực tiếp, đặt cược thông minh và trải nghiệm những giải đấu kịch tính nhất. 
              Hệ thống cung cấp đầy đủ công cụ cho Chủ ngựa, Nài ngựa, Trọng tài và Khán giả.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/tournaments"
                className="rounded-full bg-slate-900 px-8 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-slate-800"
              >
                Khám phá ngay
              </Link>
              <Link
                to="/dashboard"
                className="rounded-full border border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 shadow-sm"
              >
                Vào Dashboard
              </Link>
            </div>
          </div>

          {/* Role Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ['Horse Owner', 'Đăng ký ngựa, quản lý đội hình và theo dõi tiến độ.'],
              ['Jockey', 'Nhận lịch đua, lời mời và thống kê thành tích.'],
              ['Referee', 'Kiểm tra thông tin, ghi nhận kết quả và sự cố.'],
              ['Admin', 'Quản lý người dùng, giải đấu và cấu hình hệ thống.'],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-white/70 bg-slate-950 p-6 text-white shadow-xl hover:scale-[1.02] transition-transform">
                <h2 className="text-lg font-bold text-indigo-400">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Giải đấu sắp tới</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Xem danh sách các cuộc đua chuẩn bị diễn ra trong tuần này với đầy đủ thông tin chi tiết.</p>
            <Link to="/tournaments" className="text-indigo-600 font-bold hover:text-indigo-700 inline-flex items-center">
              Xem chi tiết <span className="ml-2">&rarr;</span>
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Dự đoán & Đặt cược</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Phân tích phong độ ngựa và nài ngựa để đưa ra lựa chọn chính xác nhất cho mỗi vòng đua.</p>
            <Link to="/predictions" className="text-indigo-600 font-bold hover:text-indigo-700 inline-flex items-center">
              Đặt cược ngay <span className="ml-2">&rarr;</span>
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 01-2 2h2a2 2 0 012-2zm7-5v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Bảng xếp hạng</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Vinh danh những nài ngựa và chú ngựa có thành tích xuất sắc nhất trong hệ thống giải đấu.</p>
            <Link to="/leaderboard" className="text-indigo-600 font-bold hover:text-indigo-700 inline-flex items-center">
              Xem bảng xếp hạng <span className="ml-2">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
