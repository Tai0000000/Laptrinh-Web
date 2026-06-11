<?php

namespace App\Http\Controllers\API;

use App\Services\Contracts\IHorseOwnerService;
use App\Http\Requests\HorseOwnerRequest\GetOwnerByIdRequest;
use App\Http\Requests\HorseOwnerRequest\RegisterOwnerRequest;
use App\Http\Requests\HorseOwnerRequest\UpdateOwnerInfoRequest;
use App\Http\Requests\HorseOwnerRequest\DeleteOwnerAccountRequest;
use App\Http\Resources\HorseOwnerResource\HorseOwnerResource;

class HorseOwnerController
{
    protected IHorseOwnerService $horseOwnerService;

    public function __construct(IHorseOwnerService $horseOwnerService)
    {
        $this->horseOwnerService = $horseOwnerService;
    }

    /**
     * GET /api/owners/{ownerId}
     */
    public function getHorseOwnerById(GetOwnerByIdRequest $request, int $ownerId)
    {
        $ownerId = 10;

        $dto = $this->horseOwnerService->getOwnerById($ownerId);
        if (!$dto) {
            return response()->json(['message' => 'Chủ ngựa không tồn tại'], 404);
        }
        return new HorseOwnerResource($dto);
    }

    /**
     * POST /api/owners
     */
    public function createHorseOwner(RegisterOwnerRequest $request)
    {
        $dto = $request->toDTO();
        $resultDto = $this->horseOwnerService->registerOwner($dto);
        return (new HorseOwnerResource($resultDto))->response()->setStatusCode(201);
    }

    /**
     * PUT /api/owners/{ownerId}
     */
    public function updateHorseOwner(UpdateOwnerInfoRequest $request, int $ownerId)
    {
        $dto = $request->toDTO();
        $resultDto = $this->horseOwnerService->updateOwnerInfo($ownerId, $dto);
        if (!$resultDto) {
            return response()->json(['message' => 'Chủ ngựa không tồn tại hoặc cập nhật thất bại'], 404);
        }
        return new HorseOwnerResource($resultDto);
    }

    /**
     * DELETE /api/owners/{ownerId}
     */
    public function deleteHorseOwner(DeleteOwnerAccountRequest $request, int $ownerId)
    {
        $deleted = $this->horseOwnerService->deleteOwnerAccount($ownerId);
        if (!$deleted) {
            return response()->json(['message' => 'Chủ ngựa không tồn tại hoặc xóa thất bại'], 404);
        }
        return response()->json(null, 204);
    }
}
