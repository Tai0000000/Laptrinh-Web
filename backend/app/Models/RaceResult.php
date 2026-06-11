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

 * @property int|null $rank

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


    protected $table = 'race_results';
    protected $fillable = [
        'race_id',
        'registration_id',
        'rank',
        'finish_time',
        'notes',
    ];

    protected $casts = [
        'race_id' => 'integer',
        'registration_id' => 'integer',

        'rank' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    public function race(): BelongsTo
    {
        return $this->belongsTo(Race::class);
    }



    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }
}
