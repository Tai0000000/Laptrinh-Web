<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Race;
use App\Models\Violation;
use Illuminate\Http\Request;

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
                'race_id' => $validated['race_id'],
                'registration_id' => $validated['registration_id'],
                'referee_id' => $request->user()->id,
                'violation_type' => $validated['violation_type'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
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
}
