<?php

namespace App\Services\Contracts;

interface IJockeyService
{
    public function getJockeyById(int $id): mixed;
    public function getJockeyByUserId(int $userId): mixed;
    public function getJockeySchedule(int $jockeyUserId): mixed;
    public function getAllJockeys(): mixed;
}
