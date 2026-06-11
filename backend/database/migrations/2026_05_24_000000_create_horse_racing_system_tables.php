<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['horse_owner', 'jockey', 'race_referee', 'spectator', 'admin'])->default('spectator');
            $table->rememberToken();
            $table->timestamps();
        });

        // Bảng Horse Owners (Chủ ngựa)
        Schema::create('horse_owners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Bảng Jockeys (Nài ngựa)
        Schema::create('jockeys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Bảng Race Referees (Trọng tài)
        Schema::create('race_referees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Bảng Spectators (Khán giả)
        Schema::create('spectators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Bảng Admins (Quản trị viên)
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Bảng Horses (Ngựa)
        Schema::create('horses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('age');
            $table->string('breed');
            $table->foreignId('horse_owner_id')->constrained('horse_owners')->onDelete('cascade');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        // Bảng Tournaments (Giải đấu)
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('location');
            $table->timestamps();
        });

        // Bảng Races (Cuộc đua)
        Schema::create('races', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->onDelete('cascade');
            $table->dateTime('race_time');
            $table->integer('distance'); // tính bằng mét
            $table->string('status')->default('scheduled'); // đã lên lịch, đang diễn ra, đã hoàn thành, đã hủy
            $table->timestamps();
        });

        // Đăng ký (Ngựa & Nài ngựa trong một Cuộc đua)
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('race_id')->constrained()->onDelete('cascade');
            $table->foreignId('horse_id')->constrained()->onDelete('cascade');
            $table->foreignId('jockey_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'confirmed', 'rejected', 'withdrawn'])->default('pending');
            $table->timestamps();
        });

        // Kết quả Cuộc đua
        Schema::create('race_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('race_id')->constrained()->onDelete('cascade');
            $table->foreignId('registration_id')->constrained()->onDelete('cascade');
            $table->integer('rank')->nullable();
            $table->string('finish_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Đặt cược (Dành cho Khán giả)
        Schema::create('bets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('registration_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('prediction_type'); // ví dụ: thắng, hạng nhất, hạng nhì
            $table->string('status')->default('pending'); // đang chờ, thắng, thua
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('bets');
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
