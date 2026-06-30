<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\ITournamentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TournamentController extends Controller
{
    protected ITournamentService $tournamentService;

    public function __construct(ITournamentService $tournamentService)
    {
        $this->tournamentService = $tournamentService;
    }

    public function index(): JsonResponse
    {
        $tournaments = $this->tournamentService->getAllTournaments();
        return response()->json($tournaments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'location' => 'required|string|max:255',
        ]);

        $tournament = $this->tournamentService->createTournament($validated);
        return response()->json($tournament, 201);
    }

    public function show(int $id): JsonResponse
    {
        $tournament = $this->tournamentService->getTournamentById($id);
        if (!$tournament) {
            return response()->json(['message' => 'Tournament does not exist.'], 404);
        }
        return response()->json($tournament);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date',
            'location' => 'sometimes|required|string|max:255',
        ]);

        $tournament = $this->tournamentService->updateTournament($id, $validated);
        if (!$tournament) {
            return response()->json(['message' => 'Tournament does not exist.'], 404);
        }
        return response()->json($tournament);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->tournamentService->deleteTournament($id);
        if (!$deleted) {
            return response()->json(['message' => 'Tournament does not exist.'], 404);
        }
        return response()->json(['message' => 'Tournament deleted successfully.'], 200);
    }
}
