<?php

require __DIR__ . '/vendor/autoload.php';

use Ratchet\Client\Connector;
use React\EventLoop\Loop;

$loop = Loop::get();
$connector = new Connector($loop);

$connector('ws://localhost:8080')->then(function ($conn) use ($loop) {
    echo "Connected to WebSocket server\n";

    // Subscribe to race 1
    $subscribeMsg = json_encode(['action' => 'subscribe_race', 'race_id' => 1]);
    $conn->send($subscribeMsg);

    $raceId = 1;
    $totalDistance = 1000;
    $horses = [
        ['id' => 1, 'name' => 'Thunder', 'jockey' => 'John Doe', 'distance_left' => 1000, 'speed' => 0, 'position' => 1],
        ['id' => 2, 'name' => 'Lightning', 'jockey' => 'Jane Smith', 'distance_left' => 1000, 'speed' => 0, 'position' => 2],
        ['id' => 3, 'name' => 'Storm', 'jockey' => 'Bob Johnson', 'distance_left' => 1000, 'speed' => 0, 'position' => 3],
        ['id' => 4, 'name' => 'Wind', 'jockey' => 'Alice Williams', 'distance_left' => 1000, 'speed' => 0, 'position' => 4],
    ];

    $tickInterval = 500; // ms
    $tickCount = 0;

    $tick = function () use (&$tickCount, &$horses, $conn, $raceId, $totalDistance, &$tick, $loop, $tickInterval) {
        $tickCount++;

        foreach ($horses as &$horse) {
            $speed = rand(30, 60);
            $distancePerTick = ($speed * 1000 / 3600) * ($tickInterval / 1000);

            $horse['speed'] = round($speed, 1);
            $horse['distance_left'] = max(0, $horse['distance_left'] - $distancePerTick);
            $horse['distance_covered'] = $totalDistance - $horse['distance_left'];
        }

        usort($horses, function ($a, $b) {
            return $a['distance_left'] <=> $b['distance_left'];
        });

        foreach ($horses as $index => &$horse) {
            $horse['position'] = $index + 1;
        }

        $update = [
            'action' => 'race_update',
            'race_id' => $raceId,
            'total_distance' => $totalDistance,
            'horses' => $horses
        ];

        $conn->send(json_encode($update));
        echo "Sent race update tick {$tickCount}\n";

        $allFinished = true;
        foreach ($horses as $horse) {
            if ($horse['distance_left'] > 0) {
                $allFinished = false;
                break;
            }
        }

        if ($allFinished) {
            echo "Race finished!\n";
            $conn->close();
            $loop->stop();
        } else {
            $loop->addTimer($tickInterval / 1000, $tick);
        }
    };

    $loop->addTimer(1, $tick);

}, function ($e) {
    echo "Could not connect: {$e->getMessage()}\n";
});

$loop->run();
