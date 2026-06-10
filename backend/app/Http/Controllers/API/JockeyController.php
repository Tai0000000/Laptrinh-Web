<?php

namespace App\\Http\\Controllers\\API;

use App\\Http\\Controllers\\Controller;
use PDO;
use Throwable;

// â”€â”€ JockeyController â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class JockeyController extends Controller {
    public function __construct(private PDO $db, private ?array $user) {}

    public function handle(string $method, string $path, array $parts): void {
        Auth::role($this->user,['jockey']);
        $jockey=$this->db->prepare('SELECT id FROM jockeys WHERE user_id=?');
        $jockey->execute([$this->user['id']]); $j=$jockey->fetch();
        if (!$j) jsonOut(['success'=>false,'message'=>'Profile jockey khÃ´ng tá»“n táº¡i'],404);
        $jId=(int)$j['id'];

        $sub   = $parts[1]??'';
        $resId = is_numeric($parts[2]??'') ? (int)$parts[2] : null;
        $action= $parts[3]??'';

        match(true) {
            $path==='stats'                               => $this->stats($jId),
            $path==='races'                               => $this->myRaces($jId),
            $path==='races/upcoming'                      => $this->upcomingRaces($jId),
            $path==='invitations/pending'                 => $this->pendingInvitations($jId),
            $path==='invitations/history'                 => $this->invitationHistory($jId),
            $method==='PUT'&&$sub==='invitations'&&$action==='respond'&&$resId => $this->respondInvitation($jId,$resId),
            $path==='performance/results'                 => $this->performanceResults($jId),
            $path==='performance/best-times'              => $this->bestTimes($jId),
            default => jsonOut(['success'=>false,'message'=>'Not found'],404),
        };
    }

    private function stats(int $jId): void {
        $total=$this->db->prepare('SELECT COUNT(*) FROM race_results rr JOIN registrations reg ON reg.id=rr.registration_id WHERE reg.jockey_id=?');
        $total->execute([$jId]);
        $wins=$this->db->prepare("SELECT COUNT(*) FROM race_results rr JOIN registrations reg ON reg.id=rr.registration_id WHERE reg.jockey_id=? AND rr.finish_position=1");
        $wins->execute([$jId]);
        $horses=$this->db->prepare("SELECT COUNT(DISTINCT hj.horse_id) FROM horse_jockey hj WHERE hj.jockey_id=? AND hj.status='accepted'");
        $horses->execute([$jId]);
        $upcoming=$this->db->prepare("SELECT COUNT(*) FROM registrations reg JOIN races r ON r.id=reg.race_id WHERE reg.jockey_id=? AND r.race_date>=NOW() AND r.status IN('scheduled','in_progress')");
        $upcoming->execute([$jId]);
        $lic=$this->db->prepare('SELECT license_number FROM jockeys WHERE id=?');
        $lic->execute([$jId]);
        $t=(int)$total->fetchColumn(); $w=(int)$wins->fetchColumn();
        jsonOut(['success'=>true,'data'=>[
            'total_races'    => $t,
            'wins'           => $w,
            'active_horses'  => (int)$horses->fetchColumn(),
            'upcoming'       => (int)$upcoming->fetchColumn(),
            'win_rate'       => $t>0 ? round($w/$t*100,1) : 0,
            'license_number' => $lic->fetchColumn() ?: 'â€”',
        ]]);
    }

    private function myRaces(int $jId): void {
        $s=$this->db->prepare("SELECT r.id,r.name AS race_name,r.race_date,r.distance,r.status,
            t.name AS tournament,h.name AS horse_name,uo.full_name AS owner_name,
            reg.lane_number,reg.status AS reg_status
            FROM registrations reg
            JOIN races r ON r.id=reg.race_id JOIN tournaments t ON t.id=r.tournament_id
            JOIN horses h ON h.id=reg.horse_id JOIN users uo ON uo.id=h.owner_id
            WHERE reg.jockey_id=? ORDER BY r.race_date DESC");
        $s->execute([$jId]); jsonOut(['success'=>true,'data'=>$s->fetchAll()]);
    }

    private function upcomingRaces(int $jId): void {
        $s=$this->db->prepare("SELECT r.id,r.name AS race_name,r.race_date,r.distance,r.status,
            t.name AS tournament,h.name AS horse_name,uo.full_name AS owner_name,
            reg.lane_number,reg.status AS reg_status
            FROM registrations reg
            JOIN races r ON r.id=reg.race_id JOIN tournaments t ON t.id=r.tournament_id
            JOIN horses h ON h.id=reg.horse_id JOIN users uo ON uo.id=h.owner_id
            WHERE reg.jockey_id=? AND r.race_date>=NOW() AND r.status IN('scheduled','in_progress')
            ORDER BY r.race_date ASC LIMIT 5");
        $s->execute([$jId]); jsonOut(['success'=>true,'data'=>$s->fetchAll()]);
    }

    private function pendingInvitations(int $jId): void {
        $s=$this->db->prepare("SELECT hj.id,hj.race_id,hj.status,
            h.name AS horse_name,h.breed,h.age,h.weight,uo.full_name AS owner_name,
            r.race_date,r.name AS race_name,r.distance,t.name AS tournament,
            (SELECT COUNT(*) FROM race_results rr2 JOIN registrations reg2 ON reg2.id=rr2.registration_id
             WHERE reg2.horse_id=h.id AND rr2.finish_position=1) AS wins
            FROM horse_jockey hj JOIN horses h ON h.id=hj.horse_id JOIN users uo ON uo.id=h.owner_id
            JOIN races r ON r.id=hj.race_id JOIN tournaments t ON t.id=r.tournament_id
            WHERE hj.jockey_id=? AND hj.status='pending' ORDER BY hj.id DESC");
        $s->execute([$jId]); jsonOut(['success'=>true,'data'=>$s->fetchAll()]);
    }

    private function invitationHistory(int $jId): void {
        $s=$this->db->prepare("SELECT hj.id,hj.status,h.name AS horse_name,r.name AS race_name,
            r.race_date AS invited_at,
            (SELECT CONCAT('Háº¡ng ',rr.finish_position) FROM race_results rr
             JOIN registrations reg ON reg.id=rr.registration_id
             WHERE reg.horse_id=h.id AND reg.jockey_id=hj.jockey_id AND reg.race_id=hj.race_id LIMIT 1) AS result
            FROM horse_jockey hj JOIN horses h ON h.id=hj.horse_id
            JOIN races r ON r.id=hj.race_id JOIN tournaments t ON t.id=r.tournament_id
            WHERE hj.jockey_id=? AND hj.status IN('accepted','rejected') ORDER BY hj.id DESC LIMIT 20");
        $s->execute([$jId]); jsonOut(['success'=>true,'data'=>$s->fetchAll()]);
    }

    private function respondInvitation(int $jId, int $invId): void {
        $b=json_decode(file_get_contents('php://input'),true)??[];
        $status=$b['status']??'';
        if (!in_array($status,['accepted','rejected'])) jsonOut(['success'=>false,'message'=>'Status khÃ´ng há»£p lá»‡'],422);
        $check=$this->db->prepare("SELECT * FROM horse_jockey WHERE id=? AND jockey_id=? AND status='pending'");
        $check->execute([$invId,$jId]); $inv=$check->fetch();
        if (!$inv) jsonOut(['success'=>false,'message'=>'Lá»i má»i khÃ´ng tá»“n táº¡i hoáº·c Ä‘Ã£ pháº£n há»“i'],404);
        $this->db->beginTransaction();
        try {
            $this->db->prepare('UPDATE horse_jockey SET status=? WHERE id=?')->execute([$status,$invId]);
            if ($status==='accepted') {
                $reg=$this->db->prepare('SELECT id FROM registrations WHERE race_id=? AND horse_id=?');
                $reg->execute([$inv['race_id'],$inv['horse_id']]); $regRow=$reg->fetch();
                if ($regRow) {
                    $this->db->prepare('UPDATE registrations SET jockey_id=? WHERE id=?')->execute([$jId,$regRow['id']]);
                } else {
                    $ins=$this->db->prepare('INSERT INTO registrations(race_id,horse_id,jockey_id,status,confirmed_by_owner) VALUES(?,?,?,?,1)');
                    $ins->execute([$inv['race_id'],$inv['horse_id'],$jId,'pending']);
                }
            }
            $this->db->commit();
            jsonOut(['success'=>true,'message'=>$status==='accepted'?'ÄÃ£ cháº¥p nháº­n lá»i má»i':'ÄÃ£ tá»« chá»‘i lá»i má»i']);
        } catch(Throwable $e) { $this->db->rollBack(); throw $e; }
    }

    private function performanceResults(int $jId): void {
        $s=$this->db->prepare("SELECT rr.id,rr.finish_position,rr.finish_time,rr.prize_amount,
            r.name AS race_name,r.race_date,r.distance,t.name AS tournament,h.name AS horse_name
            FROM race_results rr JOIN registrations reg ON reg.id=rr.registration_id
            JOIN races r ON r.id=reg.race_id JOIN tournaments t ON t.id=r.tournament_id
            JOIN horses h ON h.id=reg.horse_id
            WHERE reg.jockey_id=? ORDER BY r.race_date DESC LIMIT 50");
        $s->execute([$jId]); jsonOut(['success'=>true,'data'=>$s->fetchAll()]);
    }

    private function bestTimes(int $jId): void {
        $s=$this->db->prepare("SELECT ROW_NUMBER() OVER (ORDER BY rr.finish_time ASC) AS `rank`,
            r.name AS race_name,h.name AS horse_name,rr.finish_time AS finish_time
            FROM race_results rr JOIN registrations reg ON reg.id=rr.registration_id
            JOIN races r ON r.id=reg.race_id JOIN tournaments t ON t.id=r.tournament_id
            JOIN horses h ON h.id=reg.horse_id
            WHERE reg.jockey_id=? AND rr.finish_time IS NOT NULL ORDER BY rr.finish_time ASC LIMIT 3");
        $s->execute([$jId]); jsonOut(['success'=>true,'data'=>$s->fetchAll()]);
    }
}

