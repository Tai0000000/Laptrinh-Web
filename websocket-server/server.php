<?php

require __DIR__ . '/vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

class RaceUpdateHandler implements \Ratchet\MessageComponentInterface {
    protected $clients;
    protected $subscriptions; // race_id => \SplObjectStorage of clients

    public function __construct() {
        $this->clients = new \SplObjectStorage();
        $this->subscriptions = [];
    }

    public function onOpen(\Ratchet\ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(\Ratchet\ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);
        if (isset($data['action'])) {
            switch ($data['action']) {
                case 'subscribe_race':
                    if (isset($data['race_id'])) {
                        $raceId = $data['race_id'];
                        if (!isset($this->subscriptions[$raceId])) {
                            $this->subscriptions[$raceId] = new \SplObjectStorage();
                        }
                        $this->subscriptions[$raceId]->attach($from);
                        echo "Client {$from->resourceId} subscribed to race {$raceId}\n";
                    }
                    break;
                case 'unsubscribe_race':
                    if (isset($data['race_id'])) {
                        $raceId = $data['race_id'];
                        if (isset($this->subscriptions[$raceId])) {
                            $this->subscriptions[$raceId]->detach($from);
                            if (count($this->subscriptions[$raceId]) === 0) {
                                unset($this->subscriptions[$raceId]);
                            }
                        }
                        echo "Client {$from->resourceId} unsubscribed from race {$raceId}\n";
                    }
                    break;
                case 'race_update':
                case 'race_result':
                    if (isset($data['race_id'])) {
                        $this->broadcastRaceUpdate($data);
                    }
                    break;
            }
        }
    }

    public function onClose(\Ratchet\ConnectionInterface $conn) {
        foreach ($this->subscriptions as $raceId => $clients) {
            if ($clients->contains($conn)) {
                $clients->detach($conn);
                if (count($clients) === 0) {
                    unset($this->subscriptions[$raceId]);
                }
            }
        }
        $this->clients->detach($conn);
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(\Ratchet\ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }

    protected function broadcastRaceUpdate($data) {
        $raceId = $data['race_id'];
        if (isset($this->subscriptions[$raceId])) {
            foreach ($this->subscriptions[$raceId] as $client) {
                $client->send(json_encode($data));
            }
            echo "Broadcasted race update to race {$raceId}\n";
        }
        // Also broadcast to all clients if we want (optional, but let's do it for global updates)
        foreach ($this->clients as $client) {
            $client->send(json_encode($data));
        }
        echo "Broadcasted global update\n";
    }
}

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
