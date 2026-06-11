<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $race_id
 * @property int $registration_id
 * @property int $rank
 * @property string|null $finish_time
 * @property string|null $notes
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Race $race
 * @property-read Registration $registration
 */
class RaceResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'race_id',
        'registration_id',
        'rank',
        'finish_time',
        'notes',
    ];

    protected $casts = [
        'rank' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the race that this result is for
     */
    public function race(): BelongsTo
    {
        return $this->belongsTo(Race::class);
    }

    /**
     * Get the registration (horse/jockey) that this result is for
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }
}
