<?php

namespace App\Services\Contracts;

use App\DTOs\HorseOwnerDTO;

interface IHorseOwnerService
{
    public function getOwnerById(int $id): ?HorseOwnerDTO;

    public function registerOwner(HorseOwnerDTO $dto): HorseOwnerDTO;

    public function updateOwnerInfo(int $id, HorseOwnerDTO $dto): ?HorseOwnerDTO;

    public function deleteOwnerAccount(int $id): bool;
}
