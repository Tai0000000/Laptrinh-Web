<?php

namespace App\Services\Contracts;

interface IHorseService
{
    public function getHorseById(int $id): mixed;

    public function addHorse(array $data): mixed;

    public function updateHorse(int $id, array $data): mixed;

    public function removeHorse(int $id): bool;

    public function getHorsesByOwner(int $ownerId): mixed;
}
