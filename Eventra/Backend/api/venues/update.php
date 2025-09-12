<?php
/**
 * Update Venue API Endpoint
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

if(!empty($data->id) && !empty($data->name) && !empty($data->capacity) && !empty($data->location) && !empty($data->type)) {
    
    $venue->id = $data->id;
    $venue->name = $data->name;
    $venue->capacity = $data->capacity;
    $venue->location = $data->location;
    $venue->type = $data->type;
    $venue->availability = $data->availability ?? 'Available';
    $venue->restrictions = $data->restrictions ?? '';
    
    // Handle images
    if (isset($data->images) && is_array($data->images)) {
        $venue->images = json_encode($data->images);
    } else {
        $venue->images = json_encode([]);
    }
    
    if($venue->update()) {
        
        $venue->readOne();
        
        $venue_item = array(
            "id" => $venue->id,
            "name" => $venue->name,
            "capacity" => $venue->capacity,
            "location" => $venue->location,
            "type" => $venue->type,
            "availability" => $venue->availability,
            "restrictions" => $venue->restrictions,
            "images" => json_decode($venue->images, true),
            "created_at" => $venue->created_at,
            "updated_at" => $venue->updated_at
        );
        
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Venue updated successfully",
            "venue" => $venue_item
        ));
        
    } else {
        http_response_code(503);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to update venue."
        ));
    }
    
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Unable to update venue. Data is incomplete."
    ));
}
?> 