<?php

namespace App\DTOs;

use App\Models\Horse;

readonly class HorseDTO
{
    public function __construct(
        public ?int $id = null,
        public ?string $name = null,
        public ?int $age = null,
        public ?string $breed = null,
        public ?int $horseOwnerId = null,
        public ?string $status = null
    ) {}

    public static function fromModel(Horse $horse): self
    {
        return new self(
            id: $horse->id,
            name: $horse->name,
            age: $horse->age,
            breed: $horse->breed,
            horseOwnerId: $horse->horse_owner_id,
            status: $horse->status
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            name: $data['name'] ?? null,
            age: $data['age'] ?? null,
            breed: $data['breed'] ?? null,
            horseOwnerId: $data['horse_owner_id'] ?? $data['horseOwnerId'] ?? null,
            status: $data['status'] ?? null
        );
    }

    public function toModelAttributes(): array
    {
        return [
            'name' => $this->name,
            'age' => $this->age,
            'breed' => $this->breed,
            'horse_owner_id' => $this->horseOwnerId,
            'status' => $this->status,
        ];
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'age' => $this->age,
            'breed' => $this->breed,
            'horse_owner_id' => $this->horseOwnerId,
            'status' => $this->status,
        ];
    }
}