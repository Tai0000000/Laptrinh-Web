<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // tournaments — thêm status, prize_pool, description
        Schema::table('tournaments', function (Blueprint $table) {
            if (!Schema::hasColumn('tournaments', 'status')) {
                $table->string('status')->default('upcoming')->after('location');
                // upcoming | ongoing | finished | cancelled
            }
            if (!Schema::hasColumn('tournaments', 'prize_pool')) {
                $table->decimal('prize_pool', 15, 2)->nullable()->after('status');
            }
            if (!Schema::hasColumn('tournaments', 'description')) {
                $table->text('description')->nullable()->after('prize_pool');
            }
        });

        // horses — thêm weight
        Schema::table('horses', function (Blueprint $table) {
            if (!Schema::hasColumn('horses', 'weight')) {
                $table->decimal('weight', 6, 2)->nullable()->after('breed');
                // kg
            }
        });

        // users — thêm phone, location (dùng cho HorseOwner AccountSettings)
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 20)->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'location')) {
                $table->string('location')->nullable()->after('phone');
            }
        });

        // bets — thêm reward_amount nếu chưa có
        Schema::table('bets', function (Blueprint $table) {
            if (!Schema::hasColumn('bets', 'reward_amount')) {
                $table->decimal('reward_amount', 15, 2)->nullable()->after('amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropColumnIfExists('status');
            $table->dropColumnIfExists('prize_pool');
            $table->dropColumnIfExists('description');
        });
        Schema::table('horses', function (Blueprint $table) {
            $table->dropColumnIfExists('weight');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumnIfExists('phone');
            $table->dropColumnIfExists('location');
        });
        Schema::table('bets', function (Blueprint $table) {
            $table->dropColumnIfExists('reward_amount');
        });
    }
};
