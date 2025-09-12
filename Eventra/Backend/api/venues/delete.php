<?php
/**
 * Delete Venue API Endpoint
 * Eventra ESRS Backend
 */

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../models/Venue.php';
require_once '../../utils/JWTUtil.php';

$database = new Database();
$db = $database->getConnection();

$venue = new Venue($db);

// Verify authentication and authorization
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "Access denied. No token provided."
    ));
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$decoded_data = JWTUtil::validateToken($token);

if (!$decoded_data) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "Access denied. Invalid token."
    ));
    exit;
}

// Check if user is admin
if ($decoded_data['role'] !== 'super-admin') {
    http_response_code(403);
    echo json_encode(array(
        "success" => false,
        "message" => "Access denied. Admin privileges required."
    ));
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    
    $venue->id = $data->id;
    
    // Check if venue exists
    if ($venue->readOne()) {
        
        // Check if venue has any bookings
        $check_query = "SELECT COUNT(*) as count FROM bookings WHERE venue_id = ? AND status != 'cancelled'";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(1, $venue->id);
        $check_stmt->execute();
        $result = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] > 0) {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "Cannot delete venue. It has active bookings."
            ));
            exit;
        }
        
        if($venue->delete()) {
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Venue deleted successfully"
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to delete venue."
            ));
        }
        
    } else {
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "Venue not found."
        ));
    }
    
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Unable to delete venue. ID is required."
    ));
}
?> 