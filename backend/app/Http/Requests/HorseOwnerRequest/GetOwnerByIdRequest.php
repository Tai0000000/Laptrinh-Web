<?php

namespace App\Http\Requests\HorseOwnerRequest;

use Illuminate\Foundation\Http\FormRequest;

class GetOwnerByIdRequest extends FormRequest
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
