<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Race extends Model
{
    protected $fillable = ['tournament_id', 'round', 'race_time', 'distance', 'max_horses', 'status'];

    protected $casts = [
        'race_time' => 'datetime',
        'distance'  => 'integer',
        'max_horses' => 'integer',
    ];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(RaceResult::class);
    }
}
