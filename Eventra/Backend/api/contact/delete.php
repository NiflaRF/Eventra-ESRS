<?php
/**
 * Contact Message Delete API Endpoint (Admin)
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

// Only allow DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

// Get contact ID from URL parameter
$contact_id = $_GET['id'] ?? null;

if (empty($contact_id)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Contact ID is required"
    ));
    exit;
}

try {
    // First, get the contact message details for logging
    $contactMessage->id = $contact_id;
    if (!$contactMessage->readOne()) {
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "Contact message not found"
        ));
        exit;
    }

    $contact_email = $contactMessage->email;
    $contact_name = $contactMessage->name;

    // Delete the contact message
    if ($contactMessage->delete()) {
        // Log activity
        $activityLogger->log(
            $payload['user_id'],
            'Deleted contact message',
            json_encode([
                'contact_id' => $contact_id,
                'contact_email' => $contact_email,
                'contact_name' => $contact_name
            ]),
            'system',
            $contact_id,
            'contact_message'
        );

        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Contact message deleted successfully"
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to delete contact message. Please try again."
        ));
    }

} catch (Exception $e) {
    error_log("Contact delete error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "An error occurred while deleting the contact message"
    ));
}
?>