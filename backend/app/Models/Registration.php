<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
        'race_id' => 'integer',
        'horse_id' => 'integer',
        'jockey_id' => 'integer',
        'lane' => 'integer',
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
        return $this->belongsTo(Jockey::class, 'jockey_id');
    }

    public function result(): HasOne
    {
        return $this->hasOne(RaceResult::class);
    }
}
