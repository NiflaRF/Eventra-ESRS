<?php
/**
 * Contact Message Update Status API Endpoint (Admin)
 * Eventra ESRS Backend
 */

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../models/ContactMessage.php';
require_once '../../utils/JWTUtil.php';
require_once '../../services/ActivityLogger.php';

$database = new Database();
$db = $database->getConnection();

$contactMessage = new ContactMessage($db);
$activityLogger = new ActivityLogger($db);

// Only allow PUT requests
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(array(
        "success" => false,
        "message" => "Method not allowed"
    ));
    exit;
}

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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (empty($data->contact_id) || empty($data->status)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Contact ID and status are required"
    ));
    exit;
}

// Validate status values
$valid_statuses = ['unread', 'read', 'replied', 'archived'];
if (!in_array($data->status, $valid_statuses)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Invalid status. Must be one of: " . implode(', ', $valid_statuses)
    ));
    exit;
}

try {
    // Set contact message properties
    $contactMessage->id = $data->contact_id;
    $contactMessage->status = $data->status;

    // Update status
    if ($contactMessage->updateStatus()) {
        // Log activity
        $activityLogger->log(
            $payload['user_id'],
            'Updated contact message status',
            json_encode([
                'contact_id' => $data->contact_id,
                'new_status' => $data->status
            ]),
            'system',
            $data->contact_id,
            'contact_message'
        );

        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Status updated successfully"
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to update status. Please try again."
        ));
    }

} catch (Exception $e) {
    error_log("Contact status update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "An error occurred while updating the status"
    ));
}
?>