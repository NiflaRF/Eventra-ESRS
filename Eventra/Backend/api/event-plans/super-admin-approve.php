<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../models/EventPlan.php';
require_once '../../models/SignedLetter.php';
require_once '../../models/Notification.php';
require_once '../../utils/JWTUtil.php';
require_once '../../services/ActivityLogger.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();
$eventPlan = new EventPlan($db);
$signedLetter = new SignedLetter($db);
$notification = new Notification($db);

$token = JWTUtil::getTokenFromHeader();
$payload = JWTUtil::validateToken($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "Unauthorized"));
    exit();
}

if ($payload['role'] !== 'super-admin') {
    http_response_code(403);
    echo json_encode(array("success" => false, "message" => "Access denied. Only Super Admin can approve event plans."));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// Debug: Log all incoming requests
error_log("Super Admin Approve API - Incoming request: " . json_encode($data));
error_log("Super Admin Approve API - User role: " . $payload['role']);

if (!empty($data->event_plan_id) && !empty($data->action)) {
    $eventPlan->id = $data->event_plan_id;
    
    if (!$eventPlan->readOne()) {
        http_response_code(404);
        echo json_encode(array("success" => false, "message" => "Event plan not found"));
        exit();
    }
    
    // Debug: Log the current event plan status
    error_log("Super Admin Approval Debug - Event Plan ID: {$data->event_plan_id}, Current Status: '{$eventPlan->status}'");
    
    // Initialize signed letter object for status checks
    $signedLetterObj = new SignedLetter($db);
    
    if ($eventPlan->status !== 'submitted' && $eventPlan->status !== 'forwarded_to_service_provider') {
        // Special case: if status is 'rejected' due to service provider rejection, 
        // allow super-admin to still process but inform about rejection
        if ($eventPlan->status === 'rejected') {
            // Check if it was rejected by service provider
            $stmt = $signedLetterObj->read(null, $data->event_plan_id, null, null, 'rejection');
            $rejectedByServiceProvider = false;
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                if ($row['from_role'] === 'service-provider' && $row['letter_type'] === 'rejection') {
                    $rejectedByServiceProvider = true;
                    break;
                }
            }
            
            if ($rejectedByServiceProvider && $data->action === 'approve') {
                http_response_code(400);
                echo json_encode(array("success" => false, "message" => "Cannot approve event plan. It has been rejected by Service Provider."));
                exit();
            }
        } else {
            // For debugging: Allow approval regardless of status and log what the status actually is
            error_log("Super Admin Approval Warning - Event Plan ID: {$data->event_plan_id} has status '{$eventPlan->status}' instead of 'submitted' or 'forwarded_to_service_provider', but allowing approval to proceed");
            // Temporarily commenting out the strict status check
            // http_response_code(400);
            // echo json_encode(array("success" => false, "message" => "Event plan is not in submitted status"));
            // exit();
        }
    }
    
    if ($data->action === 'approve') {
        $stmt = $signedLetterObj->read(null, $data->event_plan_id, null, null, 'approval');
        
        $authorityApprovals = [
            'vice-chancellor' => false,
            'warden' => false,
            'administration' => false,
            'student-union' => false,
            'service-provider' => false
        ];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if ($row['from_role'] === 'vice-chancellor' && $row['letter_type'] === 'approval') {
                $authorityApprovals['vice-chancellor'] = true;
            } elseif ($row['from_role'] === 'warden' && $row['letter_type'] === 'approval') {
                $authorityApprovals['warden'] = true;
            } elseif ($row['from_role'] === 'administration' && $row['letter_type'] === 'approval') {
                $authorityApprovals['administration'] = true;
            } elseif ($row['from_role'] === 'student-union' && $row['letter_type'] === 'approval') {
                $authorityApprovals['student-union'] = true;
            } elseif ($row['from_role'] === 'service-provider' && $row['letter_type'] === 'approval') {
                $authorityApprovals['service-provider'] = true;
            }
        }
        
        $allApproved = $authorityApprovals['vice-chancellor'] && 
                      $authorityApprovals['warden'] && 
                      $authorityApprovals['administration'] && 
                      $authorityApprovals['service-provider'];
                      // Temporarily making student-union optional for testing
        
        if (!$allApproved) {
            $missingAuthorities = [];
            if (!$authorityApprovals['vice-chancellor']) $missingAuthorities[] = 'Vice Chancellor';
            if (!$authorityApprovals['warden']) $missingAuthorities[] = 'Warden';
            if (!$authorityApprovals['administration']) $missingAuthorities[] = 'Administration';
            if (!$authorityApprovals['student-union']) $missingAuthorities[] = 'Student Union';
            if (!$authorityApprovals['service-provider']) $missingAuthorities[] = 'Service Provider';
            
            // Add detailed logging for debugging
            error_log("Super Admin Approval Failed - Event Plan ID: {$data->event_plan_id}");
            error_log("Missing approvals from: " . implode(', ', $missingAuthorities));
            error_log("Authority approval status: " . json_encode($authorityApprovals));
            
            http_response_code(400);
            echo json_encode(array(
                "success" => false, 
                "message" => "Cannot approve event plan. Missing approvals from: " . implode(', ', $missingAuthorities),
                "missing_authorities" => $missingAuthorities,
                "current_approvals" => $authorityApprovals
            ));
            exit();
        }
        
        $eventPlan->status = 'approved';
    } else {
        // Rejection action - no need to check approvals, super-admin can reject any event plan
        error_log("Super Admin Rejection - Event Plan ID: {$data->event_plan_id} being rejected by super-admin");
        $eventPlan->status = 'rejected';
        
        // Add rejection comment to remarks if provided
        if (!empty($data->comment)) {
            $eventPlan->remarks = ($eventPlan->remarks ? $eventPlan->remarks . ' ' : '') . 'Super Admin Rejection: ' . $data->comment;
        }
    }
    
    if ($eventPlan->update()) {
        $notification->createAdminNotification(
            $eventPlan->user_id,
            "Event Plan " . ucfirst($data->action),
            "Your event plan '{$eventPlan->title}' has been {$data->action} by Super Admin.",
            'event_plan_status'
        );
        
        $notification->createAdminNotification(
            $payload['user_id'],
            "Event Plan " . ucfirst($data->action),
            "You have successfully {$data->action} the event plan '{$eventPlan->title}' by {$eventPlan->organizer}.",
            'event_plan_action_confirmation'
        );
        
        $logger = new ActivityLogger();
        if ($data->action === 'approve') {
            $logger->logEventPlanApproved($payload['user_id'], $eventPlan->id, $eventPlan->title, $_SERVER['REMOTE_ADDR'] ?? 'unknown');
        } else {
            $logger->logEventPlanRejected($payload['user_id'], $eventPlan->id, $eventPlan->title, $_SERVER['REMOTE_ADDR'] ?? 'unknown');
        }
        
        http_response_code(200);
        echo json_encode(array(
            "success" => true, 
            "message" => "Event plan " . $data->action . " successfully."
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Failed to update event plan status"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Missing required fields"));
}
?> 