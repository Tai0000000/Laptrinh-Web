<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\IBetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BetController extends Controller
{
    protected IBetService $betService;

    public function __construct(IBetService $betService)
    {
        $this->betService = $betService;
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $bets = $this->betService->getBetsByUser($userId);
        return response()->json($bets);
    }

    public function store(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $validated = $request->validate([
            'registration_id' => 'required|integer',
            'amount' => 'required|numeric|min:10000',
            'prediction_type' => 'required|string|in:win,place,show',
        ]);

        $validated['user_id'] = $userId;

        $bet = $this->betService->placeBet($validated);
        return response()->json($bet, 201);
    }

    public function show(int $id): JsonResponse
    {
        $bet = $this->betService->getBetById($id);
        if (!$bet) {
            return response()->json(['message' => 'Bet does not exist.'], 404);
        }
        return response()->json($bet);
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Models\Race;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BetController extends Controller
{
    /**
     * GET /api/bets
     * Hiển thị danh sách các cược của người dùng hiện tại.
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

        $formattedBets = $bets->map(function ($bet) {
            return [
                'id'              => $bet->id,
                'race_name'       => $bet->registration->race->name ?? 'N/A',
                'tournament_name' => $bet->registration->race->tournament->name ?? 'N/A',
                'horse_name'      => $bet->registration->horse->name ?? 'N/A',
                'lane'            => $bet->registration->lane ?? 'N/A',
                'prediction_type' => $bet->prediction_type,
                'amount'          => $bet->amount,
                'status'          => $bet->status,
                'payout'          => $bet->reward_amount ?? ($bet->status === 'won' ? $bet->amount * 2.5 : 0),
                'created_at'      => $bet->created_at,
            ];
        });

        return response()->json([
            'message' => 'Lấy danh sách cược thành công!',
            'data'    => $formattedBets,
        ]);
    }

    /**
     * POST /api/bets
     * Đặt một cược mới (dùng cho Spectator).
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

        // Kiểm tra cuộc đua chưa bắt đầu
        $race = Race::findOrFail($validated['race_id']);
        if (now()->greaterThanOrEqualTo($race->race_time)) {
            return response()->json([
                'message' => 'Cuộc đua đã bắt đầu hoặc kết thúc. Không thể đặt cược!',
            ], 422);
        }

        // Kiểm tra registration thuộc race và đã confirmed
        $registration = Registration::where('id', $validated['registration_id'])
            ->where('race_id', $validated['race_id'])
            ->where('status', 'confirmed')
            ->first();

        if (! $registration) {
            return response()->json([
                'message' => 'Đăng ký này không hợp lệ hoặc chưa được xác nhận.',
            ], 422);
        }

        $bet = Bet::create([
            'user_id'         => $userId,
            'registration_id' => $validated['registration_id'],
            'amount'          => $validated['amount'],
            'prediction_type' => $validated['prediction_type'],
            'status'          => 'pending',
        ]);

        return response()->json([
            'message' => 'Đặt dự đoán thành công!',
            'data'    => $bet->load(['registration.horse', 'registration.jockey', 'registration.race']),
        ], 201);
    }

    /**
     * GET /api/bets/{id}
     * Xem chi tiết một khoản cược.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $bet = Bet::with([
            'registration.horse',
            'registration.jockey',
            'registration.race.tournament',
        ])->find($id);

        if (! $bet) {
            return response()->json(['message' => 'Cược không tồn tại.'], 404);
        }

        if ($bet->user_id !== $userId) {
            return response()->json(['message' => 'Bạn không có quyền xem cược này.'], 403);
        }

        return response()->json([
            'message' => 'Lấy chi tiết cược thành công!',
            'data'    => $bet,
        ]);
    }

    /**
     * DELETE /api/bets/{id}
     * Hủy cược (chỉ khi pending và race chưa bắt đầu).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $bet = Bet::find($id);
        if (! $bet) {
            return response()->json(['message' => 'Cược không tồn tại.'], 404);
        }

        if ($bet->user_id !== $userId) {
            return response()->json(['message' => 'Bạn không có quyền hủy cược này.'], 403);
        }

        $race = $bet->registration->race;
        if ($bet->status !== 'pending' || now()->greaterThanOrEqualTo($race->race_time)) {
            return response()->json(['message' => 'Không thể hủy cược này!'], 422);
        }

        $bet->delete();

        return response()->json(['message' => 'Đã hủy cược thành công!']);
    }
}
