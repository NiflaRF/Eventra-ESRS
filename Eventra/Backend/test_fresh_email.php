<?php
/**
 * Test Fresh OTP Email with Updated Template
 */

require_once 'config/database.php';
require_once 'services/OTPService.php';

$database = new Database();
$db = $database->getConnection();
$otpService = new OTPService($db);

$testEmail = 'fresh.test@example.com';
$testUserData = [
    'name' => 'Fresh Test User',
    'email' => $testEmail,
    'password_hash' => password_hash('TestPassword123!', PASSWORD_DEFAULT),
    'role' => 'student'
];

echo "Sending fresh OTP with updated template..." . PHP_EOL;
$result = $otpService->sendRegistrationOTP($testEmail, $testUserData);
echo "Result: " . json_encode($result) . PHP_EOL;

if ($result['success']) {
    echo "✅ Fresh OTP sent! The email template should now show '2 minutes'" . PHP_EOL;
    echo "Check your email logs or inbox for the updated template." . PHP_EOL;
} else {
    echo "❌ Failed to send OTP: " . $result['message'] . PHP_EOL;
}
?>