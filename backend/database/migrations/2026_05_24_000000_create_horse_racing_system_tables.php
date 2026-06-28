<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Bảng Users
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['horse_owner', 'jockey', 'referee', 'spectator', 'admin'])->default('spectator');
            $table->rememberToken();
            $table->timestamps();
        });

        // 2. Bảng Horse Owners
        Schema::create('horse_owners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 3. Bảng Jockeys (Nài ngựa)
        Schema::create('jockeys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->integer('experience_years')->default(0);
            $table->string('license_number')->nullable()->unique();
            $table->timestamps();
        });

        // 4. Bảng Race Referees (Trọng tài)
        Schema::create('race_referees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 5. Bảng Spectators (Khán giả)
        Schema::create('spectators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 6. Bảng Admins (Quản trị viên)
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 7. Bảng Horses (Quản lý thông tin Ngựa)
        Schema::create('horses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('age');
            $table->string('breed');
            $table->foreignId('horse_owner_id')->constrained('horse_owners')->onDelete('cascade');
            $table->string('status')->default('active'); // active, injured, retired, resting
            $table->timestamps();
        });

        // 8. Bảng Tournaments (Giải đấu)
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('location');
            $table->timestamps();
        });

        // 9. Bảng Races (Cuộc đua / Vòng đua nhỏ)
        Schema::create('races', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained('tournaments')->onDelete('cascade');
            $table->string('round')->default('Vòng 1');
            $table->string('name');
            $table->dateTime('race_time');
            $table->integer('distance'); // Tính bằng mét
            $table->integer('max_horses')->default(8);
            $table->string('status')->default('scheduled'); // scheduled, ongoing, completed, cancelled
            $table->timestamps();
        });

        // 10. Bảng Đăng Ký (Xếp Ngựa & Nài vào làn đua cụ thể)
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('race_id')->constrained('races')->onDelete('cascade');
            $table->foreignId('horse_id')->constrained('horses')->onDelete('cascade');
            $table->foreignId('jockey_id')->constrained('jockeys')->onDelete('cascade');
            $table->integer('lane')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'rejected', 'withdrawn'])->default('pending');
            $table->timestamps();
        });

        // 11. Bảng Kết Quả Cuộc Đua
        Schema::create('race_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('race_id')->constrained('races')->onDelete('cascade');
            $table->foreignId('registration_id')->constrained('registrations')->onDelete('cascade');
            $table->integer('rank')->nullable();
            $table->string('finish_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 12. Bảng Giao kèo/Lời mời giữa Chủ ngựa và Nài ngựa
        Schema::create('horse_jockey', function (Blueprint $table) {
            $table->id();
            $table->foreignId('horse_id')->constrained('horses')->onDelete('cascade');
            $table->foreignId('jockey_id')->constrained('jockeys')->onDelete('cascade');
            $table->foreignId('race_id')->constrained('races')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->string('reason')->nullable();
            $table->timestamps();
        });

        // 13. Bảng Ghi nhận vi phạm (Do trọng tài lập)
        Schema::create('violations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('race_id')->constrained('races')->onDelete('cascade');
            $table->foreignId('registration_id')->constrained('registrations')->onDelete('cascade');
            $table->foreignId('referee_id')->constrained('race_referees')->onDelete('cascade');
            $table->string('violation_type');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'dismissed'])->default('pending');
            $table->timestamps();
        });

        // 14. Bảng Biên bản thi đấu (Referee Report)
        Schema::create('referee_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('race_id')->unique()->constrained('races')->onDelete('cascade');
            $table->foreignId('referee_id')->constrained('race_referees')->onDelete('cascade');
            $table->text('report_text');
            $table->timestamp('signed_at')->useCurrent();
            $table->timestamps();
        });

        // 15. Bảng Đặt cược (Dự đoán kết quả dành cho Khán giả)
        Schema::create('bets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('registration_id')->constrained('registrations')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('prediction_type');
            $table->string('status')->default('pending');
            $table->timestamps();
        });

        // 16. Bảng Giải thưởng (Prizes)
        Schema::create('prizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('race_result_id')->nullable()->constrained('race_results')->onDelete('set null');
            $table->foreignId('bet_id')->nullable()->constrained('bets')->onDelete('set null');
            $table->foreignId('winner_user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 14, 2);
            $table->enum('prize_type', ['race_reward', 'prediction_reward']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('prizes');
        Schema::dropIfExists('bets');
        Schema::dropIfExists('referee_reports');
        Schema::dropIfExists('violations');
        Schema::dropIfExists('horse_jockey');
        Schema::dropIfExists('race_results');
        Schema::dropIfExists('registrations');
        Schema::dropIfExists('races');
        Schema::dropIfExists('tournaments');
        Schema::dropIfExists('horses');
        Schema::dropIfExists('admins');
        Schema::dropIfExists('spectators');
        Schema::dropIfExists('race_referees');
        Schema::dropIfExists('jockeys');
        Schema::dropIfExists('horse_owners');
        Schema::dropIfExists('users');
    }
};
