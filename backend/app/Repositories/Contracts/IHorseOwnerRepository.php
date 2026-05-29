<?php

namespace App\Repositories\Contracts;

interface IHorseOwnerRepository
{
    /**
     * Tìm chủ ngựa theo ID
     *
     * @param int $id
     * @return mixed
     */
    public function findById(int $id): mixed;

    /**
     * Tìm chủ ngựa theo user ID
     *
     * @param int $userId
     * @return mixed
     */
    public function findByUserId(int $userId): mixed;

    /**
     * Tạo chủ ngựa mới
     *
     * @param array $data
     * @return mixed
     */
    public function create(array $data): mixed;

    /**
     * Cập nhật thông tin chủ ngựa
     *
     * @param int $id
     * @param array $data
     * @return mixed
     */
    public function update(int $id, array $data): mixed;

    /**
     * Xóa chủ ngựa
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * Lấy danh sách ngựa của chủ ngựa
     *
     * @param int $horseOwnerId
     * @return mixed
     */
    public function getHorses(int $horseOwnerId): mixed;

    /**
     * Lấy danh sách ngựa tham gia giải đấu
     *
     * @param int $horseOwnerId
     * @param int $raceId
     * @return mixed
     */
    public function getHorsesForRace(int $horseOwnerId, int $raceId): mixed;

    /**
     * Lấy danh sách jockey của ngựa
     *
     * @param int $horseId
     * @return mixed
     */
    public function getJockeysForHorse(int $horseId): mixed;

    /**
     * Lấy lịch thi đấu của ngựa
     *
     * @param int $horseId
     * @return mixed
     */
    public function getRaceScheduleForHorse(int $horseId): mixed;

    /**
     * Lấy kết quả thi đấu của ngựa
     *
     * @param int $horseId
     * @return mixed
     */
    public function getRaceResults(int $horseId): mixed;

    /**
     * Lấy bảng xếp hạng của ngựa
     *
     * @param int $horseId
     * @return mixed
     */
    public function getHorseRankings(int $horseId): mixed;

    /**
     * Lấy tiền thưởng của ngựa
     *
     * @param int $horseId
     * @return mixed
     */
    public function getHorseRewards(int $horseId): mixed;
}
