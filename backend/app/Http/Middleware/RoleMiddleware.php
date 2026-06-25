<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, $roles)) {
            return response()->json([
                'success'  => false,
                'message'  => 'Bạn không có quyền truy cập.',
                'required' => $roles,
                'current'  => $user?->role,
            ], 403);
        }

        return $next($request);
    }
}
