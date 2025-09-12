<?php
/**
 * Test script to check if OTP database changes were applied
 */

require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Check if email_verification_codes table exists
    $query = "SHOW TABLES LIKE 'email_verification_codes'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "✓ email_verification_codes table exists\n";
        
        // Check table structure
        $query = "DESCRIBE email_verification_codes";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        echo "\nTable structure:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
        }
        
    } else {
        echo "✗ email_verification_codes table does not exist\n";
        echo "Please run the database_updates_otp.sql script manually in phpMyAdmin\n";
    }
    
    // Check if users table has is_email_verified column
    $query = "SHOW COLUMNS FROM users LIKE 'is_email_verified'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "\n✓ users.is_email_verified column exists\n";
    } else {
        echo "\n✗ users.is_email_verified column does not exist\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>