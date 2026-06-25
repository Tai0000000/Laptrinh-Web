<?php

namespace App\Http\Controllers\API;


use App\Http\Controllers\Controller;
use App\Models\HorseOwner;
use App\Services\Contracts\IHorseService;
use App\Services\Contracts\IHorseOwnerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HorseController extends Controller
{
    protected IHorseService $horseService;
    protected IHorseOwnerService $horseOwnerService;

    public function __construct(IHorseService $horseService, IHorseOwnerService $horseOwnerService)
    {
        $this->horseService = $horseService;
        $this->horseOwnerService = $horseOwnerService;
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $owner = HorseOwner::where('user_id', $userId)->first();
        if (!$owner) {
            return response()->json(['message' => 'Horse owner information not found.'], 404);
        }

        $horses = $this->horseService->getHorsesByOwner($owner->id);
        return response()->json($horses);
    }

    public function store(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $owner = HorseOwner::where('user_id', $userId)->first();
        if (!$owner) {
            return response()->json(['message' => 'Horse owner information not found.'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:1',
            'breed' => 'required|string|max:255',
        ]);

        $validated['horse_owner_id'] = $owner->id;
        $validated['status'] = 'active';

        $horse = $this->horseService->createHorse($validated);
        return response()->json($horse, 201);
    }

    public function show(int $id): JsonResponse
    {
        $horse = $this->horseService->getHorseById($id);
        if (!$horse) {
            return response()->json(['message' => 'Horse does not exist.'], 404);
        }
        return response()->json($horse);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'age' => 'sometimes|required|integer|min:1',
            'breed' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:active,inactive',
        ]);

        $horse = $this->horseService->updateHorse($id, $validated);
        if (!$horse) {
            return response()->json(['message' => 'Horse does not exist.'], 404);
        }
        return response()->json($horse);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->horseService->deleteHorse($id);
        if (!$deleted) {
            return response()->json(['message' => 'Horse does not exist.'], 404);
        }
        return response()->json(['message' => 'Horse information deleted.'], 200);
    }

    public function schedule(int $id): JsonResponse
    {
        $schedule = $this->horseOwnerService->viewRaceScheduleAndConfirmParticipation($id);
        return response()->json($schedule);
    }

    public function results(int $id): JsonResponse
    {
        $results = $this->horseOwnerService->trackRaceResults($id);
        return response()->json($results);
    }

    public function rankings(int $id): JsonResponse
    {
        $rankings = $this->horseOwnerService->getHorseRankings($id);
        return response()->json($rankings);
    }

    public function rewards(int $id): JsonResponse
    {
        $rewards = $this->horseOwnerService->getHorseRewards($id);
        return response()->json($rewards);
    }

    public function hireJockey(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'jockey_id' => 'required|integer',
            'race_id' => 'required|integer',
        ]);

        $this->horseOwnerService->hireJockeyForRace($id, $validated['jockey_id'], $validated['race_id']);
        return response()->json(['message' => 'Jockey hire request sent successfully.']);
    }

    public function confirmJockey(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'jockey_id' => 'required|integer',
            'race_id' => 'required|integer',
        ]);

        $this->horseOwnerService->confirmJockeyForRace($id, $validated['race_id'], $validated['jockey_id']);
        return response()->json(['message' => 'Jockey confirmed for the race successfully.']);

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
     * GET /api/owners/{ownerId}/horses/count
     */
    public function countHorsesByOwner(int $ownerId)
    {
        $ownerId = 10; // Hardcode for testing
        $count = $this->horseService->countHorsesByOwner($ownerId);
        return response()->json(['count' => $count]);
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
