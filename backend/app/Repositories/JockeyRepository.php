<?php

namespace App\Repositories;

use App\Models\Jockey;
use App\Models\Registration;
use App\Models\User;
use App\Repositories\Contracts\IJockeyRepository;

class JockeyRepository implements IJockeyRepository
{
    public function findById(int $id): mixed
    {
        return Jockey::with('user')->find($id);
    }

    public function findByUserId(int $userId): mixed
    {
        return Jockey::where('user_id', $userId)->with('user')->first();
    }

    public function getSchedule(int $jockeyUserId): mixed
    {
        return Registration::where('jockey_id', $jockeyUserId)
            ->whereIn('status', ['pending', 'confirmed'])
            ->with(['race.tournament', 'horse'])
            ->get();
    }

    public function getAll(): mixed
    {
        return User::where('role', 'jockey')->get();
    }
}
