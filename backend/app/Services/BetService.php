<?php

namespace App\Services;

use App\Repositories\Contracts\IBetRepository;
use App\Services\Contracts\IBetService;

class BetService implements IBetService
{
    protected IBetRepository $betRepository;

    public function __construct(IBetRepository $betRepository)
    {
        $this->betRepository = $betRepository;
    }

    public function getBetById(int $id): mixed
    {
        return $this->betRepository->findById($id);
    }

    public function getBetsByUser(int $userId): mixed
    {
        return $this->betRepository->findByUser($userId);
    }

    public function getBetsByRegistration(int $registrationId): mixed
    {
        return $this->betRepository->findByRegistration($registrationId);
    }

    public function placeBet(array $data): mixed
    {
        $data['status'] = 'pending';
        return $this->betRepository->create($data);
    }

    public function updateBetStatus(int $id, string $status): mixed
    {
        return $this->betRepository->updateStatus($id, $status);
    }

    public function settleBets(int $raceId, int $winnerRegistrationId): void
    {
        $this->betRepository->settleBetsByRace($raceId, $winnerRegistrationId);
    }
}
