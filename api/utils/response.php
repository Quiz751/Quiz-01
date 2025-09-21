<?php
function send_response($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json');
    // Allow CORS for API (adjust origin as needed)
    header('Access-Control-Allow-Origin: *');
    echo json_encode($data);
    exit;
}
?>