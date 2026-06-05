<?php

namespace App\Services;

use App\Services\Contracts\IHorseOwnerService;
use App\Repositories\Contracts\IHorseOwnerRepository;

class HorseOwnerService implements IHorseOwnerService
{
    protected IHorseOwnerRepository $horseOwnerRepository;

    public function __construct(IHorseOwnerRepository $horseOwnerRepository)
    {
        $this->horseOwnerRepository = $horseOwnerRepository;
    }

    public function getOwnerById(int $id): mixed
    {
        return $this->horseOwnerRepository->findHorseOwnerById($id);
    }

    public function registerOwner(array $data): mixed
    {
        return $this->horseOwnerRepository->createHorseOwner($data);
    }

    public function updateOwnerInfo(int $id, array $data): mixed
    {
        return $this->horseOwnerRepository->updateHorseOwner($id, $data);
    }

    public function deleteOwnerAccount(int $id): bool
    {
        return $this->horseOwnerRepository->deleteHorseOwner($id);
    }
}
