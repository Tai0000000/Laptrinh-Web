<?php

// JockeyController request dispatcher for jockey users.
class JockeyController
{
    public function __construct(private PDO $db, private ?array $user) {}

    public function handle(string $method, string $path, array $parts): void
    {
        Auth::role($this->user, ['jockey']);

        $jockey = $this->db->prepare('SELECT id FROM jockeys WHERE user_id = ?');
        $jockey->execute([$this->user['id']]);
        $j      = $jockey->fetch();

        if (!$j) {
            jsonOut(['success' => false, 'message' => 'Profile jockey không tồn tại'], 404);
        }

        $jId = (int) $j['id'];

        
        $sub    = $parts[1] ?? '';
        $resId  = is_numeric($parts[2] ?? '') ? (int) $parts[2] : null;
        $action = $parts[3] ?? '';

        match (true) {
            $path === 'stats'                                => $this->stats($jId),
            $path === 'races'                                => $this->myRaces($jId),
            $path === 'races/upcoming'                       => $this->upcomingRaces($jId),
            $path === 'invitations/pending'                  => $this->pendingInvitations($jId),
            $path === 'invitations/history'                  => $this->invitationHistory($jId),
            $method === 'PUT' && $sub === 'invitations' && $action === 'respond' && $resId => $this->respondInvitation($jId, $resId),
            $path === 'performance/results'                  => $this->performanceResults($jId),
            $path === 'performance/best-times'               => $this->bestTimes($jId),
            default                                          => jsonOut(['success' => false, 'message' => 'Not found'], 404),
        };
    }
}
