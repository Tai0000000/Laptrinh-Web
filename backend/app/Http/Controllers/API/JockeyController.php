<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\IJockeyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JockeyController extends Controller
{
    protected IJockeyService $jockeyService;

    public function __construct(IJockeyService $jockeyService)
    {
        $this->jockeyService = $jockeyService;
    }

    public function index(): JsonResponse
    {
        $jockeys = $this->jockeyService->getAllJockeys();
        return response()->json($jockeys);
    }

    public function schedule(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $schedule = $this->jockeyService->getJockeySchedule($userId);
        return response()->json($schedule);
    }
}
