<?php

namespace App\Repositories;

use App\Models\HorseOwner;
use App\Models\Horse;
use App\Models\Registration;
use App\Models\Race;
use App\Models\RaceResult;
use App\Models\User;
use App\Repositories\Contracts\IHorseOwnerRepository;

class HorseOwnerRepository implements IHorseOwnerRepository
{
    /**
     * Find horse owner by ID
     *
     * @param int $id
     * @return mixed
     */
    public function findById(int $id): mixed
    {
        return HorseOwner::find($id);
    }

    /**
     * Find horse owner by user ID
     *
     * @param int $userId
     * @return mixed
     */
    public function findByUserId(int $userId): mixed
    {
        return HorseOwner::where('user_id', $userId)->first();
    }

    /**
     * Create a new horse owner
     *
     * @param array $data
     * @return mixed
     */
    public function create(array $data): mixed
    {
        return HorseOwner::create($data);
    }

    /**
     * Update horse owner details
     *
     * @param int $id
     * @param array $data
     * @return mixed
     */
    public function update(int $id, array $data): mixed
    {
        $owner = HorseOwner::find($id);
        if ($owner) {
            $owner->update($data);
            return $owner;
        }
        return null;
    }

    /**
     * Delete a horse owner
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $owner = HorseOwner::find($id);
        if ($owner) {
            return $owner->delete();
        }
        return false;
    }

    /**
     * Get all horses owned by this owner
     *
     * @param int $horseOwnerId
     * @return mixed
     */
    public function getHorses(int $horseOwnerId): mixed
    {
        return Horse::where('horse_owner_id', $horseOwnerId)->get();
    }

    /**
     * Get owner's horses participating in a specific race
     *
     * @param int $horseOwnerId
     * @param int $raceId
     * @return mixed
     */
    public function getHorsesForRace(int $horseOwnerId, int $raceId): mixed
    {
        return Horse::where('horse_owner_id', $horseOwnerId)
            ->whereHas('registrations', function ($query) use ($raceId) {
                $query->where('race_id', $raceId);
            })
            ->get();
    }

    /**
     * Get jockeys associated with the horse
     *
     * @param int $horseId
     * @return mixed
     */
    public function getJockeysForHorse(int $horseId): mixed
    {
        $jockeyIds = Registration::where('horse_id', $horseId)->pluck('jockey_id')->unique();
        return User::whereIn('id', $jockeyIds)->get();
    }

    /**
     * Get race schedule for a specific horse
     *
     * @param int $horseId
     * @return mixed
     */
    public function getRaceScheduleForHorse(int $horseId): mixed
    {
        return Race::whereHas('registrations', function ($query) use ($horseId) {
            $query->where('horse_id', $horseId);
        })->with('tournament')->get();
    }

    /**
     * Get race results for a specific horse
     *
     * @param int $horseId
     * @return mixed
     */
    public function getRaceResults(int $horseId): mixed
    {
        return RaceResult::whereHas('registration', function ($query) use ($horseId) {
            $query->where('horse_id', $horseId);
        })->with(['race.tournament', 'registration.jockey'])->get();
    }

    /**
     * Get rankings for a specific horse
     *
     * @param int $horseId
     * @return mixed
     */
    public function getHorseRankings(int $horseId): mixed
    {
        return RaceResult::whereHas('registration', function ($query) use ($horseId) {
            $query->where('horse_id', $horseId);
        })->select('id', 'race_id', 'registration_id', 'rank', 'finish_time')->get();
    }

    /**
     * Get rewards for a specific horse
     *
     * @param int $horseId
     * @return mixed
     */
    public function getHorseRewards(int $horseId): mixed
    {
        $results = RaceResult::whereHas('registration', function ($query) use ($horseId) {
            $query->where('horse_id', $horseId);
        })->with('race.tournament')->get();

        return $results->map(function ($res) {
            $amount = 0;
            if ($res->rank === 1) $amount = 10000000;
            elseif ($res->rank === 2) $amount = 5000000;
            elseif ($res->rank === 3) $amount = 2000000;

            return [
                'race_result_id' => $res->id,
                'race' => $res->race,
                'rank' => $res->rank,
                'reward_amount' => $amount,
                'description' => "Reward for rank " . ($res->rank ?? 'N/A') . " in race " . ($res->race->id ?? '')
            ];
        });
    }
}
