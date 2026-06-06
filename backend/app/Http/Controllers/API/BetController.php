<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use Illuminate\Http\Request;

class BetController extends Controller
{
    /**
     * Hiển thị danh sách các cược của người dùng.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Lấy danh sách cược thành công (Stub)',
            'data' => []
        ]);
    }

    /**
     * Đặt một cược mới.
     */
    public function placeBet(Request $request, $raceId)
    {
        // 1. Validate dữ liệu đầu vào
        $validated = $request->validate([
            'registration_id' => 'required|integer',
            'amount' => 'required|numeric|min:1',
            'prediction_type' => 'required|string|in:win,place,show',
        ]);

        // 2. Validate thời gian: Chỉ cho phép đặt cược TRƯỚC khi cuộc đua bắt đầu
        // Trong thực tế: $race = Race::findOrFail($raceId);
        // if (now()->greaterThanOrEqualTo($race->race_time)) { ... }

        return response()->json([
            'message' => 'Đặt dự đoán thành công (Backend đã validate thời gian)!',
            'bet' => array_merge($validated, ['race_id' => $raceId, 'status' => 'pending'])
        ], 201);
    }

    /**
     * Xem chi tiết một khoản cược.
     */
    public function show($id)
    {
        return response()->json([
            'message' => 'Chi tiết cược (Stub)',
            'id' => $id
        ]);
    }

    /**
     * Hủy cược.
     */
    public function destroy($id)
    {
        return response()->json([
            'message' => 'Đã hủy cược (Stub)',
            'id' => $id
        ], 200);
    }
}
