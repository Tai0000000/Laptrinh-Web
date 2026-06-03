<?php

namespace App\Services;

use App\Repositories\Contracts\IHorseRepository;
use App\Services\Contracts\IHorseService;

class HorseService implements IHorseService
{
    protected IHorseRepository $horseRepository;

    public function __construct(IHorseRepository $horseRepository)
    {
        $this->horseRepository = $horseRepository;
    }

    public function getAllHorses(): mixed
    {
        return $this->horseRepository->getAll();
    }

    public function getHorseById(int $id): mixed
    {
        return $this->horseRepository->findById($id);
    }

    public function getHorsesByOwner(int $ownerId): mixed
    {
        return $this->horseRepository->findByOwnerId($ownerId);
    }

    public function createHorse(array $data): mixed
    {
        return $this->horseRepository->create($data);
    }

    public function updateHorse(int $id, array $data): mixed
    {
        return $this->horseRepository->update($id, $data);
    }

    public function deleteHorse(int $id): bool
    {
        return $this->horseRepository->delete($id);
    }
}
