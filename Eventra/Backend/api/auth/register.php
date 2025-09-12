<?php
/**
 * Register API Endpoint with OTP Email Verification
 * Eventra ESRS Backend
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to JSON
header('Content-Type: application/json');

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../models/User.php';
require_once '../../services/OTPService.php';
require_once '../../utils/PasswordResetUtil.php';

try {

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize user object and OTP service
$user = new User($db);
$otpService = new OTPService($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->name) && !empty($data->email) && !empty($data->password) && !empty($data->role)) {
    
    // Validate password security requirements
    $passwordValidation = PasswordResetUtil::validatePassword($data->password);
    if (!$passwordValidation['success']) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => $passwordValidation['message']
        ));
        exit();
    }
    
    // Check if role is allowed for public registration
    $public_roles = ['student', 'faculty'];
    if(!in_array($data->role, $public_roles)) {
        http_response_code(403);
        echo json_encode(array(
            "success" => false,
            "message" => "This role cannot be registered publicly. Please contact your administrator."
        ));
        exit();
    }
    
    // Check if email already exists and is verified
    $user->email = $data->email;
    if($user->emailExists()) {
        // Check if the existing user has verified email
        if($user->readByEmail() && $user->is_email_verified) {
            http_response_code(409);
            echo json_encode(array(
                "success" => false,
                "message" => "An account with this email already exists and is verified."
            ));
            exit();
        }
    }
    
    // Prepare user data for OTP verification
    $userData = [
        'name' => htmlspecialchars($data->name),
        'email' => htmlspecialchars($data->email),
        'password_hash' => password_hash($data->password, PASSWORD_DEFAULT),
        'role' => htmlspecialchars($data->role),
        'department' => htmlspecialchars($data->department ?? ''),
        'faculty' => htmlspecialchars($data->faculty ?? ''),
        'designation' => htmlspecialchars($data->designation ?? ''),
        'bio' => htmlspecialchars($data->bio ?? ''),
        'event_interests' => htmlspecialchars($data->event_interests ?? ''),
        'service_type' => null // Only for service-provider
    ];
    
    // Send OTP for email verification
    $result = $otpService->sendRegistrationOTP($data->email, $userData);
    
    if($result['success']) {
        // Set response code - 200 OK (OTP sent, but registration not complete)
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => $result['message'],
            "step" => "otp_verification",
            "email" => $data->email
        ));
    } else {
        // Set response code - 400 Bad request
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => $result['message']
        ));
    }
    
} else {
    // Set response code - 400 Bad request
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Unable to register user. Data is incomplete."
    ));
}

} catch (Exception $e) {
    error_log("Registration Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Internal server error occurred during registration."
    ));
}
?> 