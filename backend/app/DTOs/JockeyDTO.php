<?php

namespace App\DTOs;

use App\Models\Jockey;

readonly class JockeyDTO
{
    public function __construct(
        public ?int $id = null,
        public ?int $userId = null,
        public ?string $name = null,
        public ?string $email = null
    ) {}

    public static function fromModel(Jockey $jockey): self
    {
        return new self(
            id: $jockey->id,
            userId: $jockey->user_id,
            name: $jockey->user?->name,
            email: $jockey->user?->email
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            userId: $data['user_id'] ?? $data['userId'] ?? null,
            name: $data['name'] ?? null,
            email: $data['email'] ?? null
        );
    }

    public function toModelAttributes(): array
    {
        $attrs = [];
        if ($this->userId !== null) $attrs['user_id'] = $this->userId;
        if ($this->name !== null) $attrs['name'] = $this->name;
        if ($this->email !== null) $attrs['email'] = $this->email;
        return $attrs;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'name' => $this->name,
            'email' => $this->email,
        ];
    }
}
