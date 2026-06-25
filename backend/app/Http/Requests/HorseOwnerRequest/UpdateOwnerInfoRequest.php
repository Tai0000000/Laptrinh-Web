<?php

namespace App\Http\Requests\HorseOwnerRequest;

use App\DTOs\HorseOwnerDTO;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOwnerInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'user_id' => 'sometimes|integer|exists:users,id',
        ];
    }

    public function toDTO(): HorseOwnerDTO
    {
        return HorseOwnerDTO::fromArray($this->validated());
    }
}
