<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // chủ ngựa, nài ngựa, trọng tài, khán giả, quản trị viên
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function horses()
    {
        return $this->hasMany(Horse::class, 'owner_id');
    }

    public function isRole($role)
    {
        return $this->role === $role;
    }
}
