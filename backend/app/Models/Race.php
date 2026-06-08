<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $tournament_id
 * @property Carbon $race_time
 * @property int $distance
 * @property string $status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Tournament $tournament
 * @property-read Collection<Registration> $registrations
 * @property-read Collection<RaceResult> $results
 */
class Race extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'race_time',
        'distance',
        'status',
    ];

    protected $casts = [
        'tournament_id' => 'integer',
        'race_time' => 'datetime',
        'distance' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the tournament of this race
     *
     * @return BelongsTo
     */
    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    /**
     * Get all horse registrations for this race
     *
     * @return HasMany
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    /**
     * Get all results of this race
     *
     * @return HasMany
     */
    public function results(): HasMany
    {
        return $this->hasMany(RaceResult::class);
    }
}
