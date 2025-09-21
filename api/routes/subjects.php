<?php
require_once '../config/db.php';
require_once '../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_response(['error' => 'Invalid request method'], 405);
    return;
}

$stmt = $conn->prepare("SELECT id, name FROM subjects");
if (!$stmt->execute()) {
    send_response(['error' => 'Failed to execute subjects query'], 500);
}
$result = $stmt->get_result();

$subjects = [];
while ($row = $result->fetch_assoc()) {
    $row['description'] = 'Master the fundamentals of ' . $row['name'] . ' with our AI-powered quizzes.';
    $subjects[] = $row;
}

send_response($subjects);

$stmt->close();