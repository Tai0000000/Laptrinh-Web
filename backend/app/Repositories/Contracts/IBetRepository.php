<?php

namespace App\Repositories\Contracts;

interface IBetRepository
{
    public function findById(int $id): mixed;
    public function findByUser(int $userId): mixed;
    public function findByRegistration(int $registrationId): mixed;
    public function create(array $data): mixed;
    public function updateStatus(int $id, string $status): mixed;
    public function settleBetsByRace(int $raceId, int $winnerRegistrationId): void;
}
