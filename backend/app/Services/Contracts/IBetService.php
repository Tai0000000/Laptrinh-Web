<?php

namespace App\Services\Contracts;

interface IBetService
{
    public function getBetById(int $id): mixed;
    public function getBetsByUser(int $userId): mixed;
    public function getBetsByRegistration(int $registrationId): mixed;
    public function placeBet(array $data): mixed;
    public function updateBetStatus(int $id, string $status): mixed;
    public function settleBets(int $raceId, int $winnerRegistrationId): void;
}
