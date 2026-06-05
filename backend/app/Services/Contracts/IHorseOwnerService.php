<?php

namespace App\Services\Contracts;

interface IHorseOwnerService
{
    public function getOwnerById(int $id): mixed;

    public function registerOwner(array $data): mixed;

    public function updateOwnerInfo(int $id, array $data): mixed;

    public function deleteOwnerAccount(int $id): bool;
}
