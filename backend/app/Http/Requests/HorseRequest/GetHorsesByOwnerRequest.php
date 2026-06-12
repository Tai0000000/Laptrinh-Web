<?php

namespace App\Http\Requests\HorseRequest;

use Illuminate\Foundation\Http\FormRequest;

class GetHorsesByOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [];
    }
}
