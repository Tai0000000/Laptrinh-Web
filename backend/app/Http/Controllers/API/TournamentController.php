<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use Illuminate\Http\Request;

class TournamentController extends Controller
{
    public function index()
    {
        return response()->json(Tournament::with('races')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'location' => 'required|string',
        ]);

        $tournament = Tournament::create($validated);
        return response()->json($tournament, 201);
    }

    public function show(Tournament $tournament)
    {
        return response()->json($tournament->load('races'));
    }

    public function update(Request $request, Tournament $tournament)
    {
        $tournament->update($request->all());
        return response()->json($tournament);
    }

    public function destroy(Tournament $tournament)
    {
        $tournament->delete();
        return response()->json(null, 204);
    }
}
