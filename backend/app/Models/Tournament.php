<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tournament extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'location',
        'status',
        'prize_pool',
        'description',
    ];

    public function races()
    {
        return $this->hasMany(Race::class);
    }
}
