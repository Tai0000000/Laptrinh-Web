<?php

namespace App\Repositories\Contracts;

interface IHorseOwnerRepository
{
    /**
     * Tìm kiếm chủ ngựa theo ID
     *
     * @param int $id
     * @return mixed
     */
    public function findHorseOwnerById(int $id): mixed;

    /**
     * Thêm chủ ngựa mới
     *
     * @param array $data
     * @return mixed
     */
    public function createHorseOwner(array $data): mixed;

    /**
     * Cập nhật thông tin chủ ngựa
     *
     * @param int $id
     * @param array $data
     * @return mixed
     */
    public function updateHorseOwner(int $id, array $data): mixed;

    /**
     * Xóa chủ ngựa
     *
     * @param int $id
     * @return bool
     */
    public function deleteHorseOwner(int $id): bool;
}

