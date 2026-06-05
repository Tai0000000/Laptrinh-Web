<?php

namespace App\Services\Contracts;

use App\DTOs\HorseDTO;

interface IHorseService
{
    public function getHorseById(int $id): ?HorseDTO;

    public function addHorse(HorseDTO $dto): HorseDTO;

    public function updateHorse(int $id, HorseDTO $dto): ?HorseDTO;

    public function removeHorse(int $id): bool;

    /**
     * @return HorseDTO[]
     */
    public function getHorsesByOwner(int $ownerId): array;
}
