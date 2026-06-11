<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BetController;
use App\Http\Controllers\API\TournamentController;
use App\Http\Controllers\API\RaceController;

/*
|--------------------------------------------------------------------------
| API Routes (Các tuyến đường API)
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'Horse Racing API',
        'timestamp' => now(),
    ]);
});

// Authentication
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');

// Protected routes (requires auth)
Route::middleware('auth:sanctum')->group(function () {
    // User
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Tournament routes
    Route::apiResource('tournaments', TournamentController::class);

    // Race routes
    Route::apiResource('races', RaceController::class);

    // Betting routes
    Route::get('/bets', [BetController::class, 'index']);
    Route::get('/bets/{bet}', [BetController::class, 'show']);
    Route::post('/races/{race}/bet', [BetController::class, 'placeBet']);
    Route::delete('/bets/{bet}', [BetController::class, 'destroy']);
});

// Public routes
Route::get('/public/tournaments', [TournamentController::class, 'index']);
Route::get('/public/races/live', [RaceController::class, 'liveRaces']);
