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
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|max:150|unique:users,email',
            'password'  => 'required|string|min:6|confirmed',
            'role'      => 'required|in:admin,horse_owner,jockey,referee,spectator',
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        
        if ($user->role === 'jockey') {
            Jockey::create(['user_id' => $user->id]);
        }

        $token = $user->createToken('horse-racing-token')->plainTextToken;

        return response()->json([
            'message'      => 'Đăng ký thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ], 201);
    }

    
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        
        $user->tokens()->delete();
        $token = $user->createToken('horse-racing-token')->plainTextToken;

        if ($user->role === 'jockey') {
            $user->load('jockeyProfile');
        }

        return response()->json([
            'message'      => 'Đăng nhập thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Đăng xuất thành công!']);
    }
}
