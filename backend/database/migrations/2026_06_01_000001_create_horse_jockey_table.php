<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('horse_jockey')) {
            Schema::create('horse_jockey', function (Blueprint $table) {
                $table->id();
                $table->foreignId('horse_id')->constrained('horses')->onDelete('cascade');
                $table->foreignId('jockey_id')->constrained('jockeys')->onDelete('cascade');
                $table->foreignId('race_id')->constrained('races')->onDelete('cascade');
                $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
                $table->string('reason')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('horse_jockey');
    }
};
