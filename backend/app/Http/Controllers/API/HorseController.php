<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\IHorseService;
use Illuminate\Http\Request;

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
    public function getHorsesByOwner(int $ownerId)
    {
        $horses = $this->horseService->getHorsesByOwner($ownerId);
        return response()->json($horses);
    }

    /**
     * GET /api/horses/{id}
     */
    public function getHorseById(int $id)
    {
        $horse = $this->horseService->getHorseById($id);
        if (!$horse) {
            return response()->json(['message' => 'Ngựa không tồn tại'], 404);
        }
        return response()->json($horse);
    }

    /**
     * POST /api/horses
     */
    public function createHorse(Request $request)
    {
        $horse = $this->horseService->addHorse($request->all());
        return response()->json($horse, 201);
    }

    /**
     * PUT /api/horses/{id}
     */
    public function updateHorse(Request $request, int $id)
    {
        $horse = $this->horseService->updateHorse($id, $request->all());
        if (!$horse) {
            return response()->json(['message' => 'Ngựa không tồn tại hoặc cập nhật thất bại'], 404);
        }
        return response()->json($horse);
    }

    /**
     * DELETE /api/horses/{id}
     */
    public function deleteHorse(int $id)
    {
        $deleted = $this->horseService->removeHorse($id);
        if (!$deleted) {
            return response()->json(['message' => 'Ngựa không tồn tại hoặc xóa thất bại'], 404);
        }
        return response()->json(null, 204);
    }
}
