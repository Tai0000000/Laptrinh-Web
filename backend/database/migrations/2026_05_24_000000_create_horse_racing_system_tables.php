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

        // Horse Owners table
        Schema::create('horse_owners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Jockeys table
        Schema::create('jockeys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Race Referees table
        Schema::create('race_referees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Spectators table
        Schema::create('spectators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Admins table
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Horses table
        Schema::create('horses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('age');
            $table->string('breed');
            $table->foreignId('horse_owner_id')->constrained('horse_owners')->onDelete('cascade');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        // Tournaments table
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('location');
            $table->timestamps();
        });

        // Races table
        Schema::create('races', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->onDelete('cascade');
            $table->dateTime('race_time');
            $table->integer('distance'); // in meters
            $table->string('status')->default('scheduled'); // scheduled, ongoing, finished, cancelled
            $table->timestamps();
        });

        // Registrations (Horse & Jockey in a Race)
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('race_id')->constrained()->onDelete('cascade');
            $table->foreignId('horse_id')->constrained()->onDelete('cascade');
            $table->foreignId('jockey_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'confirmed', 'rejected', 'withdrawn'])->default('pending');
            $table->timestamps();
        });

        // Race Results
        Schema::create('race_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('race_id')->constrained()->onDelete('cascade');
            $table->foreignId('registration_id')->constrained()->onDelete('cascade');
            $table->integer('rank')->nullable();
            $table->string('finish_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Bets (For Spectators)
        Schema::create('bets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('registration_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('prediction_type'); // e.g., win, place, show
            $table->string('status')->default('pending'); // pending, won, lost
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
