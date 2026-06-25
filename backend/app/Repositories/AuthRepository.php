<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\IAuthRepository;

class AuthRepository implements IAuthRepository
{
    public function findByEmail(string $email): mixed
    {
        return User::where('email', $email)->first();
    }

    public function findById(int $id): mixed
    {
        return User::find($id);
    }

    public function create(array $data): mixed
    {
        return User::create($data);
    }
}
