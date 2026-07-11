<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Models\Race;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BetController extends Controller
{
    /**
     * GET /api/bets
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $bets = Bet::with([
            'registration.horse',
            'registration.jockey',
            'registration.race.tournament',
        ])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        $formattedBets = $bets->map(fn ($bet) => [
            'id'              => $bet->id,
            'race_name'       => $bet->registration->race->name
                                 ?? ($bet->registration->race->round ?? 'N/A'),
            'tournament_name' => $bet->registration->race->tournament->name ?? 'N/A',
            'horse_name'      => $bet->registration->horse->name ?? 'N/A',
            'lane'            => $bet->registration->lane ?? 'N/A',
            'prediction_type' => $bet->prediction_type,
            'amount'          => $bet->amount,
            'status'          => $bet->status,
            'payout'          => $bet->reward_amount ?? ($bet->status === 'won' ? $bet->amount * 2.5 : 0),
            'created_at'      => $bet->created_at,
        ]);

        return response()->json(['message' => 'Lấy danh sách cược thành công!', 'data' => $formattedBets]);
    }

    /**
     * POST /api/bets — Đặt cược, trừ tiền từ ví
     */
    public function store(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $validated = $request->validate([
            'registration_id' => 'required|integer|exists:registrations,id',
            'race_id'         => 'required|integer|exists:races,id',
            'amount'          => 'required|numeric|min:10000',
            'prediction_type' => 'required|string|in:win,place,show',
        ]);

        $amount = (float) $validated['amount'];

        // Kiểm tra thời gian race
        $race = Race::findOrFail($validated['race_id']);
        if (now()->greaterThanOrEqualTo($race->race_time)) {
            return response()->json(['message' => 'Cuộc đua đã bắt đầu hoặc kết thúc. Không thể đặt cược!'], 422);
        }

        // Kiểm tra registration hợp lệ
        $registration = Registration::where('id', $validated['registration_id'])
            ->where('race_id', $validated['race_id'])
            ->where('status', 'confirmed')
            ->first();

        if (! $registration) {
            return response()->json(['message' => 'Đăng ký này không hợp lệ hoặc chưa được xác nhận.'], 422);
        }

        // Kiểm tra số dư ví
        $user = User::findOrFail($userId);
        if ((float) $user->balance < $amount) {
            return response()->json([
                'message' => 'Số dư ví không đủ. Số dư hiện tại: ' . number_format($user->balance, 0, ',', '.') . ' VNĐ',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Trừ tiền khỏi ví
            $user->decrement('balance', $amount);

            // Tạo cược
            $bet = Bet::create([
                'user_id'         => $userId,
                'registration_id' => $validated['registration_id'],
                'amount'          => $amount,
                'prediction_type' => $validated['prediction_type'],
                'status'          => 'pending',
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Có lỗi xảy ra khi đặt cược. Vui lòng thử lại.'], 500);
        }

        // Lấy balance mới nhất để trả về
        $user->refresh();

        return response()->json([
            'message'     => 'Đặt dự đoán thành công!',
            'data'        => $bet->load(['registration.horse', 'registration.jockey', 'registration.race']),
            'new_balance' => (float) $user->balance,
        ], 201);
    }

    /**
     * GET /api/bets/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $bet    = Bet::with(['registration.horse', 'registration.jockey', 'registration.race.tournament'])->find($id);

        if (! $bet)                    return response()->json(['message' => 'Cược không tồn tại.'], 404);
        if ($bet->user_id !== $userId) return response()->json(['message' => 'Bạn không có quyền xem cược này.'], 403);

        return response()->json(['message' => 'Lấy chi tiết cược thành công!', 'data' => $bet]);
    }

    /**
     * DELETE /api/bets/{id} — Hủy cược, hoàn tiền vào ví
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $bet    = Bet::with('registration.race')->find($id);

        if (! $bet)                    return response()->json(['message' => 'Cược không tồn tại.'], 404);
        if ($bet->user_id !== $userId) return response()->json(['message' => 'Bạn không có quyền hủy cược này.'], 403);

        $race = $bet->registration->race;
        if ($bet->status !== 'pending' || now()->greaterThanOrEqualTo($race->race_time)) {
            return response()->json(['message' => 'Không thể hủy cược này!'], 422);
        }

        DB::beginTransaction();
        try {
            // Hoàn tiền về ví
            $user = User::findOrFail($userId);
            $user->increment('balance', (float) $bet->amount);

            $bet->delete();
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Có lỗi xảy ra khi hủy cược.'], 500);
        }

        $user->refresh();

        return response()->json([
            'message'     => 'Đã hủy cược và hoàn tiền thành công!',
            'new_balance' => (float) $user->balance,
        ]);
    }

    /**
     * GET /api/wallet — Lấy số dư ví hiện tại
     */
    public function wallet(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $user   = User::findOrFail($userId);

        return response()->json([
            'balance' => (float) $user->balance,
        ]);
    }

    /**
     * POST /api/wallet/deposit — Nạp tiền vào ví
     */
    public function deposit(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $data = $request->validate([
            'amount' => 'required|numeric|min:10000|max:100000000',
        ]);

        $amount = (float) $data['amount'];

        DB::beginTransaction();
        try {
            $user = User::findOrFail($userId);
            $user->increment('balance', $amount);
            DB::commit();
            $user->refresh();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Nạp tiền thất bại. Vui lòng thử lại.'], 500);
        }

        return response()->json([
            'message'     => 'Nạp tiền thành công!',
            'amount'      => $amount,
            'new_balance' => (float) $user->balance,
        ]);
    }

    /**
     * POST /api/wallet/withdraw — Rút tiền khỏi ví
     */
    public function withdraw(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $data = $request->validate([
            'amount' => 'required|numeric|min:10000|max:100000000',
        ]);

        $amount = (float) $data['amount'];

        DB::beginTransaction();
        try {
            $user = User::findOrFail($userId);

            if ((float) $user->balance < $amount) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Số dư không đủ để rút. Số dư hiện tại: '
                        . number_format($user->balance, 0, ',', '.') . ' VNĐ',
                ], 422);
            }

            $user->decrement('balance', $amount);
            DB::commit();
            $user->refresh();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Rút tiền thất bại. Vui lòng thử lại.'], 500);
        }

        return response()->json([
            'message'     => 'Rút tiền thành công!',
            'amount'      => $amount,
            'new_balance' => (float) $user->balance,
        ]);
    }
}
