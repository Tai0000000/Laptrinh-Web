<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\IHorseOwnerService;
use App\Http\Requests\HorseOwnerRequest\GetOwnerByIdRequest;
use App\Http\Requests\HorseOwnerRequest\RegisterOwnerRequest;
use App\Http\Requests\HorseOwnerRequest\UpdateOwnerInfoRequest;
use App\Http\Requests\HorseOwnerRequest\DeleteOwnerAccountRequest;
use App\Http\Resources\HorseOwnerResource\HorseOwnerResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HorseOwnerController extends Controller
{
    protected IHorseOwnerService $horseOwnerService;

    public function __construct(IHorseOwnerService $horseOwnerService)
    {
        $this->horseOwnerService = $horseOwnerService;
    }

    /**
     * Lấy thông tin profile của Horse Owner đang đăng nhập.
     *
     * GET /horse-owner/profile
     */
    public function profile(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $owner = $this->horseOwnerService->getOwnerByUserId($userId);

        if (!$owner) {
            return response()->json(['message' => 'Không tìm thấy thông tin chủ ngựa.'], 404);
        }

        return response()->json($owner->toArray());
    }

    /**
     * Lấy danh sách tất cả ngựa thuộc chủ đang đăng nhập.
     *
     * GET /horse-owner/horses
     */
    public function myHorses(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $owner = $this->horseOwnerService->getOwnerByUserId($userId);

        if (!$owner) {
            return response()->json(['message' => 'Không tìm thấy thông tin chủ ngựa.'], 404);
        }

        $horses = $this->horseOwnerService->getHorses($owner->id);

        return response()->json($horses);
    }

    /**
     * Lấy danh sách ngựa của chủ đang tham gia một cuộc đua cụ thể.
     *
     * GET /horse-owner/horses-for-race/{raceId}
     */
    public function horsesForRace(Request $request, int $raceId): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $owner = $this->horseOwnerService->getOwnerByUserId($userId);

        if (!$owner) {
            return response()->json(['message' => 'Không tìm thấy thông tin chủ ngựa.'], 404);
        }

        $horses = $this->horseOwnerService->getHorsesForRace($owner->id, $raceId);

        return response()->json($horses);
    }

    /**
     * GET /api/owners/{ownerId}
     */
    public function getHorseOwnerById(GetOwnerByIdRequest $request, int $ownerId)
    {
        $userId = $request->attributes->get('auth_user_id');
        $owner = $this->horseOwnerService->getOwnerByUserId($userId);
        if ($owner) {
            $ownerId = $owner->id;
        }

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
