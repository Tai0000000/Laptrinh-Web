import React from 'react';
import HeroBanner from '../components/HeroBanner';
import FeaturedTournaments from '../components/FeaturedTournaments';
import UpcomingRaces from '../components/UpcomingRaces';

const Home = () => {
  // Dữ liệu giả lập (Mock data)
  const nextRaceTime = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2); // 2 ngày tới
  
  const featuredTournaments = [
    {
      id: 1,
      name: "Grand Royal Derby 2026",
      location: "Sân vận động Phú Thọ, TP.HCM",
      date_range: "15/06 - 20/06/2026",
      category: "World Series",
      race_count: 8,
      horse_count: 64,
      prize_pool: "$50,000"
    },
    {
      id: 2,
      name: "Summer Sprint Cup",
      location: "Trường đua Đại Nam, Bình Dương",
      date_range: "01/07 - 05/07/2026",
      category: "Regional",
      race_count: 5,
      horse_count: 40,
      prize_pool: "$20,000"
    },
    {
      id: 3,
      name: "Golden Hoof Championship",
      location: "Hà Nội Hippodrome",
      date_range: "12/08 - 15/08/2026",
      category: "National",
      race_count: 6,
      horse_count: 48,
      prize_pool: "$35,000"
    }
  ];

  const upcomingRaces = [
    {
      id: 101,
      time: "14:30",
      name: "Vòng loại Bảng A - Sprint",
      tournament_name: "Grand Royal Derby 2026",
      distance: 1200,
      status: "Sắp bắt đầu"
    },
    {
      id: 102,
      time: "15:45",
      name: "Chung kết Cup Mùa Hè",
      tournament_name: "Summer Sprint Cup",
      distance: 1600,
      status: "Đang chờ"
    },
    {
      id: 103,
      time: "17:00",
      name: "Đua biểu diễn Horse-Power",
      tournament_name: "National Exhibition",
      distance: 1000,
      status: "Đang chờ"
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section với Countdown */}
      <HeroBanner 
        nextRaceTime={nextRaceTime} 
        raceTitle="Grand Royal Derby 2026" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Section Giải đấu nổi bật */}
        <FeaturedTournaments tournaments={featuredTournaments} />

        {/* Section Lịch đua sắp tới */}
        <UpcomingRaces races={upcomingRaces} />

        {/* Cấu trúc cũ được giữ lại nếu cần bổ sung thêm */}
        <section className="py-12 border-t border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900">Tại sao chọn chúng tôi?</h2>
            <p className="text-slate-500 mt-2">Nền tảng quản lý và đặt cược đua ngựa hàng đầu Việt Nam.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 font-bold text-2xl">01</div>
              <h3 className="font-bold text-xl mb-2">Minh bạch</h3>
              <p className="text-gray-500 text-sm">Mọi kết quả đều được trọng tài xác nhận và ghi lại trực tiếp trên hệ thống.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-2xl">02</div>
              <h3 className="font-bold text-xl mb-2">Nhanh chóng</h3>
              <p className="text-gray-500 text-sm">Cập nhật dữ liệu trực tiếp qua WebSocket với độ trễ cực thấp.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600 font-bold text-2xl">03</div>
              <h3 className="font-bold text-xl mb-2">An toàn</h3>
              <p className="text-gray-500 text-sm">Hệ thống đặt cược bảo mật, nạp rút nhanh chóng và hỗ trợ 24/7.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
