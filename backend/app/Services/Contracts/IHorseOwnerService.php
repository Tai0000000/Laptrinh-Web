<?php

namespace App\Services\Contracts;

use App\DTOs\HorseOwnerDTO;

interface IHorseOwnerService
{
    public function registerAccount(array $data): void;
    public function registerHorseForRace(int $horseId, int $raceId): void;
    public function updateHorseInfo(int $horseId, array $data): void;
    public function hireJockeyForRace(int $horseId, int $jockeyId, int $raceId): void;
    public function confirmJockeyForRace(int $horseId, int $raceId, int $jockeyId): void;
    public function viewRaceScheduleAndConfirmParticipation(int $horseId): array;
    public function viewRaceInfo(int $raceId): array;
    public function trackRaceResults(int $horseId): array;
    public function getHorseRankings(int $horseId): array;
    public function getHorseRewards(int $horseId): array;
    public function getOwnerById(int $id): ?HorseOwnerDTO;
    public function registerOwner(HorseOwnerDTO $dto): HorseOwnerDTO;
    public function updateOwnerInfo(int $id, HorseOwnerDTO $dto): ?HorseOwnerDTO;
    public function deleteOwnerAccount(int $id): bool;

    // New helper methods to encapsulate repository queries for controllers
    public function getOwnerByUserId(int $userId): ?HorseOwnerDTO;
    public function getHorses(int $ownerId): array;
    public function getHorsesForRace(int $ownerId, int $raceId): array;
    public function getJockeysForHorse(int $horseId): array;
}
