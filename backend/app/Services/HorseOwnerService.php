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
use App\DTOs\HorseOwnerDTO;

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

    public function registerHorseForRace(int $horseId, int $raceId): void
    {
        $jockey = User::where('role', 'jockey')->first();
        $jockeyId = $jockey ? $jockey->id : 4;

        $this->registrationRepository->create([
            'race_id'   => $raceId,
            'horse_id'  => $horseId,
            'jockey_id' => $jockeyId,
            'status'    => 'pending'
        ]);
    }

    public function updateHorseInfo(int $horseId, array $data): void
    {
        $this->horseRepository->updateHorse($horseId, $data);
    }

    public function hireJockeyForRace(int $horseId, int $jockeyId, int $raceId): void
    {
        // Tạo lời mời trong bảng horse_jockey (jockey sẽ thấy ở trang Invitations)
        \App\Models\HorseJockey::updateOrCreate(
            [
                'horse_id'  => $horseId,
                'jockey_id' => $jockeyId,
                'race_id'   => $raceId,
            ],
            ['status' => 'pending']
        );
    }

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

    public function viewRaceScheduleAndConfirmParticipation(int $horseId): array
    {
        $schedule = $this->horseOwnerRepository->getRaceScheduleForHorse($horseId);
        return $schedule ? $schedule->toArray() : [];
    }

    public function viewRaceInfo(int $raceId): array
    {
        $race = $this->raceRepository->findById($raceId);
        return $race ? $race->toArray() : [];
    }

    public function trackRaceResults(int $horseId): array
    {
        $results = $this->horseOwnerRepository->getRaceResults($horseId);
        return $results ? $results->toArray() : [];
    }

    public function getHorseRankings(int $horseId): array
    {
        $rankings = $this->horseOwnerRepository->getHorseRankings($horseId);
        return $rankings ? $rankings->toArray() : [];
    }

    public function getHorseRewards(int $horseId): array
    {
        $rewards = $this->horseOwnerRepository->getHorseRewards($horseId);
        return $rewards ? $rewards->toArray() : [];
    }

    public function getOwnerById(int $id): ?HorseOwnerDTO
    {
        $owner = $this->horseOwnerRepository->findHorseOwnerById($id);
        return $owner ? HorseOwnerDTO::fromModel($owner) : null;
    }

    public function registerOwner(HorseOwnerDTO $dto): HorseOwnerDTO
    {
        $owner = $this->horseOwnerRepository->createHorseOwner($dto->toModelAttributes());
        return HorseOwnerDTO::fromModel($owner);
    }

    public function updateOwnerInfo(int $id, HorseOwnerDTO $dto): ?HorseOwnerDTO
    {
        $owner = $this->horseOwnerRepository->updateHorseOwner($id, $dto->toModelAttributes());
        return $owner ? HorseOwnerDTO::fromModel($owner) : null;
    }

    public function deleteOwnerAccount(int $id): bool
    {
        return $this->horseOwnerRepository->deleteHorseOwner($id);
    }

    public function getOwnerByUserId(int $userId): ?HorseOwnerDTO
    {
        $owner = $this->horseOwnerRepository->findByUserId($userId);
        return $owner ? HorseOwnerDTO::fromModel($owner) : null;
    }

    public function getHorses(int $ownerId): array
    {
        $horses = $this->horseOwnerRepository->getHorses($ownerId);
        return $horses ? $horses->toArray() : [];
    }

    public function getHorsesForRace(int $ownerId, int $raceId): array
    {
        $horses = $this->horseOwnerRepository->getHorsesForRace($ownerId, $raceId);
        return $horses ? $horses->toArray() : [];
    }

    public function getJockeysForHorse(int $horseId): array
    {
        $jockeys = $this->horseOwnerRepository->getJockeysForHorse($horseId);
        return $jockeys ? $jockeys->toArray() : [];
    }
}
