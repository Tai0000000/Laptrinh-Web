<?php

namespace App\Services\Contracts;

interface IHorseOwnerService
{
    /**
     * Đăng ký tài khoản tham gia hệ thống
     *
     * @param array $data
     * @return void
     */
    public function registerAccount(array $data): void;

    /**
     * Đăng ký ngựa tham gia giải đấu
     *
     * @param int $horseId
     * @param int $raceId
     * @return void
     */
    public function registerHorseForRace(int $horseId, int $raceId): void;

    /**
     * Quản lý thông tin ngựa
     *
     * @param int $horseId
     * @param array $data
     * @return void
     */
    public function updateHorseInfo(int $horseId, array $data): void;

    /**
     * Thuê/chọn jockey cho ngựa tham gia cuộc đua
     *
     * @param int $horseId
     * @param int $jockeyId
     * @param int $raceId
     * @return void
     */
    public function hireJockeyForRace(int $horseId, int $jockeyId, int $raceId): void;

    /**
     * Quản lý danh sách jockey của ngựa, xác nhận jockey tham gia cuộc đua
     *
     * @param int $horseId
     * @param int $raceId
     * @param int $jockeyId
     * @return void
     */
    public function confirmJockeyForRace(int $horseId, int $raceId, int $jockeyId): void;

    /**
     * Xem lịch thi đấu của ngựa, xác nhận cho ngựa tham gia cuộc đua
     *
     * @param int $horseId
     * @return array
     */
    public function viewRaceScheduleAndConfirmParticipation(int $horseId): array;

    /**
     * Xem thông tin cuộc đua
     *
     * @param int $raceId
     * @return array
     */
    public function viewRaceInfo(int $raceId): array;

    /**
     * Theo dõi kết quả thi đấu của ngựa
     *
     * @param int $horseId
     * @return array
     */
    public function trackRaceResults(int $horseId): array;

    /**
     * Xem bảng xếp hạng của ngựa
     *
     * @param int $horseId
     * @return array
     */
    public function getHorseRankings(int $horseId): array;

    /**
     * Xem tiền thưởng của ngựa
     *
     * @param int $horseId
     * @return array
     */
    public function getHorseRewards(int $horseId): array;
}
