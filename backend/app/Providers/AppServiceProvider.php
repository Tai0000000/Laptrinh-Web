<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\IHorseRepository;
use App\Repositories\HorseRepository;
use App\Repositories\Contracts\IHorseOwnerRepository;
use App\Repositories\HorseOwnerRepository;
use App\Services\Contracts\IHorseService;
use App\Services\HorseService;
use App\Services\Contracts\IHorseOwnerService;
use App\Services\HorseOwnerService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(IHorseRepository::class, HorseRepository::class);
        $this->app->bind(IHorseOwnerRepository::class, HorseOwnerRepository::class);
        $this->app->bind(IHorseService::class, HorseService::class);
        $this->app->bind(IHorseOwnerService::class, HorseOwnerService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
