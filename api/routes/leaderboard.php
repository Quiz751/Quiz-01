<?php
require_once '../config/db.php';
require_once '../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_response(['error' => 'Invalid request method'], 405);
    return;
}

$filter = $_GET['filter'] ?? 'weekly';

// Global Stats
$stats_sql = "SELECT 
    (SELECT MAX(xp) FROM users) as top_score, 
    (SELECT COUNT(DISTINCT user_id) FROM quiz_results WHERE created_at >= NOW() - INTERVAL 7 DAY) as active_players, 
    (SELECT MAX(streak) FROM users) as day_streak_record";
$stats_result = $conn->query($stats_sql);
$global_stats = $stats_result->fetch_assoc();

$sql = "";
$params = [];

switch ($filter) {
    case 'daily':
        $sql = "SELECT u.username, SUM(qr.xp_delta) as xp FROM quiz_results qr JOIN users u ON qr.user_id = u.id WHERE qr.created_at >= NOW() - INTERVAL 1 DAY GROUP BY u.id ORDER BY xp DESC LIMIT 50";
        break;
    case 'monthly':
        $sql = "SELECT u.username, SUM(qr.xp_delta) as xp FROM quiz_results qr JOIN users u ON qr.user_id = u.id WHERE qr.created_at >= NOW() - INTERVAL 1 MONTH GROUP BY u.id ORDER BY xp DESC LIMIT 50";
        break;
    case 'all':
        $sql = "SELECT username, xp FROM users ORDER BY xp DESC LIMIT 50";
        break;
    case 'weekly':
    default:
        $sql = "SELECT u.username, SUM(qr.xp_delta) as xp FROM quiz_results qr JOIN users u ON qr.user_id = u.id WHERE qr.created_at >= NOW() - INTERVAL 1 WEEK GROUP BY u.id ORDER BY xp DESC LIMIT 50";
        break;
}

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
