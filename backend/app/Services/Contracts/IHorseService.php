<?php

namespace App\Services\Contracts;


interface IHorseService
{
    public function getAllHorses(): mixed;
    public function getHorseById(int $id): mixed;
    public function getHorsesByOwner(int $ownerId): mixed;
    public function createHorse(array $data): mixed;
    public function updateHorse(int $id, array $data): mixed;
    public function deleteHorse(int $id): bool;
}

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

    public function countHorsesByOwner(int $ownerId): int;
}


