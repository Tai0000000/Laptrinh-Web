<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('bets', function (Blueprint $table) {
            $table->decimal('reward_amount', 10, 2)->nullable()->after('status');
        });
    }

    public function down()
    {
        Schema::table('bets', function (Blueprint $table) {
            $table->dropColumn('reward_amount');
        });
    }
};
