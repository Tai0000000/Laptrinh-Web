<?php

namespace App\Repositories;

use App\Repositories\Contracts\IHorseOwnerRepository;
use App\Models\Horse;

use App\Models\HorseOwner;

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
     * Cập nhật thông tin chủ ngựa
     *
     * @param int $id
     * @param array $data
     * @return mixed
     */
    public function updateHorseOwner(int $id, array $data): mixed
    {
        $owner = HorseOwner::find($id);
        if ($owner) {
            $owner->update($data);
            return $owner;
        }
        return null;
    }

    /**
     * Xóa chủ ngựa
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
}
