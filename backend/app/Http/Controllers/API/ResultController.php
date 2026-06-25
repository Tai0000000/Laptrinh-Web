<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Models\Race;
use App\Models\RaceResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            DB::beginTransaction();

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
                'results.*.rank' => 'nullable|integer|min:1',
                'results.*.finish_time' => 'nullable|string',
                'results.*.notes' => 'nullable|string',
            ]);

            $savedResults = [];
            $registrationRanks = [];

            // Save race results
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
                $registrationRanks[$resData['registration_id']] = $resData['rank'];
            }

            // Update race status to completed
            $race->update(['status' => 'completed']);


            // Process all bets for this race
            $bets = Bet::whereHas('registration', function ($query) use ($raceId) {
                $query->where('race_id', $raceId);
            })->where('status', 'pending')->get();

            foreach ($bets as $bet) {
                $registrationId = $bet->registration_id;
                $rank = $registrationRanks[$registrationId] ?? null;
                
                if ($rank === null) {
                    // No rank for this registration, mark as lost
                    $bet->update([
                        'status' => 'lost',
                        'reward_amount' => 0
                    ]);
                    continue;
                }

                // Determine if bet is won
                $isWon = false;
                switch ($bet->prediction_type) {
                    case 'win':
                        $isWon = ($rank === 1);
                        break;
                    case 'place':
                        $isWon = ($rank <= 2);
                        break;
                    case 'show':
                        $isWon = ($rank <= 3);
                        break;
                }

                if ($isWon) {
                    // Calculate reward (using 2.5x multiplier as seen in BetController)
                    $rewardAmount = $bet->amount * 2.5;
                    $bet->update([
                        'status' => 'won',
                        'reward_amount' => $rewardAmount
                    ]);
                } else {
                    $bet->update([
                        'status' => 'lost',
                        'reward_amount' => 0
                    ]);
                }
            }

            DB::commit();

=======
            // Resolve bets for this race
            try {
                $resultsMap = []; // registration_id => rank (int or null)
                foreach ($validated['results'] as $resData) {
                    $resultsMap[$resData['registration_id']] = $resData['rank'] !== null ? (int)$resData['rank'] : null;
                }

                $bets = \App\Models\Bet::whereIn('registration_id', array_keys($resultsMap))
                    ->where('status', 'pending')
                    ->get();

                foreach ($bets as $bet) {
                    if (array_key_exists($bet->registration_id, $resultsMap)) {
                        $rank = $resultsMap[$bet->registration_id];
                        $isWinner = false;

                        if ($rank !== null) {
                            if ($bet->prediction_type === 'win' && $rank === 1) {
                                $isWinner = true;
                            } elseif ($bet->prediction_type === 'place' && ($rank === 1 || $rank === 2)) {
                                $isWinner = true;
                            } elseif ($bet->prediction_type === 'show' && ($rank === 1 || $rank === 2 || $rank === 3)) {
                                $isWinner = true;
                            }
                        }

                        $bet->update([
                            'status' => $isWinner ? 'won' : 'lost'
                        ]);
                    }
                }
            } catch (\Exception $e) {
                // Log error but don't fail the response if bet resolution fails
                \Log::error('Error resolving bets for race ' . $raceId . ': ' . $e->getMessage());
            
            return response()->json([
                'success' => true,
                'message' => 'Race results submitted successfully',
                'data' => $savedResults
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
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
