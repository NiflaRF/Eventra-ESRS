<?php
// Suppress all output and clean buffer
ob_start();
ini_set('display_errors', 0);
error_reporting(0);

require_once '../} catch (Exception $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode(array(
        "success" => false,
        "message" => "Error generating event reports: " . $e->getMessage()
    ), JSON_UNESCAPED_UNICODE);
    ob_end_flush();
    exit();
}cors.php';
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

$startDate = $_GET['start_date'] ?? date('Y-m-01');
$endDate = $_GET['end_date'] ?? date('Y-m-t');
$eventType = $_GET['event_type'] ?? null;
$venueId = $_GET['venue_id'] ?? null;
$status = $_GET['status'] ?? null;
$limit = $_GET['limit'] ?? 50;
$offset = $_GET['offset'] ?? 0;

try {
    // Build the query for event reports
    $query = "
        SELECT 
            ep.id,
            ep.title,
            ep.type as event_type,
            ep.organizer,
            ep.date,
            ep.time,
            ep.participants,
            ep.status,
            ep.created_at,
            u.name as created_by
        FROM event_plans ep
        LEFT JOIN users u ON ep.user_id = u.id
        WHERE DATE(ep.created_at) BETWEEN ? AND ?
    ";
    
    $params = [$startDate, $endDate];
    
    if ($eventType && $eventType !== 'all') {
        $query .= " AND ep.type = ?";
        $params[] = $eventType;
    }
    
    if ($status && $status !== 'all') {
        $query .= " AND ep.status = ?";
        $params[] = $status;
    }
    
    $query .= " ORDER BY ep.created_at DESC LIMIT ? OFFSET ?";
    $params[] = (int)$limit;
    $params[] = (int)$offset;
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count for pagination
    $countQuery = "
        SELECT COUNT(*) as total
        FROM event_plans ep
        WHERE DATE(ep.created_at) BETWEEN ? AND ?
    ";
    
    $countParams = [$startDate, $endDate];
    
    if ($eventType && $eventType !== 'all') {
        $countQuery .= " AND ep.type = ?";
        $countParams[] = $eventType;
    }
    
    if ($status && $status !== 'all') {
        $countQuery .= " AND ep.status = ?";
        $countParams[] = $status;
    }
    
    $stmt = $db->prepare($countQuery);
    $stmt->execute($countParams);
    $totalCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $response = array(
        "success" => true,
        "data" => array(
            "events" => $events,
            "total_count" => (int)$totalCount,
            "limit" => (int)$limit,
            "offset" => (int)$offset
        ),
        "filters" => array(
            "start_date" => $startDate,
            "end_date" => $endDate,
            "event_type" => $eventType,
            "venue_id" => $venueId,
            "status" => $status
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