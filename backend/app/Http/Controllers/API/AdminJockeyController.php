<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Jockey;
use App\Models\User;
use App\Models\RaceResult;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * AdminJockeyController
 * Routes: /admin/jockeys  (GET, POST, PUT/{id}, DELETE/{id})
 */
class AdminJockeyController extends Controller
{
    // GET /admin/jockeys?search=
    public function index(Request $request): JsonResponse
    {
        $query = Jockey::with('user');

        if ($search = $request->query('search')) {
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            )->orWhere('license_number', 'like', "%{$search}%");
        }

        $jockeys = $query->orderByDesc('created_at')->get()->map(fn($j) => [
            'id'               => $j->id,
            'user_id'          => $j->user_id,
            'name'             => $j->user->name ?? '—',
            'email'            => $j->user->email ?? '—',
            'license_number'   => $j->license_number ?? '—',
            'experience_years' => $j->experience_years ?? 0,
            'wins'             => RaceResult::whereHas('registration', fn($q) =>
                                    $q->where('jockey_id', $j->id)
                                  )->where('rank', 1)->count(),
            'total_races'      => Registration::where('jockey_id', $j->id)->count(),
            'created_at'       => $j->created_at,
        ]);

        return response()->json($jockeys);
    }

    // POST /admin/jockeys — tạo user + jockey profile
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'required|email|unique:users,email',
            'password'         => 'required|string|min:6',
            'experience_years' => 'nullable|integer|min:0',
            'license_number'   => 'nullable|string|max:50',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => 'jockey',
            ]);

            $jockey = Jockey::create([
                'user_id'          => $user->id,
                'experience_years' => $data['experience_years'] ?? 0,
                'license_number'   => $data['license_number'] ?? null,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }

        return response()->json([
            'id'               => $jockey->id,
            'name'             => $user->name,
            'email'            => $user->email,
            'license_number'   => $jockey->license_number,
            'experience_years' => $jockey->experience_years,
        ], 201);
    }

    // PUT /admin/jockeys/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $jockey = Jockey::with('user')->findOrFail($id);

        $data = $request->validate([
            'experience_years' => 'nullable|integer|min:0',
            'license_number'   => 'nullable|string|max:50',
        ]);

        $jockey->update($data);

        return response()->json([
            'id'               => $jockey->id,
            'name'             => $jockey->user->name ?? '—',
            'experience_years' => $jockey->experience_years,
            'license_number'   => $jockey->license_number,
        ]);
    }

    // DELETE /admin/jockeys/{id}
    public function destroy(int $id): JsonResponse
    {
        $jockey = Jockey::findOrFail($id);
        // Xóa jockey profile (không xóa user account để giữ audit trail)
        $jockey->delete();

        return response()->json(['message' => 'Đã xóa nài ngựa thành công.']);
    }
}
