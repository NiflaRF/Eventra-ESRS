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
    echo json_encode(array("success" => false, "message" => "Access denied. Only super-admin can update users."));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    // Set user ID and read existing user
    $user->id = $data->id;
    if (!$user->readOne()) {
        http_response_code(404);
        echo json_encode(array("success" => false, "message" => "User not found"));
        exit();
    }
    
    // Update user properties if provided
    if (isset($data->name)) $user->name = $data->name;
    if (isset($data->email)) {
        // Check if email already exists (for other users)
        $tempUser = new User($db);
        $tempUser->email = $data->email;
        if ($tempUser->readByEmail() && $tempUser->id != $user->id) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Email already exists"));
            exit();
        }
        $user->email = $data->email;
    }
    if (isset($data->role)) $user->role = $data->role;
    if (isset($data->status)) $user->status = $data->status;
    if (isset($data->department)) $user->department = $data->department;
    if (isset($data->faculty)) $user->faculty = $data->faculty;
    if (isset($data->designation)) $user->designation = $data->designation;
    if (isset($data->bio)) $user->bio = $data->bio;
    if (isset($data->event_interests)) $user->event_interests = $data->event_interests;
    if (isset($data->service_type)) $user->service_type = $data->service_type;
    
    if ($user->update()) {
        $logger = new ActivityLogger();
        $logger->logUserUpdated($payload['user_id'], $user->id, $user->email, $_SERVER['REMOTE_ADDR'] ?? 'unknown');
        
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "User updated successfully",
            "user" => array(
                "id" => $user->id,
                "name" => $user->name,
                "email" => $user->email,
                "role" => $user->role,
                "status" => $user->status,
                "department" => $user->department,
                "faculty" => $user->faculty,
                "designation" => $user->designation,
                "bio" => $user->bio,
                "event_interests" => $user->event_interests,
                "service_type" => $user->service_type
            )
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Unable to update user"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "User ID is required"));
}
?>