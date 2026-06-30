<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Models\Race;
use App\Models\RaceResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ResultController extends Controller
{
    /**
     * POST /api/referee/races/{raceId}/results
     * Referee nhập kết quả — lưu RaceResult + resolve bets
     */
    public function store(Request $request, $raceId)
    {
        try {
            DB::beginTransaction();

            $race = Race::find($raceId);
            if (!$race) {
                return response()->json(['success' => false, 'message' => 'Race not found'], 404);
            }

            $validated = $request->validate([
                'results'                       => 'required|array',
                'results.*.registration_id'     => 'required|integer|exists:registrations,id',
                'results.*.rank'                => 'nullable|integer|min:1',
                'results.*.finish_time'         => 'nullable|string',
                'results.*.notes'               => 'nullable|string',
            ]);

            // ── Lưu kết quả từng ngựa ─────────────────────────────────────
            $savedResults = [];
            $rankMap      = []; // registration_id => rank

            foreach ($validated['results'] as $resData) {
                $result = RaceResult::updateOrCreate(
                    [
                        'race_id'         => $raceId,
                        'registration_id' => $resData['registration_id'],
                    ],
                    [
                        'rank'        => $resData['rank'],
                        'finish_time' => $resData['finish_time'] ?? null,
                        'notes'       => $resData['notes'] ?? null,
                    ]
                );
                $savedResults[]                          = $result;
                $rankMap[$resData['registration_id']]   = $resData['rank'] !== null
                    ? (int) $resData['rank']
                    : null;
            }

            // ── Cập nhật status race ──────────────────────────────────────
            $race->update(['status' => 'completed']);

            // ── Resolve bets ──────────────────────────────────────────────
            try {
                $bets = Bet::whereIn('registration_id', array_keys($rankMap))
                    ->where('status', 'pending')
                    ->get();

                foreach ($bets as $bet) {
                    $rank = $rankMap[$bet->registration_id] ?? null;

                    $isWon = false;
                    if ($rank !== null) {
                        $isWon = match ($bet->prediction_type) {
                            'win'   => $rank === 1,
                            'place' => $rank <= 2,
                            'show'  => $rank <= 3,
                            default => false,
                        };
                    }

                    $bet->update([
                        'status'        => $isWon ? 'won' : 'lost',
                        'reward_amount' => $isWon ? $bet->amount * 2.5 : 0,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Bet resolution failed for race ' . $raceId . ': ' . $e->getMessage());
                // Không rollback — kết quả đã lưu, chỉ bet bị lỗi
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Race results submitted successfully',
                'data'    => $savedResults,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/referee/races/{raceId}/results
     */
    public function show($raceId)
    {
        try {
            $results = RaceResult::with(['registration.horse', 'registration.jockey'])
                ->where('race_id', $raceId)
                ->orderBy('rank')
                ->get();

            return response()->json(['success' => true, 'data' => $results]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
