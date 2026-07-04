<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Models\Horse;
use App\Models\Jockey;
use App\Models\Race;
use App\Models\RaceResult;
use App\Models\Registration;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────
    // GET /admin/stats
    // ──────────────────────────────────────────────────────────────────────
    public function stats(): JsonResponse
    {
        $now       = now();
        $prevMonth = $now->copy()->subMonth();

        $thisMonthUsers = User::whereYear('created_at', $now->year)
                              ->whereMonth('created_at', $now->month)->count();
        $lastMonthUsers = User::whereYear('created_at', $prevMonth->year)
                              ->whereMonth('created_at', $prevMonth->month)->count();

        $userGrowth = $lastMonthUsers > 0
            ? round(($thisMonthUsers - $lastMonthUsers) / $lastMonthUsers * 100, 1)
            : ($thisMonthUsers > 0 ? 100.0 : 0.0);

        return response()->json([
            'total_tournaments'     => Tournament::count(),
            'total_horses'          => Horse::count(),
            'total_jockeys'         => Jockey::count(),
            'total_bets'            => Bet::count(),
            'total_users'           => User::count(),
            'active_races'          => Race::whereIn('status', ['scheduled', 'ongoing'])->count(),
            'completed_races'       => Race::where('status', 'finished')->count(),
            'pending_registrations' => Registration::where('status', 'pending')->count(),
            'user_growth_percent'   => $userGrowth,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /admin/recent-activity
    // ──────────────────────────────────────────────────────────────────────
    public function recentActivity(): JsonResponse
    {
        $merged = collect()
            ->merge($this->latestBets())
            ->merge($this->latestRegistrations())
            ->merge($this->latestUsers())
            ->sortByDesc('time')
            ->take(12)
            ->values();

        return response()->json($merged);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /admin/users?search=&role=
    // ──────────────────────────────────────────────────────────────────────
    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($search = $request->query('search')) {
            $query->where(fn($q) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            );
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        $users = $query->orderByDesc('created_at')->get()->map(fn($u) => [
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
            'role' => 'required|in:admin,horse_owner,jockey,referee,race_referee,spectator',
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => $data['role']]);

        return response()->json(['message' => 'Đã đổi vai trò thành công.', 'user' => $user]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // PUT /admin/users/{id}/toggle-lock
    // Bảng users chưa có cột is_locked — thêm migration riêng nếu cần
    // Hiện tại trả success để frontend không crash
    // ──────────────────────────────────────────────────────────────────────
    public function toggleLock(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Kiểm tra cột is_locked tồn tại
        if (\Schema::hasColumn('users', 'is_locked')) {
            $user->update(['is_locked' => !$user->is_locked]);
            $msg = $user->is_locked ? 'Đã khoá tài khoản.' : 'Đã mở khoá tài khoản.';
        } else {
            $msg = 'Tính năng khoá tài khoản chưa được bật (cần migration).';
        }

        return response()->json(['message' => $msg, 'user' => $user]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /admin/races?tournament_id=&status=
    // Trả races với registrations để admin có thể nhập kết quả
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

        $races = $query->orderBy('race_time')->get()->map(fn($r) => [
            'id'            => $r->id,
            'name'          => $r->name ?? ($r->tournament->name . ' - ' . $r->round),
            'round'         => $r->round,
            'race_time'     => $r->race_time,
            'distance'      => $r->distance,
            'status'        => $r->status,
            'tournament'    => $r->tournament->name ?? '—',
            'tournament_id' => $r->tournament_id,
            'registrations' => $r->registrations->map(fn($reg) => [
                'id'    => $reg->id,
                'horse' => $reg->horse->name ?? '—',
                'lane'  => $reg->lane,
            ]),
        ]);

        return response()->json($races);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /admin/races/{id}/results
    // ──────────────────────────────────────────────────────────────────────
    public function raceResults(int $raceId): JsonResponse
    {
        $results = RaceResult::with(['registration.horse'])
            ->where('race_id', $raceId)
            ->orderBy('rank')
            ->get()
            ->map(fn($r) => [
                'registration_id' => $r->registration_id,
                'horse'           => $r->registration->horse->name ?? '—',
                'rank'            => $r->rank,
                'finish_time'     => $r->finish_time,
                'notes'           => $r->notes,
            ]);

        return response()->json(['success' => true, 'data' => $results]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // POST /admin/races/{id}/results
    // Nhập kết quả — delegate sang ResultController logic
    // ──────────────────────────────────────────────────────────────────────
    public function storeRaceResults(Request $request, int $raceId): JsonResponse
    {
        // Delegate tới ResultController
        $controller = app(ResultController::class);
        return $controller->store($request, $raceId);
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
            $query->whereHas('race', fn($q) => $q->where('tournament_id', $tid));
        }

        $regs = $query->orderByDesc('created_at')->get()->map(fn($r) => [
            'id'         => $r->id,
            'horse'      => $r->horse->name ?? '—',
            'race'       => $r->race->name ?? ($r->race->tournament->name . ' - ' . $r->race->round) ?? '—',
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

        return response()->json(['message' => 'Đã cập nhật trạng thái đăng ký.', 'registration' => $reg]);
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
            $query->whereHas('race', fn($q) => $q->where('tournament_id', $tid));
        }

        if ($round = $request->query('round')) {
            $query->whereHas('race', fn($q) => $q->where('round', $round));
        }

        $results = $query->get()->map(fn($r) => [
            'rank'        => $r->rank,
            'horse'       => $r->registration->horse->name ?? '—',
            'finish_time' => $r->finish_time,
            'notes'       => $r->notes,
            'race'        => $r->registration->race->name ?? ($r->registration->race->tournament->name . ' R' . $r->registration->race->round) ?? '—',
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
            1 => '50,000,000 VNĐ',
            2 => '25,000,000 VNĐ',
            3 => '10,000,000 VNĐ',
            4 => '5,000,000 VNĐ',
            default => 'Không có thưởng',
        };
    }

    private function latestBets(): array
    {
        return Bet::with(['user', 'registration.race'])
            ->latest()->limit(5)->get()
            ->map(function (Bet $bet) {
                $raceTime = optional(optional($bet->registration)->race)->race_time;
                $label    = $raceTime
                    ? 'Cuộc đua ' . \Carbon\Carbon::parse($raceTime)->format('d/m/Y')
                    : 'Cuộc đua';
                return [
                    'type'        => 'bet',
                    'icon'        => '💸',
                    'color'       => 'amber',
                    'badge'       => 'Cược mới',
                    'description' => ($bet->user->name ?? 'Khán giả') . ' đặt cược ' . number_format($bet->amount) . ' VNĐ vào ' . $label,
                    'time'        => $bet->created_at,
                    'time_ago'    => $bet->created_at->diffForHumans(),
                ];
            })->toArray();
    }

    private function latestRegistrations(): array
    {
        return Registration::with(['horse', 'race.tournament'])
            ->latest()->limit(5)->get()
            ->map(function (Registration $reg) {
                $horse      = optional($reg->horse)->name ?? 'Ngựa';
                $tournament = optional(optional($reg->race)->tournament)->name ?? 'Giải đấu';
                return [
                    'type'        => 'registration',
                    'icon'        => '📋',
                    'color'       => 'blue',
                    'badge'       => $this->translateStatus($reg->status),
                    'description' => "Ngựa \"{$horse}\" đăng ký tham gia {$tournament}",
                    'time'        => $reg->created_at,
                    'time_ago'    => $reg->created_at->diffForHumans(),
                ];
            })->toArray();
    }

    private function latestUsers(): array
    {
        return User::latest()->limit(5)->get()
            ->map(function (User $user) {
                $role = $user->role instanceof \App\Enums\Role ? $user->role->value : (string) $user->role;
                return [
                    'type'        => 'user',
                    'icon'        => '👤',
                    'color'       => 'emerald',
                    'badge'       => 'Thành viên mới',
                    'description' => "{$user->name} đăng ký tài khoản với vai trò " . $this->translateRole($role),
                    'time'        => $user->created_at,
                    'time_ago'    => $user->created_at->diffForHumans(),
                ];
            })->toArray();
    }

    private function translateStatus(?string $status): string
    {
        return match ($status) {
            'confirmed' => 'Đã duyệt',
            'rejected'  => 'Từ chối',
            'withdrawn' => 'Rút lui',
            default     => 'Chờ duyệt',
        };
    }

    private function translateRole(string $role): string
    {
        return match ($role) {
            'admin'        => 'Quản trị viên',
            'horse_owner'  => 'Chủ ngựa',
            'jockey'       => 'Nài ngựa',
            'race_referee',
            'referee'      => 'Trọng tài',
            'spectator'    => 'Khán giả',
            default        => 'Người dùng',
        };
    }
}
