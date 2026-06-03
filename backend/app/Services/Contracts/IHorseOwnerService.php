<?php

namespace App\Services\Contracts;

interface IHorseOwnerService
{
    /**
     * Register a new account to participate in the system
     *
     * @param array $data
     * @return void
     */
    public function registerAccount(array $data): void;

    /**
     * Register a horse for a tournament race
     *
     * @param int $horseId
     * @param int $raceId
     * @return void
     */
    public function registerHorseForRace(int $horseId, int $raceId): void;

    /**
     * Manage horse details
     *
     * @param int $horseId
     * @param array $data
     * @return void
     */
    public function updateHorseInfo(int $horseId, array $data): void;

    /**
     * Hire/select a jockey for a horse in a specific race
     *
     * @param int $horseId
     * @param int $jockeyId
     * @param int $raceId
     * @return void
     */
    public function hireJockeyForRace(int $horseId, int $jockeyId, int $raceId): void;

    /**
     * Manage horse's jockey list and confirm jockey participation
     *
     * @param int $horseId
     * @param int $raceId
     * @param int $jockeyId
     * @return void
     */
    public function confirmJockeyForRace(int $horseId, int $raceId, int $jockeyId): void;

    /**
     * View horse race schedule and confirm participation
     *
     * @param int $horseId
     * @return array
     */
    public function viewRaceScheduleAndConfirmParticipation(int $horseId): array;

    /**
     * View race details
     *
     * @param int $raceId
     * @return array
     */
    public function viewRaceInfo(int $raceId): array;

    /**
     * Track race results of a horse
     *
     * @param int $horseId
     * @return array
     */
    public function trackRaceResults(int $horseId): array;

    /**
     * View horse rankings
     *
     * @param int $horseId
     * @return array
     */
    public function getHorseRankings(int $horseId): array;

    /**
     * View horse rewards
     *
     * @param int $horseId
     * @return array
     */
    public function getHorseRewards(int $horseId): array;
}
