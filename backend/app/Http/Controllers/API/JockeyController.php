<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\IJockeyService;
use Illuminate\Http\JsonResponse;
use App\Models\HorseJockey;
use App\Models\RaceResult;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Http\Request;

class JockeyController extends Controller
{
    protected IJockeyService $jockeyService;

    public function __construct(IJockeyService $jockeyService)
    {
        $this->jockeyService = $jockeyService;
    }

    public function index(): JsonResponse
    {
        $jockeys = $this->jockeyService->getAllJockeys();
        return response()->json($jockeys);
    }

    public function schedule(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $schedule = $this->jockeyService->getJockeySchedule($userId);
        return response()->json($schedule);

    // GET /api/jockey/stats
    public function stats(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $regs   = Registration::where('jockey_id', $userId)->get();
            $total  = $regs->count();

            $wins = RaceResult::whereHas(
                'registration', fn($q) => $q->where('jockey_id', $userId)
            )->where('rank', 1)->count();

            $activeHorses = $regs
                ->whereIn('status', ['pending', 'confirmed'])
                ->pluck('horse_id')->unique()->count();

            $upcoming = Registration::where('jockey_id', $userId)
                ->whereHas('race', fn($q) => $q->whereNotNull('race_time')
                    ->where('race_time', '>', now()))
                ->count();

            return response()->json(['success' => true, 'data' => [
                'total_races'    => $total,
                'wins'           => $wins,
                'active_horses'  => $activeHorses,
                'upcoming'       => $upcoming,
                'win_rate'       => $total > 0 ? round($wins / $total * 100, 1) : 0,
                // TODO: thêm cột license_number vào bảng jockeys khi cần
                'license_number' => '—',
            ]]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // GET /api/jockey/races/upcoming
    public function upcomingRaces(Request $request)
    {
        try {
            $rows = Registration::with(['race.tournament', 'horse.owner'])
                ->where('jockey_id', $request->user()->id)
                ->whereHas('race', fn($q) => $q->where('race_time', '>', now()))
                ->get()
                ->sortBy(fn($r) => $r->race->race_time)
                ->take(5)
                ->map(fn($r) => [
                    'id'          => $r->id,
                    'race_date'   => $r->race->race_time,
                    'race_name'   => $r->race->tournament->name ?? 'Cuộc đua',
                    'tournament'  => $r->race->tournament->name ?? '—',
                    'distance'    => $r->race->distance,
                    'horse_name'  => $r->horse->name ?? '—',
                    'owner_name'  => $r->horse->owner->name ?? '—',
                    'lane_number' => $r->lane_number ?? null,
                    'reg_status'  => $r->status,
                    'status'      => $r->race->status,
                ])
                ->values();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // GET /api/jockey/races
    public function races(Request $request)
    {
        try {
            $rows = Registration::with(['race.tournament', 'horse.owner'])
                ->where('jockey_id', $request->user()->id)
                ->orderByDesc('created_at')
                ->get()
                ->map(fn($r) => [
                    'id'          => $r->id,
                    'race_date'   => $r->race->race_time,
                    'race_name'   => $r->race->tournament->name ?? 'Cuộc đua',
                    'tournament'  => $r->race->tournament->name ?? '—',
                    'distance'    => $r->race->distance,
                    'horse_name'  => $r->horse->name ?? '—',
                    'owner_name'  => $r->horse->owner->name ?? '—',
                    'lane_number' => $r->lane_number ?? null,
                    'reg_status'  => $r->status,
                    'status'      => $r->race->status,
                ])
                ->values();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // GET /api/jockey/invitations/pending
    public function invitationsPending(Request $request)
    {
        try {
            $rows = HorseJockey::with(['horse.owner', 'race.tournament'])
                ->where('jockey_id', $request->user()->id)
                ->where('status', 'pending')
                ->orderByDesc('created_at')
                ->get()
                ->map(fn($inv) => [
                    'id'         => $inv->id,
                    'horse_name' => $inv->horse->name ?? '—',
                    'breed'      => $inv->horse->breed ?? '—',
                    'age'        => $inv->horse->age ?? '—',
                    'weight'     => '—',
                    'wins'       => $this->countHorseWins($inv->horse_id),
                    'owner_name' => $inv->horse->owner->name ?? '—',
                    'race_name'  => $inv->race->tournament->name ?? '—',
                    'tournament' => $inv->race->tournament->name ?? '—',
                    'race_date'  => $inv->race->race_time,
                    'distance'   => $inv->race->distance,
                ])
                ->values();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // GET /api/jockey/invitations/history
    public function invitationsHistory(Request $request)
    {
        try {
            $rows = HorseJockey::with(['horse', 'race.tournament'])
                ->where('jockey_id', $request->user()->id)
                ->whereIn('status', ['accepted', 'rejected'])
                ->orderByDesc('updated_at')
                ->get()
                ->map(fn($inv) => [
                    'id'         => $inv->id,
                    'horse_name' => $inv->horse->name ?? '—',
                    'race_name'  => $inv->race->tournament->name ?? '—',
                    'invited_at' => $inv->created_at,
                    'status'     => $inv->status,
                    'result'     => $this->getInviteResult($inv),
                ])
                ->values();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // PUT /api/jockey/invitations/{invite}/respond
    public function respondInvitation(Request $request, HorseJockey $invite)
    {
        try {
            if ($invite->jockey_id !== $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'Không có quyền phản hồi lời mời này.'], 403);
            }

            if ($invite->status !== 'pending') {
                return response()->json(['success' => false, 'message' => 'Lời mời này đã được phản hồi rồi.'], 422);
            }

            $data = $request->validate([
                'status' => 'required|in:accepted,rejected',
                'reason' => 'nullable|string|max:500',
            ]);

            $invite->update($data);

            if ($data['status'] === 'accepted') {
                Registration::updateOrCreate(
                    ['race_id' => $invite->race_id, 'horse_id' => $invite->horse_id],
                    ['jockey_id' => $invite->jockey_id, 'status' => 'confirmed']
                );
            }

            return response()->json([
                'success' => true,
                'message' => $data['status'] === 'accepted' ? 'Đã chấp nhận lời mời.' : 'Đã từ chối lời mời.',
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // GET /api/jockey/performance/results
    public function performanceResults(Request $request)
    {
        try {
            $rows = RaceResult::with(['registration.race.tournament', 'registration.horse'])
                ->whereHas('registration', fn($q) => $q->where('jockey_id', $request->user()->id))
                ->orderByDesc('created_at')
                ->get()
                ->map(fn($r) => [
                    'id'              => $r->id,
                    'race_name'       => $r->registration->race->tournament->name ?? 'Cuộc đua',
                    'horse_name'      => $r->registration->horse->name ?? '—',
                    'race_date'       => $r->registration->race->race_time,
                    'finish_position' => $r->rank,
                    'finish_time'     => $r->finish_time,
                    'prize_amount'    => $r->prize_amount ?? 0,
                ])
                ->values();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // GET /api/jockey/performance/best-times
    public function performanceBestTimes(Request $request)
    {
        try {
            $rows = RaceResult::with(['registration.race.tournament', 'registration.horse'])
                ->whereHas('registration', fn($q) => $q->where('jockey_id', $request->user()->id))
                ->whereNotNull('finish_time')
                ->orderBy('finish_time')
                ->limit(3)
                ->get()
                ->map(fn($r, $i) => [
                    'rank'        => $i + 1,
                    'race_name'   => $r->registration->race->tournament->name ?? 'Cuộc đua',
                    'horse_name'  => $r->registration->horse->name ?? '—',
                    'finish_time' => $r->finish_time,
                ])
                ->values();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private function countHorseWins(int $horseId): int
    {
        return RaceResult::whereHas(
            'registration', fn($q) => $q->where('horse_id', $horseId)
        )->where('rank', 1)->count();
    }

    private function getInviteResult(HorseJockey $inv): ?string
    {
        if ($inv->status !== 'accepted') return null;

        $result = RaceResult::whereHas(
            'registration',
            fn($q) => $q->where('race_id', $inv->race_id)
                        ->where('horse_id', $inv->horse_id)
                        ->where('jockey_id', $inv->jockey_id)
        )->first();

        return $result ? "Hạng {$result->rank}" : null;

    }
}
