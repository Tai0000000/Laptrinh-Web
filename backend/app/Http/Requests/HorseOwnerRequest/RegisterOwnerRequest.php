<?php

namespace App\Http\Requests\HorseOwnerRequest;

use App\DTOs\HorseOwnerDTO;
use Illuminate\Foundation\Http\FormRequest;

class RegisterOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|integer|unique:horse_owners,user_id|exists:users,id',
        ];
    }

    public function toDTO(): HorseOwnerDTO
    {
        return HorseOwnerDTO::fromArray($this->validated());
    }
}
