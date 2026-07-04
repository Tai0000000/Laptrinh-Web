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
        // Wrap thành {success, data} để frontend đọc nhất quán
        $data = is_array($tournaments) ? $tournaments : (method_exists($tournaments, 'toArray') ? $tournaments->toArray() : $tournaments);
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'location'    => 'required|string|max:255',
            'status'      => 'sometimes|string|in:upcoming,ongoing,finished,cancelled',
            'prize_pool'  => 'sometimes|nullable|numeric|min:0',
            'description' => 'sometimes|nullable|string',
        ]);

        $tournament = $this->tournamentService->createTournament($validated);
        return response()->json(['success' => true, 'data' => $tournament], 201);
    }

    public function show(int $id): JsonResponse
    {
        $tournament = $this->tournamentService->getTournamentById($id);
        if (!$tournament) {
            return response()->json(['success' => false, 'message' => 'Tournament does not exist.'], 404);
        }
        return response()->json(['success' => true, 'data' => $tournament]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'start_date'  => 'sometimes|required|date',
            'end_date'    => 'sometimes|required|date',
            'location'    => 'sometimes|required|string|max:255',
            'status'      => 'sometimes|string|in:upcoming,ongoing,finished,cancelled',
            'prize_pool'  => 'sometimes|nullable|numeric|min:0',
            'description' => 'sometimes|nullable|string',
        ]);

        $tournament = $this->tournamentService->updateTournament($id, $validated);
        if (!$tournament) {
            return response()->json(['success' => false, 'message' => 'Tournament does not exist.'], 404);
        }
        return response()->json(['success' => true, 'data' => $tournament]);
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
