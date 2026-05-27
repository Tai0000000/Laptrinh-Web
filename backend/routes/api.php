<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'Horse Racing API',
        'timestamp' => now(),
    ]);
});

// Authentication routes (team implements)
// Route::post('/login', ...);
// Route::post('/register', ...);

// Protected routes (team implements)
// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/user', ...);
//     Route::post('/logout', ...);
//     Route::apiResource('tournaments', TournamentController::class);
// });

// Public routes
// Route::get('/public/tournaments', ...);
// Route::get('/public/races/live', ...);
