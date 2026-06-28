<?php

namespace App\Services\Contracts;

interface ITournamentService
{
    public function getAllTournaments(): mixed;
    public function getTournamentById(int $id): mixed;
    public function createTournament(array $data): mixed;
    public function updateTournament(int $id, array $data): mixed;
    public function deleteTournament(int $id): bool;
}
