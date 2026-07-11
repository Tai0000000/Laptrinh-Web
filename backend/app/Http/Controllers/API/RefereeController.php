<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Models\Race;
use App\Models\RaceResult;
use App\Models\Registration;
use App\Models\Violation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RefereeController extends Controller
{
    /**
     * Display a listing of races scheduled for today or upcoming.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // Get races that are scheduled or active
            $races = Race::with(['tournament', 'registrations.horse', 'registrations.jockey'])
                ->orderBy('race_time', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $races
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving races: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retrieve details of a specific race, including checklists.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $race = Race::with(['tournament', 'registrations.horse', 'registrations.jockey', 'results'])
                ->find($id);

            if (!$race) {
                return response()->json([
                    'success' => false,
                    'message' => 'Race not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $race
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving race details: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Log a violation for a horse or jockey in a race.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logViolation(Request $request)
    {
        try {
            $validated = $request->validate([
                'race_id' => 'required|integer|exists:races,id',
                'registration_id' => 'required|integer|exists:registrations,id',
                'violation_type' => 'required|string',
                'notes' => 'nullable|string',
            ]);

            $violation = Violation::create([
                'race_id'        => $validated['race_id'],
                'registration_id'=> $validated['registration_id'],
                'referee_id'     => $request->attributes->get('auth_user_id'),
                'violation_type' => $validated['violation_type'],
                'notes'          => $validated['notes'] ?? null,
                'status'         => 'pending',
            ]);

            $violation->load(['race', 'registration.horse', 'registration.jockey']);

            return response()->json([
                'success' => true,
                'message' => 'Violation logged successfully',
                'data' => $violation
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error logging violation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get violations, optionally filtered by race_id.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getViolations(Request $request)
    {
        $query = Violation::with(['race', 'registration.horse', 'registration.jockey']);

        if ($request->has('race_id')) {
            $query->where('race_id', $request->race_id);
        }

        $violations = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['success' => true, 'data' => $violations]);
    }

    /**
     * Update race status (start or end a race).
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateRaceStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|in:scheduled,ongoing,finished,cancelled',
            ]);

            $race = Race::find($id);
            if (!$race) {
                return response()->json([
                    'success' => false,
                    'message' => 'Race not found'
                ], 404);
            }

            $race->update(['status' => $validated['status']]);
            $race->load(['tournament', 'registrations.horse', 'registrations.jockey', 'violations']);

            return response()->json([
                'success' => true,
                'message' => 'Race status updated successfully',
                'data' => $race
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating race status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update violation status (approve/reject).
     * PUT /referee/violations/{id}/status
     */
    public function updateViolationStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|in:pending,approved,rejected',
            ]);

            $violation = Violation::find($id);
            if (!$violation) {
                return response()->json(['success' => false, 'message' => 'Violation not found'], 404);
            }

            $violation->update(['status' => $validated['status']]);
            $violation->load(['race', 'registration.horse', 'registration.jockey']);

            return response()->json([
                'success' => true,
                'message' => 'Violation status updated',
                'data'    => $violation,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Nullify result of a specific horse (disqualification action on result).
     * PUT /referee/races/{race}/registrations/{registration}/disqualify
     */
    public function disqualifyResult(Request $request, $raceId, $registrationId)
    {
        DB::beginTransaction();
        try {
            // Đánh dấu kết quả là DQ (rank = null, notes = DQ)
            RaceResult::updateOrCreate(
                ['race_id' => $raceId, 'registration_id' => $registrationId],
                ['rank' => null, 'finish_time' => null, 'notes' => 'Truất quyền thi đấu (DQ)']
            );

            // Hủy các bets liên quan — hoàn tiền
            $bets = Bet::where('registration_id', $registrationId)
                ->where('status', 'won')
                ->with('user')
                ->get();

            foreach ($bets as $bet) {
                $rewardTaken = (float) $bet->reward_amount;
                if ($rewardTaken > 0 && $bet->user) {
                    // Trừ lại tiền thưởng đã cộng
                    $bet->user->decrement('balance', $rewardTaken);
                }
                $bet->update(['status' => 'lost', 'reward_amount' => 0]);
            }

            // Ghi violation tự động nếu chưa có
            $refId = $request->attributes->get('auth_user_id');
            Violation::firstOrCreate(
                ['race_id' => $raceId, 'registration_id' => $registrationId, 'violation_type' => 'disqualification'],
                ['referee_id' => $refId, 'notes' => 'Truất quyền thi đấu — kết quả bị hủy', 'status' => 'approved']
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã truất quyền thi đấu và hủy kết quả thành công.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Disqualify error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Assign lanes to registrations for a race.
     * POST /referee/races/{race}/assign-lanes
     */
    public function assignLanes(Request $request, $raceId)
    {
        try {
            $validated = $request->validate([
                'lanes'                    => 'required|array|min:1',
                'lanes.*.registration_id'  => 'required|integer|exists:registrations,id',
                'lanes.*.lane'             => 'required|integer|min:1',
            ]);

            DB::beginTransaction();
            foreach ($validated['lanes'] as $item) {
                Registration::where('id', $item['registration_id'])
                    ->where('race_id', $raceId)
                    ->update(['lane' => $item['lane']]);
            }
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Đã cập nhật làn chạy thành công.']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
