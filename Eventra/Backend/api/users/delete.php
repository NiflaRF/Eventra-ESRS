<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../models/User.php';
require_once '../../utils/JWTUtil.php';
require_once '../../services/ActivityLogger.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$token = JWTUtil::getTokenFromHeader();
$payload = JWTUtil::validateToken($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "Unauthorized"));
    exit();
}

if ($payload['role'] !== 'super-admin') {
    http_response_code(403);
    echo json_encode(array("success" => false, "message" => "Access denied. Only super-admin can delete users."));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    // Set user ID and read existing user to get email for logging
    $user->id = $data->id;
    if (!$user->readOne()) {
        http_response_code(404);
        echo json_encode(array("success" => false, "message" => "User not found"));
        exit();
    }
    
    $userEmail = $user->email; // Store email for logging before deletion
    
    if ($user->delete()) {
        $logger = new ActivityLogger();
        $logger->logUserDeleted($payload['user_id'], $userEmail, $_SERVER['REMOTE_ADDR'] ?? 'unknown');
        
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "User deleted successfully"
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Unable to delete user"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "User ID is required"));
}
?>