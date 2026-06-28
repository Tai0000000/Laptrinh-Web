<?php

namespace App\Http\Controllers\API;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\HorseOwner;
use App\Models\Jockey;
use App\Models\RaceReferee;
use App\Models\Spectator;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => ['required', 'confirmed', Password::min(8)],
            'role'                  => 'required|in:horse_owner,jockey,race_referee,spectator,admin',
        ]);

        // 1. Create user
        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'],
        ]);

        // 2. Create role-specific profile
        $this->createRoleProfile($user);

        // 3. Issue JWT
        $token = $this->generateJwt($user);

        return response()->json([
            'message' => 'Registration successful.',
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $token = $this->generateJwt($user);

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ]);
    }

    /**
     * POST /api/auth/logout  [jwt.auth]
     */
    public function logout(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }

    /**
     * GET /api/auth/me  [jwt.auth]
     */
    public function me(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');
        $user   = User::findOrFail($userId);

        return response()->json([
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Create profile based on user role
     */
    private function createRoleProfile(User $user): void
    {
        match ($user->role) {
            Role::HorseOwner  => HorseOwner::create(['user_id' => $user->id]),
            Role::Jockey      => Jockey::create(['user_id' => $user->id]),
            Role::RaceReferee => RaceReferee::create(['user_id' => $user->id]),
            Role::Spectator   => Spectator::create(['user_id' => $user->id]),
            Role::Admin       => Admin::create(['user_id' => $user->id]),
        };
    }

    /**
     * Generate JWT token for user
     */
    private function generateJwt(User $user): string
    {
        $ttl = (int) env('AUTH_TOKEN_TTL_MINUTES', 10080); // 7 days

        $payload = [
            'iss'  => env('APP_URL', 'http://localhost:8000'), // Issuer
            'sub'  => $user->id,                               // Subject (user ID)
            'role' => $user->role->value,                      // Role
            'iat'  => time(),                                   // Issued at
            'exp'  => time() + ($ttl * 60),                    // Expiry
        ];

        return JWT::encode(
            $payload,
            env('JWT_SECRET', 'fallback_secret'),
            'HS256'
        );
    }

    /**
     * Format user data for response
     */
    private function formatUser(User $user): array
    {
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role->value,
            'role_label' => $user->role->getLabel(),
            'created_at' => $user->created_at,
        ];
    }
}
