<?php

namespace App\Services\Contracts;

interface IRaceService
{
    public function getAllRaces(): mixed;
    public function getRaceById(int $id): mixed;
    public function getRacesByTournament(int $tournamentId): mixed;
    public function createRace(array $data): mixed;
    public function updateRace(int $id, array $data): mixed;
    public function updateRaceStatus(int $id, string $status): mixed;
    public function deleteRace(int $id): bool;
    public function getLiveRaces(): mixed;
}
