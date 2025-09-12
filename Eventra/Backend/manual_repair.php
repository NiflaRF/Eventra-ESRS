<?php
require_once 'config/database.php';

// Connect to database
$database = new Database();
$db = $database->getConnection();

function fixCorruptedJson($data) {
    // Remove surrounding quotes if they exist
    $data = trim($data, '"');
    
    // Unescape escaped quotes
    $data = str_replace('\\"', '"', $data);
    $data = str_replace('\\\\', '\\', $data);
    
    // Try to decode
    $decoded = json_decode($data, true);
    
    if ($decoded !== null && is_array($decoded)) {
        return $decoded;
    }
    
    // If still not working, try to extract the array manually
    if (preg_match('/\[(.*)\]/', $data, $matches)) {
        $content = $matches[1];
        // Split by comma but respect quoted strings
        $items = [];
        $parts = explode('","', $content);
        foreach ($parts as $part) {
            $item = trim($part, '"');
            if (!empty($item)) {
                $items[] = $item;
            }
        }
        return $items;
    }
    
    return null;
}

try {
    // Get specific corrupted records
    $corruptedIds = [51, 52, 53, 54, 55, 56, 57];
    
    $repaired = 0;
    
    foreach ($corruptedIds as $id) {
        $query = "SELECT id, title, facilities FROM event_plans WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            echo "Fixing Event Plan ID: {$row['id']} ({$row['title']})\n";
            echo "Original: {$row['facilities']}\n";
            
            $fixed = fixCorruptedJson($row['facilities']);
            
            if ($fixed !== null) {
                $newFacilities = json_encode($fixed);
                
                $updateQuery = "UPDATE event_plans SET facilities = ? WHERE id = ?";
                $updateStmt = $db->prepare($updateQuery);
                
                if ($updateStmt->execute([$newFacilities, $id])) {
                    echo "FIXED: $newFacilities\n";
                    echo "Facilities: " . implode(', ', $fixed) . "\n";
                    $repaired++;
                } else {
                    echo "ERROR: Could not update record\n";
                }
            } else {
                echo "ERROR: Could not parse facilities\n";
            }
            echo "---\n";
        }
    }
    
    echo "\nSUMMARY: Repaired $repaired records\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>