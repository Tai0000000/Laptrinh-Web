<?php

namespace App\Repositories;

use App\Models\Bet;
use App\Repositories\Contracts\IBetRepository;

class BetRepository implements IBetRepository
{
    public function findById(int $id): mixed
    {
        return Bet::with(['user', 'registration.horse', 'registration.race.tournament'])->find($id);
    }

    public function findByUser(int $userId): mixed
    {
        return Bet::where('user_id', $userId)->with(['registration.horse', 'registration.race.tournament'])->get();
    }

    public function findByRegistration(int $registrationId): mixed
    {
        return Bet::where('registration_id', $registrationId)->with('user')->get();
    }

    public function create(array $data): mixed
    {
        return Bet::create($data);
    }

    public function updateStatus(int $id, string $status): mixed
    {
        $bet = Bet::find($id);
        if ($bet) {
            $bet->update(['status' => $status]);
            return $bet;
        }
        return null;
    }

    public function settleBetsByRace(int $raceId, int $winnerRegistrationId): void
    {
        $bets = Bet::whereHas('registration', function ($query) use ($raceId) {
            $query->where('race_id', $raceId);
        })->where('status', 'pending')->get();

        foreach ($bets as $bet) {
            if ($bet->registration_id === $winnerRegistrationId) {
                $bet->update(['status' => 'won']);
            } else {
                $bet->update(['status' => 'lost']);
            }
        }
    }
}
