<?php
/**
 * Test OTP Expiration and Resend Functionality
 */

require_once 'config/database.php';
require_once 'services/OTPService.php';

echo "=== Testing OTP 2-Minute Expiration and Resend ===\n\n";

$database = new Database();
$db = $database->getConnection();
$otpService = new OTPService($db);

$testEmail = 'test.resend@example.com';
$testUserData = [
    'name' => 'Test Resend User',
    'email' => $testEmail,
    'password_hash' => password_hash('TestPassword123!', PASSWORD_DEFAULT),
    'role' => 'student'
];

echo "1. Sending initial OTP...\n";
$result = $otpService->sendRegistrationOTP($testEmail, $testUserData);
echo "Result: " . json_encode($result) . "\n\n";

if ($result['success']) {
    // Check the expiration time in database
    $query = "SELECT verification_code, expires_at, created_at FROM email_verification_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute([$testEmail]);
    $record = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($record) {
        echo "2. OTP Details:\n";
        echo "   Code: " . $record['verification_code'] . "\n";
        echo "   Created: " . $record['created_at'] . "\n";
        echo "   Expires: " . $record['expires_at'] . "\n";
        
        $expiresTime = strtotime($record['expires_at']);
        $createdTime = strtotime($record['created_at']);
        $durationMinutes = ($expiresTime - $createdTime) / 60;
        
        echo "   Duration: " . $durationMinutes . " minutes\n\n";
        
        if ($durationMinutes == 2) {
            echo "✅ OTP expiration set correctly to 2 minutes\n\n";
        } else {
            echo "❌ OTP expiration is NOT 2 minutes (actual: " . $durationMinutes . " minutes)\n\n";
        }
        
        // Test immediate resend (should fail due to cooldown)
        echo "3. Testing immediate resend (should fail)...\n";
        $resendResult = $otpService->resendOTP($testEmail);
        echo "Result: " . json_encode($resendResult) . "\n\n";
        
        // Wait for cooldown and test resend
        echo "4. Waiting 61 seconds for cooldown...\n";
        echo "   (In real testing, wait and then test resend)\n\n";
        
        echo "5. To manually test resend functionality:\n";
        echo "   - Wait 61 seconds after initial OTP\n";
        echo "   - Call resendOTP API or function\n";
        echo "   - Verify new OTP code is generated\n";
        echo "   - Verify new expiration time is 2 minutes from resend time\n\n";
        
        echo "6. To test expiration:\n";
        echo "   - Wait 2+ minutes after OTP generation\n";
        echo "   - Try to verify with the OTP code\n";
        echo "   - Should get 'Invalid or expired verification code' error\n\n";
    }
} else {
    echo "❌ Failed to send initial OTP\n";
}

echo "=== Test Complete ===\n";
echo "You can now test the frontend resend button functionality!\n";
?>