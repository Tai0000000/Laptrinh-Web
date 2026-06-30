<?php

namespace App\Repositories\Contracts;

interface IHorseRepository
{
    public function findById(int $id): mixed;
    public function findByOwnerId(int $horseOwnerId): mixed;
    public function create(array $data): mixed;
    public function update(int $id, array $data): mixed;
    public function delete(int $id): bool;
    public function getAll(): mixed;

    public function findHorseById(int $id): mixed;
    public function createHorse(array $data): mixed;
    public function updateHorse(int $id, array $data): mixed;
    public function deleteHorse(int $id): bool;
    public function getHorsesByOwnerId(int $horseOwnerId): mixed;
    public function countHorsesByOwnerId(int $horseOwnerId): int;
}


