<?php

namespace App\Services;


use App\Repositories\Contracts\IHorseRepository;
use App\Services\Contracts\IHorseService;

use App\Services\Contracts\IHorseService;
use App\Repositories\Contracts\IHorseRepository;
use App\DTOs\HorseDTO;


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

    public function getHorseById(int $id): ?HorseDTO
    {
        $horse = $this->horseRepository->findHorseById($id);
        return $horse ? HorseDTO::fromModel($horse) : null;
    }

    public function addHorse(HorseDTO $dto): HorseDTO
    {
        $horse = $this->horseRepository->createHorse($dto->toModelAttributes());
        return HorseDTO::fromModel($horse);
    }

    public function updateHorse(int $id, HorseDTO $dto): ?HorseDTO
    {
        $horse = $this->horseRepository->updateHorse($id, $dto->toModelAttributes());
        return $horse ? HorseDTO::fromModel($horse) : null;
    }

    public function removeHorse(int $id): bool
    {
        return $this->horseRepository->deleteHorse($id);
    }

    public function getHorsesByOwner(int $ownerId): array
    {
        $horses = $this->horseRepository->getHorsesByOwnerId($ownerId);
        $dtos = [];
        foreach ($horses as $horse) {
            $dtos[] = HorseDTO::fromModel($horse);
        }
        return $dtos;
    }

    public function countHorsesByOwner(int $ownerId): int
    {
        return $this->horseRepository->countHorsesByOwnerId($ownerId);
    }
}


