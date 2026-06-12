<?php

namespace App\Repositories\Contracts;

interface IHorseRepository
{
    /**
     * Tìm kiếm ngựa theo ID
     *
     * @param int $id
     * @return mixed
     */
    public function findHorseById(int $id): mixed;

    /**
     * Thêm ngựa mới
     *
     * @param array $data
     * @return mixed
     */
    public function createHorse(array $data): mixed;

    /**
     * Cập nhật thông tin ngựa
     *
     * @param int $id
     * @param array $data
     * @return mixed
     */
    public function updateHorse(int $id, array $data): mixed;

    /**
     * Xóa ngựa
     *
     * @param int $id
     * @return bool
     */
    public function deleteHorse(int $id): bool;

    /**
     * Lấy danh sách ngựa của chủ ngựa
     *
     * @param int $horseOwnerId
     * @return mixed
     */
    public function getHorsesByOwnerId(int $horseOwnerId): mixed;
}
