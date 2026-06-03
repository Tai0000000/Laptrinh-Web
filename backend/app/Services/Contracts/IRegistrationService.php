<?php

namespace App\Services\Contracts;

interface IRegistrationService
{
    public function getRegistrationById(int $id): mixed;
    public function getRegistrationsByRace(int $raceId): mixed;
    public function getRegistrationsByHorse(int $horseId): mixed;
    public function getRegistrationsByJockey(int $jockeyUserId): mixed;
    public function createRegistration(array $data): mixed;
    public function updateRegistrationStatus(int $id, string $status): mixed;
    public function deleteRegistration(int $id): bool;
}
