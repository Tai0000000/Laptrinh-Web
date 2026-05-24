<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TournamentController;
use App\Http\Controllers\API\HorseController;
use App\Http\Controllers\API\RaceController;
use App\Http\Controllers\API\BetController;

/*
|--------------------------------------------------------------------------
| API Routes (Các tuyến đường API)
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    // Thông tin người dùng
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Các tuyến đường Giải đấu (Tournament)
    Route::apiResource('tournaments', TournamentController::class);
    
    // Các tuyến đường Ngựa (Horse)
    Route::apiResource('horses', HorseController::class);
    
    // Các tuyến đường Cuộc đua (Race)
    Route::apiResource('races', RaceController::class);
    Route::post('/races/{race}/register', [RaceController::class, 'registerHorse']);
    
    // Kết quả và Báo cáo
    Route::get('/races/{race}/results', [RaceController::class, 'results']);
    Route::post('/races/{race}/report', [RaceController::class, 'submitReport']); // Dành cho Trọng tài

    // Đặt cược (Dành cho Khán giả)
    Route::post('/races/{race}/bet', [BetController::class, 'placeBet']);
});

// Các tuyến đường công khai (Public)
Route::get('/public/tournaments', [TournamentController::class, 'index']);
Route::get('/public/races/live', [RaceController::class, 'liveRaces']);
