<?php
require_once '../config/db.php';
require_once '../utils/response.php';

// Secure session cookie flags (allow non-HTTPS on local dev)
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
ini_set('session.cookie_secure', $is_https ? '1' : '0');
ini_set('session.cookie_samesite', 'Lax');

session_start();

if (!isset($_SESSION['user_id'])) {
    send_response(['error' => 'Unauthorized'], 401);
    return;
}

$user_id = $_SESSION['user_id'];



// Fetch user data
$stmt_user = $conn->prepare("SELECT username, email, profile_image, level, xp, progress, streak, created_at, daily_attempts, daily_attempts_date FROM users WHERE id = ?");
$stmt_user->bind_param('i', $user_id);
if (!$stmt_user->execute()) {
    send_response(['error' => 'Failed to fetch user data'], 500);
}
$result_user = $stmt_user->get_result();
$user_data = $result_user->fetch_assoc();
$stmt_user->close();

if (!$user_data) {
    send_response(['error' => 'User not found'], 404);
}

// Fetch quiz history (latest per chapter)
$stmt_quiz = $conn->prepare("SELECT chapter_id, score, completed_at FROM user_quiz_progress WHERE user_id = ? ORDER BY completed_at DESC");
$stmt_quiz->bind_param('i', $user_id);
if (!$stmt_quiz->execute()) {
    send_response(['error' => 'Failed to fetch quiz history'], 500);
}
$result_quiz = $stmt_quiz->get_result();
$quiz_history = [];
while ($row = $result_quiz->fetch_assoc()) {
    $quiz_history[] = $row;
}
$stmt_quiz->close();

// Fetch achievements
$stmt_ach = $conn->prepare("SELECT achievement_name, achieved_at FROM user_achievements WHERE user_id = ?");
$stmt_ach->bind_param('i', $user_id);
if (!$stmt_ach->execute()) {
    send_response(['error' => 'Failed to fetch achievements'], 500);
}
$result_ach = $stmt_ach->get_result();
$achievements = [];
while ($row = $result_ach->fetch_assoc()) {
    $achievements[] = $row;
}
$stmt_ach->close();

// Convert profile_image to base64 if exists
if (!empty($user_data['profile_image'])) {
    $user_data['profile_image'] = base64_encode($user_data['profile_image']);
}

// Stats: quizzes completed counts ALL attempts, even repeated chapters (use quiz_results for accuracy)
$stmt_qc = $conn->prepare("SELECT COUNT(*) AS total FROM quiz_results WHERE user_id = ?");
$stmt_qc->bind_param('i', $user_id);
if (!$stmt_qc->execute()) {
    send_response(['error' => 'Failed to count quizzes'], 500);
}
$qc_row = $stmt_qc->get_result()->fetch_assoc();
$quizzes_completed = (int)($qc_row['total'] ?? 0);
$stmt_qc->close();

// Daily challenge status for today
$today = date('Y-m-d');
$attempts_today = 0;
if (!empty($user_data['daily_attempts_date']) && $user_data['daily_attempts_date'] === $today) {
    $attempts_today = (int)($user_data['daily_attempts'] ?? 0);
}
$daily_challenge = [
    'required' => 5,
    'attempted' => $attempts_today,
    'remaining' => max(0, 5 - $attempts_today),
    'completed' => ($attempts_today >= 5)
];

// Global rank by XP
$stmt_rank = $conn->prepare("SELECT 1 + COUNT(*) AS rank FROM users WHERE xp > (SELECT xp FROM users WHERE id = ?)");
$stmt_rank->bind_param('i', $user_id);
if (!$stmt_rank->execute()) {
    send_response(['error' => 'Failed to compute rank'], 500);
}
$rank_row = $stmt_rank->get_result()->fetch_assoc();
$global_rank = (int)($rank_row['rank'] ?? 0);
$stmt_rank->close();

// Recent activity (last 6)
$stmt_act = $conn->prepare("SELECT activity_type, meta, created_at FROM user_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 6");
$stmt_act->bind_param('i', $user_id);
if (!$stmt_act->execute()) {
    send_response(['error' => 'Failed to fetch activity'], 500);
}
$res_act = $stmt_act->get_result();
$recent_activity = [];
while ($row = $res_act->fetch_assoc()) {
    $recent_activity[] = $row;
}
$stmt_act->close();

send_response([
    'user' => $user_data,
    'quiz_history' => $quiz_history,
    'achievements' => $achievements,
    'stats' => [
        'level' => (int)($user_data['level'] ?? 1),
        'xp' => (int)($user_data['xp'] ?? 0),
        'progress' => (int)($user_data['progress'] ?? 0),
        'streak' => (int)($user_data['streak'] ?? 0),
        'quizzes_completed' => $quizzes_completed,
        'global_rank' => $global_rank
    ],
    'recent_activity' => $recent_activity,
    'daily_challenge' => $daily_challenge
]);

