<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('violations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('race_id')->constrained('races')->onDelete('cascade');
            $table->foreignId('registration_id')->constrained('registrations')->onDelete('cascade');
            $table->foreignId('referee_id')->constrained('users')->onDelete('cascade');
            $table->string('violation_type'); // e.g., 'false_start', 'lane_deviation', 'jockey_conduct', 'equipment_violation'
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'dismissed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('violations');
    }
};
