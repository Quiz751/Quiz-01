<?php
require_once '../config/db.php';
require_once '../utils/response.php';

session_start();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_quiz':
        handle_get_quiz($conn);
        break;
    case 'get_complete_quiz':
        handle_get_complete_quiz($conn);
        break;
    case 'submit_quiz':
        handle_submit_quiz($conn);
        break;
    default:
        send_response(['error' => 'Invalid action'], 400);
}

function handle_get_quiz($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        send_response(['error' => 'Invalid request method'], 405);
    }
    $chapter_id = $_GET['chapter_id'] ?? null;
    if (!$chapter_id || !filter_var($chapter_id, FILTER_VALIDATE_INT)) {
        send_response(['error' => 'Invalid chapter_id'], 400);
    }

    // Fetch chapter title and its subject_id
    $stmt = $conn->prepare("SELECT title, subject_id FROM chapters WHERE id = ?");
    $stmt->bind_param('i', $chapter_id);
    if (!$stmt->execute()) {
        send_response(['error' => 'Failed to fetch chapter details'], 500);
    }
    $result = $stmt->get_result();
    $chapter = $result->fetch_assoc();
    $stmt->close();

    if (!$chapter) {
        send_response(['error' => 'Chapter not found'], 404);
    }

    // Select exactly 20 random questions for this chapter
    $stmt = $conn->prepare(
        "
        SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation
        FROM questions q
        INNER JOIN topics t ON q.topic_id = t.id
        WHERE t.chapter_id = ?
        ORDER BY RAND()
        LIMIT 20
        "
    );
    $stmt->bind_param('i', $chapter_id);
    if (!$stmt->execute()) {
        send_response(['error' => 'Failed to fetch quiz'], 500);
    }
    $result = $stmt->get_result();
    $questions = [];
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    $stmt->close();
    send_response([
        'title' => $chapter['title'] . ' Quiz',
        'questions' => $questions,
        'subject_id' => $chapter['subject_id']
    ]);
}

function handle_get_complete_quiz($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        send_response(['error' => 'Invalid request method'], 405);
    }

    $target_count = 50;
    $selectedQuestions = [];
    $selectedIds = [];

    // 1) Get all topics that have at least one question
    $topicsResult = $conn->query("SELECT t.id AS topic_id FROM topics t WHERE EXISTS (SELECT 1 FROM questions q WHERE q.topic_id = t.id)");
    if (!$topicsResult) {
        send_response(['error' => 'Failed to fetch topics'], 500);
    }

    // 2) For each topic, pick 1 random question to ensure coverage
    while ($topicRow = $topicsResult->fetch_assoc()) {
        $topicId = (int)$topicRow['topic_id'];
        $stmt = $conn->prepare(
            "SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation
             FROM questions q
             WHERE q.topic_id = ?
             ORDER BY RAND()
             LIMIT 1"
        );
        $stmt->bind_param('i', $topicId);
        if ($stmt->execute()) {
            $res = $stmt->get_result();
            if ($row = $res->fetch_assoc()) {
                $qid = (int)$row['id'];
                $selectedQuestions[] = $row;
                $selectedIds[$qid] = true;
            }
        }
        $stmt->close();
    }

    $topicsResult->close();

    // 3) Calculate remaining slots
    $remaining = $target_count - count($selectedQuestions);

    // 4) If we still need more, fill randomly from the remaining pool excluding already selected
    if ($remaining > 0) {
        $ids = array_keys($selectedIds);
        if (count($ids) > 0) {
            // Build dynamic placeholders and bind via call_user_func_array to satisfy references requirement
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $sql = "SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation
                    FROM questions q
                    WHERE q.id NOT IN ($placeholders)
                    ORDER BY RAND()
                    LIMIT ?";
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                $types = str_repeat('i', count($ids)) . 'i';
                $bindParams = [];
                $bindParams[] = & $types;
                // Bind each id by reference
                foreach ($ids as $index => $val) {
                    $ids[$index] = (int)$val;
                    $bindParams[] = & $ids[$index];
                }
                $bindParams[] = & $remaining;
                call_user_func_array([$stmt, 'bind_param'], $bindParams);
                if ($stmt->execute()) {
                    $res = $stmt->get_result();
                    while ($row = $res->fetch_assoc()) {
                        $selectedQuestions[] = $row;
                    }
                }
                $stmt->close();
            }
        } else {
            $sql = "SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation
                    FROM questions q
                    ORDER BY RAND()
                    LIMIT ?";
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                $stmt->bind_param('i', $remaining);
                if ($stmt->execute()) {
                    $res = $stmt->get_result();
                    while ($row = $res->fetch_assoc()) {
                        $selectedQuestions[] = $row;
                    }
                }
                $stmt->close();
            }
        }
    }

    // If fewer than 50 total exist, we return all we found
    send_response([
        'title' => 'Complete Subject Quiz',
        'questions' => $selectedQuestions
    ]);
}

function handle_submit_quiz($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_response(['error' => 'Invalid request method'], 405);
    }
    if (!isset($_SESSION['user_id'])) {
        send_response(['error' => 'Unauthorized'], 401);
    }

    $user_id = (int)$_SESSION['user_id'];
    $data = json_decode(file_get_contents('php://input'), true);
    $chapter_id = isset($data['chapter_id']) ? (int)$data['chapter_id'] : null;
    $score = isset($data['score']) ? (int)$data['score'] : null; // 0-100

    if (!$chapter_id || $score === null || $score < 0 || $score > 100) {
        send_response(['error' => 'Invalid payload'], 400);
    }

    // Enforce per-day streak logic (no hard cap on attempts; streak awarded once at 5)
    $today = date('Y-m-d');
    $conn->begin_transaction();
    $stmt = $conn->prepare("SELECT daily_attempts, daily_attempts_date, streak, last_streak_date, xp, level, progress FROM users WHERE id = ? FOR UPDATE");
    $stmt->bind_param('i', $user_id);
    if (!$stmt->execute()) {
        send_response(['error' => 'Failed to load user'], 500);
    }
    $userRes = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$userRes) {
        send_response(['error' => 'User not found'], 404);
    }

    $daily_attempts = (int)$userRes['daily_attempts'];
    $daily_attempts_date = $userRes['daily_attempts_date'];

    if ($daily_attempts_date !== $today) {
        // If yesterday (or earlier) attempts were < 5, reset streak to 0
        // We consider $daily_attempts as count for $daily_attempts_date
        if (!empty($daily_attempts_date)) {
            // Only if last recorded date is before today
            if ($daily_attempts < 5) {
                $stmt = $conn->prepare("UPDATE users SET streak = 0 WHERE id = ?");
                $stmt->bind_param('i', $user_id);
                $stmt->execute();
                $stmt->close();

                // Log activity for streak reset due to not meeting daily challenge yesterday
                $typeReset = 'streak_reset';
                $metaReset = json_encode(['date' => $daily_attempts_date, 'reason' => 'daily_challenge_incomplete']);
                $stmt = $conn->prepare("INSERT INTO user_activity (user_id, activity_type, meta) VALUES (?, ?, ?)");
                $stmt->bind_param('iss', $user_id, $typeReset, $metaReset);
                $stmt->execute();
                $stmt->close();
            }
        }
        $daily_attempts = 0;
        $stmt = $conn->prepare("UPDATE users SET daily_attempts = 0, daily_attempts_date = ? WHERE id = ?");
        $stmt->bind_param('si', $today, $user_id);
        $stmt->execute();
        $stmt->close();
    }

    // Upsert quiz progress for this chapter (unique per user/chapter)
    $stmt = $conn->prepare("SELECT id FROM user_quiz_progress WHERE user_id = ? AND chapter_id = ?");
    $stmt->bind_param('ii', $user_id, $chapter_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $existing = $res->fetch_assoc();
    $stmt->close();

    if ($existing) {
        $stmt = $conn->prepare("UPDATE user_quiz_progress SET score = ?, completed_at = NOW() WHERE id = ?");
        $stmt->bind_param('ii', $score, $existing['id']);
        if (!$stmt->execute()) {
            $conn->rollback();
            send_response(['error' => 'Failed to update progress'], 500);
        }
        $stmt->close();
    } else {
        $stmt = $conn->prepare("INSERT INTO user_quiz_progress (user_id, chapter_id, score) VALUES (?, ?, ?)");
        $stmt->bind_param('iii', $user_id, $chapter_id, $score);
        if (!$stmt->execute()) {
            $conn->rollback();
            send_response(['error' => 'Failed to save progress'], 500);
        }
        $stmt->close();
    }

    // XP logic
    $xp_delta = 0;
    if ($score >= 90) $xp_delta = 30; else if ($score >= 80) $xp_delta = 20; else if ($score >= 70) $xp_delta = 12; else if ($score >= 60) $xp_delta = 8; else if ($score >= 50) $xp_delta = 5; else $xp_delta = -10;

    // Allow XP to go negative per requirements
    $new_xp = (int)$userRes['xp'] + $xp_delta;
    $new_progress = min(255, (int)$userRes['progress'] + max(1, (int)floor($score / 5))); // +1..20
    $new_level = (int)$userRes['level'];
    while ($new_progress >= 100) {
        $new_progress -= 100;
        $new_level += 1;
    }

    $stmt = $conn->prepare("UPDATE users SET xp = ?, progress = ?, level = ? WHERE id = ?");
    $stmt->bind_param('iiii', $new_xp, $new_progress, $new_level, $user_id);
    if (!$stmt->execute()) {
        $conn->rollback();
        send_response(['error' => 'Failed to update stats'], 500);
    }
    $stmt->close();

    // Increase daily attempts and handle streak when reaching 5 today (award once)
    $daily_attempts++;
    $stmt = $conn->prepare("UPDATE users SET daily_attempts = ?, daily_attempts_date = ? WHERE id = ?");
    $stmt->bind_param('isi', $daily_attempts, $today, $user_id);
    $stmt->execute();
    $stmt->close();

    if ($daily_attempts === 5) {
        $last_streak_date = $userRes['last_streak_date'];
        if ($last_streak_date !== $today) {
            $stmt = $conn->prepare("UPDATE users SET streak = streak + 1, last_streak_date = ? WHERE id = ?");
            $stmt->bind_param('si', $today, $user_id);
            $stmt->execute();
            $stmt->close();

            // Log activity for daily challenge completion and streak increment
            $typeDaily = 'daily_challenge_completed';
            $metaDaily = json_encode(['date' => $today, 'quizzes_completed' => 5]);
            $stmt = $conn->prepare("INSERT INTO user_activity (user_id, activity_type, meta) VALUES (?, ?, ?)");
            $stmt->bind_param('iss', $user_id, $typeDaily, $metaDaily);
            $stmt->execute();
            $stmt->close();

            $typeStreak = 'streak_incremented';
            $metaStreak = json_encode(['date' => $today]);
            $stmt = $conn->prepare("INSERT INTO user_activity (user_id, activity_type, meta) VALUES (?, ?, ?)");
            $stmt->bind_param('iss', $user_id, $typeStreak, $metaStreak);
            $stmt->execute();
            $stmt->close();
        }
    }

    // Persist detailed result and activity inside the same transaction
    $stmt = $conn->prepare("INSERT INTO quiz_results (user_id, quiz_id, chapter_id, score, max_score, xp_delta) VALUES (?, NULL, ?, ?, 100, ?)");
    $stmt->bind_param('iiii', $user_id, $chapter_id, $score, $xp_delta);
    if (!$stmt->execute()) {
        $conn->rollback();
        send_response(['error' => 'Failed to persist quiz result'], 500);
    }
    $stmt->close();

    // Log activity
    $meta = json_encode(['chapter_id' => $chapter_id, 'score' => $score, 'xp_delta' => $xp_delta]);
    $type = 'quiz_submitted';
    $stmt = $conn->prepare("INSERT INTO user_activity (user_id, activity_type, meta) VALUES (?, ?, ?)");
    $stmt->bind_param('iss', $user_id, $type, $meta);
    $stmt->execute();
    $stmt->close();
    
    // Compute today attempts capped for progress and quizzes_today
    $quizzes_today = $daily_attempts;
    $daily_progress = min(5, $daily_attempts);

    $conn->commit();

    send_response([
        'success' => true,
        'xp_delta' => $xp_delta,
        'new_xp' => $new_xp,
        'quizzes_today' => $quizzes_today,
        'daily_progress' => $daily_progress
    ]);
}

?>