<?php
require_once 'config/database.php';

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Manual mapping for the known corrupted records based on what they should be
$knownFacilities = [
    51 => ['Microphone', 'Lighting System', 'Air Conditioning', 'Whiteboard'],
    52 => ['Microphone', 'Lighting System', 'Air Conditioning'],
    53 => ['Microphone', 'Lighting System', 'Air Conditioning'],
    54 => ['Microphone', 'Lighting System', 'Air Conditioning'],
    55 => ['Projector', 'Stage Setup', 'Wi-Fi'],
    56 => ['Microphone', 'Lighting System', 'Air Conditioning'],
    57 => ['Microphone', 'Lighting System', 'Air Conditioning']
];

try {
    $repaired = 0;
    
    foreach ($knownFacilities as $id => $facilities) {
        $newFacilities = json_encode($facilities);
        
        $updateQuery = "UPDATE event_plans SET facilities = ? WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        
        if ($updateStmt->execute([$newFacilities, $id])) {
            echo "REPAIRED Event Plan ID: $id\n";
            echo "Facilities: " . implode(', ', $facilities) . "\n";
            echo "JSON: $newFacilities\n";
            $repaired++;
        } else {
            echo "ERROR: Could not update Event Plan ID: $id\n";
        }
        echo "---\n";
    }
    
    echo "\nSUMMARY: Successfully repaired $repaired records\n";
    
    // Verify the repairs
    echo "\nVERIFICATION:\n";
    foreach ($knownFacilities as $id => $expectedFacilities) {
        $query = "SELECT id, title, facilities FROM event_plans WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $decodedFacilities = json_decode($row['facilities'], true);
            echo "ID $id ({$row['title']}): ";
            if (is_array($decodedFacilities)) {
                echo implode(', ', $decodedFacilities) . " ✓\n";
            } else {
                echo "STILL CORRUPTED ✗\n";
            }
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>