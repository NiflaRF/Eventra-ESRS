<?php
require_once 'config/database.php';

// Connect to database
$database = new Database();
$db = $database->getConnection();

function recursivelyDecode($data) {
    $attempts = 0;
    $maxAttempts = 10; // Prevent infinite loops
    
    while ($attempts < $maxAttempts) {
        $decoded = json_decode($data, true);
        
        if ($decoded === null) {
            // If it's not valid JSON, return the original data
            return $data;
        }
        
        // If the result is a string that looks like JSON, try again
        if (is_string($decoded) && (substr($decoded, 0, 1) === '[' || substr($decoded, 0, 1) === '{')) {
            $data = $decoded;
            $attempts++;
        } else {
            // We got a proper array/object, return it
            return $decoded;
        }
    }
    
    return $data; // Return whatever we have after max attempts
}

try {
    // Get all event plans with potentially corrupted data
    $query = "SELECT id, title, facilities FROM event_plans WHERE facilities IS NOT NULL AND facilities != ''";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $repaired = 0;
    $corrupted = 0;
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $id = $row['id'];
        $title = $row['title'];
        $facilities = $row['facilities'];
        
        echo "Processing Event Plan ID: $id ($title)\n";
        
        // Try to recursively decode the facilities
        $decoded = recursivelyDecode($facilities);
        
        // Check if we successfully got an array
        if (is_array($decoded)) {
            // Re-encode properly
            $fixed_facilities = json_encode($decoded);
            
            // Only update if the data actually changed
            if ($fixed_facilities !== $facilities) {
                $update_query = "UPDATE event_plans SET facilities = ? WHERE id = ?";
                $update_stmt = $db->prepare($update_query);
                if ($update_stmt->execute([$fixed_facilities, $id])) {
                    echo "REPAIRED: Plan $id\n";
                    echo "Old length: " . strlen($facilities) . " chars\n";
                    echo "New length: " . strlen($fixed_facilities) . " chars\n";
                    echo "Decoded facilities: " . print_r($decoded, true) . "\n";
                    $repaired++;
                } else {
                    echo "ERROR: Failed to update plan $id\n";
                    $corrupted++;
                }
            } else {
                echo "OK: Plan $id is already properly formatted\n";
            }
        } else {
            echo "ERROR: Could not decode facilities for plan $id\n";
            echo "Final decoded value: " . print_r($decoded, true) . "\n";
            $corrupted++;
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