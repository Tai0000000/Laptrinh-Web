<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read User $user
 */
class Jockey extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'experience_years',
    ];

    protected $casts = [
        'user_id'          => 'integer',
        'experience_years' => 'integer',
        'created_at'       => 'datetime',
        'updated_at'       => 'datetime',
    ];

    /**
     * User account của jockey này
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Các đăng ký race mà jockey này tham gia
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class, 'jockey_id', 'user_id');
    }
}
