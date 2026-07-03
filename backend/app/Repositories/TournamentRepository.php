<?php

namespace App\Repositories;

use App\Models\Tournament;
use App\Repositories\Contracts\ITournamentRepository;

class TournamentRepository implements ITournamentRepository
{
    public function getAll(): mixed
    {
        return Tournament::with('races')->get();
    }

    public function findById(int $id): mixed
    {
        return Tournament::with('races')->find($id);
    }

    public function create(array $data): mixed
    {
        return Tournament::create($data);
    }

    public function update(int $id, array $data): mixed
    {
        $tournament = Tournament::find($id);
        if ($tournament) {
            $tournament->update($data);
            return $tournament;
        }
        return null;
    }

    public function delete(int $id): bool
    {
        $tournament = Tournament::find($id);
        if ($tournament) {
            return $tournament->delete();
        }
        return false;
    }
}
