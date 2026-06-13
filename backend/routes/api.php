<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BetController;
use App\Http\Controllers\API\TournamentController;
use App\Http\Controllers\API\RaceController;

use App\Http\Controllers\API\HorseController;
use App\Http\Controllers\API\HorseOwnerController;
use App\Http\Controllers\API\RefereeController;
use App\Http\Controllers\API\ResultController;

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

    // Referee routes
    Route::get('/referee/races', [RefereeController::class, 'index']);
    Route::get('/referee/races/{id}', [RefereeController::class, 'show']);
    Route::post('/referee/violations', [RefereeController::class, 'logViolation']);
    Route::post('/referee/races/{race}/results', [ResultController::class, 'store']);
    Route::get('/referee/races/{race}/results', [ResultController::class, 'show']);
});

// Public routes
Route::get('/public/tournaments', [TournamentController::class, 'index']);
Route::get('/public/races/live', [RaceController::class, 'liveRaces']);

// Horse routes (public for testing)
Route::get('/owners/{ownerId}/horses', [HorseController::class, 'getHorsesByOwner']);
Route::get('/owners/{ownerId}/horses/count', [HorseController::class, 'countHorsesByOwner']);
Route::get('/horses/{horseId}', [HorseController::class, 'getHorseById']);

Route::post('/horses', [HorseController::class, 'createHorse']);
Route::put('/horses/{horseId}', [HorseController::class, 'updateHorse']);
Route::delete('/horses/{horseId}', [HorseController::class, 'deleteHorse']);

// Horse Owner routes (public for testing)
Route::get('/owners/{ownerId}', [HorseOwnerController::class, 'getHorseOwnerById']);
Route::post('/owners', [HorseOwnerController::class, 'createHorseOwner']);
Route::put('/owners/{ownerId}', [HorseOwnerController::class, 'updateHorseOwner']);
Route::delete('/owners/{ownerId}', [HorseOwnerController::class, 'deleteHorseOwner']);

