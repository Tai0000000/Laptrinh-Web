import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur-xl sm:p-10">
          <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">
            React + Vite đã sẵn sàng
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Quản lý giải đua ngựa với giao diện gọn, rõ và dễ mở rộng.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Đây là scaffold frontend React + Vite cho hệ thống quản lý tournament, có sẵn router,
            Axios và cấu trúc page/component cơ bản để phát triển tiếp.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="rounded-full bg-slate-900 px-5 py-3 font-medium text-white shadow-glow transition hover:-translate-y-0.5"
            >
              Vào Dashboard
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Đăng nhập
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {[
            ['Horse Owner', 'Đăng ký ngựa, quản lý đội hình và theo dõi tiến độ.'],
            ['Jockey', 'Nhận lịch đua, lời mời và thống kê thành tích.'],
            ['Referee', 'Kiểm tra thông tin, ghi nhận kết quả và sự cố.'],
            ['Admin', 'Quản lý người dùng, giải đấu và cấu hình hệ thống.'],
          ].map(([title, description]) => (
            <article key={title} className="rounded-3xl border border-white/70 bg-slate-950 p-6 text-white shadow-glow">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;