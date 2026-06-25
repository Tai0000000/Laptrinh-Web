import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeroBanner = ({ nextRaceTime, raceTitle }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(nextRaceTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextRaceTime]);

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-xl p-3 min-w-[80px] border border-white/20">
      <span className="text-3xl md:text-4xl font-black text-white">{value.toString().padStart(2, '0')}</span>
      <span className="text-xs uppercase tracking-widest text-indigo-200 font-bold mt-1">{label}</span>
    </div>
  );

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 py-16 px-8 shadow-2xl">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div>
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-bold text-indigo-400 border border-indigo-500/20">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            SỰ KIỆN SẮP DIỄN RA
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            {raceTitle} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Khởi tranh sau:</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-xl leading-relaxed">
            Đừng bỏ lỡ cơ hội chứng kiến những chú ngựa xuất sắc nhất tranh tài. Đặt cược ngay để nhận ưu đãi hấp dẫn!
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/predictions" className="rounded-full bg-indigo-600 px-8 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-indigo-500">
              Đặt cược ngay
            </Link>
            <Link to="/tournaments" className="rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold text-white transition hover:bg-white/10 backdrop-blur-sm">
              Xem lịch thi đấu
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-end">
          <div className="flex gap-4 md:gap-6">
            <TimeUnit value={timeLeft.days} label="Ngày" />
            <TimeUnit value={timeLeft.hours} label="Giờ" />
            <TimeUnit value={timeLeft.minutes} label="Phút" />
            <TimeUnit value={timeLeft.seconds} label="Giây" />
          </div>
          <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">Thống kê nhanh</h3>
              <span className="text-indigo-400 text-xs font-bold uppercase">Live</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Số ngựa tham gia:</span>
                <span className="text-white font-bold">12 Chiến mã</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tổng giải thưởng:</span>
                <span className="text-green-400 font-bold">$25,000</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-4">
                <div className="bg-indigo-500 h-full rounded-full w-3/4 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-2 italic">75% vé đã được đặt</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
