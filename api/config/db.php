<?php
// Database configuration
// IMPORTANT: In a production environment, these credentials should be stored in environment variables
// or a secure configuration management system, NOT hardcoded in the file.
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'quizai');

// Create a new MySQLi object
$conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check for connection errors
if ($conn->connect_error) {
    // Log the error internally (e.g., to a file or monitoring system)
    error_log("Database connection failed: " . $conn->connect_error);
    // Return a generic error message to the client
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed. Please try again later."]);
    exit(); // Terminate script execution
}

// Set character set to utf8mb4
$conn->set_charset("utf8mb4");
?>