<?php

namespace App\Services;

use App\Repositories\Contracts\ITournamentRepository;
use App\Services\Contracts\ITournamentService;

class TournamentService implements ITournamentService
{
    protected ITournamentRepository $tournamentRepository;

    public function __construct(ITournamentRepository $tournamentRepository)
    {
        $this->tournamentRepository = $tournamentRepository;
    }

    public function getAllTournaments(): mixed
    {
        return $this->tournamentRepository->getAll();
    }

    public function getTournamentById(int $id): mixed
    {
        return $this->tournamentRepository->findById($id);
    }

    public function createTournament(array $data): mixed
    {
        return $this->tournamentRepository->create($data);
    }

    public function updateTournament(int $id, array $data): mixed
    {
        return $this->tournamentRepository->update($id, $data);
    }

    public function deleteTournament(int $id): bool
    {
        return $this->tournamentRepository->delete($id);
    }
}
