<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RaceResult extends Model
{
    use HasFactory;

    protected $table = 'race_results';

    protected $fillable = [
        'race_id',
        'registration_id',
        'rank',
        'finish_time',
        'notes',
    ];

    protected $casts = [
        'race_id' => 'integer',
        'registration_id' => 'integer',
        'rank' => 'integer',
    ];

    public function race(): BelongsTo
    {
        return $this->belongsTo(Race::class);
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }
}
