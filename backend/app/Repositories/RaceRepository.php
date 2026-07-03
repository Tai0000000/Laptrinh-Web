<?php

namespace App\Repositories;

use App\Models\Race;
use App\Repositories\Contracts\IRaceRepository;

class RaceRepository implements IRaceRepository
{
    public function getAll(): mixed
    {
        return Race::with('tournament')->withCount('registrations')->get();
    }

    public function findById(int $id): mixed
    {
        return Race::with([
            'tournament',
            'registrations.horse',
            'registrations.jockey.user',  // jockey → jockeys.user → users
        ])->withCount('registrations')->find($id);
    }

    public function findByTournament(int $tournamentId): mixed
    {
        return Race::where('tournament_id', $tournamentId)->with('tournament')->withCount('registrations')->get();
    }

    public function create(array $data): mixed
    {
        return Race::create($data);
    }

    public function update(int $id, array $data): mixed
    {
        $race = Race::find($id);
        if ($race) {
            $race->update($data);
            return $race;
        }
        return null;
    }

    public function updateStatus(int $id, string $status): mixed
    {
        $race = Race::find($id);
        if ($race) {
            $race->update(['status' => $status]);
            return $race;
        }
        return null;
    }

    public function delete(int $id): bool
    {
        $race = Race::find($id);
        if ($race) {
            return $race->delete();
        }
        return false;
    }

    public function getLiveRaces(): mixed
    {
        return Race::where('status', 'ongoing')->with(['tournament', 'registrations.horse', 'registrations.jockey'])->get();
    }
}
