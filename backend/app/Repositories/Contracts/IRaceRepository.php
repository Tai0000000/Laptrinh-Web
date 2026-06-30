<?php

namespace App\Repositories\Contracts;

interface IRaceRepository
{
    public function getAll(): mixed;
    public function findById(int $id): mixed;
    public function findByTournament(int $tournamentId): mixed;
    public function create(array $data): mixed;
    public function update(int $id, array $data): mixed;
    public function updateStatus(int $id, string $status): mixed;
    public function delete(int $id): bool;
    public function getLiveRaces(): mixed;
}
