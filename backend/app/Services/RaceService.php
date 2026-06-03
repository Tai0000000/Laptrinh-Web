<?php

namespace App\Services;

use App\Repositories\Contracts\IRaceRepository;
use App\Services\Contracts\IRaceService;

class RaceService implements IRaceService
{
    protected IRaceRepository $raceRepository;

    public function __construct(IRaceRepository $raceRepository)
    {
        $this->raceRepository = $raceRepository;
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
}
