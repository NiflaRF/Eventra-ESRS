<?php
/**
 * Debug timezone issues
 */

echo "<h1>Timezone Debug</h1>";

echo "<h3>PHP Time Settings:</h3>";
echo "<p>Default timezone: " . date_default_timezone_get() . "</p>";
echo "<p>PHP time(): " . date('Y-m-d H:i:s', time()) . "</p>";

echo "<h3>MySQL Time Settings:</h3>";
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();

$stmt = $db->query("SELECT NOW() as mysql_now, UTC_TIMESTAMP() as mysql_utc");
$result = $stmt->fetch(PDO::FETCH_ASSOC);
echo "<p>MySQL NOW(): " . $result['mysql_now'] . "</p>";
echo "<p>MySQL UTC_TIMESTAMP(): " . $result['mysql_utc'] . "</p>";

echo "<h3>Test OTP Record:</h3>";
$stmt = $db->query("SELECT expires_at, created_at FROM email_verification_codes WHERE email = 'test@example.com' ORDER BY created_at DESC LIMIT 1");
$record = $stmt->fetch(PDO::FETCH_ASSOC);
if ($record) {
    echo "<p>Record expires_at: " . $record['expires_at'] . "</p>";
    echo "<p>Record created_at: " . $record['created_at'] . "</p>";
    
    // Test comparison
    $stmt = $db->query("SELECT (expires_at > NOW()) as is_valid FROM email_verification_codes WHERE email = 'test@example.com' ORDER BY created_at DESC LIMIT 1");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Is expires_at > NOW(): " . ($result['is_valid'] ? 'TRUE' : 'FALSE') . "</p>";
}
?>