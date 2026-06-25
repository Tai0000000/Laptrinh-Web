<?php

namespace App\Services;

use App\Repositories\Contracts\IRaceResultRepository;
use App\Services\Contracts\IBetService;
use App\Services\Contracts\IRaceResultService;

class RaceResultService implements IRaceResultService
{
    protected IRaceResultRepository $raceResultRepository;
    protected IBetService $betService;

    public function __construct(IRaceResultRepository $raceResultRepository, IBetService $betService)
    {
        $this->raceResultRepository = $raceResultRepository;
        $this->betService = $betService;
    }

    public function getResultsByRace(int $raceId): mixed
    {
        return $this->raceResultRepository->findByRace($raceId);
    }

    public function getResultByRegistration(int $registrationId): mixed
    {
        return $this->raceResultRepository->findByRegistration($registrationId);
    }

    public function createRaceResult(array $data): mixed
    {
        $result = $this->raceResultRepository->create($data);

        // If this result represents rank 1 (winner), automatically settle bets for this race!
        if (isset($data['rank']) && (int)$data['rank'] === 1) {
            $this->betService->settleBets((int)$data['race_id'], (int)$data['registration_id']);
        }

        return $result;
    }

    public function updateRaceResult(int $id, array $data): mixed
    {
        $result = $this->raceResultRepository->update($id, $data);

        // If updated to rank 1, settle bets
        if ($result && isset($data['rank']) && (int)$data['rank'] === 1) {
            $this->betService->settleBets((int)$result->race_id, (int)$result->registration_id);
        }

        return $result;
    }

    public function getLeaderboard(int $raceId): mixed
    {
        return $this->raceResultRepository->getLeaderboard($raceId);
    }
}
