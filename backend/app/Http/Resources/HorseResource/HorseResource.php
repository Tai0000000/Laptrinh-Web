<?php

namespace App\Http\Resources\HorseResource;

use App\DTOs\HorseDTO;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HorseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if ($this->resource instanceof HorseDTO) {
            return [
                'id' => $this->resource->id,
                'name' => $this->resource->name,
                'age' => $this->resource->age,
                'breed' => $this->resource->breed,
                'horse_owner_id' => $this->resource->horseOwnerId,
                'status' => $this->resource->status,
            ];
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'age' => $this->age,
            'breed' => $this->breed,
            'horse_owner_id' => $this->horse_owner_id,
            'status' => $this->status,
        ];
    }
}
