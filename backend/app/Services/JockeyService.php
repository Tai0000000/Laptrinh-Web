<?php

namespace App\Services;

use App\Services\Contracts\IJockeyService;
use App\Repositories\Contracts\IJockeyRepository;
use App\DTOs\JockeyDTO;

class JockeyService implements IJockeyService
{
    protected IJockeyRepository $jockeyRepository;

    public function __construct(IJockeyRepository $jockeyRepository)
    {
        $this->jockeyRepository = $jockeyRepository;
    }

    public function getJockeyById(int $id): ?JockeyDTO
    {
        $jockey = $this->jockeyRepository->findJockeyById($id);
        return $jockey ? JockeyDTO::fromModel($jockey) : null;
    }

    public function createJockey(JockeyDTO $dto): JockeyDTO
    {
        $jockey = $this->jockeyRepository->createJockey($dto->toModelAttributes());
        return JockeyDTO::fromModel($jockey);
    }

    public function updateJockey(int $id, JockeyDTO $dto): ?JockeyDTO
    {
        $jockey = $this->jockeyRepository->updateJockey($id, $dto->toModelAttributes());
        return $jockey ? JockeyDTO::fromModel($jockey) : null;
    }

    public function deleteJockey(int $id): bool
    {
        return $this->jockeyRepository->deleteJockey($id);
    }

    /**
     * @return JockeyDTO[]
     */
    public function getAllJockeys(): array
    {
        $jockeys = $this->jockeyRepository->getAllJockeys();
        $dtos = [];
        foreach ($jockeys as $jockey) {
            $dtos[] = JockeyDTO::fromModel($jockey);
        }
        return $dtos;
    }
}
