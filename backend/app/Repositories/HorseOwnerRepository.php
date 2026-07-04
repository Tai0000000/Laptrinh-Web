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

     * Tìm kiếm chủ ngựa theo ID

     *
     * @param int $id
     * @return mixed
     */
    public function findHorseOwnerById(int $id): mixed
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

        return HorseOwner::with('user')->find($id);
    }

    /**
     * Thêm chủ ngựa mới

     *
     * @param array $data
     * @return mixed
     */
    public function createHorseOwner(array $data): mixed
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
    public function updateHorseOwner(int $id, array $data): mixed
    {
        $owner = HorseOwner::with('user')->find($id);
        if ($owner) {
            // Update associated user if user details are provided
            if ($owner->user) {
                $userData = [];
                if (isset($data['name'])) $userData['name'] = $data['name'];
                if (isset($data['email'])) $userData['email'] = $data['email'];
                if (!empty($userData)) {
                    $owner->user->update($userData);
                }
            }
            // Update the horse owner record itself
            $ownerData = array_filter($data, function($key) {
                return $key === 'user_id';
            }, ARRAY_FILTER_USE_KEY);
            if (!empty($ownerData)) {
                $owner->update($ownerData);
            }
            
            // Reload user relation to return updated data
            $owner->load('user');

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
    public function deleteHorseOwner(int $id): bool
    {
        $owner = HorseOwner::find($id);
        if ($owner) {
            return $owner->delete();
        }
        return false;
    }

    public function delete(int $id): bool
    {
        return $this->deleteHorseOwner($id);
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
     * Get race schedule for a specific horse — includes registration info
     */
    public function getRaceScheduleForHorse(int $horseId): mixed
    {
        // Lấy trực tiếp từ registrations để có đủ thông tin
        return Registration::where('horse_id', $horseId)
            ->with(['race.tournament'])
            ->get()
            ->map(fn($reg) => [
                'registration_id'     => $reg->id,
                'id'                  => $reg->race_id,
                'name'                => $reg->race->name ?? $reg->race->round ?? "Cuộc đua #{$reg->race_id}",
                'race_time'           => $reg->race->race_time,
                'distance'            => $reg->race->distance,
                'status'              => $reg->race->status,
                'registration_status' => $reg->status,
                'lane'                => $reg->lane,
                'jockey_id'           => $reg->jockey_id,
                'tournament_id'       => $reg->race->tournament_id,
                'tournament'          => $reg->race->tournament,
            ]);
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
