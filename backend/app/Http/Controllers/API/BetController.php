<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Models\Race;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BetController extends Controller
{
    /**
     * Hiển thị danh sách các cược của người dùng hiện tại.
     */
    public function index()
    {
        $user = Auth::user();
        $bets = Bet::with([
            'registration.horse', 
            'registration.jockey',
            'registration.race.tournament'
        ])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Return formatted data for frontend
        $formattedBets = $bets->map(function ($bet) {
            return [
                'id' => $bet->id,
                'race_name' => $bet->registration->race->name ?? 'N/A',
                'tournament_name' => $bet->registration->race->tournament->name ?? 'N/A',
                'horse_name' => $bet->registration->horse->name ?? 'N/A',
                'lane' => $bet->registration->lane ?? 'N/A',
                'prediction_type' => $bet->prediction_type,
                'status' => $bet->status,
                'payout' => $bet->reward_amount ?? ($bet->status === 'won' ? $bet->amount * 2.5 : 0),
                'created_at' => $bet->created_at,
            ];
        });

        return response()->json([
            'message' => 'Lấy danh sách cược thành công!',
            'data' => $formattedBets
        ]);
    }

    /**
     * Đặt một cược mới.
     */
    public function placeBet(Request $request, $raceId)
    {
        $user = Auth::user();

        // Validate request data
        $validated = $request->validate([
            'registration_id' => 'required|exists:registrations,id',
            'amount' => 'required|numeric|min:1',
            'prediction_type' => 'required|string|in:win,place,show',
        ]);

        // 1. Get race to check time
        $race = Race::findOrFail($raceId);

        // 2. Validate: Only allow betting before race starts
        if (now()->greaterThanOrEqualTo($race->race_time)) {
            return response()->json([
                'message' => 'Cuộc đua đã bắt đầu hoặc kết thúc. Không thể đặt cược!'
            ], 422);
        }

        // 3. Check registration is for this specific race
        $registration = Registration::where('id', $validated['registration_id'])
            ->where('race_id', $raceId)
            ->where('status', 'confirmed')
            ->firstOrFail();

        // 4. Create bet
        $bet = Bet::create([
            'user_id' => $user->id,
            'registration_id' => $validated['registration_id'],
            'amount' => $validated['amount'],
            'prediction_type' => $validated['prediction_type'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Đặt dự đoán thành công!',
            'bet' => $bet->load([
                'registration.horse', 
                'registration.jockey',
                'registration.race'
            ])
        ], 201);
    }

    /**
     * Xem chi tiết một khoản cược.
     */
    public function show(Bet $bet)
    {
        // Check if user owns the bet
        if ($bet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Bạn không có quyền xem cược này.'], 403);
        }

        $bet->load([
            'registration.horse',
            'registration.jockey',
            'registration.race.tournament'
        ]);

        return response()->json([
            'message' => 'Lấy chi tiết cược thành công!',
            'data' => $bet
        ]);
    }

    /**
     * Hủy cược.
     */
    public function destroy(Bet $bet)
    {
        // Check if user owns the bet
        if ($bet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Bạn không có quyền hủy cược này.'], 403);
        }

        // Check if bet is still pending and race hasn't started
        $race = $bet->registration->race;
        if ($bet->status !== 'pending' || now()->greaterThanOrEqualTo($race->race_time)) {
            return response()->json(['message' => 'Không thể hủy cược này!'], 422);
        }

        $bet->delete();

        return response()->json([
            'message' => 'Đã hủy cược thành công!'
        ], 200);
    }
}
