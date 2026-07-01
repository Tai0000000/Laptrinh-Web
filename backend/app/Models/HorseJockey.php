<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'horse_id'  => 'integer',
        'jockey_id' => 'integer',
        'race_id'   => 'integer',
    ];

    /** Ngựa được mời */
    public function horse(): BelongsTo
    {
        return $this->belongsTo(Horse::class);
    }

    /**
     * Jockey được mời — jockey_id → jockeys.id
     * Dùng Jockey model, không phải User
     */
    public function jockey(): BelongsTo
    {
        return $this->belongsTo(Jockey::class);
    }

    /** Cuộc đua liên quan */
    public function race(): BelongsTo
    {
        return $this->belongsTo(Race::class);
    }
}
