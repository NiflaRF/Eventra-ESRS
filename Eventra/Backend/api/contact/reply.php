<?php
/**
 * Contact Message Reply API Endpoint (Admin)
 * Eventra ESRS Backend
 */

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../models/ContactMessage.php';
require_once '../../utils/JWTUtil.php';
require_once '../../services/ActivityLogger.php';
require_once '../../config/email.php';

$database = new Database();
$db = $database->getConnection();

$contactMessage = new ContactMessage($db);
$activityLogger = new ActivityLogger($db);

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
if (empty($data->contact_id) || empty($data->reply_message)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Contact ID and reply message are required"
    ));
    exit;
}

try {
    // First, get the original contact message
    $contactMessage->id = $data->contact_id;
    if (!$contactMessage->readOne()) {
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "Contact message not found"
        ));
        exit;
    }

    $original_email = $contactMessage->email;
    $original_name = $contactMessage->name;
    $original_message = $contactMessage->message;

    // Add reply to the contact message
    $contactMessage->reply_message = $data->reply_message;
    $contactMessage->replied_by = $payload['user_id'];

    if ($contactMessage->addReply()) {
        // Log activity
        $activityLogger->log(
            $payload['user_id'],
            'Replied to contact message',
            json_encode([
                'contact_id' => $data->contact_id,
                'original_email' => $original_email,
                'reply_preview' => substr($data->reply_message, 0, 100)
            ]),
            'system',
            $data->contact_id,
            'contact_message'
        );

        // Send reply email to the original sender
        try {
            $emailService = new EmailService();
            $emailService->sendContactReply(
                $original_email,
                $original_name,
                $original_message,
                $data->reply_message
            );
        } catch (Exception $e) {
            // Log email error but don't fail the reply submission
            error_log("Failed to send reply email: " . $e->getMessage());
        }

        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Reply sent successfully"
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to send reply. Please try again."
        ));
    }

} catch (Exception $e) {
    error_log("Contact reply error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "An error occurred while sending the reply"
    ));
}
?>