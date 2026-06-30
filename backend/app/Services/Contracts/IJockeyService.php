<?php

namespace App\Services\Contracts;

use App\DTOs\JockeyDTO;

interface IJockeyService
{
    public function getJockeyById(int $id): mixed;
    public function createJockey(JockeyDTO $dto): JockeyDTO;
    public function updateJockey(int $id, JockeyDTO $dto): ?JockeyDTO;
    public function deleteJockey(int $id): bool;
    public function getAllJockeys(): mixed;
    public function getJockeyByUserId(int $userId): mixed;
    public function getJockeySchedule(int $jockeyUserId): mixed;
}
