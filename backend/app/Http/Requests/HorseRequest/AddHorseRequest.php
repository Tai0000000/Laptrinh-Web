<?php

namespace App\Http\Requests\HorseRequest;

use App\DTOs\HorseDTO;
use Illuminate\Foundation\Http\FormRequest;

class AddHorseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0',
            'breed' => 'required|string|max:255',
            'horse_owner_id' => 'required|integer|exists:horse_owners,id',
            'status' => 'nullable|string|max:50',
        ];
    }

    public function toDTO(): HorseDTO
    {
        return HorseDTO::fromArray($this->validated());
    }
}
