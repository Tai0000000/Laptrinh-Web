<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Horse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AdminHorseController
 * Routes: /admin/horses  (GET, POST, PUT/{id}, DELETE/{id})
 */
class AdminHorseController extends Controller
{
    // GET /admin/horses?search=&status=
    public function index(Request $request): JsonResponse
    {
        $query = Horse::with('owner.user');

        if ($search = $request->query('search')) {
            $query->where(fn($q) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('breed', 'like', "%{$search}%")
            );
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $horses = $query->orderByDesc('created_at')->get()->map(fn($h) => [
            'id'         => $h->id,
            'name'       => $h->name,
            'breed'      => $h->breed,
            'age'        => $h->age,
            'weight'     => $h->weight,
            'status'     => $h->status,
            'owner_name' => $h->owner->user->name ?? ($h->owner->name ?? '—'),
            'owner_id'   => $h->horse_owner_id,
            'created_at' => $h->created_at,
        ]);

        return response()->json($horses);
    }

    // POST /admin/horses
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'age'            => 'required|integer|min:1',
            'breed'          => 'required|string|max:255',
            'weight'         => 'nullable|numeric|min:1',
            'status'         => 'sometimes|string|in:active,injured,resting,retired',
            'horse_owner_id' => 'nullable|integer|exists:horse_owners,id',
        ]);

        $data['status'] = $data['status'] ?? 'active';

        $horse = Horse::create($data);

        return response()->json($horse, 201);
    }

    // PUT /admin/horses/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $horse = Horse::findOrFail($id);

        $data = $request->validate([
            'name'   => 'sometimes|required|string|max:255',
            'age'    => 'sometimes|required|integer|min:1',
            'breed'  => 'sometimes|required|string|max:255',
            'weight' => 'nullable|numeric|min:1',
            'status' => 'sometimes|string|in:active,injured,resting,retired',
        ]);

        $horse->update($data);

        return response()->json($horse);
    }

    // DELETE /admin/horses/{id}
    public function destroy(int $id): JsonResponse
    {
        $horse = Horse::findOrFail($id);
        $horse->delete();

        return response()->json(['message' => 'Đã xóa ngựa thành công.']);
    }
}
