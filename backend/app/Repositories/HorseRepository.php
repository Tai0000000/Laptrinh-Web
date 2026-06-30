<?php

namespace App\Repositories;

use App\Models\Horse;
use App\Repositories\Contracts\IHorseRepository;

class HorseRepository implements IHorseRepository
{
    public function findById(int $id): mixed
    {
        return Horse::with('owner')->find($id);
    }

    public function findByOwnerId(int $horseOwnerId): mixed
    {
        return Horse::where('horse_owner_id', $horseOwnerId)->get();
    }

    public function create(array $data): mixed
    {
        return Horse::create($data);
    }

    public function update(int $id, array $data): mixed
    {
        $horse = Horse::find($id);
        if ($horse) {
            $horse->update($data);
            return $horse;
        }
        return null;
    }

    public function delete(int $id): bool
    {
        $horse = Horse::find($id);
        if ($horse) {
            return $horse->delete();
        }
        return false;
    }

    public function getAll(): mixed
    {
        return Horse::with('owner')->get();
    }

    public function findHorseById(int $id): mixed
    {
        return Horse::find($id);
    }

    public function createHorse(array $data): mixed
    {
        return Horse::create($data);
    }

    public function updateHorse(int $id, array $data): mixed
    {
        $horse = Horse::find($id);
        if ($horse) {
            $horse->update($data);
            return $horse;
        }
        return null;
    }

    public function deleteHorse(int $id): bool
    {
        $horse = Horse::find($id);
        if ($horse) {
            return $horse->delete();
        }
        return false;
    }

    public function getHorsesByOwnerId(int $horseOwnerId): mixed
    {
        return Horse::where('horse_owner_id', $horseOwnerId)->get();
    }

    public function countHorsesByOwnerId(int $horseOwnerId): int
    {
        return Horse::where('horse_owner_id', $horseOwnerId)->count();
    }
}


