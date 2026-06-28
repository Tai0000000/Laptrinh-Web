<?php

namespace App\Services;

use App\Repositories\Contracts\IRegistrationRepository;
use App\Services\Contracts\IRegistrationService;

class RegistrationService implements IRegistrationService
{
    protected IRegistrationRepository $registrationRepository;

    public function __construct(IRegistrationRepository $registrationRepository)
    {
        $this->registrationRepository = $registrationRepository;
    }

    public function getRegistrationById(int $id): mixed
    {
        return $this->registrationRepository->findById($id);
    }

    public function getRegistrationsByRace(int $raceId): mixed
    {
        return $this->registrationRepository->findByRace($raceId);
    }

    public function getRegistrationsByHorse(int $horseId): mixed
    {
        return $this->registrationRepository->findByHorse($horseId);
    }

    public function getRegistrationsByJockey(int $jockeyUserId): mixed
    {
        return $this->registrationRepository->findByJockey($jockeyUserId);
    }

    public function createRegistration(array $data): mixed
    {
        return $this->registrationRepository->create($data);
    }

    public function updateRegistrationStatus(int $id, string $status): mixed
    {
        return $this->registrationRepository->updateStatus($id, $status);
    }

    public function deleteRegistration(int $id): bool
    {
        return $this->registrationRepository->delete($id);
    }
}
