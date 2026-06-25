<?php

namespace App\Repositories\Contracts;

interface IAuthRepository
{
    /** Find user by email */
    public function findByEmail(string $email): mixed;

    /** Find user by ID */
    public function findById(int $id): mixed;

    /** Create a new user */
    public function create(array $data): mixed;
}
