<?php

namespace App\Services\Contracts;

interface IHorseService
{
    public function getAllHorses(): mixed;
    public function getHorseById(int $id): mixed;
    public function getHorsesByOwner(int $ownerId): mixed;
    public function createHorse(array $data): mixed;
    public function updateHorse(int $id, array $data): mixed;
    public function deleteHorse(int $id): bool;
}
