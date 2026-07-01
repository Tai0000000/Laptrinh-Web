<?php

namespace App\Repositories\Contracts;

interface IRegistrationRepository
{
    public function findById(int $id): mixed;
    public function findByRace(int $raceId): mixed;
    public function findByHorse(int $horseId): mixed;
    public function findByJockey(int $jockeyUserId): mixed;
    public function create(array $data): mixed;
    public function updateStatus(int $id, string $status): mixed;
    public function delete(int $id): bool;
}
