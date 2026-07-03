<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JockeyContract extends Model
{
    use HasFactory;

    protected $table = 'jockey_contracts';

    protected $fillable = [
        'jockey_id',
        'horse_owner_id',
        'status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'jockey_id'      => 'integer',
        'horse_owner_id' => 'integer',
        'start_date'     => 'date',
        'end_date'       => 'date',
    ];

    /** Nài ngựa tham gia hợp đồng */
    public function jockey(): BelongsTo
    {
        return $this->belongsTo(Jockey::class);
    }

    /** Chủ ngựa tham gia hợp đồng */
    public function horseOwner(): BelongsTo
    {
        return $this->belongsTo(HorseOwner::class, 'horse_owner_id');
    }
}
