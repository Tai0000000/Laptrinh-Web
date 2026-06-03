<?php

namespace App\Services;

use App\Repositories\Contracts\IJockeyRepository;
use App\Services\Contracts\IJockeyService;

class JockeyService implements IJockeyService
{
    protected IJockeyRepository $jockeyRepository;

    public function __construct(IJockeyRepository $jockeyRepository)
    {
        $this->jockeyRepository = $jockeyRepository;
    }

    public function getJockeyById(int $id): mixed
    {
        return $this->jockeyRepository->findById($id);
    }

    public function getJockeyByUserId(int $userId): mixed
    {
        return $this->jockeyRepository->findByUserId($userId);
    }

    public function getJockeySchedule(int $jockeyUserId): mixed
    {
        return $this->jockeyRepository->getSchedule($jockeyUserId);
    }

    public function getAllJockeys(): mixed
    {
        return $this->jockeyRepository->getAll();
    }
}
