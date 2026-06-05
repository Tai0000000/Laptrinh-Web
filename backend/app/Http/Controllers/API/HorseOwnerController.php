<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\IHorseOwnerService;
use Illuminate\Http\Request;

class HorseOwnerController extends Controller
{
    protected IHorseOwnerService $horseOwnerService;

    public function __construct(IHorseOwnerService $horseOwnerService)
    {
        $this->horseOwnerService = $horseOwnerService;
    }

    /**
     * GET /api/owners/{id}
     */
    public function getHorseOwnerById(int $id)
    {
        $owner = $this->horseOwnerService->getOwnerById($id);
        if (!$owner) {
            return response()->json(['message' => 'Chủ ngựa không tồn tại'], 404);
        }
        return response()->json($owner);
    }

    /**
     * POST /api/owners
     */
    public function createHorseOwner(Request $request)
    {
        $owner = $this->horseOwnerService->registerOwner($request->all());
        return response()->json($owner, 201);
    }

    /**
     * PUT /api/owners/{id}
     */
    public function updateHorseOwner(Request $request, int $id)
    {
        $owner = $this->horseOwnerService->updateOwnerInfo($id, $request->all());
        if (!$owner) {
            return response()->json(['message' => 'Chủ ngựa không tồn tại hoặc cập nhật thất bại'], 404);
        }
        return response()->json($owner);
    }

    /**
     * DELETE /api/owners/{id}
     */
    public function deleteHorseOwner(int $id)
    {
        $deleted = $this->horseOwnerService->deleteOwnerAccount($id);
        if (!$deleted) {
            return response()->json(['message' => 'Chủ ngựa không tồn tại hoặc xóa thất bại'], 404);
        }
        return response()->json(null, 204);
    }
}
