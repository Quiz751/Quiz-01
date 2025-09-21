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
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_settings':
        handle_get_settings($conn, $user_id);
        break;
    case 'update_settings':
        handle_update_settings($conn, $user_id);
        break;
    case 'update_profile_image':
        handle_update_profile_image($conn, $user_id);
        break;
    case 'remove_profile_image':
        handle_remove_profile_image($conn, $user_id);
        break;
    default:
        send_response(['error' => 'Invalid action'], 400);
}

function handle_get_settings($conn, $user_id) {
    $stmt = $conn->prepare("SELECT username, email, profile_image FROM users WHERE id = ?");
    $stmt->bind_param('i', $user_id);
    if (!$stmt->execute()) {
        send_response(['error' => 'Failed to fetch settings'], 500);
    }
    $result = $stmt->get_result();
    $settings = $result->fetch_assoc();
    $stmt->close();

    $stmt = $conn->prepare("SELECT achievement_name, achieved_at FROM user_achievements WHERE user_id = ? ORDER BY achieved_at DESC");
    $stmt->bind_param('i', $user_id);
    if (!$stmt->execute()) {
        send_response(['error' => 'Failed to fetch achievements'], 500);
    }
    $result = $stmt->get_result();
    $achievements = [];
    while ($row = $result->fetch_assoc()) {
        $achievements[] = $row;
    }
    $stmt->close();

    $settings['achievements'] = $achievements;

    send_response($settings);
}

function handle_update_settings($conn, $user_id) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_response(['error' => 'Invalid request method'], 405);
    }
    $data = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? null;
    $new_password = $data['new_password'] ?? null;

    // Validate required fields
    if (!$username || !$email) {
        send_response(['error' => 'All fields required'], 400);
    }
    // Validate username (alphanumeric, underscores, 3-32 chars)
    if (!preg_match('/^[a-zA-Z0-9_]{3,32}$/', $username)) {
        send_response(['error' => 'Invalid username. Use 3-32 letters, numbers, or underscores.'], 400);
    }
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_response(['error' => 'Invalid email address'], 400);
    }
    // Check for duplicate email
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->bind_param('si', $email, $user_id);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        send_response(['error' => 'Email already in use'], 409);
    }
    $stmt->close();
    // Check for duplicate username
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
    $stmt->bind_param('si', $username, $user_id);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        send_response(['error' => 'Username already in use'], 409);
    }
    $stmt->close();

    // If password change is requested
    if ($password !== null && $new_password !== null) {
        // Fetch current password hash
        $stmt = $conn->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $stmt->bind_result($current_hash);
        if (!$stmt->fetch()) {
            $stmt->close();
            send_response(['error' => 'User not found'], 404);
        }
        $stmt->close();
        // Verify current password
        if (!password_verify($password, $current_hash)) {
            send_response(['error' => 'Current password is incorrect'], 401);
        }
        // Validate new password (min 8 chars, at least 1 letter and 1 number)
        if (!preg_match('/^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]{8,}$/', $new_password)) {
            send_response(['error' => 'New password must be at least 8 characters and include a letter and a number.'], 400);
        }
        $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
        // Update username, email, and password
        $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?");
        $stmt->bind_param('sssi', $username, $email, $new_hash, $user_id);
    } else {
        // Update username and email only
        $stmt = $conn->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
        $stmt->bind_param('ssi', $username, $email, $user_id);
    }
    if (!$stmt->execute()) {
        send_response(['error' => 'Failed to update settings'], 500);
    }
    $stmt->close();
    send_response(['success' => true]);
}

function handle_update_profile_image($conn, $user_id) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_response(['error' => 'Invalid request method'], 405);
    }
    $data = json_decode(file_get_contents('php://input'), true);
    $image_data = $data['image_data'] ?? null;

    if (!$image_data) {
        send_response(['error' => 'No image data provided'], 400);
    }

    // Basic validation for base64 string
    if (!preg_match('/^data:image\/(png|jpeg|gif);base64,/', $image_data)) {
        send_response(['error' => 'Invalid image format'], 400);
    }

    $stmt = $conn->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
    $stmt->bind_param('si', $image_data, $user_id);
    if (!$stmt->execute()) {
        send_response(['error' => 'Failed to update profile image'], 500);
    }
    $stmt->close();
    send_response(['success' => true]);
}

function handle_remove_profile_image($conn, $user_id) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_response(['error' => 'Invalid request method'], 405);
    }

    $stmt = $conn->prepare("UPDATE users SET profile_image = NULL WHERE id = ?");
    $stmt->bind_param('i', $user_id);
    if (!$stmt->execute()) {
        send_response(['error' => 'Failed to remove profile image'], 500);
    }
    $stmt->close();
    send_response(['success' => true]);
}