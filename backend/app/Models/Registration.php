<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

 * @property int $id
 * @property int $race_id
 * @property int $horse_id
 * @property int $jockey_id

 * @property string $status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Race $race
 * @property-read Horse $horse
 * @property-read User $jockey
 */
class Registration extends Model
{
    use HasFactory;

    protected $fillable = [
        'race_id',
        'horse_id',
        'jockey_id',

        'lane',
        'status', // pending, confirmed, rejected, withdrawn
    ];

    protected $casts = [
        'lane' => 'integer',
        'status',
    ];

    protected $casts = [
        'race_id' => 'integer',
        'horse_id' => 'integer',
        'jockey_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function race(): BelongsTo
    {
        return $this->belongsTo(Race::class);
    }
    public function horse(): BelongsTo
    {
        return $this->belongsTo(Horse::class);
    }

    public function jockey(): BelongsTo
    {
        return $this->belongsTo(User::class, 'jockey_id');
    }
}
