<?php

require __DIR__ . '/vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use App\WebSocket\RaceUpdateHandler;

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new RaceUpdateHandler()
        )
    ),
    8080
);

echo "WebSocket server running on port 8080\n";

$server->run();
