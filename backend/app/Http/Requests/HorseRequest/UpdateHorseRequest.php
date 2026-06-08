<?php

namespace App\Http\Requests\HorseRequest;

use App\DTOs\HorseDTO;
use Illuminate\Foundation\Http\FormRequest;

class UpdateHorseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'age' => 'sometimes|integer|min:0',
            'breed' => 'sometimes|string|max:255',
            'horse_owner_id' => 'sometimes|integer|exists:horse_owners,id',
            'status' => 'nullable|string|max:50',
        ];
    }

    public function toDTO(): HorseDTO
    {
        return HorseDTO::fromArray($this->validated());
    }
}
