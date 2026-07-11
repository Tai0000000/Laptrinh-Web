<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tournament;
use App\Models\Race;
use App\Models\Horse;
use App\Models\HorseOwner;
use App\Models\Jockey;
use App\Models\Registration;
use App\Models\User;
use App\Models\RaceReferee;
use App\Models\Spectator;
use App\Models\RaceResult;
use App\Models\Violation;
use App\Models\Bet;
use App\Models\Prize;
use App\Models\JockeyContract;
use Illuminate\Support\Facades\Hash;

class HorseRacingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin Hệ thống',
            'email' => 'admin@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'admin'
        ]);

        $ownerUser = new User();
        $ownerUser->id = 10;
        $ownerUser->name = 'Nguyễn Văn Hoàng';
        $ownerUser->email = 'owner@horseracing.com';
        $ownerUser->password = Hash::make('password123');
        $ownerUser->role = 'horse_owner';
        $ownerUser->save();

        $owner = new HorseOwner();
        $owner->id = 10;
        $owner->user_id = 10;
        $owner->save();

        $jockeyUser1 = User::create([
            'name' => 'Trần Văn An',
            'email' => 'jockey1@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'jockey'
        ]);
        $j1 = Jockey::create([
            'user_id' => $jockeyUser1->id,
            'experience_years' => 5,
            'license_number' => 'JC001'
        ]);

        $jockeyUser2 = User::create([
            'name' => 'Lê Thị Mỹ Dung',
            'email' => 'jockey2@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'jockey'
        ]);
        $j2 = Jockey::create([
            'user_id' => $jockeyUser2->id,
            'experience_years' => 3,
            'license_number' => 'JC002'
        ]);

        $jockeyUser3 = User::create([
            'name' => 'Phạm Quốc Hùng',
            'email' => 'jockey3@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'jockey'
        ]);
        $j3 = Jockey::create([
            'user_id' => $jockeyUser3->id,
            'experience_years' => 7,
            'license_number' => 'JC003'
        ]);

        $jockeyUser4 = User::create([
            'name' => 'Hoàng Thị Mỹ Duyên',
            'email' => 'jockey4@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'jockey'
        ]);
        $j4 = Jockey::create([
            'user_id' => $jockeyUser4->id,
            'experience_years' => 4,
            'license_number' => 'JC004'
        ]);

        // Seed Jockey Contracts
        JockeyContract::create([
            'jockey_id' => $j1->id,
            'horse_owner_id' => $owner->id,
            'status' => 'active',
            'start_date' => now()->subMonths(2),
            'end_date' => now()->addMonths(10),
        ]);

        JockeyContract::create([
            'jockey_id' => $j2->id,
            'horse_owner_id' => $owner->id,
            'status' => 'active',
            'start_date' => now()->subMonths(1),
            'end_date' => now()->addMonths(11),
        ]);

        JockeyContract::create([
            'jockey_id' => $j3->id,
            'horse_owner_id' => $owner->id,
            'status' => 'pending',
            'start_date' => now(),
            'end_date' => now()->addYear(),
        ]);

        JockeyContract::create([
            'jockey_id' => $j4->id,
            'horse_owner_id' => $owner->id,
            'status' => 'rejected',
            'start_date' => now(),
            'end_date' => now()->addYear(),
        ]);

        $refereeUser = User::create([
            'name' => 'Trọng Tài Minh',
            'email' => 'referee@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'referee'
        ]);
        $referee = RaceReferee::create([
            'user_id' => $refereeUser->id
        ]);

        $spectatorUser = User::create([
            'name' => 'Nguyễn Khánh Ly',
            'email' => 'spectator@horseracing.com',
            'password' => Hash::make('password123'),
            'role' => 'spectator'
        ]);
        $spectator = Spectator::create([
            'user_id' => $spectatorUser->id
        ]);

        $horse1 = Horse::create([
            'name' => 'Thần Gió',
            'age' => 4,
            'breed' => 'Thoroughbred',
            'horse_owner_id' => 10,
            'status' => 'active'
        ]);

        $horse2 = Horse::create([
            'name' => 'Xích Thố',
            'age' => 5,
            'breed' => 'Arabian',
            'horse_owner_id' => 10,
            'status' => 'resting'
        ]);

        $horse3 = Horse::create([
            'name' => 'Bạch Mã',
            'age' => 3,
            'breed' => 'Quarter Horse',
            'horse_owner_id' => 10,
            'status' => 'injured'
        ]);

        $horse4 = Horse::create([
            'name' => 'Hắc Long',
            'age' => 4,
            'breed' => 'Appaloosa',
            'horse_owner_id' => 10,
            'status' => 'retired'
        ]);

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

        $race1 = Race::create([
            'tournament_id' => $tournament1->id,
            'round' => 'Vòng loại Bảng A',
            'name' => 'Chặng 1 - Khởi Động',
            'race_time' => now()->addDays(3)->addHours(14)->format('Y-m-d H:i:s'),
            'distance' => 1000,
            'max_horses' => 8,
            'status' => 'finished'
        ]);

        $race2 = Race::create([
            'tournament_id' => $tournament1->id,
            'round' => 'Vòng loại Bảng A',
            'name' => 'Chặng 2 - Bứt Tốc',
            'race_time' => now()->addDays(4)->addHours(16)->format('Y-m-d H:i:s'),
            'distance' => 1200,
            'max_horses' => 8,
            'status' => 'scheduled'
        ]);

        $race3 = Race::create([
            'tournament_id' => $tournament2->id,
            'round' => 'Chung Kết',
            'name' => 'Cup Mùa Hè',
            'race_time' => now()->addWeeks(3)->addHours(15)->format('Y-m-d H:i:s'),
            'distance' => 1500,
            'max_horses' => 8,
            'status' => 'scheduled'
        ]);

        $reg1 = Registration::create([
            'race_id' => $race1->id,
            'horse_id' => $horse1->id,
            'jockey_id' => $j1->id,
            'lane' => 1,
            'status' => 'confirmed',
            'odds' => 2.5
        ]);

        $reg2 = Registration::create([
            'race_id' => $race1->id,
            'horse_id' => $horse2->id,
            'jockey_id' => $j2->id,
            'lane' => 2,
            'status' => 'confirmed',
            'odds' => 3.0
        ]);

        $reg3 = Registration::create([
            'race_id' => $race1->id,
            'horse_id' => $horse3->id,
            'jockey_id' => $j3->id,
            'lane' => 3,
            'status' => 'confirmed',
            'odds' => 4.0
        ]);

        $reg4 = Registration::create([
            'race_id' => $race1->id,
            'horse_id' => $horse4->id,
            'jockey_id' => $j4->id,
            'lane' => 4,
            'status' => 'confirmed',
            'odds' => 5.0
        ]);

        Registration::create([
            'race_id' => $race2->id,
            'horse_id' => $horse1->id,
            'jockey_id' => $j1->id,
            'lane' => 1,
            'status' => 'confirmed',
            'odds' => 2.5
        ]);

        Registration::create([
            'race_id' => $race2->id,
            'horse_id' => $horse2->id,
            'jockey_id' => $j2->id,
            'lane' => 2,
            'status' => 'confirmed',
            'odds' => 3.0
        ]);

        Registration::create([
            'race_id' => $race3->id,
            'horse_id' => $horse1->id,
            'jockey_id' => $j1->id,
            'lane' => 1,
            'status' => 'confirmed',
            'odds' => 2.5
        ]);

        Registration::create([
            'race_id' => $race3->id,
            'horse_id' => $horse2->id,
            'jockey_id' => $j2->id,
            'lane' => 2,
            'status' => 'confirmed',
            'odds' => 3.0
        ]);

        $res1 = RaceResult::create([
            'race_id' => $race1->id,
            'registration_id' => $reg1->id,
            'rank' => 1,
            'finish_time' => '01:45.23',
            'notes' => 'Thắng thuyết phục'
        ]);

        $res2 = RaceResult::create([
            'race_id' => $race1->id,
            'registration_id' => $reg2->id,
            'rank' => 2,
            'finish_time' => '01:47.88',
            'notes' => 'Bám đuổi sát sao'
        ]);

        $res3 = RaceResult::create([
            'race_id' => $race1->id,
            'registration_id' => $reg3->id,
            'rank' => 3,
            'finish_time' => '01:50.12',
            'notes' => 'Cán đích thứ ba'
        ]);

        Violation::create([
            'race_id' => $race1->id,
            'registration_id' => $reg4->id,
            'referee_id' => $referee->id,
            'violation_type' => 'Cản địa trái phép',
            'notes' => 'Nài ngựa di chuyển sai làn đường cố ý chèn đối thủ',
            'status' => 'confirmed'
        ]);

        $bet = Bet::create([
            'user_id' => $spectatorUser->id,
            'registration_id' => $reg1->id,
            'amount' => 500000,
            'prediction_type' => 'win',
            'status' => 'won'
        ]);

        Prize::create([
            'race_result_id' => $res1->id,
            'winner_user_id' => $ownerUser->id,
            'amount' => 10000000.00,
            'prize_type' => 'race_reward'
        ]);

        Prize::create([
            'bet_id' => $bet->id,
            'winner_user_id' => $spectatorUser->id,
            'amount' => 1500000.00,
            'prize_type' => 'prediction_reward'
        ]);
    }
}
