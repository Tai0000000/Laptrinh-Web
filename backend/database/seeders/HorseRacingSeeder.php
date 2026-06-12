<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tournament;
use App\Models\Race;
use App\Models\Horse;
use App\Models\HorseOwner;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class HorseRacingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo 1 Admin
        $admin = User::create([
            'name' => 'Admin Hệ thống',
            'email' => 'admin@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'admin'
        ]);

        // Tạo HorseOwner
        $ownerUser = User::create([
            'name' => 'Nguyễn Văn Hoàng',
            'email' => 'owner@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'horse_owner'
        ]);
        
        $owner = HorseOwner::create([
            'user_id' => $ownerUser->id
        ]);

        // Tạo Jockeys
        $jockey1 = User::create([
            'name' => 'Trần Văn An',
            'email' => 'jockey1@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'jockey'
        ]);
        
        $jockey2 = User::create([
            'name' => 'Lê Thị Mỹ Dung',
            'email' => 'jockey2@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'jockey'
        ]);
        
        $jockey3 = User::create([
            'name' => 'Phạm Quốc Hùng',
            'email' => 'jockey3@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'jockey'
        ]);
        
        $jockey4 = User::create([
            'name' => 'Hoàng Thị Mỹ Duyên',
            'email' => 'jockey4@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'jockey'
        ]);

        // Tạo Spectator
        $spectator = User::create([
            'name' => 'Nguyễn Khánh Ly',
            'email' => 'spectator@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'spectator'
        ]);

        // Tạo Horses
        $horse1 = Horse::create([
            'name' => 'Thần Gió',
            'age' => 4,
            'breed' => 'Thoroughbred',
            'horse_owner_id' => $owner->id,
            'status' => 'active'
        ]);
        
        $horse2 = Horse::create([
            'name' => 'Xích Thố',
            'age' => 5,
            'breed' => 'Arabian',
            'horse_owner_id' => $owner->id,
            'status' => 'active'
        ]);
        
        $horse3 = Horse::create([
            'name' => 'Bạch Mã',
            'age' => 3,
            'breed' => 'Quarter Horse',
            'horse_owner_id' => $owner->id,
            'status' => 'active'
        ]);
        
        $horse4 = Horse::create([
            'name' => 'Hắc Long',
            'age' => 4,
            'breed' => 'Appaloosa',
            'horse_owner_id' => $owner->id,
            'status' => 'active'
        ]);

        // Tạo 2 Giải đấu
        $tournament1 = Tournament::create([
            'name' => 'Giải Đua Ngựa Hoàng Gia Grand Prix 2026',
            'location' => 'Sân đua An Dương, TP. HCM',
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(7)->toDateString()
        ]);
        
        $tournament2 = Tournament::create([
            'name' => 'Giải Đua Mùa Hè Sprint Cup',
            'location' => 'Sân đua Thủ Đức, TP. HCM',
            'start_date' => now()->addWeeks(3)->toDateString(),
            'end_date' => now()->addWeeks(4)->toDateString()
        ]);

        // Tạo các cuộc đua cho Giải đấu 1
        $race1 = Race::create([
            'tournament_id' => $tournament1->id,
            'name' => 'Vòng loại Bảng A - Chặng 1',
            'race_time' => now()->addDays(3)->addHours(14)->format('Y-m-d H:i:s'),
            'distance' => 1000,
            'status' => 'scheduled'
        ]);
        
        $race2 = Race::create([
            'tournament_id' => $tournament1->id,
            'name' => 'Vòng loại Bảng A - Chặng 2',
            'race_time' => now()->addDays(4)->addHours(16)->format('Y-m-d H:i:s'),
            'distance' => 1200,
            'status' => 'scheduled'
        ]);
        
        $race3 = Race::create([
            'tournament_id' => $tournament2->id,
            'name' => 'Chung kết Cup Mùa Hè',
            'race_time' => now()->addWeeks(3)->addHours(15)->format('Y-m-d H:i:s'),
            'distance' => 1500,
            'status' => 'scheduled'
        ]);

        // Đăng ký ngựa vào cuộc đua
        Registration::create([
            'race_id' => $race1->id,
            'horse_id' => $horse1->id,
            'jockey_id' => $jockey1->id,
            'lane' => 1,
            'status' => 'confirmed'
        ]);
        
        Registration::create([
            'race_id' => $race1->id,
            'horse_id' => $horse2->id,
            'jockey_id' => $jockey2->id,
            'lane' => 2,
            'status' => 'confirmed'
        ]);
        
        Registration::create([
            'race_id' => $race1->id,
            'horse_id' => $horse3->id,
            'jockey_id' => $jockey3->id,
            'lane' => 3,
            'status' => 'confirmed'
        ]);
        
        Registration::create([
            'race_id' => $race1->id,
            'horse_id' => $horse4->id,
            'jockey_id' => $jockey4->id,
            'lane' => 4,
            'status' => 'confirmed'
        ]);

        Registration::create([
            'race_id' => $race2->id,
            'horse_id' => $horse1->id,
            'jockey_id' => $jockey1->id,
            'lane' => 1,
            'status' => 'confirmed'
        ]);
        
        Registration::create([
            'race_id' => $race2->id,
            'horse_id' => $horse2->id,
            'jockey_id' => $jockey2->id,
            'lane' => 2,
            'status' => 'confirmed'
        ]);
        
        Registration::create([
            'race_id' => $race3->id,
            'horse_id' => $horse1->id,
            'jockey_id' => $jockey1->id,
            'lane' => 1,
            'status' => 'confirmed'
        ]);
        
        Registration::create([
            'race_id' => $race3->id,
            'horse_id' => $horse4->id,
            'jockey_id' => $jockey4->id,
            'lane' => 2,
            'status' => 'confirmed'
        ]);
        
        Registration::create([
            'race_id' => $race3->id,
            'horse_id' => $horse2->id,
            'jockey_id' => $jockey2->id,
            'lane' => 3,
            'status' => 'confirmed'
        ]);
    }
}
