<?php
require_once '../config/db.php';
require_once '../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_response(['error' => 'Invalid request method'], 405);
    return;
}

$subject_id = $_GET['subject_id'] ?? '';

if (empty($subject_id) || !filter_var($subject_id, FILTER_VALIDATE_INT)) {
    send_response(['error' => 'Invalid subject_id'], 400);
    return;
}

// Fetch subject name
$stmt = $conn->prepare("SELECT name FROM subjects WHERE id = ?");
$stmt->bind_param('i', $subject_id);
if (!$stmt->execute()) {
    send_response(['error' => 'Failed to execute subject query'], 500);
}
$result = $stmt->get_result();
$subject = $result->fetch_assoc();

if (!$subject) {
    send_response(['error' => 'Subject not found'], 404);
    return;
}

// Fetch chapters
$stmt = $conn->prepare("SELECT id, title, order_index FROM chapters WHERE subject_id = ? ORDER BY order_index ASC");
$stmt->bind_param('i', $subject_id);
if (!$stmt->execute()) {
    send_response(['error' => 'Failed to execute chapters query'], 500);
}
$result = $stmt->get_result();

$chapters = [];
while ($row = $result->fetch_assoc()) {
    $chapters[] = $row;
}

send_response([
    'subject_name' => $subject['name'],
    'chapters' => $chapters
]);

$stmt->close();