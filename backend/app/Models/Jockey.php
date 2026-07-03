<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jockey extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'experience_years',
        'license_number',
    ];

    protected $casts = [
        'user_id'          => 'integer',
        'experience_years' => 'integer',
    ];

    /** User account của jockey này */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Các đăng ký race — registrations.jockey_id = jockeys.id
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class, 'jockey_id');
    }

    /**
     * Các lời mời nhận được — horse_jockey.jockey_id = jockeys.id
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(HorseJockey::class, 'jockey_id');
    }

    /**
     * Các hợp đồng của jockey này — jockey_contracts.jockey_id = jockeys.id
     */
    public function contracts(): HasMany
    {
        return $this->hasMany(JockeyContract::class, 'jockey_id');
    }
}
