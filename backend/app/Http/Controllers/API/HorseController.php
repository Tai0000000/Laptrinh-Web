<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\IHorseService;
use App\Http\Requests\HorseRequest\GetHorsesByOwnerRequest;
use App\Http\Requests\HorseRequest\GetHorseByIdRequest;
use App\Http\Requests\HorseRequest\AddHorseRequest;
use App\Http\Requests\HorseRequest\UpdateHorseRequest;
use App\Http\Requests\HorseRequest\RemoveHorseRequest;
use App\Http\Resources\HorseResource\HorseResource;

class HorseController extends Controller
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
        $dtos = $this->horseService->getHorsesByOwner($ownerId);
        return HorseResource::collection($dtos);
    }

    /**
     * GET /api/horses/{id}
     */
    public function getHorseById(GetHorseByIdRequest $request, int $id)
    {
        $dto = $this->horseService->getHorseById($id);
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
        $dto = $request->toDTO();
        $resultDto = $this->horseService->addHorse($dto);
        return (new HorseResource($resultDto))->response()->setStatusCode(201);
    }

    /**
     * PUT /api/horses/{id}
     */
    public function updateHorse(UpdateHorseRequest $request, int $id)
    {
        $dto = $request->toDTO();
        $resultDto = $this->horseService->updateHorse($id, $dto);
        if (!$resultDto) {
            return response()->json(['message' => 'Ngựa không tồn tại hoặc cập nhật thất bại'], 404);
        }
        return new HorseResource($resultDto);
    }

    /**
     * DELETE /api/horses/{id}
     */
    public function deleteHorse(RemoveHorseRequest $request, int $id)
    {
        $deleted = $this->horseService->removeHorse($id);
        if (!$deleted) {
            return response()->json(['message' => 'Ngựa không tồn tại hoặc xóa thất bại'], 404);
        }
        return response()->json(null, 204);
    }
}
