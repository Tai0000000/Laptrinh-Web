<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read User $user
 * @property-read Collection<Horse> $horses
 * @property-read Collection<Horse> $activeHorses
 */
class HorseOwner extends User
{
    use HasFactory;

    protected $table = 'horse_owners';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
    ];

    /**
     * Get the user associated with this horse owner
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get all horses owned by this owner
     *
     * @return HasMany
     */
    public function horses(): HasMany
    {
        return $this->hasMany(Horse::class, 'horse_owner_id');
    }

    /**
     * Get active horses only
     *
     * @return HasMany
     */
    public function activeHorses(): HasMany
    {
        return $this->horses()->where('status', 'active');
    }
}
