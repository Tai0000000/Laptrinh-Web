<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Lời mời jockey điều khiển ngựa cho một race cụ thể.
 * Horse Owner tạo → Jockey respond (accepted / rejected)
 *
 * @property int $id
 * @property int $horse_id
 * @property int $jockey_id   — trỏ tới users.id
 * @property int $race_id
 * @property string $status   — pending | accepted | rejected
 * @property string|null $reason
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Horse $horse
 * @property-read User $jockey
 * @property-read Race $race
 */
class HorseJockey extends Model
{
    use HasFactory;

    protected $table = 'horse_jockey';

    protected $fillable = [
        'horse_id',
        'jockey_id',
        'race_id',
        'status',
        'reason',
    ];

    protected $casts = [
        'horse_id'   => 'integer',
        'jockey_id'  => 'integer',
        'race_id'    => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Ngựa được mời
     */
    public function horse(): BelongsTo
    {
        return $this->belongsTo(Horse::class);
    }

    /**
     * Jockey được mời (jockey_id → users.id)
     */
    public function jockey(): BelongsTo
    {
        return $this->belongsTo(User::class, 'jockey_id');
    }

    /**
     * Cuộc đua liên quan
     */
    public function race(): BelongsTo
    {
        return $this->belongsTo(Race::class);
    }
}
