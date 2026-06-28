<?php

namespace App\Services;

use App\Repositories\Contracts\IRaceRepository;
use App\Repositories\Contracts\IHorseOwnerRepository;
use App\Services\Contracts\IRaceService;

class RaceService implements IRaceService
{
    protected IRaceRepository $raceRepository;
    protected IHorseOwnerRepository $horseOwnerRepository;

    public function __construct(
        IRaceRepository $raceRepository,
        IHorseOwnerRepository $horseOwnerRepository
    ) {
        $this->raceRepository = $raceRepository;
        $this->horseOwnerRepository = $horseOwnerRepository;
    }

    public function getAllRaces(): mixed
    {
        return $this->raceRepository->getAll();
    }

    public function getRaceById(int $id): mixed
    {
        return $this->raceRepository->findById($id);
    }

    public function getRacesByTournament(int $tournamentId): mixed
    {
        return $this->raceRepository->findByTournament($tournamentId);
    }

    public function createRace(array $data): mixed
    {
        return $this->raceRepository->create($data);
    }

    public function updateRace(int $id, array $data): mixed
    {
        return $this->raceRepository->update($id, $data);
    }

    public function updateRaceStatus(int $id, string $status): mixed
    {
        return $this->raceRepository->updateStatus($id, $status);
    }

    public function deleteRace(int $id): bool
    {
        return $this->raceRepository->delete($id);
    }

    public function getLiveRaces(): mixed
    {
        return $this->raceRepository->getLiveRaces();
    }

    public function getRaceScheduleForHorse(int $horseId): array
    {
        $schedule = $this->horseOwnerRepository->getRaceScheduleForHorse($horseId);
        return $schedule ? $schedule->toArray() : [];
    }
}
