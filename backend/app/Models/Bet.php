<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'registration_id',
        'amount',
        'prediction_type', // thắng, hạng nhất, hạng nhì (win, place, show)
        'status',          // đang chờ, thắng, thua (pending, won, lost)
        'reward_amount',   // tiền thưởng nhận được
    ];

    /**
     * Lấy người dùng đã đặt cược.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Lấy thông tin đăng ký cuộc đua mà người dùng đã đặt cược.
     */
    public function registration()
    {
        return $this->belongsTo(Registration::class);
    }
}
