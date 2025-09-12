<?php
// Test the actual send-signed-letters.php endpoint
echo "🧪 Testing the actual send-signed-letters.php endpoint\n";
echo "====================================================\n\n";

// Simulate POST request data
$_POST = [
    'event_plan_id' => 60,
    'requester_email' => 'nykedotnyc@gmail.com',
    'event_title' => 'sqrda',
    'requester_name' => 'Nyke'
];

echo "📋 Test parameters:\n";
echo "Event Plan ID: {$_POST['event_plan_id']}\n";
echo "Email: {$_POST['requester_email']}\n";
echo "Event Title: {$_POST['event_title']}\n";
echo "Requester: {$_POST['requester_name']}\n\n";

// Include the actual endpoint file
ob_start();
include 'send-signed-letters.php';
$output = ob_get_clean();

echo "📤 Endpoint output:\n";
echo $output . "\n";
?>