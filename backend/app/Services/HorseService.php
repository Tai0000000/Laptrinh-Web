<?php

namespace App\Services;

use App\Repositories\Contracts\IHorseRepository;
use App\Repositories\Contracts\IHorseOwnerRepository;
use App\Services\Contracts\IHorseService;
use App\DTOs\HorseDTO;

class HorseService implements IHorseService
{
    protected IHorseRepository $horseRepository;
    protected IHorseOwnerRepository $horseOwnerRepository;

    public function __construct(
        IHorseRepository $horseRepository,
        IHorseOwnerRepository $horseOwnerRepository
    ) {
        $this->horseRepository = $horseRepository;
        $this->horseOwnerRepository = $horseOwnerRepository;
    }

    public function getHorseById(int $id): ?HorseDTO
    {
        $horse = $this->horseRepository->findHorseById($id);
        return $horse ? HorseDTO::fromModel($horse) : null;
    }

    public function createHorse(array $data): mixed
    {
        return $this->horseRepository->createHorse($data);
    }

    public function updateHorse(int $id, array $data): mixed
    {
        return $this->horseRepository->updateHorse($id, $data);
    }

    public function deleteHorse(int $id): bool
    {
        return $this->horseRepository->deleteHorse($id);
    }

    public function addHorse(HorseDTO $dto): HorseDTO
    {
        $horse = $this->horseRepository->createHorse($dto->toModelAttributes());
        return HorseDTO::fromModel($horse);
    }

    public function updateHorseDto(int $id, HorseDTO $dto): ?HorseDTO
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

    public function trackRaceResults(int $horseId): array
    {
        $results = $this->horseOwnerRepository->getRaceResults($horseId);
        return $results ? $results->toArray() : [];
    }

    public function getHorseRankings(int $horseId): array
    {
        $rankings = $this->horseOwnerRepository->getHorseRankings($horseId);
        return $rankings ? $rankings->toArray() : [];
    }

    public function getHorseRewards(int $horseId): array
    {
        $rewards = $this->horseOwnerRepository->getHorseRewards($horseId);
        return $rewards ? $rewards->toArray() : [];
    }
}


