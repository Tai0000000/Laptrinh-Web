function Login() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur-xl sm:p-10">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Đăng nhập</h1>
        <p className="mt-3 text-slate-600">Màn hình mẫu để nối API xác thực sau khi backend hoàn thiện.</p>

        <form className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              placeholder="admin@example.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Mật khẩu</span>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </label>

          <button
            type="button"
            className="rounded-full bg-slate-900 px-5 py-3 font-medium text-white shadow-glow transition hover:-translate-y-0.5"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;