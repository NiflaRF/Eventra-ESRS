<?php
/**
 * Test OTP System - For debugging purposes only
 * This endpoint should be removed in production
 */

header('Content-Type: application/json');

require_once 'config/cors.php';
require_once 'config/database.php';
require_once 'services/OTPService.php';

$database = new Database();
$db = $database->getConnection();
$otpService = new OTPService($db);

// Test data
$testEmail = 'test@example.com';
$testUserData = [
    'name' => 'Test User',
    'email' => $testEmail,
    'password_hash' => password_hash('testpassword', PASSWORD_DEFAULT),
    'role' => 'student'
];

echo "<h1>OTP System Test</h1>";
echo "<h3>1. Sending OTP...</h3>";

// Send OTP
$result = $otpService->sendRegistrationOTP($testEmail, $testUserData);
echo "<p>Result: " . json_encode($result) . "</p>";

if ($result['success']) {
    echo "<h3>2. Check your database for the OTP code</h3>";
    echo "<p>Look in the email_verification_codes table for email: $testEmail</p>";
    
    // Query to show the code (for testing only)
    $query = "SELECT verification_code, expires_at FROM email_verification_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $testEmail);
    $stmt->execute();
    
    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<p><strong>Generated OTP: " . $row['verification_code'] . "</strong></p>";
        echo "<p>Expires at: " . $row['expires_at'] . "</p>";
        
        echo "<h3>3. Testing OTP Verification...</h3>";
        $verifyResult = $otpService->verifyRegistrationOTP($testEmail, $row['verification_code']);
        echo "<p>Verification Result: " . json_encode($verifyResult) . "</p>";
    }
}

echo "<h3>Email Service Status:</h3>";
try {
    require_once 'config/email.php';
    $emailService = new EmailService();
    echo "<p>✓ Email service initialized successfully</p>";
} catch (Exception $e) {
    echo "<p>✗ Email service error: " . $e->getMessage() . "</p>";
}

echo "<hr><p><strong>Note:</strong> Remove this test file in production!</p>";
?>