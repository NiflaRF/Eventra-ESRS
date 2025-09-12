<?php
/**
 * Resend OTP API Endpoint
 * Resends OTP for email verification
 * Eventra ESRS Backend
 */

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../services/OTPService.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize OTP service
$otpService = new OTPService($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email)) {
    
    // Resend OTP
    $result = $otpService->resendOTP($data->email);
    
    if ($result['success']) {
        // Set response code - 200 OK
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => $result['message']
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
        "message" => "Email is required."
    ));
}
?>