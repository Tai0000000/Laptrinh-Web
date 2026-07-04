<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('races', function (Blueprint $table) {
            if (!Schema::hasColumn('races', 'round')) {
                $table->string('round')->default('Vòng 1')->after('tournament_id');
            }
            if (!Schema::hasColumn('races', 'name')) {
                $table->string('name')->nullable()->after('round');
            }
            if (!Schema::hasColumn('races', 'max_horses')) {
                $table->integer('max_horses')->default(8)->after('distance');
            }
        });
    }

    public function down(): void
    {
        Schema::table('races', function (Blueprint $table) {
            $table->dropColumnIfExists('round');
            $table->dropColumnIfExists('name');
            $table->dropColumnIfExists('max_horses');
        });
    }
};
