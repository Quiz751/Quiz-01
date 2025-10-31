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

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        handle_register($conn);
        break;
    case 'login':
        handle_login($conn);
        break;
    case 'logout':
        handle_logout();
        break;
    case 'check_session':
        handle_check_session();
        break;
    case 'check_email':
        handle_check_email($conn);
        break;
    case 'reset_password':
        handle_reset_password($conn);
        break;
    default:
        send_response(['error' => 'Invalid action'], 400);
}

function handle_check_email($conn) {
    $email = $_GET['email'] ?? '';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_response(['exists' => false]);
        return;
    }

    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->store_result();

    send_response(['exists' => $stmt->num_rows > 0]);
}

function handle_reset_password($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_response(['error' => 'Invalid request method'], 405);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || empty($password)) {
        send_response(['error' => 'Invalid input'], 400);
        return;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
    $stmt->bind_param('ss', $hash, $email);

    if ($stmt->execute()) {
        send_response(['success' => true]);
    } else {
        send_response(['error' => 'Password reset failed'], 500);
    }
}

function handle_login($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_response(['error' => 'Invalid request method'], 405);
    }
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    if (!$email || !$password) {
        send_response(['error' => 'Email and password required'], 400);
    }
    $stmt = $conn->prepare("SELECT id, password_hash FROM users WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows === 0) {
        send_response(['error' => 'Invalid credentials'], 401);
    }
    $stmt->bind_result($user_id, $hash);
    $stmt->fetch();
    if (!password_verify($password, $hash)) {
        send_response(['error' => 'Invalid credentials'], 401);
    }
    $_SESSION['user_id'] = $user_id;

    // Add user activity log for login
    $activity_stmt = $conn->prepare("INSERT INTO user_activity (user_id, activity_type) VALUES (?, 'login')");
    $activity_stmt->bind_param('i', $user_id);
    $activity_stmt->execute();
    $activity_stmt->close();

    send_response(['success' => true]);
}

function handle_register($conn) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_response(['error' => 'Invalid request method'], 405);
    }
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $username = $data['username'] ?? '';
    if (!$email || !$password || !$username) {
        send_response(['error' => 'All fields required'], 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_response(['error' => 'Invalid email address'], 400);
    }
    if (!preg_match('/^[a-zA-Z0-9_]{3,32}$/', $username)) {
        send_response(['error' => 'Invalid username'], 400);
    }
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        send_response(['error' => 'Email already registered'], 409);
    }
    $stmt->close();
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        send_response(['error' => 'Username already taken'], 409);
    }
    $stmt->close();
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $stmt->bind_param('sss', $username, $email, $hash);
    if (!$stmt->execute()) {
        send_response(['error' => 'Registration failed'], 500);
    }
    send_response(['success' => true]);
}

function handle_logout() {
    session_destroy();
    send_response(['success' => true]);
}

function handle_check_session() {
    if (!isset($_SESSION['user_id'])) {
        send_response(['logged_in' => false]);
    }
    send_response(['logged_in' => true]);
}
