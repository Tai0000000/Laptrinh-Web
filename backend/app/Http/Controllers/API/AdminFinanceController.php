<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * AdminFinanceController
 * Báo cáo tài chính và quản lý giao dịch cược cho admin
 */
class AdminFinanceController extends Controller
{
    // GET /admin/finance/summary
    public function summary(): JsonResponse
    {
        $totalBets        = Bet::count();
        $totalBetAmount   = Bet::sum('amount');
        $totalPayout      = Bet::where('status', 'won')->sum('reward_amount');
        $pendingBets      = Bet::where('status', 'pending')->count();
        $wonBets          = Bet::where('status', 'won')->count();
        $lostBets         = Bet::where('status', 'lost')->count();
        $totalRevenue     = $totalBetAmount - ($totalPayout ?? 0);
        $totalWallets     = User::whereIn('role', ['spectator'])->sum('balance');

        return response()->json([
            'total_bets'       => $totalBets,
            'total_bet_amount' => (float) $totalBetAmount,
            'total_payout'     => (float) ($totalPayout ?? 0),
            'total_revenue'    => (float) $totalRevenue,
            'pending_bets'     => $pendingBets,
            'won_bets'         => $wonBets,
            'lost_bets'        => $lostBets,
            'total_wallets'    => (float) $totalWallets,
        ]);
    }

    // GET /admin/finance/bets?status=&search=&page=
    public function bets(Request $request): JsonResponse
    {
        $query = Bet::with([
            'user',
            'registration.horse',
            'registration.race.tournament',
        ]);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            );
        }

        $bets = $query->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn($bet) => [
                'id'              => $bet->id,
                'user_name'       => $bet->user->name ?? '—',
                'user_email'      => $bet->user->email ?? '—',
                'horse_name'      => $bet->registration->horse->name ?? '—',
                'race_name'       => $bet->registration->race->name
                                     ?? ($bet->registration->race->round ?? '—'),
                'tournament'      => $bet->registration->race->tournament->name ?? '—',
                'prediction_type' => $bet->prediction_type,
                'amount'          => (float) $bet->amount,
                'reward_amount'   => (float) ($bet->reward_amount ?? 0),
                'status'          => $bet->status,
                'created_at'      => $bet->created_at,
            ]);

        return response()->json($bets);
    }

    // PUT /admin/finance/bets/{id}/settle — Xử lý kết quả cược
    public function settleBet(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status'        => 'required|in:won,lost,refunded',
            'reward_amount' => 'nullable|numeric|min:0',
        ]);

        $bet = Bet::with('user')->findOrFail($id);

        if ($bet->status !== 'pending') {
            return response()->json(['message' => 'Cược này đã được xử lý rồi.'], 422);
        }

        DB::beginTransaction();
        try {
            $bet->update([
                'status'        => $data['status'],
                'reward_amount' => $data['reward_amount'] ?? 0,
            ]);

            // Cộng tiền thưởng nếu thắng hoặc hoàn tiền
            if (in_array($data['status'], ['won', 'refunded']) && $bet->user) {
                $payout = $data['status'] === 'won'
                    ? (float) ($data['reward_amount'] ?? 0)
                    : (float) $bet->amount;

                $bet->user->increment('balance', $payout);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Đã xử lý cược thành công.', 'bet' => $bet]);
    }

    // GET /admin/finance/revenue?period=daily|weekly|monthly
    public function revenue(Request $request): JsonResponse
    {
        $period = $request->query('period', 'daily');

        $groupFormat = match ($period) {
            'monthly' => '%Y-%m',
            'weekly'  => '%x-W%v',
            default   => '%Y-%m-%d',
        };

        $days = match ($period) {
            'monthly' => 365,
            'weekly'  => 90,
            default   => 30,
        };

        $rows = Bet::select(
                DB::raw("DATE_FORMAT(created_at, '{$groupFormat}') as period"),
                DB::raw('SUM(amount) as total_bet'),
                DB::raw('SUM(CASE WHEN status = "won" THEN reward_amount ELSE 0 END) as total_payout'),
                DB::raw('COUNT(*) as bet_count')
            )
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return response()->json($rows);
    }
}
