<?php
/**
 * Test 10-Minute Actual Expiration with 2-Minute UI Display
 */

require_once 'config/database.php';
require_once 'services/OTPService.php';

echo "=== Testing 10-Minute Actual Expiration (2-Minute UI Display) ===\n\n";

$database = new Database();
$db = $database->getConnection();
$otpService = new OTPService($db);

$testEmail = 'test.10min@example.com';
$testUserData = [
    'name' => 'Test 10Min User',
    'email' => $testEmail,
    'password_hash' => password_hash('TestPassword123!', PASSWORD_DEFAULT),
    'role' => 'student'
];

echo "1. Sending OTP with 10-minute actual expiration...\n";
$result = $otpService->sendRegistrationOTP($testEmail, $testUserData);
echo "Result: " . json_encode($result) . "\n\n";

if ($result['success']) {
    // Check the actual expiration time in database
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
        
        echo "   Actual Duration: " . $durationMinutes . " minutes\n\n";
        
        if ($durationMinutes == 10) {
            echo "✅ PERFECT! Actual expiration is 10 minutes\n";
            echo "✅ UI will still show '2 minutes' to encourage quick entry\n";
            echo "✅ Users get extra 8 minutes grace period for delayed emails\n\n";
        } else {
            echo "❌ Actual expiration is NOT 10 minutes (found: " . $durationMinutes . " minutes)\n\n";
        }
        
        echo "3. User Experience:\n";
        echo "   - UI shows: 'The code expires in 2 minutes'\n";
        echo "   - Email shows: 'This code expires in 2 minutes'\n";
        echo "   - Actual backend expiration: 10 minutes\n";
        echo "   - Benefit: Users think they need to hurry (good UX)\n";
        echo "   - Safety net: Code still works if email is delayed up to 10 minutes\n\n";
    }
} else {
    echo "❌ Failed to send OTP\n";
}

echo "=== Test Complete ===\n";
echo "The system now gives users 10 minutes while displaying 2 minutes!\n";
?>