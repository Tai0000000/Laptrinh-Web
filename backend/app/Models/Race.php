<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $tournament_id
 * @property string $name
 * @property int $distance
 * @property Carbon $race_time
 * @property string $status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Tournament $tournament
 * @property-read Registration[] $registrations
 */
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
        'race_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the tournament that owns this race
     */
    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    /**
     * Get all registrations (horses/jockeys) for this race
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }
}
