<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind Repositories
        $this->app->bind(
            \App\Repositories\Contracts\IHorseOwnerRepository::class,
            \App\Repositories\HorseOwnerRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\IHorseRepository::class,
            \App\Repositories\HorseRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\ITournamentRepository::class,
            \App\Repositories\TournamentRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\IRaceRepository::class,
            \App\Repositories\RaceRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\IRegistrationRepository::class,
            \App\Repositories\RegistrationRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\IRaceResultRepository::class,
            \App\Repositories\RaceResultRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\IBetRepository::class,
            \App\Repositories\BetRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\IJockeyRepository::class,
            \App\Repositories\JockeyRepository::class
        );

        // Bind Services
        $this->app->bind(
            \App\Services\Contracts\IHorseOwnerService::class,
            \App\Services\HorseOwnerService::class
        );
        $this->app->bind(
            \App\Services\Contracts\IHorseService::class,
            \App\Services\HorseService::class
        );
        $this->app->bind(
            \App\Services\Contracts\ITournamentService::class,
            \App\Services\TournamentService::class
        );
        $this->app->bind(
            \App\Services\Contracts\IRaceService::class,
            \App\Services\RaceService::class
        );
        $this->app->bind(
            \App\Services\Contracts\IRegistrationService::class,
            \App\Services\RegistrationService::class
        );
        $this->app->bind(
            \App\Services\Contracts\IRaceResultService::class,
            \App\Services\RaceResultService::class
        );
        $this->app->bind(
            \App\Services\Contracts\IBetService::class,
            \App\Services\BetService::class
        );
        $this->app->bind(
            \App\Services\Contracts\IJockeyService::class,
            \App\Services\JockeyService::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
