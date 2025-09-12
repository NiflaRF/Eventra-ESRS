<?php
require_once 'config/database.php';

// Connect to database
$database = new Database();
$db = $database->getConnection();

try {
    // Get all event plans
    $query = "SELECT id, title, facilities FROM event_plans WHERE facilities IS NOT NULL";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $repaired = 0;
    $corrupted = 0;
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $id = $row['id'];
        $title = $row['title'];
        $facilities = $row['facilities'];
        
        echo "Checking Event Plan ID: $id ($title)\n";
        echo "Raw facilities: $facilities\n";
        
        // Try to decode the facilities
        $decoded = json_decode($facilities, true);
        
        if ($decoded === null && $facilities !== null && $facilities !== '') {
            echo "ERROR: Invalid JSON for plan $id\n";
            $corrupted++;
            continue;
        }
        
        // Check if it's double-encoded (decoded result is a string that looks like JSON)
        if (is_string($decoded) && (substr($decoded, 0, 1) === '[' || substr($decoded, 0, 1) === '{')) {
            echo "FOUND DOUBLE-ENCODED: Plan $id has double-encoded facilities\n";
            echo "Double-encoded value: $decoded\n";
            
            // Try to decode again
            $properly_decoded = json_decode($decoded, true);
            if ($properly_decoded !== null) {
                // Re-encode properly
                $fixed_facilities = json_encode($properly_decoded);
                
                // Update the database
                $update_query = "UPDATE event_plans SET facilities = ? WHERE id = ?";
                $update_stmt = $db->prepare($update_query);
                if ($update_stmt->execute([$fixed_facilities, $id])) {
                    echo "REPAIRED: Plan $id facilities fixed\n";
                    echo "Old: $facilities\n";
                    echo "New: $fixed_facilities\n";
                    $repaired++;
                } else {
                    echo "ERROR: Failed to update plan $id\n";
                }
            } else {
                echo "ERROR: Could not decode double-encoded facilities for plan $id\n";
                $corrupted++;
            }
        } else {
            echo "OK: Plan $id facilities are properly encoded\n";
        }
        
        echo "---\n";
    }
    
    echo "\nSUMMARY:\n";
    echo "Repaired: $repaired records\n";
    echo "Corrupted (could not fix): $corrupted records\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>