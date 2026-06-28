<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefereeReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'race_id',
        'referee_id',
        'report_text',
        'signed_at',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
    ];

    public function race(): BelongsTo
    {
        return $this->belongsTo(Race::class);
    }

    public function referee(): BelongsTo
    {
        return $this->belongsTo(RaceReferee::class, 'referee_id');
    }
}
