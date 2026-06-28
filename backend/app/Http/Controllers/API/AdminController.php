<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Models\Horse;
use App\Models\Jockey;
use App\Models\Race;
use App\Models\Registration;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    // -------------------------------------------------------
    // GET /admin/stats
    // Trả về các chỉ số KPI tổng quan cho trang Admin.
    // -------------------------------------------------------
    public function stats(): JsonResponse
    {
        $now      = now();
        $prevMonth = $now->copy()->subMonth();

        $thisMonthUsers = User::whereYear('created_at', $now->year)
                              ->whereMonth('created_at', $now->month)
                              ->count();

        $lastMonthUsers = User::whereYear('created_at', $prevMonth->year)
                              ->whereMonth('created_at', $prevMonth->month)
                              ->count();

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

    // -------------------------------------------------------
    // GET /admin/recent-activity
    // Trả về 12 hoạt động gần đây (cược, đăng ký, thành viên mới)
    // được sắp xếp theo thời gian mới nhất.
    // -------------------------------------------------------
    public function recentActivity(): JsonResponse
    {
        $bets = $this->latestBets();
        $regs = $this->latestRegistrations();
        $users = $this->latestUsers();

        $merged = collect()
            ->merge($bets)
            ->merge($regs)
            ->merge($users)
            ->sortByDesc('time')
            ->take(12)
            ->values();

        return response()->json($merged);
    }

    // ── Private helpers ──────────────────────────────────────

    private function latestBets(): array
    {
        return Bet::with(['user', 'registration.race'])
            ->latest()
            ->limit(5)
            ->get()
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
                    'description' => ($bet->user->name ?? 'Khán giả')
                                   . ' đặt cược ' . number_format($bet->amount) . ' VNĐ vào ' . $label,
                    'time'        => $bet->created_at,
                    'time_ago'    => $bet->created_at->diffForHumans(),
                ];
            })
            ->toArray();
    }

    private function latestRegistrations(): array
    {
        return Registration::with(['horse', 'race.tournament'])
            ->latest()
            ->limit(5)
            ->get()
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
            })
            ->toArray();
    }

    private function latestUsers(): array
    {
        return User::latest()
            ->limit(5)
            ->get()
            ->map(function (User $user) {
                $role = $user->role?->value ?? (string) $user->role;

                return [
                    'type'        => 'user',
                    'icon'        => '👤',
                    'color'       => 'emerald',
                    'badge'       => 'Thành viên mới',
                    'description' => "{$user->name} đăng ký tài khoản với vai trò "
                                   . $this->translateRole($role),
                    'time'        => $user->created_at,
                    'time_ago'    => $user->created_at->diffForHumans(),
                ];
            })
            ->toArray();
    }

    // Dịch trạng thái đăng ký sang tiếng Việt
    private function translateStatus(?string $status): string
    {
        return match ($status) {
            'confirmed'  => 'Đã duyệt',
            'rejected'   => 'Từ chối',
            'withdrawn'  => 'Rút lui',
            default      => 'Chờ duyệt',
        };
    }

    // Dịch vai trò sang tiếng Việt
    private function translateRole(string $role): string
    {
        return match ($role) {
            'admin'        => 'Quản trị viên',
            'horse_owner'  => 'Chủ ngựa',
            'jockey'       => 'Nài ngựa',
            'race_referee' => 'Trọng tài',
            'spectator'    => 'Khán giả',
            default        => 'Người dùng',
        };
    }
}
