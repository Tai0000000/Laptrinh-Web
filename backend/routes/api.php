<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\BetController;
use App\Http\Controllers\API\TournamentController;
use App\Http\Controllers\API\HorseController;
use App\Http\Controllers\API\HorseOwnerController;

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'Horse Racing API',
        'timestamp' => now(),
    ]);
});

// Authentication routes (stub)
Route::post('/login', function() { return response()->json(['message' => 'Login stub']); });
Route::post('/register', function() { return response()->json(['message' => 'Register stub']); });

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function(Request $request) { return $request->user(); });
    Route::post('/logout', function() { return response()->json(['message' => 'Logout stub']); });
    
    // Tournament routes
    Route::apiResource('tournaments', TournamentController::class);

    // Bet routes
    Route::get('/bets', [BetController::class, 'index']);
    Route::get('/bets/{bet}', [BetController::class, 'show']);
    Route::post('/races/{race}/bet', [BetController::class, 'placeBet']);
    Route::delete('/bets/{bet}', [BetController::class, 'destroy']);
});

// Public routes
Route::get('/public/tournaments', [TournamentController::class, 'index']);

// Horse routes (public for testing)
Route::get('/owners/{ownerId}/horses', [HorseController::class, 'getHorsesByOwner']);
Route::get('/horses/{horseId}', [HorseController::class, 'getHorseById']);
Route::post('/horses', [HorseController::class, 'createHorse']);
Route::put('/horses/{horseId}', [HorseController::class, 'updateHorse']);
Route::delete('/horses/{horseId}', [HorseController::class, 'deleteHorse']);

// Horse Owner routes (public for testing)
Route::get('/owners/{ownerId}', [HorseOwnerController::class, 'getHorseOwnerById']);
Route::post('/owners', [HorseOwnerController::class, 'createHorseOwner']);
Route::put('/owners/{ownerId}', [HorseOwnerController::class, 'updateHorseOwner']);
Route::delete('/owners/{ownerId}', [HorseOwnerController::class, 'deleteHorseOwner']);
