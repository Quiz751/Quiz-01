<?php
require_once '../config/db.php';
require_once '../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_response(['error' => 'Invalid request method'], 405);
    return;
}

// Global Stats
$stats_sql = "SELECT 
    (SELECT MAX(xp) FROM users) as top_score, 
    (SELECT COUNT(*) FROM users) as active_players, 
    (SELECT MAX(streak) FROM users) as day_streak_record";
$stats_result = $conn->query($stats_sql);
$global_stats = $stats_result->fetch_assoc();

$sql = "SELECT username, xp FROM users ORDER BY xp DESC LIMIT 50";

$stmt = $conn->prepare($sql);

if (!$stmt->execute()) {
    send_response(['error' => 'Failed to execute leaderboard query'], 500);
}
$result = $stmt->get_result();

$leaderboard = [];
while ($row = $result->fetch_assoc()) {
    $leaderboard[] = [
        'username' => $row['username'],
        'xp' => (int)$row['xp']
    ];
}

send_response([
    'global_stats' => $global_stats,
    'leaderboard' => $leaderboard
]);

$stmt->close();
