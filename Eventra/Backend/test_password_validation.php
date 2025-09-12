<?php
/**
 * Test Password Validation Implementation
 */

require_once 'utils/PasswordResetUtil.php';

echo "=== Testing Password Validation Rules ===\n";

$testPasswords = [
    'weak' => 'Test weak password',
    'abc123' => 'Test short password without uppercase/special',
    'ABC123' => 'Test without lowercase/special characters',
    'abcDEF' => 'Test without numbers/special characters',
    'abc123!' => 'Test without uppercase letter',
    'ABC123!' => 'Test without lowercase letter',
    'abcDEF!' => 'Test without numbers',
    'Password123' => 'Test without special character',
    'Password123!' => 'Test strong password - should pass'
];

foreach ($testPasswords as $password => $description) {
    echo "\n$description: '$password'\n";
    $result = PasswordResetUtil::validatePassword($password);
    
    if ($result['success']) {
        echo "✅ PASS: " . $result['message'] . "\n";
    } else {
        echo "❌ FAIL: " . $result['message'] . "\n";
    }
}

echo "\n=== Testing Backend API Response ===\n";

// Test the actual API endpoint
$testData = [
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => 'weak',
    'role' => 'student'
];

echo "Testing weak password 'weak' via API...\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/Eventra-ESRS/Eventra/Backend/api/auth/register.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
echo "Response: $response\n";

// Test strong password
$testData['password'] = 'Password123!';
echo "\nTesting strong password 'Password123!' via API...\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost/Eventra-ESRS/Eventra/Backend/api/auth/register.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
echo "Response: $response\n";

?>