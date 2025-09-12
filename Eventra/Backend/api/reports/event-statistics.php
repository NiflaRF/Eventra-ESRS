<?php
// Suppress all output and clean buffer
ob_start();
ini_set('display_errors', 0);
error_reporting(0);

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../models/EventPlan.php';
require_once '../../models/Booking.php';
require_once '../../models/Venue.php';
require_once '../../utils/JWTUtil.php';

// Clean all output
ob_end_clean();
ob_start();

header('Content-Type: application/json; charset=utf-8');

$database = new Database();
$db = $database->getConnection();

$token = JWTUtil::getTokenFromHeader();
$payload = JWTUtil::validateToken($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "Unauthorized"));
    exit();
}

// Allow multiple admin roles to access reports
$allowedRoles = ['super-admin', 'administration', 'vice-chancellor'];
if (!in_array($payload['role'], $allowedRoles)) {
    http_response_code(403);
    echo json_encode(array("success" => false, "message" => "Access denied. Admin privileges required to access reports."));
    exit();
}

$startDate = $_GET['start_date'] ?? date('Y-m-01'); // Default to first day of current month
$endDate = $_GET['end_date'] ?? date('Y-m-t'); // Default to last day of current month
$eventType = $_GET['event_type'] ?? null;
$venueId = $_GET['venue_id'] ?? null;

try {
    $response = array();
    
    $overallStats = array();
    
    // Count total events
    $query = "SELECT COUNT(*) as total FROM event_plans WHERE DATE(created_at) BETWEEN ? AND ?";
    $params = [$startDate, $endDate];
    
    if ($eventType && $eventType !== 'all') {
        $query .= " AND type = ?";
        $params[] = $eventType;
    }
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $overallStats['total_events'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Count total bookings
    $query = "SELECT COUNT(*) as total FROM bookings WHERE DATE(created_at) BETWEEN ? AND ?";
    $params = [$startDate, $endDate];
    
    if ($venueId && $venueId !== 'all') {
        $query .= " AND venue_id = ?";
        $params[] = $venueId;
    }
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $overallStats['total_bookings'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Sum total participants
    $query = "SELECT SUM(participants) as total FROM event_plans WHERE DATE(created_at) BETWEEN ? AND ?";
    $params = [$startDate, $endDate];
    
    if ($eventType && $eventType !== 'all') {
        $query .= " AND type = ?";
        $params[] = $eventType;
    }
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $overallStats['total_participants'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
    
    // Calculate average participants
    $overallStats['avg_participants'] = $overallStats['total_events'] > 0 ? 
        round($overallStats['total_participants'] / $overallStats['total_events'], 1) : 0;
    
    // Status distribution
    $statusQuery = "SELECT status, COUNT(*) as count FROM event_plans WHERE DATE(created_at) BETWEEN ? AND ?";
    $params = [$startDate, $endDate];
    
    if ($eventType && $eventType !== 'all') {
        $statusQuery .= " AND type = ?";
        $params[] = $eventType;
    }
    
    $statusQuery .= " GROUP BY status";
    $stmt = $db->prepare($statusQuery);
    $stmt->execute($params);
    $overallStats['status_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Type distribution
    $typeQuery = "SELECT type as event_type, COUNT(*) as count FROM event_plans WHERE DATE(created_at) BETWEEN ? AND ?";
    $params = [$startDate, $endDate];
    
    if ($eventType && $eventType !== 'all') {
        $typeQuery .= " AND type = ?";
        $params[] = $eventType;
    }
    
    $typeQuery .= " GROUP BY type";
    $stmt = $db->prepare($typeQuery);
    $stmt->execute($params);
    $overallStats['type_distribution'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Monthly trend analysis
    $trendQuery = "
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as event_count,
            SUM(participants) as total_participants
        FROM event_plans 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ";
    
    $stmt = $db->prepare($trendQuery);
    $stmt->execute();
    $overallStats['monthly_trend'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Top events by participants
    $topEventsQuery = "
        SELECT 
            title,
            type as event_type,
            participants as expected_participants,
            status,
            created_at
        FROM event_plans 
        WHERE DATE(created_at) BETWEEN ? AND ?
        ORDER BY participants DESC
        LIMIT 10
    ";
    
    $params = [$startDate, $endDate];
    $stmt = $db->prepare($topEventsQuery);
    $stmt->execute($params);
    $overallStats['top_events'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Approval statistics
    $approvalQuery = "
        SELECT 
            status,
            COUNT(*) as count
        FROM event_plans 
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY status
    ";
    
    $stmt = $db->prepare($approvalQuery);
    $stmt->execute([$startDate, $endDate]);
    $overallStats['approval_stats'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response = array(
        "success" => true,
        "data" => $overallStats,
        "filters" => array(
            "start_date" => $startDate,
            "end_date" => $endDate,
            "event_type" => $eventType,
            "venue_id" => $venueId
        )
    );
    
    http_response_code(200);
    ob_clean(); // Clean any remaining output
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    ob_end_flush();
    exit();
    
} catch (Exception $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode(array(
        "success" => false,
        "message" => "Error generating statistics: " . $e->getMessage()
    ), JSON_UNESCAPED_UNICODE);
    ob_end_flush();
    exit();
}
?>