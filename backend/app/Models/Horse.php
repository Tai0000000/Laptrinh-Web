<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $name
 * @property int $age
 * @property string $breed
 * @property int $horse_owner_id
 * @property string $status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read HorseOwner $owner
 */
class Horse extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'age',
        'breed',
        'horse_owner_id',
        'status',
    ];

    protected $casts = [
        'age' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the owner (HorseOwner) of this horse
     *
     * @return BelongsTo
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(HorseOwner::class, 'horse_owner_id');
    }
}
