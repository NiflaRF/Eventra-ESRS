<?php
// Advanced email test - check email format and headers
require_once '../../config/database.php';
require_once '../../config/email.php';

echo "🔍 Advanced Email Attachment Test\n";
echo "==================================\n\n";

// Create a test instance
$emailService = new EmailService();

// Create test attachment data
$testAttachment = [
    'file_path' => __DIR__ . '/../../uploads/signed-letters/warden_approval_60_1757688863.pdf',
    'file_name' => 'warden_approval_60_1757688863.pdf',
    'role' => 'warden'
];

if (!file_exists($testAttachment['file_path'])) {
    echo "❌ Test file not found: {$testAttachment['file_path']}\n";
    exit(1);
}

echo "✅ Test file found: {$testAttachment['file_name']}\n";
echo "📁 File size: " . filesize($testAttachment['file_path']) . " bytes\n";
echo "📄 MIME type: " . mime_content_type($testAttachment['file_path']) . "\n\n";

// Test with detailed PHPMailer configuration
$emailBody = "
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <h2 style='color: #2c3e50;'>Event Approval Letter</h2>
    <p>Dear User,</p>
    <p>Please find the signed approval letter attached to this email.</p>
    <p><strong>Important:</strong> The attached PDF should be downloadable. If you see the content as text instead of a downloadable file, please contact support.</p>
    <p>File Details:</p>
    <ul>
        <li>Filename: {$testAttachment['file_name']}</li>
        <li>Type: PDF Document</li>
        <li>Size: " . round(filesize($testAttachment['file_path']) / 1024, 2) . " KB</li>
    </ul>
    <p>Best regards,<br>Eventra ESRS System</p>
</body>
</html>";

// Send test email with detailed logging
echo "📧 Sending test email with enhanced configuration...\n";

$result = $emailService->sendEmailWithAttachments(
    'nykedotnyc@gmail.com',
    'TEST: PDF Attachment Verification - Please Check Download',
    $emailBody,
    [$testAttachment]
);

echo "\n📊 Results:\n";
echo json_encode($result, JSON_PRETTY_PRINT) . "\n";

if ($result['success']) {
    echo "\n✅ Email sent successfully!\n";
    echo "📬 Check your email and try to download the PDF attachment.\n";
    echo "🔍 If the PDF appears as text, there might be an issue with:\n";
    echo "   - Email client settings\n";
    echo "   - MIME type handling\n";
    echo "   - Attachment encoding\n";
    echo "   - Email security settings\n";
} else {
    echo "\n❌ Email failed: {$result['message']}\n";
}

echo "\n📋 Next Steps:\n";
echo "1. Check your email inbox\n";
echo "2. Look for the test email with subject containing 'TEST:'\n";
echo "3. Try to download the PDF attachment\n";
echo "4. Report back what you see (downloadable file or text content)\n";
?>