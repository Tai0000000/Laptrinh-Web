<?php

namespace App\Services\Contracts;

use App\DTOs\HorseDTO;

interface IHorseService
{
    public function getHorseById(int $id): ?HorseDTO;
    public function createHorse(array $data): mixed;
    public function updateHorse(int $id, array $data): mixed;
    public function deleteHorse(int $id): bool;
    public function addHorse(HorseDTO $dto): HorseDTO;
    public function updateHorseDto(int $id, HorseDTO $dto): ?HorseDTO;
    public function removeHorse(int $id): bool;
    public function getHorsesByOwner(int $ownerId): array;
    public function countHorsesByOwner(int $ownerId): int;
    public function trackRaceResults(int $horseId): array;
    public function getHorseRankings(int $horseId): array;
    public function getHorseRewards(int $horseId): array;
}


