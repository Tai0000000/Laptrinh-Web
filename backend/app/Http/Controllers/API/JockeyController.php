<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\HorseJockey;
use App\Models\Jockey;
use App\Models\RaceResult;
use App\Models\Registration;
use Illuminate\Http\Request;

class JockeyController extends Controller
{
    
    private function getJockey(Request $request): ?Jockey
    {
        $userId = $request->attributes->get('auth_user_id');
        if (!$userId) return null;
        return Jockey::where('user_id', $userId)->first();
    }

    private function notFound(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Jockey profile not found.'], 404);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/jockey/stats
    // ──────────────────────────────────────────────────────────────────────
    public function stats(Request $request)
    {
        try {
            $jockey = $this->getJockey($request);
            if (!$jockey) return $this->notFound();

            $regs  = Registration::where('jockey_id', $jockey->id)->get();
            $total = $regs->count();

            $wins = RaceResult::whereHas(
                'registration', fn($q) => $q->where('jockey_id', $jockey->id)
            )->where('rank', 1)->count();

            $activeHorses = $regs
                ->whereIn('status', ['pending', 'confirmed'])
                ->pluck('horse_id')->unique()->count();

            $upcoming = Registration::where('jockey_id', $jockey->id)
                ->whereHas('race', fn($q) => $q->whereNotNull('race_time')
                    ->where('race_time', '>', now()))
                ->count();

            return response()->json(['success' => true, 'data' => [
                'total_races'    => $total,
                'wins'           => $wins,
                'active_horses'  => $activeHorses,
                'upcoming'       => $upcoming,
                'win_rate'       => $total > 0 ? round($wins / $total * 100, 1) : 0,
                'license_number' => $jockey->license_number ?? '—',
            ]]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/jockey/races/upcoming
    // ──────────────────────────────────────────────────────────────────────
    public function upcomingRaces(Request $request)
    {
        try {
            $jockey = $this->getJockey($request);
            if (!$jockey) return $this->notFound();

            $rows = Registration::with(['race.tournament', 'horse.owner.user'])
                ->where('jockey_id', $jockey->id)
                ->whereHas('race', fn($q) => $q->where('race_time', '>', now()))
                ->get()
                ->sortBy(fn($r) => $r->race->race_time)
                ->take(5)
                ->map(fn($r) => [
                    'id'          => $r->id,
                    'race_date'   => $r->race->race_time,
                    'race_name'   => $r->race->name ?? $r->race->tournament->name ?? 'Cuộc đua',
                    'tournament'  => $r->race->tournament->name ?? '—',
                    'distance'    => $r->race->distance,
                    'horse_name'  => $r->horse->name ?? '—',
                    'owner_name'  => $r->horse->owner->user->name ?? '—',
                    'lane_number' => $r->lane ?? null,
                    'reg_status'  => $r->status,
                    'status'      => $r->race->status,
                ])
                ->values();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/jockey/races
    // ──────────────────────────────────────────────────────────────────────
    public function races(Request $request)
    {
        try {
            $jockey = $this->getJockey($request);
            if (!$jockey) return $this->notFound();

            $rows = Registration::with(['race.tournament', 'horse.owner.user'])
                ->where('jockey_id', $jockey->id)
                ->orderByDesc('created_at')
                ->get()
                ->map(fn($r) => [
                    'id'          => $r->id,
                    'race_date'   => $r->race->race_time,
                    'race_name'   => $r->race->name ?? $r->race->tournament->name ?? 'Cuộc đua',
                    'tournament'  => $r->race->tournament->name ?? '—',
                    'distance'    => $r->race->distance,
                    'horse_name'  => $r->horse->name ?? '—',
                    'owner_name'  => $r->horse->owner->user->name ?? '—',
                    'lane_number' => $r->lane ?? null,
                    'reg_status'  => $r->status,
                    'status'      => $r->race->status,
                ])
                ->values();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/jockey/invitations/pending
    // ──────────────────────────────────────────────────────────────────────
    public function invitationsPending(Request $request)
    {
        try {
            $jockey = $this->getJockey($request);
            if (!$jockey) return $this->notFound();

            $rows = HorseJockey::with(['horse.owner.user', 'race.tournament'])
                ->where('jockey_id', $jockey->id)
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
                    'owner_name' => $inv->horse->owner->user->name ?? '—',
                    'race_name'  => $inv->race->name ?? $inv->race->tournament->name ?? '—',
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

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/jockey/invitations/history
    // ──────────────────────────────────────────────────────────────────────
    public function invitationsHistory(Request $request)
    {
        try {
            $jockey = $this->getJockey($request);
            if (!$jockey) return $this->notFound();

            $rows = HorseJockey::with(['horse', 'race.tournament'])
                ->where('jockey_id', $jockey->id)
                ->whereIn('status', ['accepted', 'rejected'])
                ->orderByDesc('updated_at')
                ->get()
                ->map(fn($inv) => [
                    'id'         => $inv->id,
                    'horse_name' => $inv->horse->name ?? '—',
                    'race_name'  => $inv->race->name ?? $inv->race->tournament->name ?? '—',
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

    // ──────────────────────────────────────────────────────────────────────
    // PUT /api/jockey/invitations/{invite}/respond
    // Body: { "status": "accepted"|"rejected", "reason": "..." }
    // ──────────────────────────────────────────────────────────────────────
    public function respondInvitation(Request $request, HorseJockey $invite)
    {
        try {
            $jockey = $this->getJockey($request);
            if (!$jockey) return $this->notFound();

            if ($invite->jockey_id !== $jockey->id) {
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

            // Chấp nhận → tạo registration dùng jockeys.id
            if ($data['status'] === 'accepted') {
                Registration::updateOrCreate(
                    ['race_id' => $invite->race_id, 'horse_id' => $invite->horse_id],
                    ['jockey_id' => $jockey->id, 'status' => 'confirmed']
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

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/jockey/performance/results
    // ──────────────────────────────────────────────────────────────────────
    public function performanceResults(Request $request)
    {
        try {
            $jockey = $this->getJockey($request);
            if (!$jockey) return $this->notFound();

            $rows = RaceResult::with(['registration.race.tournament', 'registration.horse'])
                ->whereHas('registration', fn($q) => $q->where('jockey_id', $jockey->id))
                ->orderByDesc('created_at')
                ->get()
                ->map(fn($r) => [
                    'id'              => $r->id,
                    'race_name'       => $r->registration->race->name
                                        ?? $r->registration->race->tournament->name
                                        ?? 'Cuộc đua',
                    'horse_name'      => $r->registration->horse->name ?? '—',
                    'race_date'       => $r->registration->race->race_time,
                    'finish_position' => $r->rank,
                    'finish_time'     => $r->finish_time,
                    'prize_amount'    => 0, // bảng prizes riêng, chưa join
                ])
                ->values();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/jockey/performance/best-times
    // ──────────────────────────────────────────────────────────────────────
    public function performanceBestTimes(Request $request)
    {
        try {
            $jockey = $this->getJockey($request);
            if (!$jockey) return $this->notFound();

            $rows = RaceResult::with(['registration.race.tournament', 'registration.horse'])
                ->whereHas('registration', fn($q) => $q->where('jockey_id', $jockey->id))
                ->whereNotNull('finish_time')
                ->orderBy('finish_time')
                ->limit(3)
                ->get()
                ->map(fn($r, $i) => [
                    'rank'        => $i + 1,
                    'race_name'   => $r->registration->race->name
                                    ?? $r->registration->race->tournament->name
                                    ?? 'Cuộc đua',
                    'horse_name'  => $r->registration->horse->name ?? '—',
                    'finish_time' => $r->finish_time,
                ])
                ->values();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private function countHorseWins(int $horseId): int
    {
        return RaceResult::whereHas(
            'registration', fn($q) => $q->where('horse_id', $horseId)
        )->where('rank', 1)->count();
    }

    private function getInviteResult(HorseJockey $inv): ?string
    {
        if ($inv->status !== 'accepted') return null;

        // Tìm registration tương ứng rồi lấy rank
        $result = RaceResult::whereHas(
            'registration',
            fn($q) => $q->where('race_id', $inv->race_id)
                        ->where('horse_id', $inv->horse_id)
                        ->where('jockey_id', $inv->jockey_id)
        )->first();

        return $result ? "Hạng {$result->rank}" : null;
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/jockeys
    // ──────────────────────────────────────────────────────────────────────
    public function listJockeys(Request $request)
    {
        try {
            $jockeys = Jockey::with('user')->get()->map(fn($j) => [
                'id' => $j->id,
                'name' => $j->user->name ?? '—',
                'email' => $j->user->email ?? '—',
                'experience_years' => $j->experience_years,
                'license_number' => $j->license_number ?? '—',
            ]);
            return response()->json(['success' => true, 'data' => $jockeys]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function getHorseOwner(Request $request): ?\App\Models\HorseOwner
    {
        $userId = $request->attributes->get('auth_user_id');
        if (!$userId) return null;
        return \App\Models\HorseOwner::where('user_id', $userId)->first();
    }

    // ──────────────────────────────────────────────────────────────────────
    // POST /api/contracts
    // ──────────────────────────────────────────────────────────────────────
    public function proposeContract(Request $request)
    {
        try {
            $owner = $this->getHorseOwner($request);
            if (!$owner) {
                return response()->json(['success' => false, 'message' => 'Horse Owner profile not found.'], 404);
            }

            $validated = $request->validate([
                'jockey_id' => 'required|integer|exists:jockeys,id',
            ]);

            // Check if there is an active/pending contract already
            $existing = \App\Models\JockeyContract::where('jockey_id', $validated['jockey_id'])
                ->where('horse_owner_id', $owner->id)
                ->whereIn('status', ['pending', 'active'])
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hợp đồng với nài ngựa này đã tồn tại hoặc đang chờ phản hồi.'
                ], 422);
            }

            $contract = \App\Models\JockeyContract::create([
                'jockey_id' => $validated['jockey_id'],
                'horse_owner_id' => $owner->id,
                'status' => 'pending',
                'start_date' => now(),
                'end_date' => now()->addYear(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Gửi đề xuất hợp đồng thành công.',
                'data' => $contract
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/contracts/owner
    // ──────────────────────────────────────────────────────────────────────
    public function ownerContracts(Request $request)
    {
        try {
            $owner = $this->getHorseOwner($request);
            if (!$owner) {
                return response()->json(['success' => false, 'message' => 'Horse Owner profile not found.'], 404);
            }

            $contracts = \App\Models\JockeyContract::with('jockey.user')
                ->where('horse_owner_id', $owner->id)
                ->get()
                ->map(fn($c) => [
                    'id' => $c->id,
                    'jockey_id' => $c->jockey_id,
                    'name' => $c->jockey->user->name ?? '—',
                    'experience' => "{$c->jockey->experience_years} năm",
                    'license' => $c->jockey->license_number ?? '—',
                    'wins' => RaceResult::whereHas(
                        'registration', fn($q) => $q->where('jockey_id', $c->jockey_id)
                    )->where('rank', 1)->count(),
                    'rating' => '4.8★', // Mock rating
                    'contractStatus' => $c->status,
                    'start_date' => $c->start_date ? $c->start_date->format('Y-m-d') : null,
                    'end_date' => $c->end_date ? $c->end_date->format('Y-m-d') : null,
                ]);

            return response()->json(['success' => true, 'data' => $contracts]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/jockey/contracts/pending
    // ──────────────────────────────────────────────────────────────────────
    public function pendingContracts(Request $request)
    {
        try {
            $jockey = $this->getJockey($request);
            if (!$jockey) return $this->notFound();

            $contracts = \App\Models\JockeyContract::with('horseOwner.user')
                ->where('jockey_id', $jockey->id)
                ->where('status', 'pending')
                ->get()
                ->map(fn($c) => [
                    'id' => $c->id,
                    'owner_name' => $c->horseOwner->user->name ?? '—',
                    'start_date' => $c->start_date ? $c->start_date->format('Y-m-d') : null,
                    'end_date' => $c->end_date ? $c->end_date->format('Y-m-d') : null,
                ]);

            return response()->json(['success' => true, 'data' => $contracts]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // PUT /api/jockey/contracts/{contract}/respond
    // ──────────────────────────────────────────────────────────────────────
    public function respondContract(Request $request, $contractId)
    {
        try {
            $jockey = $this->getJockey($request);
            if (!$jockey) return $this->notFound();

            $contract = \App\Models\JockeyContract::find($contractId);
            if (!$contract || $contract->jockey_id !== $jockey->id) {
                return response()->json(['success' => false, 'message' => 'Hợp đồng không tồn tại hoặc không thuộc quyền quản lý.'], 404);
            }

            $validated = $request->validate([
                'status' => 'required|in:active,rejected',
            ]);

            $contract->update([
                'status' => $validated['status'],
            ]);

            return response()->json([
                'success' => true,
                'message' => $validated['status'] === 'active' ? 'Đã ký hợp đồng thành công.' : 'Đã từ chối đề xuất hợp đồng.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // DELETE /api/contracts/{contract}
    // ──────────────────────────────────────────────────────────────────────
    public function terminateContract(Request $request, $contractId)
    {
        try {
            $jockey = $this->getJockey($request);
            $owner = $this->getHorseOwner($request);

            $contract = \App\Models\JockeyContract::find($contractId);
            if (!$contract) {
                return response()->json(['success' => false, 'message' => 'Hợp đồng không tồn tại.'], 404);
            }

            // Check authorization
            $isAuthorized = false;
            if ($jockey && $contract->jockey_id === $jockey->id) {
                $isAuthorized = true;
            } elseif ($owner && $contract->horse_owner_id === $owner->id) {
                $isAuthorized = true;
            }

            if (!$isAuthorized) {
                return response()->json(['success' => false, 'message' => 'Không có quyền kết thúc hợp đồng này.'], 403);
            }

            $contract->update(['status' => 'terminated']);

            return response()->json([
                'success' => true,
                'message' => 'Đã chấm dứt hợp đồng thành công.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
