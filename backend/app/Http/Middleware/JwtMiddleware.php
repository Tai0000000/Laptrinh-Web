<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use UnexpectedValueException;

/**
 * JwtMiddleware
 *
 * Validates JWT token from the Authorization: Bearer <token> header.
 * Optional: Checks role authorization if specified.
 *
 * Usage in routes:
 *   ->middleware('jwt.auth')              // valid token required
 *   ->middleware('jwt.auth:admin')        // admin role required
 *   ->middleware('jwt.auth:admin,referee')// multiple roles allowed
 */
class JwtMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // 1. Get bearer token from Authorization header
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json([
                'message' => 'Token not found. Please log in.',
            ], 401);
        }

        // 2. Decode and validate the token
        try {
            $decoded = JWT::decode(
                $token,
                new Key(env('JWT_SECRET', 'fallback_secret'), 'HS256')
            );
        } catch (ExpiredException) {
            return response()->json([
                'message' => 'Token has expired. Please log in again.',
            ], 401);
        } catch (SignatureInvalidException) {
            return response()->json([
                'message' => 'Token signature is invalid.',
            ], 401);
        } catch (UnexpectedValueException $e) {
            return response()->json([
                'message' => 'Token is invalid: ' . $e->getMessage(),
            ], 401);
        }

        // 3. Check role (if required)
        if (! empty($roles)) {
            $userRole = $decoded->role ?? null;

            if (! in_array($userRole, $roles, true)) {
                return response()->json([
                    'message' => 'You do not have permission to access this resource.',
                    'required_roles' => $roles,
                    'your_role'      => $userRole,
                ], 403);
            }
        }

        // 4. Attach authenticated user details to request attributes
        $request->attributes->set('auth_user_id', $decoded->sub);
        $request->attributes->set('auth_role',    $decoded->role);
        $request->attributes->set('auth_payload', $decoded);

        return $next($request);
    }
}
