<?php

namespace App\Http\Resources\HorseOwnerResource;

use App\DTOs\HorseOwnerDTO;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HorseOwnerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if ($this->resource instanceof HorseOwnerDTO) {
            return [
                'id' => $this->resource->id,
                'user_id' => $this->resource->userId,
            ];
        }

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
        ];
    }
}
