<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Race;
use App\Models\RaceResult;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    /**
     * Submit or update results for a specific race.
     *
     * @param Request $request
     * @param int $raceId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $raceId)
    {
        try {
            $race = Race::find($raceId);
            if (!$race) {
                return response()->json([
                    'success' => false,
                    'message' => 'Race not found'
                ], 404);
            }

            $validated = $request->validate([
                'results' => 'required|array',
                'results.*.registration_id' => 'required|integer|exists:registrations,id',
                'results.*.rank' => 'required|integer|min:1',
                'results.*.finish_time' => 'required|string',
                'results.*.notes' => 'nullable|string',
            ]);

            $savedResults = [];

            // Wrap in transaction or run loop to update/create
            foreach ($validated['results'] as $resData) {
                $result = RaceResult::updateOrCreate(
                    [
                        'race_id' => $raceId,
                        'registration_id' => $resData['registration_id']
                    ],
                    [
                        'rank' => $resData['rank'],
                        'finish_time' => $resData['finish_time'],
                        'notes' => $resData['notes'] ?? null
                    ]
                );
                $savedResults[] = $result;
            }

            // Update race status to completed
            $race->update(['status' => 'completed']);

            // Resolve bets for this race
            try {
                $resultsMap = []; // registration_id => rank
                foreach ($validated['results'] as $resData) {
                    $resultsMap[$resData['registration_id']] = (int)$resData['rank'];
                }

                $bets = \App\Models\Bet::whereIn('registration_id', array_keys($resultsMap))
                    ->where('status', 'pending')
                    ->get();

                foreach ($bets as $bet) {
                    $rank = $resultsMap[$bet->registration_id] ?? null;
                    if ($rank) {
                        $isWinner = false;
                        if ($bet->prediction_type === 'win' && $rank === 1) {
                            $isWinner = true;
                        } elseif ($bet->prediction_type === 'place' && ($rank === 1 || $rank === 2)) {
                            $isWinner = true;
                        } elseif ($bet->prediction_type === 'show' && ($rank === 1 || $rank === 2 || $rank === 3)) {
                            $isWinner = true;
                        }
                        
                        $bet->update([
                            'status' => $isWinner ? 'won' : 'lost'
                        ]);
                    }
                }
            } catch (\Exception $e) {
                // Log error but don't fail the response if bet resolution fails
                \Log::error('Error resolving bets for race ' . $raceId . ': ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Race results submitted successfully',
                'data' => $savedResults
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error saving race results: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the results of a specific race.
     *
     * @param int $raceId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($raceId)
    {
        try {
            $results = RaceResult::with(['registration.horse', 'registration.jockey'])
                ->where('race_id', $raceId)
                ->orderBy('rank', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving race results: ' . $e->getMessage()
            ], 500);
        }
    }
}
