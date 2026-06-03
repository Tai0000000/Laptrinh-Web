<?php

namespace App\Repositories;

use App\Models\RaceResult;
use App\Repositories\Contracts\IRaceResultRepository;

class RaceResultRepository implements IRaceResultRepository
{
    public function findByRace(int $raceId): mixed
    {
        return RaceResult::where('race_id', $raceId)->with(['registration.horse', 'registration.jockey'])->get();
    }

    public function findByRegistration(int $registrationId): mixed
    {
        return RaceResult::where('registration_id', $registrationId)->with(['race.tournament', 'registration.horse', 'registration.jockey'])->first();
    }

    public function create(array $data): mixed
    {
        return RaceResult::create($data);
    }

    public function update(int $id, array $data): mixed
    {
        $result = RaceResult::find($id);
        if ($result) {
            $result->update($data);
            return $result;
        }
        return null;
    }

    public function getLeaderboard(int $raceId): mixed
    {
        return RaceResult::where('race_id', $raceId)
            ->with(['registration.horse', 'registration.jockey'])
            ->orderBy('rank', 'asc')
            ->get();
    }
}
