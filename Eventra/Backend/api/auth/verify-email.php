<?php
/**
 * Email Verification API Endpoint
 * Verifies OTP and completes user registration
 * Eventra ESRS Backend
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to JSON
header('Content-Type: application/json');

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../services/OTPService.php';
require_once '../../utils/JWTUtil.php';

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Initialize OTP service
    $otpService = new OTPService($db);

    // Get posted data
    $input = file_get_contents("php://input");
    $data = json_decode($input);

    // Log the received data for debugging
    error_log("Verify Email Request: " . $input);

    if (!empty($data->email) && !empty($data->otp)) {
        
        // Verify OTP and complete registration
        $result = $otpService->verifyRegistrationOTP($data->email, $data->otp);
        
        error_log("OTP Verification Result: " . json_encode($result));
        
        if ($result['success']) {
            // Email verification successful - user should now login
            // Don't auto-login, redirect to login page instead
            
            // Create response data without token
            $response_data = array(
                "success" => true,
                "message" => "Email verified successfully! Please login to continue.",
                "redirect_to_login" => true
            );
            
            // Set response code - 201 Created
            http_response_code(201);
            echo json_encode($response_data);
            
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
            "message" => "Email and OTP code are required."
        ));
    }

} catch (Exception $e) {
    error_log("Verify Email Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Internal server error occurred during verification."
    ));
}
?>