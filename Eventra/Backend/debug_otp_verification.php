<?php
/**
 * Debug OTP Verification - Test specific OTP verification
 */

require_once 'config/database.php';
require_once 'services/OTPService.php';

$database = new Database();
$db = $database->getConnection();

$testEmail = 'test@example.com';
$testOTP = '915549'; // Use the OTP from the previous test

echo "<h1>OTP Verification Debug</h1>";

// Check what's in the database
$query = "SELECT * FROM email_verification_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bindParam(1, $testEmail);
$stmt->execute();

$record = $stmt->fetch(PDO::FETCH_ASSOC);

echo "<h3>Database Record:</h3>";
echo "<pre>" . print_r($record, true) . "</pre>";

if ($record) {
    echo "<h3>Verification Details:</h3>";
    echo "<p>Email: " . $record['email'] . "</p>";
    echo "<p>Code in DB: " . $record['verification_code'] . "</p>";
    echo "<p>Test Code: " . $testOTP . "</p>";
    echo "<p>Codes Match: " . ($record['verification_code'] === $testOTP ? 'YES' : 'NO') . "</p>";
    echo "<p>Expires At: " . $record['expires_at'] . "</p>";
    echo "<p>Current Time: " . date('Y-m-d H:i:s') . "</p>";
    echo "<p>Is Expired: " . (strtotime($record['expires_at']) < time() ? 'YES' : 'NO') . "</p>";
    echo "<p>Verified At: " . ($record['verified_at'] ? $record['verified_at'] : 'NULL') . "</p>";
    echo "<p>Attempts: " . $record['attempts'] . "</p>";
    echo "<p>Max Attempts: " . $record['max_attempts'] . "</p>";
    
    // Test the exact query used in verification
    echo "<h3>Testing Verification Query:</h3>";
    $verifyQuery = "SELECT * FROM email_verification_codes 
                   WHERE email = :email 
                   AND verification_code = :otp 
                   AND expires_at > NOW() 
                   AND verified_at IS NULL 
                   AND attempts < max_attempts
                   ORDER BY created_at DESC 
                   LIMIT 1";
    
    $verifyStmt = $db->prepare($verifyQuery);
    $verifyStmt->bindParam(':email', $testEmail);
    $verifyStmt->bindParam(':otp', $testOTP);
    $verifyStmt->execute();
    
    $verifyResult = $verifyStmt->fetch(PDO::FETCH_ASSOC);
    
    echo "<p>Query Result: " . ($verifyResult ? 'FOUND' : 'NOT FOUND') . "</p>";
    
    if ($verifyResult) {
        echo "<h3>✓ Query found the record - verification should work</h3>";
    } else {
        echo "<h3>✗ Query did not find the record - checking why...</h3>";
        
        // Check each condition separately
        $conditions = [
            "email = '$testEmail'" => "SELECT COUNT(*) as count FROM email_verification_codes WHERE email = '$testEmail'",
            "verification_code = '$testOTP'" => "SELECT COUNT(*) as count FROM email_verification_codes WHERE email = '$testEmail' AND verification_code = '$testOTP'",
            "expires_at > NOW()" => "SELECT COUNT(*) as count FROM email_verification_codes WHERE email = '$testEmail' AND expires_at > NOW()",
            "verified_at IS NULL" => "SELECT COUNT(*) as count FROM email_verification_codes WHERE email = '$testEmail' AND verified_at IS NULL",
            "attempts < max_attempts" => "SELECT COUNT(*) as count FROM email_verification_codes WHERE email = '$testEmail' AND attempts < max_attempts"
        ];
        
        foreach ($conditions as $condition => $query) {
            $stmt = $db->prepare($query);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "<p>$condition: " . ($result['count'] > 0 ? '✓ PASS' : '✗ FAIL') . " (count: {$result['count']})</p>";
        }
    }
}
?>