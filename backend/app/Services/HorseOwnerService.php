<?php

namespace App\Services;

use App\Enums\Role;
use App\Models\User;
use App\Models\HorseOwner;
use App\Models\Registration;
use App\Repositories\Contracts\IHorseOwnerRepository;
use App\Repositories\Contracts\IHorseRepository;
use App\Repositories\Contracts\IRaceRepository;
use App\Repositories\Contracts\IRegistrationRepository;
use App\Services\Contracts\IHorseOwnerService;
use Illuminate\Support\Facades\Hash;

class HorseOwnerService implements IHorseOwnerService
{
    protected IHorseOwnerRepository $horseOwnerRepository;
    protected IHorseRepository $horseRepository;
    protected IRaceRepository $raceRepository;
    protected IRegistrationRepository $registrationRepository;

    public function __construct(
        IHorseOwnerRepository $horseOwnerRepository,
        IHorseRepository $horseRepository,
        IRaceRepository $raceRepository,
        IRegistrationRepository $registrationRepository
    ) {
        $this->horseOwnerRepository = $horseOwnerRepository;
        $this->horseRepository = $horseRepository;
        $this->raceRepository = $raceRepository;
        $this->registrationRepository = $registrationRepository;
    }

    /**
     * Register a new horse owner account
     *
     * @param array $data
     * @return void
     */
    public function registerAccount(array $data): void
    {
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => Role::HorseOwner,
        ]);

        HorseOwner::create([
            'user_id' => $user->id,
        ]);
    }

    /**
     * Register a horse for a race
     *
     * @param int $horseId
     * @param int $raceId
     * @return void
     */
    public function registerHorseForRace(int $horseId, int $raceId): void
    {
        // Find first available jockey in the system to satisfy the non-null FK constraint
        $jockey = User::where('role', 'jockey')->first();
        $jockeyId = $jockey ? $jockey->id : 4; // fallback to 4 if none exists

        $this->registrationRepository->create([
            'race_id'   => $raceId,
            'horse_id'  => $horseId,
            'jockey_id' => $jockeyId,
            'status'    => 'pending'
        ]);
    }

    /**
     * Update horse information
     *
     * @param int $horseId
     * @param array $data
     * @return void
     */
    public function updateHorseInfo(int $horseId, array $data): void
    {
        $this->horseRepository->update($horseId, $data);
    }

    /**
     * Hire a jockey for a race
     *
     * @param int $horseId
     * @param int $jockeyId
     * @param int $raceId
     * @return void
     */
    public function hireJockeyForRace(int $horseId, int $jockeyId, int $raceId): void
    {
        $registration = Registration::where('horse_id', $horseId)
            ->where('race_id', $raceId)
            ->first();

        if ($registration) {
            $registration->update([
                'jockey_id' => $jockeyId,
                'status'    => 'pending' // reset to pending for confirmation
            ]);
        } else {
            $this->registrationRepository->create([
                'race_id'   => $raceId,
                'horse_id'  => $horseId,
                'jockey_id' => $jockeyId,
                'status'    => 'pending'
            ]);
        }
    }

    /**
     * Confirm jockey selection for a race
     *
     * @param int $horseId
     * @param int $raceId
     * @param int $jockeyId
     * @return void
     */
    public function confirmJockeyForRace(int $horseId, int $raceId, int $jockeyId): void
    {
        $registration = Registration::where('horse_id', $horseId)
            ->where('race_id', $raceId)
            ->where('jockey_id', $jockeyId)
            ->first();

        if ($registration) {
            $registration->update([
                'status' => 'confirmed'
            ]);
        }
    }

    /**
     * View race schedule and confirm horse participation
     *
     * @param int $horseId
     * @return array
     */
    public function viewRaceScheduleAndConfirmParticipation(int $horseId): array
    {
        $schedule = $this->horseOwnerRepository->getRaceScheduleForHorse($horseId);
        return $schedule ? $schedule->toArray() : [];
    }

    /**
     * View race details
     *
     * @param int $raceId
     * @return array
     */
    public function viewRaceInfo(int $raceId): array
    {
        $race = $this->raceRepository->findById($raceId);
        return $race ? $race->toArray() : [];
    }

    /**
     * Track race results of a horse
     *
     * @param int $horseId
     * @return array
     */
    public function trackRaceResults(int $horseId): array
    {
        $results = $this->horseOwnerRepository->getRaceResults($horseId);
        return $results ? $results->toArray() : [];
    }

    /**
     * View horse rankings
     *
     * @param int $horseId
     * @return array
     */
    public function getHorseRankings(int $horseId): array
    {
        $rankings = $this->horseOwnerRepository->getHorseRankings($horseId);
        return $rankings ? $rankings->toArray() : [];
    }

    /**
     * View horse rewards
     *
     * @param int $horseId
     * @return array
     */
    public function getHorseRewards(int $horseId): array
    {
        $rewards = $this->horseOwnerRepository->getHorseRewards($horseId);
        return $rewards ? $rewards->toArray() : [];
    }
}
