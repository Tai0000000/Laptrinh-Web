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
