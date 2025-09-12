<?php
/**
 * Contact Messages Read API Endpoint (Admin)
 * Eventra ESRS Backend
 */

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../models/ContactMessage.php';
require_once '../../utils/JWTUtil.php';

$database = new Database();
$db = $database->getConnection();

$contactMessage = new ContactMessage($db);

// Verify JWT token
$token = JWTUtil::getTokenFromHeader();
$payload = JWTUtil::validateToken($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "Unauthorized access"
    ));
    exit;
}

// Check if user is admin
if (!in_array($payload['role'], ['super-admin', 'admin'])) {
    http_response_code(403);
    echo json_encode(array(
        "success" => false,
        "message" => "Access denied. Admin privileges required."
    ));
    exit;
}

// Get query parameters
$status = $_GET['status'] ?? null;
$priority = $_GET['priority'] ?? null;
$limit = $_GET['limit'] ?? null;

try {
    $stmt = $contactMessage->read($status, $priority, $limit);
    $messages = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $messages[] = array(
            "id" => $row['id'],
            "name" => $row['name'],
            "email" => $row['email'],
            "message" => $row['message'],
            "status" => $row['status'],
            "priority" => $row['priority'],
            "replied_by" => $row['replied_by'],
            "reply_message" => $row['reply_message'],
            "replied_at" => $row['replied_at'],
            "ip_address" => $row['ip_address'],
            "created_at" => $row['created_at'],
            "updated_at" => $row['updated_at']
        );
    }

    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "data" => $messages,
        "count" => count($messages)
    ));

} catch (Exception $e) {
    error_log("Contact messages read error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "An error occurred while fetching contact messages"
    ));
}
?>