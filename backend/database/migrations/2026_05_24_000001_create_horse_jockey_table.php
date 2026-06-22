<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horse_jockey', function (Blueprint $table) {
            $table->id();
            $table->foreignId('horse_id')
                  ->constrained('horses')
                  ->onDelete('cascade');
            $table->foreignId('jockey_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            $table->foreignId('race_id')
                  ->constrained('races')
                  ->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'rejected'])
                  ->default('pending');
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horse_jockey');
    }
};
