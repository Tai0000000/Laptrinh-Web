<?php

require __DIR__ . '/vendor/autoload.php';

use Ratchet\Client\Connector;
use React\EventLoop\Loop;

// ── Tham số đầu vào ──────────────────────────────────────────────────────
// Sử dụng: php simulate-race.php <race_id> [api_base_url]
// Ví dụ:   php simulate-race.php 3
//          php simulate-race.php 3 http://backend:8000/api

$raceId     = isset($argv[1]) ? (int)$argv[1] : 1;
$apiBaseUrl = isset($argv[2]) ? rtrim($argv[2], '/') : 'http://backend:8000/api';

echo "Starting simulation for race #{$raceId}\n";
echo "API base: {$apiBaseUrl}\n";

// ── Lấy dữ liệu race từ API (danh sách ngựa đã đăng ký) ─────────────────
function fetchRaceData(int $raceId, string $apiBaseUrl): ?array
{
    $url = "{$apiBaseUrl}/public/races/{$raceId}";
    $ch  = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code !== 200 || !$body) return null;

    $json = json_decode($body, true);
    return $json['data'] ?? $json ?? null;
}

// ── Lưu kết quả vào backend (gọi API nội bộ) ────────────────────────────
function saveResults(int $raceId, array $results, string $apiBaseUrl): bool
{
    // Cần JWT token của referee/admin — dùng service account hoặc env
    $token = getenv('INTERNAL_API_TOKEN') ?: '';

    $payload = json_encode(['results' => $results]);
    $url     = "{$apiBaseUrl}/referee/races/{$raceId}/results";

    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
    ];
    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 15,
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "Save results API response [{$code}]: {$body}\n";
    return $code >= 200 && $code < 300;
}

// ── Load danh sách ngựa từ API ───────────────────────────────────────────
$raceData = fetchRaceData($raceId, $apiBaseUrl);

if ($raceData && !empty($raceData['registrations'])) {
    $horses = array_map(fn($reg) => [
        'registration_id' => $reg['id'],
        'id'              => $reg['horse']['id'] ?? $reg['id'],
        'name'            => $reg['horse']['name'] ?? "Ngựa #{$reg['id']}",
        'jockey'          => $reg['jockey']['user']['name'] ?? $reg['jockey']['name'] ?? 'N/A',
        'lane'            => $reg['lane'] ?? 0,
        'distance_left'   => 0,
        'speed'           => 0,
        'position'        => 0,
    ], $raceData['registrations']);
    $totalDistance = $raceData['distance'] ?? 1000;
    echo "Loaded " . count($horses) . " horses from API\n";
} else {
    // Fallback: dữ liệu mặc định
    echo "Warning: Could not load race data, using default horses\n";
    $horses = [
        ['registration_id' => null, 'id' => 1, 'name' => 'Thần Gió',  'jockey' => 'Nài 1', 'lane' => 1, 'distance_left' => 0, 'speed' => 0, 'position' => 0],
        ['registration_id' => null, 'id' => 2, 'name' => 'Hắc Long',  'jockey' => 'Nài 2', 'lane' => 2, 'distance_left' => 0, 'speed' => 0, 'position' => 0],
        ['registration_id' => null, 'id' => 3, 'name' => 'Xích Thố',  'jockey' => 'Nài 3', 'lane' => 3, 'distance_left' => 0, 'speed' => 0, 'position' => 0],
    ];
    $totalDistance = 1000;
}

// Reset distance_left cho mỗi ngựa
foreach ($horses as &$h) {
    $h['distance_left'] = $totalDistance;
}
unset($h);

// ── WebSocket simulation ─────────────────────────────────────────────────
$loop      = Loop::get();
$connector = new Connector($loop);

$connector('ws://localhost:8080')->then(function ($conn) use (
    $loop, $raceId, $totalDistance, &$horses, $apiBaseUrl
) {
    echo "Connected to WebSocket server\n";

    // Subscribe
    $conn->send(json_encode(['action' => 'subscribe_race', 'race_id' => $raceId]));

    $tickInterval = 500; // ms
    $tickCount    = 0;
    $finishOrder  = []; // Thứ tự về đích: [registration_id => {rank, finish_time, time_ms}]
    $startTime    = microtime(true);

    $tick = function () use (
        &$tickCount, &$horses, &$finishOrder, &$startTime,
        $conn, $raceId, $totalDistance, &$tick, $loop, $tickInterval, $apiBaseUrl
    ) {
        $tickCount++;
        $elapsedMs = (microtime(true) - $startTime) * 1000;

        foreach ($horses as &$horse) {
            if ($horse['distance_left'] <= 0) continue;

            $speed            = rand(35, 65); // km/h
            $distancePerTick  = ($speed * 1000 / 3600) * ($tickInterval / 1000);
            $horse['speed']   = round($speed, 1);
            $horse['distance_left'] = max(0, $horse['distance_left'] - $distancePerTick);

            // Ghi nhận ngựa vừa về đích
            if ($horse['distance_left'] <= 0 && !isset($finishOrder[$horse['registration_id'] ?? $horse['id']])) {
                $rank    = count($finishOrder) + 1;
                $timeSec = $elapsedMs / 1000;
                $minutes = floor($timeSec / 60);
                $secs    = $timeSec - ($minutes * 60);
                $timeStr = sprintf('%02d:%06.3f', $minutes, $secs);

                $key = $horse['registration_id'] ?? $horse['id'];
                $finishOrder[$key] = [
                    'rank'            => $rank,
                    'finish_time'     => $timeStr,
                    'registration_id' => $horse['registration_id'],
                    'notes'           => null,
                ];
                echo "Horse {$horse['name']} finished rank #{$rank} at {$timeStr}\n";
            }
        }
        unset($horse);

        // Sắp xếp theo distance_left (ít nhất = dẫn đầu)
        usort($horses, fn($a, $b) => $a['distance_left'] <=> $b['distance_left']);
        foreach ($horses as $index => &$horse) {
            $horse['position'] = $index + 1;
        }
        unset($horse);

        // Broadcast update
        $update = [
            'action'         => 'race_update',
            'race_id'        => $raceId,
            'total_distance' => $totalDistance,
            'horses'         => $horses,
            'tick'           => $tickCount,
        ];
        $conn->send(json_encode($update));

        // Kiểm tra tất cả ngựa về đích
        $allFinished = array_reduce($horses, fn($carry, $h) => $carry && $h['distance_left'] <= 0, true);

        if ($allFinished && count($horses) > 0) {
            echo "Race #{$raceId} finished! Saving results...\n";

            // ── Broadcast kết quả cuối ────────────────────────────────
            $finalResults = array_values($finishOrder);
            $conn->send(json_encode([
                'action'         => 'race_finished',
                'race_id'        => $raceId,
                'total_distance' => $totalDistance,
                'horses'         => $horses,
                'results'        => $finalResults,
            ]));

            // ── Lưu kết quả vào backend qua API ──────────────────────
            // Chỉ lưu nếu có registration_id thật (không phải fallback)
            $hasRealIds = !empty(array_filter($finalResults, fn($r) => $r['registration_id'] !== null));
            if ($hasRealIds) {
                $apiResults = array_map(fn($r) => [
                    'registration_id' => $r['registration_id'],
                    'rank'            => $r['rank'],
                    'finish_time'     => $r['finish_time'],
                    'notes'           => $r['notes'],
                ], $finalResults);

                $saved = saveResults($raceId, $apiResults, $apiBaseUrl);
                echo $saved
                    ? "✓ Results saved to database automatically\n"
                    : "✗ Failed to save results - referee must enter manually\n";
            } else {
                echo "No registration_id available, skipping API save\n";
            }

            $conn->close();
            $loop->stop();
        } else {
            $loop->addTimer($tickInterval / 1000, $tick);
        }
    };

    $loop->addTimer(1, $tick);

}, function ($e) {
    echo "Could not connect to WebSocket: {$e->getMessage()}\n";
});

$loop->run();
echo "Simulation complete.\n";
