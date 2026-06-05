<?php

namespace App\Services;

use App\Services\Contracts\IHorseOwnerService;
use App\Repositories\Contracts\IHorseOwnerRepository;
use App\DTOs\HorseOwnerDTO;

class HorseOwnerService implements IHorseOwnerService
{
    protected IHorseOwnerRepository $horseOwnerRepository;

    public function __construct(IHorseOwnerRepository $horseOwnerRepository)
    {
        $this->horseOwnerRepository = $horseOwnerRepository;
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
}
