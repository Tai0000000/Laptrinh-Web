<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Horse extends Model
{
    protected $fillable = [
        'name',
        'age',
        'breed',
        'owner_id',
        'status', // đang hoạt động, bị thương, đã nghỉ hưu
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }
}
