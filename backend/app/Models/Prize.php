<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prize extends Model
{
    use HasFactory;

    protected $fillable = [
        'race_result_id',
        'bet_id',
        'winner_user_id',
        'amount',
        'prize_type', // race_reward, prediction_reward
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_user_id');
    }

    public function raceResult(): BelongsTo
    {
        return $this->belongsTo(RaceResult::class, 'race_result_id');
    }

    public function bet(): BelongsTo
    {
        return $this->belongsTo(Bet::class, 'bet_id');
    }
}
