<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RaceResult;
use App\Models\Registration;
use App\Models\Race;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AdminUserController
 *
 * Xử lý các route admin quản lý user, registrations, races, leaderboard.
 * Routes trong api.php trỏ đến class này.
 */
class AdminUserController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────
    // GET /admin/users?search=&role=
    // ──────────────────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($search = $request->query('search')) {
            $query->where(fn ($q) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            );
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        $users = $query->orderByDesc('created_at')->get()->map(fn ($u) => [
            'id'         => $u->id,
            'name'       => $u->name,
            'email'      => $u->email,
            'role'       => $u->role instanceof \App\Enums\Role ? $u->role->value : (string) $u->role,
            'is_locked'  => (bool) ($u->is_locked ?? false),
            'created_at' => $u->created_at,
        ]);

        return response()->json($users);
    }

    // ──────────────────────────────────────────────────────────────────────
    // PUT /admin/users/{id}/role
    // ──────────────────────────────────────────────────────────────────────
    public function changeRole(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'role' => 'required|in:admin,horse_owner,jockey,race_referee,spectator',
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => $data['role']]);

        return response()->json([
            'message' => 'Đã đổi vai trò thành công.',
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role instanceof \App\Enums\Role ? $user->role->value : (string) $user->role,
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // DELETE /admin/users/{id}
    // ──────────────────────────────────────────────────────────────────────
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Ngăn admin tự xóa chính mình
        $adminId = request()->attributes->get('auth_user_id');
        if ($adminId && $adminId == $id) {
            return response()->json(['message' => 'Không thể tự xóa tài khoản của mình.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Đã xóa tài khoản người dùng thành công.']);
    }

    // ──────────────────────────────────────────────────────────────────────
    // PUT /admin/users/{id}/toggle-lock
    // ──────────────────────────────────────────────────────────────────────
    public function toggleLock(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if (\Schema::hasColumn('users', 'is_locked')) {
            $user->update(['is_locked' => ! $user->is_locked]);
            $msg = $user->is_locked ? 'Đã khoá tài khoản.' : 'Đã mở khoá tài khoản.';
        } else {
            $msg = 'Tính năng khoá tài khoản chưa được bật (cần migration).';
        }

        return response()->json(['message' => $msg, 'user' => $user]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /admin/registrations?status=&tournament_id=&race_id=
    // ──────────────────────────────────────────────────────────────────────
    public function registrations(Request $request): JsonResponse
    {
        $query = Registration::with(['horse', 'race.tournament']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($raceId = $request->query('race_id')) {
            $query->where('race_id', $raceId);
        }
        if ($tid = $request->query('tournament_id')) {
            $query->whereHas('race', fn ($q) => $q->where('tournament_id', $tid));
        }

        $regs = $query->orderByDesc('created_at')->get()->map(fn ($r) => [
            'id'         => $r->id,
            'horse'      => $r->horse->name ?? '—',
            'race'       => $r->race->name ?? (($r->race->tournament->name ?? '') . ' - ' . ($r->race->round ?? '')),
            'tournament' => $r->race->tournament->name ?? '—',
            'race_time'  => $r->race->race_time,
            'lane'       => $r->lane,
            'status'     => $r->status,
            'created_at' => $r->created_at,
        ]);

        return response()->json($regs);
    }

    // ──────────────────────────────────────────────────────────────────────
    // PUT /admin/registrations/{id}/status
    // ──────────────────────────────────────────────────────────────────────
    public function updateRegistrationStatus(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,rejected,withdrawn',
        ]);

        $reg = Registration::findOrFail($id);
        $reg->update(['status' => $data['status']]);

        return response()->json([
            'message'      => 'Đã cập nhật trạng thái đăng ký.',
            'registration' => $reg,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /admin/races?tournament_id=&status=
    // ──────────────────────────────────────────────────────────────────────
    public function races(Request $request): JsonResponse
    {
        $query = Race::with(['tournament', 'registrations.horse']);

        if ($tid = $request->query('tournament_id')) {
            $query->where('tournament_id', $tid);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $races = $query->orderBy('race_time')->get()->map(fn ($r) => [
            'id'            => $r->id,
            'name'          => $r->name ?? (($r->tournament->name ?? '') . ' - ' . ($r->round ?? '')),
            'round'         => $r->round,
            'race_time'     => $r->race_time,
            'distance'      => $r->distance,
            'status'        => $r->status,
            'tournament'    => $r->tournament->name ?? '—',
            'tournament_id' => $r->tournament_id,
            'registrations' => $r->registrations->map(fn ($reg) => [
                'id'    => $reg->id,
                'horse' => $reg->horse->name ?? '—',
                'lane'  => $reg->lane,
            ]),
        ]);

        return response()->json($races);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /admin/leaderboard?tournament_id=&round=&race_id=
    // ──────────────────────────────────────────────────────────────────────
    public function leaderboard(Request $request): JsonResponse
    {
        $query = RaceResult::with(['registration.horse', 'registration.race.tournament'])
            ->orderBy('rank');

        if ($raceId = $request->query('race_id')) {
            $query->where('race_id', $raceId);
        } elseif ($tid = $request->query('tournament_id')) {
            $query->whereHas('race', fn ($q) => $q->where('tournament_id', $tid));
        }

        if ($round = $request->query('round')) {
            $query->whereHas('race', fn ($q) => $q->where('round', $round));
        }

        $results = $query->get()->map(fn ($r) => [
            'rank'        => $r->rank,
            'horse'       => $r->registration->horse->name ?? '—',
            'finish_time' => $r->finish_time,
            'notes'       => $r->notes,
            'race'        => $r->registration->race->name
                             ?? (($r->registration->race->tournament->name ?? '') . ' R' . ($r->registration->race->round ?? '')),
            'tournament'  => $r->registration->race->tournament->name ?? '—',
            'round'       => $r->registration->race->round ?? null,
            'prize'       => $this->calcPrize($r->rank),
        ]);

        return response()->json($results);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private function calcPrize(?int $rank): string
    {
        return match ($rank) {
            1       => '50,000,000 VNĐ',
            2       => '25,000,000 VNĐ',
            3       => '10,000,000 VNĐ',
            4       => '5,000,000 VNĐ',
            default => 'Không có thưởng',
        };
    }
}
