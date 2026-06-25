<?php

use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BetController;
use App\Http\Controllers\API\HorseController;
use App\Http\Controllers\API\HorseOwnerController;
use App\Http\Controllers\API\JockeyController;
use App\Http\Controllers\API\RaceController;
use App\Http\Controllers\API\RaceResultController;
use App\Http\Controllers\API\RegistrationController;
use App\Http\Controllers\API\TournamentController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BetController;
use App\Http\Controllers\API\TournamentController;
use App\Http\Controllers\API\RaceController;

use App\Http\Controllers\API\HorseController;
use App\Http\Controllers\API\HorseOwnerController;
use App\Http\Controllers\API\RefereeController;
use App\Http\Controllers\API\ResultController;
use App\Http\Controllers\API\JockeyController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'Horse Racing API',
        'timestamp' => now(),
    ]);
});


// ============================================================
// Public / Anonymous routes
// ============================================================
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/public/tournaments', [TournamentController::class, 'index']);
Route::get('/public/races/live', [RaceController::class, 'live']);
Route::get('/public/race-results/{raceId}', [RaceResultController::class, 'leaderboard']);

// ============================================================
// Authenticated Routes (JWT required)
// ============================================================
Route::middleware('jwt.auth')->group(function () {
    // Auth profile
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Admin-only: Dashboard stats & activity + Tournaments
    Route::middleware('jwt.auth:admin')->group(function () {
        // Overview KPI & activity feed
        Route::get('/admin/stats', [AdminController::class, 'stats']);
        Route::get('/admin/recent-activity', [AdminController::class, 'recentActivity']);

        // Tournaments CRUD
        Route::post('/tournaments', [TournamentController::class, 'store']);
        Route::get('/tournaments', [TournamentController::class, 'index']);
        Route::get('/tournaments/{id}', [TournamentController::class, 'show']);
        Route::put('/tournaments/{id}', [TournamentController::class, 'update']);
        Route::delete('/tournaments/{id}', [TournamentController::class, 'destroy']);
    });

    // Admin & Race Referee: Races
    Route::middleware('jwt.auth:admin,race_referee')->group(function () {
        Route::post('/races', [RaceController::class, 'store']);
        Route::get('/races', [RaceController::class, 'index']);
        Route::get('/races/{id}', [RaceController::class, 'show']);
        Route::put('/races/{id}', [RaceController::class, 'update']);
        Route::put('/races/{id}/status', [RaceController::class, 'updateStatus']);
        Route::delete('/races/{id}', [RaceController::class, 'destroy']);

        // Registration approvals
        Route::put('/registrations/{id}/status', [RegistrationController::class, 'updateStatus']);
    });

    // Race Referee only: Race Results
    Route::middleware('jwt.auth:race_referee')->group(function () {
        Route::post('/race-results', [RaceResultController::class, 'store']);
        Route::get('/race-results', [RaceResultController::class, 'index']);
        Route::get('/race-results/{id}', [RaceResultController::class, 'show']);
        Route::put('/race-results/{id}', [RaceResultController::class, 'update']);
    });

    // Horse Owner only: Horses and Registrations
    Route::middleware('jwt.auth:horse_owner')->group(function () {
        // Horse CRUD
        Route::post('/horses', [HorseController::class, 'store']);
        Route::get('/horses', [HorseController::class, 'index']);
        Route::get('/horses/{id}', [HorseController::class, 'show']);
        Route::put('/horses/{id}', [HorseController::class, 'update']);
        Route::delete('/horses/{id}', [HorseController::class, 'destroy']);

        // Horse specific schedules/results/rewards/jockeys
        Route::get('/horses/{id}/schedule', [HorseController::class, 'schedule']);
        Route::get('/horses/{id}/results', [HorseController::class, 'results']);
        Route::get('/horses/{id}/rankings', [HorseController::class, 'rankings']);
        Route::get('/horses/{id}/rewards', [HorseController::class, 'rewards']);
        Route::post('/horses/{id}/hire-jockey', [HorseController::class, 'hireJockey']);
        Route::post('/horses/{id}/confirm-jockey', [HorseController::class, 'confirmJockey']);

        // Register horse for a race
        Route::post('/registrations', [RegistrationController::class, 'store']);

        // Horse Owner profile & management
        Route::get('/horse-owner/profile', [HorseOwnerController::class, 'profile']);
        Route::get('/horse-owner/horses', [HorseOwnerController::class, 'myHorses']);
        Route::get('/horse-owner/horses-for-race/{raceId}', [HorseOwnerController::class, 'horsesForRace']);
        Route::get('/horse-owner/horses/{horseId}/jockeys', [HorseOwnerController::class, 'jockeysForHorse']);
        Route::get('/horse-owner/horses/{horseId}/schedule', [HorseOwnerController::class, 'raceSchedule']);
        Route::get('/horse-owner/horses/{horseId}/results', [HorseOwnerController::class, 'raceResults']);
        Route::get('/horse-owner/horses/{horseId}/rankings', [HorseOwnerController::class, 'horseRankings']);
        Route::get('/horse-owner/horses/{horseId}/rewards', [HorseOwnerController::class, 'horseRewards']);

        // Danh sách nài ngựa để chủ ngựa chọn thuê
        Route::get('/jockeys', [HorseOwnerController::class, 'listJockeys']);
    });

    // Jockey only: View schedule & accept registration
    Route::middleware('jwt.auth:jockey')->group(function () {
        Route::get('/jockey/schedule', [JockeyController::class, 'schedule']);
        Route::post('/registrations/{id}/accept', [RegistrationController::class, 'accept']);
    });

    // Spectator only: Bets
    Route::middleware('jwt.auth:spectator')->group(function () {
        Route::post('/bets', [BetController::class, 'store']);
        Route::get('/bets', [BetController::class, 'index']);
        Route::get('/bets/{id}', [BetController::class, 'show']);
    });
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
    Route::get('/referee/violations', [RefereeController::class, 'getViolations']);
    Route::put('/referee/races/{id}/status', [RefereeController::class, 'updateRaceStatus']);
    Route::post('/referee/races/{race}/results', [ResultController::class, 'store']);
    Route::get('/referee/races/{race}/results', [ResultController::class, 'show']);

    Route::middleware('role:jockey')->prefix('jockey')->group(function () {
        // Overview — stats tổng hợp + lịch đua sắp tới
        Route::get('/stats',          [JockeyController::class, 'stats']);
        Route::get('/races/upcoming', [JockeyController::class, 'upcomingRaces']);

        // Schedule — toàn bộ lịch đua, filter theo status
        Route::get('/races',          [JockeyController::class, 'races']);

        // Invitations — pending & history tách riêng, respond dùng PUT
        Route::get('/invitations/pending',          [JockeyController::class, 'invitationsPending']);
        Route::get('/invitations/history',          [JockeyController::class, 'invitationsHistory']);
        Route::put('/invitations/{invite}/respond', [JockeyController::class, 'respondInvitation']);

        // Performance — kết quả & thời gian tốt nhất
        Route::get('/performance/results',    [JockeyController::class, 'performanceResults']);
        Route::get('/performance/best-times', [JockeyController::class, 'performanceBestTimes']);
    });
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


