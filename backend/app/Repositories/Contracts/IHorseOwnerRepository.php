<?php

namespace App\Repositories\Contracts;

interface IHorseOwnerRepository
{
    /**
     * Find horse owner by ID
     *
     * @param int $id
     * @return mixed
     */
    public function findById(int $id): mixed;

    /**
     * Find horse owner by user ID
     *
     * @param int $userId
     * @return mixed
     */
    public function findByUserId(int $userId): mixed;

    /**
     * Create a new horse owner
     *
     * @param array $data
     * @return mixed
     */
    public function create(array $data): mixed;

    /**
     * Update horse owner details
     *
     * @param int $id
     * @param array $data
     * @return mixed
     */
    public function update(int $id, array $data): mixed;

    /**
     * Delete a horse owner
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * Get all horses owned by this owner
     *
     * @param int $horseOwnerId
     * @return mixed
     */
    public function getHorses(int $horseOwnerId): mixed;

    /**
     * Get owner's horses participating in a specific race
     *
     * @param int $horseOwnerId
     * @param int $raceId
     * @return mixed
     */
    public function getHorsesForRace(int $horseOwnerId, int $raceId): mixed;

    /**
     * Get jockeys associated with the horse
     *
     * @param int $horseId
     * @return mixed
     */
    public function getJockeysForHorse(int $horseId): mixed;

    /**
     * Get race schedule for a specific horse
     *
     * @param int $horseId
     * @return mixed
     */
    public function getRaceScheduleForHorse(int $horseId): mixed;

    /**
     * Get race results for a specific horse
     *
     * @param int $horseId
     * @return mixed
     */
    public function getRaceResults(int $horseId): mixed;

    /**
     * Get rankings for a specific horse
     *
     * @param int $horseId
     * @return mixed
     */
    public function getHorseRankings(int $horseId): mixed;

    /**
     * Get rewards for a specific horse
     *
     * @param int $horseId
     * @return mixed
     */
    public function getHorseRewards(int $horseId): mixed;
}
