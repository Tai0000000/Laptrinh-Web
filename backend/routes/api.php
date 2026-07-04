<?php

use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\AdminUserController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BetController;
use App\Http\Controllers\API\HorseController;
use App\Http\Controllers\API\HorseOwnerController;
use App\Http\Controllers\API\JockeyController;
use App\Http\Controllers\API\RaceController;
use App\Http\Controllers\API\RaceResultController;
use App\Http\Controllers\API\RegistrationController;
use App\Http\Controllers\API\TournamentController;
use App\Http\Controllers\API\RefereeController;
use App\Http\Controllers\API\ResultController;
use App\Http\Controllers\API\SystemSettingController;
use Illuminate\Support\Facades\Route;

// ============================================================
// Health Check
// ============================================================
Route::get('/health', function () {
    return response()->json([
        'status'    => 'ok',
        'service'   => 'Horse Racing API',
        'timestamp' => now(),
    ]);
});

// ============================================================
// Public / Anonymous routes
// ============================================================
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

Route::get('/public/tournaments',           [TournamentController::class, 'index']);
Route::get('/public/tournaments/{id}',      [TournamentController::class, 'show']);
Route::get('/public/races',                 [RaceController::class, 'index']);
Route::get('/public/races/live',            [RaceController::class, 'live']);
Route::get('/public/races/{id}',            [RaceController::class, 'show']);
Route::get('/public/race-results/{raceId}', [RaceResultController::class, 'leaderboard']);

// Races — public (Predictions.jsx cần lấy danh sách race và chi tiết không cần login)
Route::get('/races',        [RaceController::class, 'index']);
Route::get('/races/{id}',   [RaceController::class, 'show']);

// ============================================================
// Authenticated Routes (JWT required)
// ============================================================
Route::middleware('jwt.auth')->group(function () {

    // -- Auth profile --
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);
    Route::delete('/contracts/{contract}', [JockeyController::class, 'terminateContract']);

    // --------------------------------------------------------
    // Admin-only routes
    // --------------------------------------------------------
    Route::middleware('jwt.auth:admin')->group(function () {

        // Dashboard KPIs & activity
        Route::get('/admin/stats',           [AdminController::class, 'stats']);
        Route::get('/admin/recent-activity', [AdminController::class, 'recentActivity']);

        // User management
        Route::get('/admin/users',                        [AdminUserController::class, 'index']);
        Route::put('/admin/users/{id}/role',              [AdminUserController::class, 'changeRole']);
        Route::put('/admin/users/{id}/toggle-lock',       [AdminUserController::class, 'toggleLock']);

        // Registration approval (admin view)
        Route::get('/admin/registrations',                [AdminUserController::class, 'registrations']);
        Route::put('/admin/registrations/{id}/status',    [AdminUserController::class, 'updateRegistrationStatus']);

        // Race list (admin view - all races)
        Route::get('/admin/races',                        [AdminUserController::class, 'races']);

        // Leaderboard
        Route::get('/admin/leaderboard',                  [AdminUserController::class, 'leaderboard']);

        // Admin result entry (same as referee, but accessible by admin)
        Route::post('/admin/races/{race}/results',        [ResultController::class, 'store']);
        Route::get('/admin/races/{race}/results',         [ResultController::class, 'show']);

        // System settings
        Route::get('/admin/settings',          [SystemSettingController::class, 'index']);
        Route::put('/admin/settings',          [SystemSettingController::class, 'update']);
        Route::put('/admin/settings/{key}/toggle', [SystemSettingController::class, 'toggle']);

        // Tournaments CRUD
        Route::get('/tournaments',       [TournamentController::class, 'index']);
        Route::post('/tournaments',      [TournamentController::class, 'store']);
        Route::get('/tournaments/{id}',  [TournamentController::class, 'show']);
        Route::put('/tournaments/{id}',  [TournamentController::class, 'update']);
        Route::delete('/tournaments/{id}', [TournamentController::class, 'destroy']);
    });

    // --------------------------------------------------------
    // Admin & Referee: Races + Registration approval
    // --------------------------------------------------------
    Route::middleware('jwt.auth:admin,race_referee')->group(function () {
        Route::post('/races',              [RaceController::class, 'store']);
        Route::put('/races/{id}',          [RaceController::class, 'update']);
        Route::put('/races/{id}/status',   [RaceController::class, 'updateStatus']);
        Route::delete('/races/{id}',       [RaceController::class, 'destroy']);
        Route::put('/registrations/{id}/status', [RegistrationController::class, 'updateStatus']);
    });

    // --------------------------------------------------------
    // Referee only: results & violations
    // --------------------------------------------------------
    Route::middleware('jwt.auth:race_referee')->group(function () {
        Route::post('/race-results',        [RaceResultController::class, 'store']);
        Route::get('/race-results',         [RaceResultController::class, 'index']);
        Route::get('/race-results/{id}',    [RaceResultController::class, 'show']);
        Route::put('/race-results/{id}',    [RaceResultController::class, 'update']);

        Route::get('/referee/races',                     [RefereeController::class, 'index']);
        Route::get('/referee/races/{id}',                [RefereeController::class, 'show']);
        Route::post('/referee/violations',               [RefereeController::class, 'logViolation']);
        Route::get('/referee/violations',                [RefereeController::class, 'getViolations']);
        Route::put('/referee/races/{id}/status',         [RefereeController::class, 'updateRaceStatus']);
        Route::post('/referee/races/{race}/results',     [ResultController::class, 'store']);
        Route::get('/referee/races/{race}/results',      [ResultController::class, 'show']);
    });

    // --------------------------------------------------------
    // Horse Owner
    // --------------------------------------------------------
    Route::middleware('jwt.auth:horse_owner')->group(function () {
        Route::post('/horses',             [HorseController::class, 'store']);
        Route::get('/horses',              [HorseController::class, 'index']);
        Route::get('/horses/{id}',         [HorseController::class, 'show']);
        Route::put('/horses/{id}',         [HorseController::class, 'update']);
        Route::delete('/horses/{id}',      [HorseController::class, 'destroy']);

        Route::get('/horses/{id}/schedule',         [HorseController::class, 'schedule']);
        Route::get('/horses/{id}/results',          [HorseController::class, 'results']);
        Route::get('/horses/{id}/rankings',         [HorseController::class, 'rankings']);
        Route::get('/horses/{id}/rewards',          [HorseController::class, 'rewards']);
        Route::post('/horses/{id}/hire-jockey',     [HorseController::class, 'hireJockey']);
        Route::post('/horses/{id}/confirm-jockey',  [HorseController::class, 'confirmJockey']);

        Route::post('/registrations', [RegistrationController::class, 'store']);
        Route::get('/registrations/owner', [RegistrationController::class, 'ownerRegistrations']);
        Route::delete('/registrations/{id}', [RegistrationController::class, 'ownerDestroy']);

        Route::get('/horse-owner/profile',                            [HorseOwnerController::class, 'profile']);
        Route::get('/horse-owner/horses',                             [HorseOwnerController::class, 'myHorses']);
        Route::get('/horse-owner/horses-for-race/{raceId}',           [HorseOwnerController::class, 'horsesForRace']);
        Route::get('/horse-owner/horses/{horseId}/jockeys',           [HorseController::class, 'jockeysForHorse']);
        Route::get('/horse-owner/horses/{horseId}/schedule',          [HorseController::class, 'schedule']);
        Route::get('/horse-owner/horses/{horseId}/results',           [HorseController::class, 'results']);
        Route::get('/horse-owner/horses/{horseId}/rankings',          [HorseController::class, 'rankings']);
        Route::get('/horse-owner/horses/{horseId}/rewards',           [HorseController::class, 'rewards']);

        Route::get('/jockeys', [JockeyController::class, 'listJockeys']);
        Route::post('/contracts', [JockeyController::class, 'proposeContract']);
        Route::get('/contracts/owner', [JockeyController::class, 'ownerContracts']);

        // RESTful API endpoints for specific Owner ID (used by frontend)
        Route::get('/owners/{ownerId}',         [HorseOwnerController::class, 'getHorseOwnerById']);
        Route::put('/owners/{ownerId}',         [HorseOwnerController::class, 'updateHorseOwner']);
        Route::delete('/owners/{ownerId}',      [HorseOwnerController::class, 'deleteHorseOwner']);
        Route::post('/owners',                  [HorseOwnerController::class, 'createHorseOwner']);

        Route::get('/owners/{ownerId}/horses',  [HorseController::class, 'getHorsesByOwner']);
        Route::get('/owners/{ownerId}/horses/count', [HorseController::class, 'countHorsesByOwner']);
    });

    // --------------------------------------------------------
    // Jockey
    // --------------------------------------------------------
    Route::middleware('jwt.auth:jockey')->group(function () {
        Route::get('/jockey/schedule',           [JockeyController::class, 'schedule']);
        Route::post('/registrations/{id}/accept',[RegistrationController::class, 'accept']);

        Route::prefix('jockey')->group(function () {
            Route::get('/stats',                   [JockeyController::class, 'stats']);
            Route::get('/contracts/pending',       [JockeyController::class, 'pendingContracts']);
            Route::put('/contracts/{contract}/respond', [JockeyController::class, 'respondContract']);
            Route::get('/races/upcoming',          [JockeyController::class, 'upcomingRaces']);
            Route::get('/races',                   [JockeyController::class, 'races']);
            Route::get('/invitations/pending',     [JockeyController::class, 'invitationsPending']);
            Route::get('/invitations/history',     [JockeyController::class, 'invitationsHistory']);
            Route::put('/invitations/{invite}/respond', [JockeyController::class, 'respondInvitation']);
            Route::get('/performance/results',     [JockeyController::class, 'performanceResults']);
            Route::get('/performance/best-times',  [JockeyController::class, 'performanceBestTimes']);
        });
    });

    // --------------------------------------------------------
    // Spectator
    // --------------------------------------------------------
    Route::middleware('jwt.auth:spectator')->group(function () {
        Route::post('/bets',          [BetController::class, 'store']);
        Route::get('/bets',           [BetController::class, 'index']);
        Route::get('/bets/{id}',      [BetController::class, 'show']);
        Route::delete('/bets/{id}',   [BetController::class, 'destroy']);
    });
});
