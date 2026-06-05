<?php

namespace App\Services;

use App\Services\Contracts\IHorseService;
use App\Repositories\Contracts\IHorseRepository;

class HorseService implements IHorseService
{
    protected IHorseRepository $horseRepository;

    public function __construct(IHorseRepository $horseRepository)
    {
        $this->horseRepository = $horseRepository;
    }

    public function getHorseById(int $id): mixed
    {
        return $this->horseRepository->findHorseById($id);
    }

    public function addHorse(array $data): mixed
    {
        return $this->horseRepository->createHorse($data);
    }

    public function updateHorse(int $id, array $data): mixed
    {
        return $this->horseRepository->updateHorse($id, $data);
    }

    public function removeHorse(int $id): bool
    {
        return $this->horseRepository->deleteHorse($id);
    }

    public function getHorsesByOwner(int $ownerId): mixed
    {
        return $this->horseRepository->getHorsesByOwnerId($ownerId);
    }
}
