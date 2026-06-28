<?php

namespace App\Repositories;

use App\Models\Jockey;
use App\Models\Registration;
use App\Models\User;
use App\Repositories\Contracts\IJockeyRepository;

class JockeyRepository implements IJockeyRepository
{
    /**
     * Tìm kiếm nài ngựa theo ID
     *
     * @param int $id
     * @return mixed
     */
    public function findJockeyById(int $id): mixed
    {
        return Jockey::with('user')->find($id);
    }

    /**
     * Thêm nài ngựa mới
     *
     * @param array $data
     * @return mixed
     */
    public function createJockey(array $data): mixed
    {
        return Jockey::create($data);
    }

    /**
     * Cập nhật thông tin nài ngựa
     *
     * @param int $id
     * @param array $data
     * @return mixed
     */
    public function updateJockey(int $id, array $data): mixed
    {
        $jockey = Jockey::with('user')->find($id);
        if ($jockey) {
            // Update associated user if user details are provided
            if ($jockey->user) {
                $userData = [];
                if (isset($data['name'])) $userData['name'] = $data['name'];
                if (isset($data['email'])) $userData['email'] = $data['email'];
                if (!empty($userData)) {
                    $jockey->user->update($userData);
                }
            }

            $jockeyData = array_filter($data, function($key) {
                return $key === 'user_id';
            }, ARRAY_FILTER_USE_KEY);
            if (!empty($jockeyData)) {
                $jockey->update($jockeyData);
            }

            $jockey->load('user');
            return $jockey;
        }
        return null;
    }

    /**
     * Xóa nài ngựa
     *
     * @param int $id
     * @return bool
     */
    public function deleteJockey(int $id): bool
    {
        $jockey = Jockey::find($id);
        if ($jockey) {
            return $jockey->delete();
        }
        return false;
    }

    /**
     * Lấy tất cả nài ngựa
     *
     * @return mixed
     */
    public function getAllJockeys(): mixed
    {
        return Jockey::with('user')->get();
    }

    public function findById(int $id): mixed
    {
        return Jockey::with('user')->find($id);
    }

    public function findByUserId(int $userId): mixed
    {
        return Jockey::where('user_id', $userId)->with('user')->first();
    }

    public function getSchedule(int $jockeyUserId): mixed
    {
        return Registration::where('jockey_id', $jockeyUserId)
            ->whereIn('status', ['pending', 'confirmed'])
            ->with(['race.tournament', 'horse'])
            ->get();
    }

    public function getAll(): mixed
    {
        return User::where('role', 'jockey')->get();
    }
}
