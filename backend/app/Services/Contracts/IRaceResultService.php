<?php

namespace App\Services\Contracts;

interface IRaceResultService
{
    public function getResultsByRace(int $raceId): mixed;
    public function getResultByRegistration(int $registrationId): mixed;
    public function createRaceResult(array $data): mixed;
    public function updateRaceResult(int $id, array $data): mixed;
    public function getLeaderboard(int $raceId): mixed;
}
