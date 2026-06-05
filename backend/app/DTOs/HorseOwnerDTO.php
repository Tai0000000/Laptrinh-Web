<?php

namespace App\DTOs;

use App\Models\HorseOwner;

readonly class HorseOwnerDTO
{
    public function __construct(
        public ?int $id = null,
        public ?int $userId = null
    ) {}

    public static function fromModel(HorseOwner $owner): self
    {
        return new self(
            id: $owner->id,
            userId: $owner->user_id
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            userId: $data['user_id'] ?? $data['userId'] ?? null
        );
    }

    public function toModelAttributes(): array
    {
        return [
            'user_id' => $this->userId,
        ];
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
        ];
    }
}
