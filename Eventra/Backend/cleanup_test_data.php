<?php
/**
 * Clean up test data
 */

require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

// Clean up test data
$email = 'test@example.com';

echo "<h1>Cleaning up test data</h1>";

// Delete from users table
$stmt = $db->prepare("DELETE FROM users WHERE email = ?");
$stmt->bindParam(1, $email);
if ($stmt->execute()) {
    echo "<p>✓ Deleted user records for $email</p>";
}

// Delete from email_verification_codes table
$stmt = $db->prepare("DELETE FROM email_verification_codes WHERE email = ?");
$stmt->bindParam(1, $email);
if ($stmt->execute()) {
    echo "<p>✓ Deleted OTP records for $email</p>";
}

echo "<p>Test data cleaned up successfully!</p>";
?>