<?php

namespace App\Repositories\Contracts;

interface IJockeyRepository
{
    /**
     * Tìm kiếm nài ngựa theo ID
     *
     * @param int $id
     * @return mixed
     */
    public function findJockeyById(int $id): mixed;

    /**
     * Thêm nài ngựa mới
     *
     * @param array $data
     * @return mixed
     */
    public function createJockey(array $data): mixed;

    /**
     * Cập nhật thông tin nài ngựa
     *
     * @param int $id
     * @param array $data
     * @return mixed
     */
    public function updateJockey(int $id, array $data): mixed;

    /**
     * Xóa nài ngựa
     *
     * @param int $id
     * @return bool
     */
    public function deleteJockey(int $id): bool;

    /**
     * Lấy tất cả nài ngựa
     *
     * @return mixed
     */
    public function getAllJockeys(): mixed;

    public function findById(int $id): mixed;
    public function findByUserId(int $userId): mixed;
    public function getSchedule(int $jockeyUserId): mixed;
    public function getAll(): mixed;
}
