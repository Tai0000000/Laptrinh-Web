<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Contracts\IRegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    protected IRegistrationService $registrationService;

    public function __construct(IRegistrationService $registrationService)
    {
        $this->registrationService = $registrationService;
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'race_id'   => 'required|integer|exists:races,id',
            'horse_id'  => 'required|integer|exists:horses,id',
            'jockey_id' => 'nullable|integer|exists:jockeys,id',
        ]);

        $validated['status']    = 'pending';
        $validated['jockey_id'] = $validated['jockey_id'] ?? null;

        $registration = $this->registrationService->createRegistration($validated);
        return response()->json([
            'success' => true,
            'message' => 'Đăng ký tham gia cuộc đua thành công.',
            'data'    => $registration,
        ], 201);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,rejected,withdrawn',
        ]);

        $registration = $this->registrationService->updateRegistrationStatus($id, $validated['status']);
        if (!$registration) {
            return response()->json(['message' => 'Registration does not exist.'], 404);
        }
        return response()->json($registration);
    }

    public function accept(Request $request, int $id): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $registration = $this->registrationService->getRegistrationById($id);

        if (!$registration) {
            return response()->json(['message' => 'Registration does not exist.'], 404);
        }

        // Verify that this registration is assigned to the authenticated jockey
        if ((int)$registration->jockey_id !== (int)$userId) {
            return response()->json(['message' => 'Cannot accept a registration request for another user.'], 403);
        }

        $registration = $this->registrationService->updateRegistrationStatus($id, 'confirmed');
        return response()->json([
            'message' => 'Successfully confirmed participation in the race.',
            'registration' => $registration
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $registration = $this->registrationService->getRegistrationById($id);
        if (!$registration) {
            return response()->json(['message' => 'Registration does not exist.'], 404);
        }
        return response()->json($registration);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->registrationService->deleteRegistration($id);
        if (!$deleted) {
            return response()->json(['message' => 'Registration does not exist.'], 404);
        }
        return response()->json(['message' => 'Registration deleted successfully.'], 200);
    }
}
