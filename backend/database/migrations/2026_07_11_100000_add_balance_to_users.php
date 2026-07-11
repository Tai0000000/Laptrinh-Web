<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'balance')) {
                // Số dư ví — mặc định 1,000,000 VNĐ khi tạo tài khoản mới
                $table->decimal('balance', 15, 2)->default(1000000.00)->after('location');
            }
        });

        // Cập nhật balance cho các user đã có sẵn chưa có balance
        DB::statement('UPDATE users SET balance = 1000000.00 WHERE balance IS NULL OR balance = 0');
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumnIfExists('balance');
        });
    }
};
