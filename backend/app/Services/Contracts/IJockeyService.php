<?php

namespace App\Services\Contracts;

use App\DTOs\JockeyDTO;

interface IJockeyService
{
    public function getJockeyById(int $id): ?JockeyDTO;

    public function createJockey(JockeyDTO $dto): JockeyDTO;

    public function updateJockey(int $id, JockeyDTO $dto): ?JockeyDTO;

    public function deleteJockey(int $id): bool;

    /**
     * @return JockeyDTO[]
     */
    public function getAllJockeys(): array;
}
