<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\IBetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BetController extends Controller
{
    protected IBetService $betService;

    public function __construct(IBetService $betService)
    {
        $this->betService = $betService;
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $bets = $this->betService->getBetsByUser($userId);
        return response()->json($bets);
    }

    public function store(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $validated = $request->validate([
            'registration_id' => 'required|integer',
            'amount' => 'required|numeric|min:10000',
            'prediction_type' => 'required|string|in:win,place,show',
        ]);

        $validated['user_id'] = $userId;

        $bet = $this->betService->placeBet($validated);
        return response()->json($bet, 201);
    }

    public function show(int $id): JsonResponse
    {
        $bet = $this->betService->getBetById($id);
        if (!$bet) {
            return response()->json(['message' => 'Bet does not exist.'], 404);
        }
        return response()->json($bet);
    }
}
