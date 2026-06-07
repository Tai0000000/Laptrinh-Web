<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\HorseOwner;
use App\Services\Contracts\IHorseOwnerService;
use App\Repositories\Contracts\IHorseOwnerRepository;
use App\Repositories\Contracts\IJockeyRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HorseOwnerController extends Controller
{
    protected IHorseOwnerService $horseOwnerService;
    protected IHorseOwnerRepository $horseOwnerRepository;
    protected IJockeyRepository $jockeyRepository;

    public function __construct(
        IHorseOwnerService $horseOwnerService,
        IHorseOwnerRepository $horseOwnerRepository,
        IJockeyRepository $jockeyRepository
    ) {
        $this->horseOwnerService    = $horseOwnerService;
        $this->horseOwnerRepository = $horseOwnerRepository;
        $this->jockeyRepository     = $jockeyRepository;
    }

    /**
     * Lấy thông tin profile của Horse Owner đang đăng nhập.
     *
     * GET /horse-owner/profile
     */
    public function profile(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $owner = $this->horseOwnerRepository->findByUserId($userId);

        if (!$owner) {
            return response()->json(['message' => 'Không tìm thấy thông tin chủ ngựa.'], 404);
        }

        return response()->json($owner);
    }

    /**
     * Lấy danh sách tất cả ngựa thuộc chủ đang đăng nhập.
     *
     * GET /horse-owner/horses
     */
    public function myHorses(Request $request): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $owner = $this->horseOwnerRepository->findByUserId($userId);

        if (!$owner) {
            return response()->json(['message' => 'Không tìm thấy thông tin chủ ngựa.'], 404);
        }

        $horses = $this->horseOwnerRepository->getHorses($owner->id);

        return response()->json($horses);
    }

    /**
     * Lấy danh sách ngựa của chủ đang tham gia một cuộc đua cụ thể.
     *
     * GET /horse-owner/horses-for-race/{raceId}
     */
    public function horsesForRace(Request $request, int $raceId): JsonResponse
    {
        $userId = $request->attributes->get('auth_user_id');

        $owner = $this->horseOwnerRepository->findByUserId($userId);

        if (!$owner) {
            return response()->json(['message' => 'Không tìm thấy thông tin chủ ngựa.'], 404);
        }

        $horses = $this->horseOwnerRepository->getHorsesForRace($owner->id, $raceId);

        return response()->json($horses);
    }

    /**
     * Lấy danh sách nài ngựa đã từng tham gia với một con ngựa cụ thể.
     *
     * GET /horse-owner/horses/{horseId}/jockeys
     */
    public function jockeysForHorse(int $horseId): JsonResponse
    {
        $jockeys = $this->horseOwnerRepository->getJockeysForHorse($horseId);

        return response()->json($jockeys);
    }

    /**
     * Lấy lịch đua của một con ngựa.
     *
     * GET /horse-owner/horses/{horseId}/schedule
     */
    public function raceSchedule(int $horseId): JsonResponse
    {
        $schedule = $this->horseOwnerService->viewRaceScheduleAndConfirmParticipation($horseId);

        return response()->json($schedule);
    }

    /**
     * Lấy kết quả đua của một con ngựa.
     *
     * GET /horse-owner/horses/{horseId}/results
     */
    public function raceResults(int $horseId): JsonResponse
    {
        $results = $this->horseOwnerService->trackRaceResults($horseId);

        return response()->json($results);
    }

    /**
     * Lấy bảng xếp hạng của một con ngựa.
     *
     * GET /horse-owner/horses/{horseId}/rankings
     */
    public function horseRankings(int $horseId): JsonResponse
    {
        $rankings = $this->horseOwnerService->getHorseRankings($horseId);

        return response()->json($rankings);
    }

    /**
     * Lấy phần thưởng đạt được của một con ngựa.
     *
     * GET /horse-owner/horses/{horseId}/rewards
     */
    public function horseRewards(int $horseId): JsonResponse
    {
        $rewards = $this->horseOwnerService->getHorseRewards($horseId);

        return response()->json($rewards);
    }

    /**
     * Lấy danh sách tất cả nài ngựa trong hệ thống (để chủ ngựa chọn thuê).
     *
     * GET /jockeys
     */
    public function listJockeys(): JsonResponse
    {
        $jockeys = $this->jockeyRepository->getAll();

        return response()->json($jockeys);
    }
}
