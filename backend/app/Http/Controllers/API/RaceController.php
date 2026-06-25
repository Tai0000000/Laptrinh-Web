<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Race;
use Illuminate\Http\Request;

class RaceController extends Controller
{
    
    public function index()
    {
        return response()->json(Race::with('tournament', 'registrations.horse', 'registrations.jockey')->get());
    }

    /**
     * Display a specific race
     */
    public function show(Race $race)
    {
        $race->load('tournament', 'registrations.horse', 'registrations.jockey');
        return response()->json($race);
    }

   
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tournament_id' => 'required|exists:tournaments,id',
            'name' => 'required|string|max:255',
            'distance' => 'required|integer',
            'race_time' => 'required|date',
            'status' => 'string|in:scheduled,ongoing,completed,cancelled',
        ]);

        $race = Race::create($validated);
        return response()->json($race, 201);
    }

    /**
     * Update a race
     */
    public function update(Request $request, Race $race)
    {
        $validated = $request->validate([
            'tournament_id' => 'exists:tournaments,id',
            'name' => 'string|max:255',
            'distance' => 'integer',
            'race_time' => 'date',
            'status' => 'string|in:scheduled,ongoing,completed,cancelled',
        ]);

        $race->update($validated);
        return response()->json($race);
    }

    /**
     * Delete a race
     */
    public function destroy(Race $race)
    {
        $race->delete();
        return response()->json(null, 204);
    }

    /**
     * Get live races (public)
     */
    public function liveRaces()
    {
        $liveRaces = Race::with('tournament')
            ->whereIn('status', ['ongoing', 'scheduled'])
            ->orderBy('race_time')
            ->get();

        return response()->json($liveRaces);
    }
}

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

    public function index(Request $request): JsonResponse
    {
        $tournamentId = $request->query('tournament_id');
        if ($tournamentId) {
            $races = $this->raceService->getRacesByTournament((int)$tournamentId);
        } else {
            $races = $this->raceService->getAllRaces();
        }
        return response()->json($races);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tournament_id' => 'required|integer|exists:tournaments,id',
            'round' => 'required|string|max:255',
            'race_time' => 'required|date',
            'distance' => 'required|integer|min:100|max:5000',
            'max_horses' => 'required|integer|min:2|max:30',
            'status' => 'sometimes|required|string|in:scheduled,ongoing,finished,cancelled',
        ]);

        $tournament = \App\Models\Tournament::find($validated['tournament_id']);
        if ($tournament) {
            $raceDate = new \DateTime($validated['race_time']);
            $startDate = new \DateTime($tournament->start_date);
            $endDate = new \DateTime($tournament->end_date);
            $startDate->setTime(0, 0, 0);
            $endDate->setTime(23, 59, 59);

            if ($raceDate < $startDate || $raceDate > $endDate) {
                return response()->json([
                    'message' => 'Ngày đua phải nằm trong thời gian diễn ra giải đấu (' . date('d/m/Y', strtotime($tournament->start_date)) . ' đến ' . date('d/m/Y', strtotime($tournament->end_date)) . ').'
                ], 422);
            }
        }

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
        $race = $this->raceService->getRaceById($id);
        if (!$race) {
            return response()->json(['message' => 'Race does not exist.'], 404);
        }

        $validated = $request->validate([
            'tournament_id' => 'sometimes|required|integer|exists:tournaments,id',
            'round' => 'sometimes|required|string|max:255',
            'race_time' => 'sometimes|required|date',
            'distance' => 'sometimes|required|integer|min:100|max:5000',
            'max_horses' => 'sometimes|required|integer|min:2|max:30',
            'status' => 'sometimes|required|string|in:scheduled,ongoing,finished,cancelled',
        ]);

        $targetTournamentId = $validated['tournament_id'] ?? $race->tournament_id;
        $targetRaceTime = $validated['race_time'] ?? $race->race_time;

        if ($targetTournamentId && $targetRaceTime) {
            $tournament = \App\Models\Tournament::find($targetTournamentId);
            if ($tournament) {
                $raceDate = new \DateTime($targetRaceTime);
                $startDate = new \DateTime($tournament->start_date);
                $endDate = new \DateTime($tournament->end_date);
                $startDate->setTime(0, 0, 0);
                $endDate->setTime(23, 59, 59);

                if ($raceDate < $startDate || $raceDate > $endDate) {
                    return response()->json([
                        'message' => 'Ngày đua phải nằm trong thời gian diễn ra giải đấu (' . date('d/m/Y', strtotime($tournament->start_date)) . ' đến ' . date('d/m/Y', strtotime($tournament->end_date)) . ').'
                    ], 422);
                }
            }
        }

        if (isset($validated['max_horses'])) {
            $currentRegistrations = $race->registrations_count ?? ($race->registrations ? $race->registrations->count() : 0);
            if ($validated['max_horses'] < $currentRegistrations) {
                return response()->json([
                    'message' => 'Số ngựa tối đa không thể nhỏ hơn số ngựa hiện tại đang đăng ký tham gia (' . $currentRegistrations . ' ngựa).'
                ], 422);
            }
        }

        $updatedRace = $this->raceService->updateRace($id, $validated);
        return response()->json($updatedRace);
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
        $race = $this->raceService->getRaceById($id);
        if (!$race) {
            return response()->json(['message' => 'Race does not exist.'], 404);
        }

        if ($race->status === 'finished') {
            return response()->json([
                'message' => 'Không thể xóa cuộc đua đã hoàn thành.'
            ], 400);
        }

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
