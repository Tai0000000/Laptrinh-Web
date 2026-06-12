<?php

namespace App\Models;

use Carbon\Carbon;


use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Race extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'name',
        'distance',
        'race_time',
        'status', // scheduled, ongoing, completed, cancelled
    ];

    protected $casts = [
        'tournament_id' => 'integer',
        'race_time' => 'datetime',
        'distance' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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

    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class);
    }
}
