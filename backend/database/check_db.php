<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

$users = User::all();
echo "Found " . $users->count() . " users. Resetting all passwords to 'password'...\n";
foreach ($users as $user) {
    $user->password = Hash::make('password');
    $user->save();
    echo "- Reset password for: " . $user->email . "\n";
}
echo "All passwords reset successfully!\n";
