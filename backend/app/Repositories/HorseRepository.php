<?php

namespace App\Repositories;


use App\Models\Horse;
use App\Repositories\Contracts\IHorseRepository;

class HorseRepository implements IHorseRepository
{
    public function findById(int $id): mixed
    {
        return Horse::with('owner')->find($id);
    }

    public function findByOwnerId(int $horseOwnerId): mixed
    {
        return Horse::where('horse_owner_id', $horseOwnerId)->get();
    }

    public function create(array $data): mixed

use App\Repositories\Contracts\IHorseRepository;

use App\Models\Horse;

class HorseRepository implements IHorseRepository
{
    /**
     * Tìm kiếm ngựa theo ID
     *
     * @param int $id
     * @return mixed
     */
    public function findHorseById(int $id): mixed
    {
        return Horse::find($id);
    }

    /**
     * Thêm ngựa mới
     *
     * @param array $data
     * @return mixed
     */
    public function createHorse(array $data): mixed

    {
        return Horse::create($data);
    }


    public function update(int $id, array $data): mixed

    /**
     * Cập nhật thông tin ngựa
     *
     * @param int $id
     * @param array $data
     * @return mixed
     */
    public function updateHorse(int $id, array $data): mixed

    {
        $horse = Horse::find($id);
        if ($horse) {
            $horse->update($data);
            return $horse;
        }
        return null;
    }


    public function delete(int $id): bool

    /**
     * Xóa ngựa
     *
     * @param int $id
     * @return bool
     */
    public function deleteHorse(int $id): bool

    {
        $horse = Horse::find($id);
        if ($horse) {
            return $horse->delete();
        }
        return false;
    }


    public function getAll(): mixed
    {
        return Horse::with('owner')->get();
    }
}

    /**
     * Lấy danh sách ngựa của chủ ngựa
     *
     * @param int $horseOwnerId
     * @return mixed
     */
    public function getHorsesByOwnerId(int $horseOwnerId): mixed
    {
        return Horse::where('horse_owner_id', $horseOwnerId)->get();
    }

    /**
     * Đếm số lượng ngựa của chủ ngựa
     *
     * @param int $horseOwnerId
     * @return int
     */
    public function countHorsesByOwnerId(int $horseOwnerId): int
    {
        return Horse::where('horse_owner_id', $horseOwnerId)->count();
    }
}


