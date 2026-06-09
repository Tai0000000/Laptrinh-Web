<?php

namespace App\Http\Controllers\API;

use App\Services\Contracts\IHorseService;
use App\Http\Requests\HorseRequest\GetHorsesByOwnerRequest;
use App\Http\Requests\HorseRequest\GetHorseByIdRequest;
use App\Http\Requests\HorseRequest\AddHorseRequest;
use App\Http\Requests\HorseRequest\UpdateHorseRequest;
use App\Http\Requests\HorseRequest\RemoveHorseRequest;
use App\Http\Resources\HorseResource\HorseResource;
use App\DTOs\HorseDTO;

class HorseController
{
    protected IHorseService $horseService;

    public function __construct(IHorseService $horseService)
    {
        $this->horseService = $horseService;
    }

    /**
     * GET /api/owners/{ownerId}/horses
     */
    public function getHorsesByOwner(GetHorsesByOwnerRequest $request, int $ownerId)
    {
        $ownerId = 10; // Hardcode for testing
        $dtos = $this->horseService->getHorsesByOwner($ownerId);
        return HorseResource::collection($dtos);
    }

    /**
     * GET /api/horses/{horseId}
     */
    public function getHorseById(GetHorseByIdRequest $request, int $horseId)
    {
        $dto = $this->horseService->getHorseById($horseId);
        if (!$dto) {
            return response()->json(['message' => 'Ngựa không tồn tại'], 404);
        }
        return new HorseResource($dto);
    }

    /**
     * POST /api/horses
     */
    public function createHorse(AddHorseRequest $request)
    {
        $data = $request->validated();
        $data['horse_owner_id'] = 10; // Hardcode for testing
        $dto = HorseDTO::fromArray($data);
        $resultDto = $this->horseService->addHorse($dto);
        return (new HorseResource($resultDto))->response()->setStatusCode(201);
    }

    /**
     * PUT /api/horses/{horseId}
     */
    public function updateHorse(UpdateHorseRequest $request, int $horseId)
    {
        $dto = $request->toDTO();
        $resultDto = $this->horseService->updateHorse($horseId, $dto);
        if (!$resultDto) {
            return response()->json(['message' => 'Ngựa không tồn tại hoặc cập nhật thất bại'], 404);
        }
        return new HorseResource($resultDto);
    }

    /**
     * DELETE /api/horses/{horseId}
     */
    public function deleteHorse(RemoveHorseRequest $request, int $horseId)
    {
        $deleted = $this->horseService->removeHorse($horseId);
        if (!$deleted) {
            return response()->json(['message' => 'Ngựa không tồn tại hoặc xóa thất bại'], 404);
        }
        return response()->json(null, 204);
    }
}
