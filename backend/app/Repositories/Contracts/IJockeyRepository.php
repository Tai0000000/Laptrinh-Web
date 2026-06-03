<?php

namespace App\Repositories\Contracts;

interface IJockeyRepository
{
    public function findById(int $id): mixed;
    public function findByUserId(int $userId): mixed;
    public function getSchedule(int $jockeyUserId): mixed;
    public function getAll(): mixed;
}
