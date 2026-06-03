<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\IRaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RaceController extends Controller
{
    protected IRaceService $raceService;

    public function __construct(IRaceService $raceService)
    {
        $this->raceService = $raceService;
    }

    public function index(): JsonResponse
    {
        $races = $this->raceService->getAllRaces();
        return response()->json($races);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tournament_id' => 'required|integer',
            'race_time' => 'required|date',
            'distance' => 'required|integer|min:100',
            'status' => 'sometimes|required|string|in:scheduled,ongoing,finished,cancelled',
        ]);

        $race = $this->raceService->createRace($validated);
        return response()->json($race, 201);
    }

    public function show(int $id): JsonResponse
    {
        $race = $this->raceService->getRaceById($id);
        if (!$race) {
            return response()->json(['message' => 'Race does not exist.'], 404);
        }
        return response()->json($race);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'tournament_id' => 'sometimes|required|integer',
            'race_time' => 'sometimes|required|date',
            'distance' => 'sometimes|required|integer|min:100',
            'status' => 'sometimes|required|string|in:scheduled,ongoing,finished,cancelled',
        ]);

        $race = $this->raceService->updateRace($id, $validated);
        if (!$race) {
            return response()->json(['message' => 'Race does not exist.'], 404);
        }
        return response()->json($race);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:scheduled,ongoing,finished,cancelled',
        ]);

        $race = $this->raceService->updateRaceStatus($id, $validated['status']);
        if (!$race) {
            return response()->json(['message' => 'Race does not exist.'], 404);
        }
        return response()->json($race);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->raceService->deleteRace($id);
        if (!$deleted) {
            return response()->json(['message' => 'Race does not exist.'], 404);
        }
        return response()->json(['message' => 'Race deleted successfully.'], 200);
    }

    public function live(): JsonResponse
    {
        $liveRaces = $this->raceService->getLiveRaces();
        return response()->json($liveRaces);
    }
}
