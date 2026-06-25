<?php

namespace App\Repositories;

use App\Models\Registration;
use App\Repositories\Contracts\IRegistrationRepository;

class RegistrationRepository implements IRegistrationRepository
{
    public function findById(int $id): mixed
    {
        return Registration::with(['race.tournament', 'horse', 'jockey'])->find($id);
    }

    public function findByRace(int $raceId): mixed
    {
        return Registration::where('race_id', $raceId)->with(['horse', 'jockey'])->get();
    }

    public function findByHorse(int $horseId): mixed
    {
        return Registration::where('horse_id', $horseId)->with(['race.tournament', 'jockey'])->get();
    }

    public function findByJockey(int $jockeyUserId): mixed
    {
        return Registration::where('jockey_id', $jockeyUserId)->with(['race.tournament', 'horse'])->get();
    }

    public function create(array $data): mixed
    {
        return Registration::create($data);
    }

    public function updateStatus(int $id, string $status): mixed
    {
        $registration = Registration::find($id);
        if ($registration) {
            $registration->update(['status' => $status]);
            return $registration;
        }
        return null;
    }

    public function delete(int $id): bool
    {
        $registration = Registration::find($id);
        if ($registration) {
            return $registration->delete();
        }
        return false;
    }
}
