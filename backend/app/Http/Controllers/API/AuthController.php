<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Jockey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    
    public function register(Request $request)
    {
        $data = $request->validate([
            'username'  => 'required|string|max:50|unique:users,username',
            'email'     => 'nullable|email|max:150|unique:users,email',
            'password'  => 'required|string|min:6',
            'role'      => 'required|in:admin,horse_owner,jockey,referee,spectator',
            'full_name' => 'nullable|string|max:100',
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        
        if ($user->role === 'jockey') {
            Jockey::create(['user_id' => $user->id, 'experience_years' => 0]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    
    public function login(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $data['username'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        if ($user->role === 'jockey') {
            $user->load('jockeyProfile');
        }

        return response()->json(['user' => $user, 'token' => $token]);
    }

    
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công.']);
    }
}
