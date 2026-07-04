<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix các vấn đề schema được phát hiện:
 * 1. users.role enum thiếu 'race_referee'
 * 2. violations.referee_id FK trỏ race_referees nhưng controller lưu users.id
 * 3. bets thiếu cột reward_amount
 * 4. races.name cho phép NULL (admin/referee tạo race không bắt buộc điền tên)
 * 5. registrations.jockey_id cho phép NULL (ngựa có thể đăng ký trước khi có nài)
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Fix users.role enum — thêm 'race_referee'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM(
            'horse_owner','jockey','referee','race_referee','spectator','admin'
        ) NOT NULL DEFAULT 'spectator'");

        // 2. Fix violations.referee_id — đổi FK từ race_referees sang users
        Schema::table('violations', function (Blueprint $table) {
            // Drop FK cũ
            $table->dropForeign(['referee_id']);
        });
        Schema::table('violations', function (Blueprint $table) {
            // Thêm FK mới trỏ users
            $table->foreign('referee_id')->references('id')->on('users')->onDelete('cascade');
        });

        // 3. Thêm reward_amount vào bets
        Schema::table('bets', function (Blueprint $table) {
            if (! Schema::hasColumn('bets', 'reward_amount')) {
                $table->decimal('reward_amount', 14, 2)->nullable()->after('status');
            }
        });

        // 4. Cho phép races.name là nullable
        Schema::table('races', function (Blueprint $table) {
            $table->string('name')->nullable()->change();
        });

        // 5. Cho phép registrations.jockey_id là nullable
        // NOTE: Bỏ qua nếu có dữ liệu cũ không tương thích
        // Schema::table('registrations', function (Blueprint $table) {
        //     $table->dropForeign(['jockey_id']);
        //     $table->unsignedBigInteger('jockey_id')->nullable()->change();
        //     $table->foreign('jockey_id')->references('id')->on('jockeys')->onDelete('set null');
        // });
    }

    public function down(): void
    {
        // Revert reward_amount
        Schema::table('bets', function (Blueprint $table) {
            if (Schema::hasColumn('bets', 'reward_amount')) {
                $table->dropColumn('reward_amount');
            }
        });

        // Revert violations FK
        Schema::table('violations', function (Blueprint $table) {
            $table->dropForeign(['referee_id']);
            $table->foreign('referee_id')->references('id')->on('race_referees')->onDelete('cascade');
        });

        // Revert users.role enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM(
            'horse_owner','jockey','referee','spectator','admin'
        ) NOT NULL DEFAULT 'spectator'");

        // Revert races.name
        Schema::table('races', function (Blueprint $table) {
            $table->string('name')->nullable(false)->change();
        });

        // Revert jockey_id
        Schema::table('registrations', function (Blueprint $table) {
            $table->dropForeign(['jockey_id']);
            $table->unsignedBigInteger('jockey_id')->nullable(false)->change();
            $table->foreign('jockey_id')->references('id')->on('jockeys')->onDelete('cascade');
        });
    }
};
