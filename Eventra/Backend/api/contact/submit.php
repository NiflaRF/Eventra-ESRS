<?php
/**
 * Contact Form Submit API Endpoint
 * Eventra ESRS Backend
 */

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../models/ContactMessage.php';
require_once '../../models/Notification.php';
require_once '../../services/ActivityLogger.php';
require_once '../../config/email.php';

$database = new Database();
$db = $database->getConnection();

$contactMessage = new ContactMessage($db);
$notification = new Notification($db);
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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (empty($data->name) || empty($data->email) || empty($data->message)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Name, email, and message are required"
    ));
    exit;
}

// Validate email format
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Invalid email format"
    ));
    exit;
}

// Rate limiting - Check if same IP sent message in last 5 minutes
$ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

try {
    // Check for recent submission from same IP
    $rate_limit_query = "SELECT COUNT(*) as count FROM contact_messages 
                        WHERE ip_address = :ip_address 
                        AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)";
    $rate_stmt = $db->prepare($rate_limit_query);
    $rate_stmt->bindParam(":ip_address", $ip_address);
    $rate_stmt->execute();
    $rate_result = $rate_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($rate_result['count'] >= 3) {
        http_response_code(429);
        echo json_encode(array(
            "success" => false,
            "message" => "Too many submissions. Please wait 5 minutes before submitting again."
        ));
        exit;
    }

    // Set contact message properties
    $contactMessage->name = $data->name;
    $contactMessage->email = $data->email;
    $contactMessage->message = $data->message;
    $contactMessage->status = 'unread';
    $contactMessage->priority = 'medium';
    $contactMessage->ip_address = $ip_address;
    $contactMessage->user_agent = $user_agent;

    // Create the contact message
    if ($contactMessage->create()) {
        // Log activity
        $activityLogger->log(
            null, // No user ID for public contact
            'Contact form submitted',
            json_encode([
                'contact_id' => $contactMessage->id,
                'name' => $data->name,
                'email' => $data->email,
                'ip_address' => $ip_address
            ]),
            'system',
            $contactMessage->id,
            'contact_message'
        );

        // Send notification email to admins
        try {
            $emailService = new EmailService();
            
            // Get admin emails and create notifications
            $admin_query = "SELECT id, email, name FROM users WHERE role IN ('super-admin', 'admin') AND status = 'active'";
            $admin_stmt = $db->prepare($admin_query);
            $admin_stmt->execute();
            
            while ($admin = $admin_stmt->fetch(PDO::FETCH_ASSOC)) {
                // Create notification for each admin
                $notification->user_id = $admin['id'];
                $notification->title = 'New Contact Inquiry';
                $notification->message = "New contact message from {$data->name} ({$data->email})";
                $notification->type = 'contact';
                $notification->related_booking_id = null;
                $notification->related_venue_id = null;
                $notification->metadata = [
                    'contact_id' => $contactMessage->id,
                    'contact_name' => $data->name,
                    'contact_email' => $data->email,
                    'message_preview' => substr($data->message, 0, 100) . (strlen($data->message) > 100 ? '...' : '')
                ];
                $notification->create();

                // Send email notification
                $emailService->sendContactNotification(
                    $admin['email'],
                    $admin['name'],
                    $data->name,
                    $data->email,
                    $data->message,
                    $contactMessage->id
                );
            }
        } catch (Exception $e) {
            // Log email error but don't fail the contact submission
            error_log("Failed to send admin notification email: " . $e->getMessage());
        }

        http_response_code(201);
        echo json_encode(array(
            "success" => true,
            "message" => "Your message has been sent successfully. We'll get back to you soon!",
            "contact_id" => $contactMessage->id
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to submit your message. Please try again later."
        ));
    }

} catch (Exception $e) {
    error_log("Contact submission error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "An error occurred while processing your request"
    ));
}
?>