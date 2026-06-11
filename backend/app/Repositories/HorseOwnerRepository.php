<?php

namespace App\Repositories;

use App\Repositories\Contracts\IHorseOwnerRepository;
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
     * Cập nhật thông tin chủ ngựa
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
