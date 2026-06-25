import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/HeroBanner';
import FeaturedTournaments from '../components/FeaturedTournaments';
import UpcomingRaces from '../components/UpcomingRaces';
import api from '../api/axios';

const Home = () => {
  // State cho loading
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);
  const [races, setRaces] = useState([]);
  const [nextRace, setNextRace] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy dữ liệu từ API thật
        const [tournamentRes, raceRes] = await Promise.all([
          api.get('/public/tournaments'),
          api.get('/public/races/live'),
        ]);

        // Format data để phù hợp với components
        const formattedTournaments = tournamentRes.data.map(t => ({
          id: t.id,
          name: t.name,
          location: t.location,
          start_date: t.start_date,
          end_date: t.end_date,
          category: 'National',
          prize_pool: '$50,000',
          race_count: t.races ? t.races.length : 3,
          horse_count: 30,
          date_range: `${new Date(t.start_date).getDate()}/${new Date(t.start_date).getMonth()+1} - ${new Date(t.end_date).getDate()}/${new Date(t.end_date).getMonth()+1}/${new Date(t.end_date).getFullYear()}`
        }));

        const formattedRaces = raceRes.data.map(r => ({
          id: r.id,
          name: r.name,
          distance: r.distance,
          time: new Date(r.race_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          tournament_name: r.tournament?.name || 'Giải đấu',
          status: r.status === 'scheduled' ? 'Sắp bắt đầu' : r.status
        }));

        setTournaments(formattedTournaments);
        setRaces(formattedRaces);
        
        // Lấy cuộc đua sớm nhất làm next race
        if (formattedRaces.length > 0) {
          const sortedRaces = [...formattedRaces].sort((a, b) => 
            new Date(a.race_time) - new Date(b.race_time)
          );
          setNextRace(sortedRaces[0]);
        }

      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        
        // Nếu lỗi API, dùng dữ liệu mẫu
        const mockTournaments = [
          {
            id: 1,
            name: "Giải Đua Ngựa Hoàng Gia Grand Prix 2026",
            location: "Sân đua An Dương, TP. HCM",
            date_range: "14/06 - 18/06/2026",
            category: "Grand Prix",
            race_count: 3,
            horse_count: 30,
            prize_pool: "$50,000"
          },
          {
            id: 2,
            name: "Giải Đua Mùa Hè Sprint Cup",
            location: "Sân đua Thủ Đức, TP. HCM",
            date_range: "05/07 - 08/07/2026",
            category: "Sprint Cup",
            race_count: 2,
            horse_count: 25,
            prize_pool: "$30,000"
          }
        ];
        
        const mockRaces = [
          {
            id: 1,
            time: "14:30",
            name: "Vòng loại Bảng A - Chặng 1",
            tournament_name: "Giải Đua Hoàng Gia Grand Prix 2026",
            distance: 1000,
            status: "Sắp bắt đầu"
          },
          {
            id: 2,
            time: "16:00",
            name: "Vòng loại Bảng A - Chặng 2",
            tournament_name: "Giải Đua Hoàng Gia Grand Prix 2026",
            distance: 1200,
            status: "Sắp bắt đầu"
          },
          {
            id: 3,
            time: "15:45",
            name: "Chung kết Cup Mùa Hè",
            tournament_name: "Giải Đua Mùa Hè Sprint Cup",
            distance: 1500,
            status: "Sắp bắt đầu"
          }
        ];
        
        setTournaments(mockTournaments);
        setRaces(mockRaces);
        setNextRace(mockRaces[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Nếu đang loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section với Countdown */}
      <HeroBanner 
        nextRaceTime={nextRace ? new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)} 
        raceTitle={nextRace?.name || "Giải Đua Ngựa Hoàng Gia 2026"} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Section Giải đấu nổi bật */}
        <FeaturedTournaments tournaments={tournaments} />

        {/* Section Lịch đua sắp tới */}
        <UpcomingRaces races={races} />

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
