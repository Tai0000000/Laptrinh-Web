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
        // Stub: Xử lý logic đặt cược
        $validated = $request->validate([
            'registration_id' => 'required|integer',
            'amount' => 'required|numeric|min:1',
            'prediction_type' => 'required|string',
        ]);

        return response()->json([
            'message' => 'Đặt cược thành công (Stub)',
            'bet' => $validated
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
