<?php

namespace App\Enums;

enum Role: string
{
    case HorseOwner  = 'horse_owner';
    case Jockey      = 'jockey';
    case Referee     = 'referee';      // kept for backwards compat
    case RaceReferee = 'race_referee'; // used by routes & JWT
    case Spectator   = 'spectator';
    case Admin       = 'admin';

    /**
     * Get all role values for display
     */
    public function getLabel(): string
    {
        return match ($this) {
            self::HorseOwner  => 'Horse Owner',
            self::Jockey      => 'Jockey',
            self::Referee,
            self::RaceReferee => 'Race Referee',
            self::Spectator   => 'Spectator',
            self::Admin       => 'Admin',
        };
    }
}
