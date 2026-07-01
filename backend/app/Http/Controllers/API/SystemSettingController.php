<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * SystemSettingController
 *
 * Quản lý các cài đặt hệ thống bằng Laravel Cache (file/redis).
 * Không cần bảng DB riêng — admin thay đổi qua API,
 * settings được persist trong cache với key 'system_settings'.
 */
class SystemSettingController extends Controller
{
    /** Các cài đặt mặc định */
    private array $defaults = [
        'site_name'              => 'Horse Racing Platform',
        'allow_registration'     => true,
        'allow_betting'          => true,
        'betting_min_amount'     => 10000,
        'betting_max_amount'     => 10000000,
        'maintenance_mode'       => false,
        'results_auto_resolve'   => true,
        'max_horses_per_race'    => 20,
        'race_registration_days' => 7,
    ];

    // ──────────────────────────────────────────────────────────────────────
    // GET /admin/settings
    // ──────────────────────────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        $settings = Cache::get('system_settings', $this->defaults);

        // Merge để đảm bảo luôn có đủ keys mặc định
        $settings = array_merge($this->defaults, $settings);

        return response()->json([
            'success'  => true,
            'settings' => $settings,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // PUT /admin/settings
    // Body: { "site_name": "...", "allow_betting": true, ... }
    // ──────────────────────────────────────────────────────────────────────
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'site_name'              => 'sometimes|string|max:255',
            'allow_registration'     => 'sometimes|boolean',
            'allow_betting'          => 'sometimes|boolean',
            'betting_min_amount'     => 'sometimes|integer|min:1000',
            'betting_max_amount'     => 'sometimes|integer|min:10000',
            'maintenance_mode'       => 'sometimes|boolean',
            'results_auto_resolve'   => 'sometimes|boolean',
            'max_horses_per_race'    => 'sometimes|integer|min:2|max:50',
            'race_registration_days' => 'sometimes|integer|min:1|max:30',
        ]);

        $current  = Cache::get('system_settings', $this->defaults);
        $updated  = array_merge($current, $data);

        Cache::forever('system_settings', $updated);

        return response()->json([
            'success'  => true,
            'message'  => 'Cài đặt hệ thống đã được cập nhật.',
            'settings' => $updated,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    // PUT /admin/settings/{key}/toggle
    // Toggle một boolean setting
    // ──────────────────────────────────────────────────────────────────────
    public function toggle(string $key): JsonResponse
    {
        $boolKeys = ['allow_registration', 'allow_betting', 'maintenance_mode', 'results_auto_resolve'];

        if (! in_array($key, $boolKeys, true)) {
            return response()->json([
                'success' => false,
                'message' => "Không thể toggle setting '{$key}'.",
            ], 422);
        }

        $current        = Cache::get('system_settings', $this->defaults);
        $current[$key]  = ! ($current[$key] ?? $this->defaults[$key] ?? false);

        Cache::forever('system_settings', $current);

        return response()->json([
            'success' => true,
            'message' => "Đã toggle '{$key}' thành " . ($current[$key] ? 'bật' : 'tắt') . '.',
            'key'     => $key,
            'value'   => $current[$key],
        ]);
    }
}
