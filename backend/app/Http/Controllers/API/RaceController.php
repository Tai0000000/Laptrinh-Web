<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Race;
use Illuminate\Http\Request;

class RaceController extends Controller
{
    /**
     * Display all races
     */
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

    /**
     * Store a new race
     */
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
