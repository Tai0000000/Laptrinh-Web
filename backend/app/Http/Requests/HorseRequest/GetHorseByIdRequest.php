<?php

namespace App\Http\Requests\HorseRequest;

use Illuminate\Foundation\Http\FormRequest;

class GetHorseByIdRequest extends FormRequest
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
