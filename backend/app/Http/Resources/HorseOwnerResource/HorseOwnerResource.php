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
                'id'       => $this->resource->id,
                'user_id'  => $this->resource->userId,
                'name'     => $this->resource->name,
                'email'    => $this->resource->email,
                'phone'    => $this->resource->phone,
                'location' => $this->resource->location,
            ];
        }

        return [
            'id'       => $this->id,
            'user_id'  => $this->user_id,
            'name'     => $this->user?->name,
            'email'    => $this->user?->email,
            'phone'    => $this->user?->phone,
            'location' => $this->user?->location,
        ];
    }
}
