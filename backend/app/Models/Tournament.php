<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tournament extends Model
{
    protected $fillable = ['name', 'start_date', 'end_date', 'location'];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function races(): HasMany
    {
        return $this->hasMany(Race::class);
    }
}
