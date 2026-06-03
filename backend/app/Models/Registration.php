<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Registration extends Model
{
    protected $fillable = ['race_id', 'horse_id', 'jockey_id', 'status'];

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

    public function result(): HasOne
    {
        return $this->hasOne(RaceResult::class);
    }
}
