<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\IRaceResultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RaceResultController extends Controller
{
    protected IRaceResultService $raceResultService;

    public function __construct(IRaceResultService $raceResultService)
    {
        $this->raceResultService = $raceResultService;
    }

    public function index(Request $request): JsonResponse
    {
        $raceId = $request->query('race_id');
        if ($raceId) {
            $results = $this->raceResultService->getResultsByRace((int)$raceId);
        } else {
            return response()->json(['message' => 'Please provide the race_id parameter.'], 400);
        }
        return response()->json($results);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'race_id' => 'required|integer',
            'registration_id' => 'required|integer',
            'rank' => 'required|integer|min:1',
            'finish_time' => 'required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $result = $this->raceResultService->createRaceResult($validated);
        return response()->json($result, 201);
    }

    public function show(int $id): JsonResponse
    {
        $result = $this->raceResultService->getResultByRegistration($id);
        if (!$result) {
            return response()->json(['message' => 'Race result does not exist.'], 404);
        }
        return response()->json($result);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'rank' => 'sometimes|required|integer|min:1',
            'finish_time' => 'sometimes|required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $result = $this->raceResultService->updateRaceResult($id, $validated);
        if (!$result) {
            return response()->json(['message' => 'Race result does not exist.'], 404);
        }
        return response()->json($result);
    }

    public function leaderboard(int $raceId): JsonResponse
    {
        $leaderboard = $this->raceResultService->getLeaderboard($raceId);
        return response()->json($leaderboard);
    }
}
