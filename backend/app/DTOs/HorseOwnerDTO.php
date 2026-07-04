<?php

namespace App\DTOs;

use App\Models\HorseOwner;

readonly class HorseOwnerDTO
{
    public function __construct(
        public ?int    $id       = null,
        public ?int    $userId   = null,
        public ?string $name     = null,
        public ?string $email    = null,
        public ?string $phone    = null,
        public ?string $location = null,
    ) {}

    public static function fromModel(HorseOwner $owner): self
    {
        return new self(
            id:       $owner->id,
            userId:   $owner->user_id,
            name:     $owner->user?->name,
            email:    $owner->user?->email,
            phone:    $owner->user?->phone,
            location: $owner->user?->location,
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id:       $data['id']      ?? null,
            userId:   $data['user_id'] ?? $data['userId'] ?? null,
            name:     $data['name']    ?? null,
            email:    $data['email']   ?? null,
            phone:    $data['phone']   ?? null,
            location: $data['location'] ?? null,
        );
    }

    public function toModelAttributes(): array
    {
        $attrs = [];
        if ($this->userId   !== null) $attrs['user_id']  = $this->userId;
        if ($this->name     !== null) $attrs['name']     = $this->name;
        if ($this->email    !== null) $attrs['email']    = $this->email;
        if ($this->phone    !== null) $attrs['phone']    = $this->phone;
        if ($this->location !== null) $attrs['location'] = $this->location;
        return $attrs;
    }

    public function toArray(): array
    {
        return [
            'id'       => $this->id,
            'user_id'  => $this->userId,
            'name'     => $this->name,
            'email'    => $this->email,
            'phone'    => $this->phone,
            'location' => $this->location,
        ];
    }
}
