<?php
// Test email attachment functionality
require_once '../../config/database.php';
require_once '../../config/email.php';

// Test parameters - use an event plan that has actual PDF files
$testEventPlanId = 60;
$testEmail = 'nykedotnyc@gmail.com';
$testEventTitle = 'sqrda';
$testRequesterName = 'Nyke';

echo "🧪 Testing email attachment functionality\n";
echo "==========================================\n\n";

$database = new Database();
$conn = $database->getConnection();
$emailService = new EmailService();

// Get signed letters
$query = "SELECT 
            sl.letter_content,
            sl.letter_type,
            sl.from_role,
            sl.file_path,
            sl.file_name
          FROM signed_letters sl
          WHERE sl.event_plan_id = ? 
          AND sl.letter_type = 'approval'
          AND sl.file_path IS NOT NULL 
          AND sl.file_path != ''
          AND sl.file_name IS NOT NULL
          AND sl.file_name != ''";

$stmt = $conn->prepare($query);
$stmt->execute([$testEventPlanId]);

$letters = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $relativePath = $row['file_path'];
    $absolutePath = __DIR__ . '/../../' . $relativePath;
    
    if (file_exists($absolutePath)) {
        $letters[] = [
            'role' => $row['from_role'],
            'content' => $row['letter_content'],
            'file_path' => $absolutePath,
            'file_name' => $row['file_name'],
            'letter_type' => $row['letter_type']
        ];
        echo "✅ Found file: {$row['file_name']} (Size: " . filesize($absolutePath) . " bytes)\n";
    } else {
        echo "❌ File not found: {$absolutePath}\n";
    }
}

if (empty($letters)) {
    echo "❌ No letters found for testing\n";
    exit(1);
}

echo "\n📧 Attempting to send test email with " . count($letters) . " attachments...\n";

// Test email body
$emailBody = "
<html>
<body>
<h2>Test Email with PDF Attachments</h2>
<p>This is a test email to verify PDF attachments are working.</p>
<p>Expected attachments: " . count($letters) . "</p>
<ul>";

foreach ($letters as $letter) {
    $emailBody .= "<li>{$letter['role']}: {$letter['file_name']}</li>";
}

$emailBody .= "</ul>
</body>
</html>";

// Send test email
$result = $emailService->sendEmailWithAttachments(
    $testEmail,
    "Test: PDF Attachments - Event Plan {$testEventTitle}",
    $emailBody,
    $letters
);

echo "\n📤 Email service response:\n";
echo json_encode($result, JSON_PRETTY_PRINT) . "\n";

if ($result['success']) {
    echo "\n✅ Test email sent successfully!\n";
    echo "Check your email at {$testEmail} for the PDF attachments.\n";
} else {
    echo "\n❌ Test email failed: {$result['message']}\n";
}
?>