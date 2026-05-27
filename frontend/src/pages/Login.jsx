import React from 'react';

const Login = () => {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 mt-12">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Đăng nhập</h2>
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="example@gmail.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-gray-600">
            <input type="checkbox" className="mr-2 rounded text-indigo-600" />
            Ghi nhớ đăng nhập
          </label>
          <a href="#" className="text-indigo-600 hover:underline">Quên mật khẩu?</a>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md font-bold hover:bg-indigo-700 transition-colors shadow-md"
        >
          Đăng nhập
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600">
        Chưa có tài khoản? <a href="#" className="text-indigo-600 font-bold hover:underline">Đăng ký ngay</a>
      </div>
    </div>
  );
};

export default Login;
