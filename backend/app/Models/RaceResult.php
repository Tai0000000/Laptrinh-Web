<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RaceResult extends Model
{
    protected $fillable = ['race_id', 'registration_id', 'rank', 'finish_time', 'notes'];

    protected $casts = ['rank' => 'integer'];

    public function race(): BelongsTo
    {
        return $this->belongsTo(Race::class);
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }
}
