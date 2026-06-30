<?php

namespace App\Repositories\Contracts;

interface IRaceResultRepository
{
    public function findByRace(int $raceId): mixed;
    public function findByRegistration(int $registrationId): mixed;
    public function create(array $data): mixed;
    public function update(int $id, array $data): mixed;
    public function getLeaderboard(int $raceId): mixed;
}
