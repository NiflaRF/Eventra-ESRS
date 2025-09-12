<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

define('USE_MOCK_EMAIL', false);

class EmailService {
    private $mailer;
    private $config;
    
    public function __construct() {
        $this->config = [
            'smtp_host' => 'smtp.gmail.com', 
            'smtp_port' => 587,
            'smtp_username' => 'nykedotnyc@gmail.com', 
            'smtp_password' => 'zxzg ipxv xpxg rrff', 
            'smtp_encryption' => 'tls',
            'from_email' => 'noreply@university.edu', 
            'from_name' => 'University Event Management System'
        ];
        
        $this->initializeMailer();
    }
    
    private function initializeMailer() {
        if (defined('USE_MOCK_EMAIL') && USE_MOCK_EMAIL) {
            $this->mailer = null;
            return;
        }
        
        if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            $this->mailer = new PHPMailer(true);
            
            try {
                $this->mailer->isSMTP();
                $this->mailer->Host = $this->config['smtp_host'];
                $this->mailer->SMTPAuth = true;
                $this->mailer->Username = $this->config['smtp_username'];
                $this->mailer->Password = $this->config['smtp_password'];
                $this->mailer->SMTPSecure = $this->config['smtp_encryption'];
                $this->mailer->Port = $this->config['smtp_port'];
                
                // Performance optimizations
                $this->mailer->SMTPKeepAlive = true; // Keep connection alive for multiple emails
                $this->mailer->Timeout = 30; // 30 seconds timeout
                $this->mailer->SMTPOptions = array(
                    'ssl' => array(
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true
                    )
                );
                
                $this->mailer->setFrom($this->config['from_email'], $this->config['from_name']);
                $this->mailer->isHTML(true);
                $this->mailer->CharSet = 'UTF-8';
                
            } catch (Exception $e) {
                error_log("Email service initialization failed: " . $e->getMessage());
                throw new Exception("Email service not available");
            }
        } else {
            error_log("PHPMailer class not found - using mock service");
            $this->mailer = null;
        }
    }
    
    public function sendEmailWithAttachments($toEmail, $subject, $body, $attachments = []) {
        if (defined('USE_MOCK_EMAIL') && USE_MOCK_EMAIL) {
            $logMessage = "MOCK EMAIL SENT:\n";
            $logMessage .= "To: $toEmail\n";
            $logMessage .= "Subject: $subject\n";
            $logMessage .= "Attachments: " . count($attachments) . "\n";
            
            foreach ($attachments as $attachment) {
                $fileName = $attachment['file_name'] ?? basename($attachment['file_path'] ?? 'unknown');
                $filePath = $attachment['file_path'] ?? 'unknown';
                $fileExists = isset($attachment['file_path']) && file_exists($attachment['file_path']) ? 'EXISTS' : 'NOT FOUND';
                $logMessage .= "- {$fileName} ({$fileExists})\n";
                $logMessage .= "  Path: {$filePath}\n";
            }
            
            error_log($logMessage);
            
            return [
                'success' => true,
                'message' => 'Mock email logged successfully',
                'recipient' => $toEmail,
                'subject' => $subject,
                'attachments_count' => count($attachments),
                'mock_service' => true,
                'attachments' => array_map(function($att) {
                    return [
                        'name' => $att['file_name'] ?? basename($att['file_path'] ?? 'unknown'),
                        'exists' => isset($att['file_path']) && file_exists($att['file_path'])
                    ];
                }, $attachments)
            ];
        }
        
        if (!$this->mailer) {
            return [
                'success' => false,
                'message' => 'Email service not available'
            ];
        }
        
        try {
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            
            $this->mailer->addAddress($toEmail);
            
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $body;
            $this->mailer->AltBody = $this->stripHtml($body);
            
            error_log("📎 Processing " . count($attachments) . " attachments for email to: {$toEmail}");
            
            $attachedCount = 0;
            foreach ($attachments as $attachment) {
                if (isset($attachment['file_path']) && file_exists($attachment['file_path'])) {
                    $fileName = $attachment['file_name'] ?? basename($attachment['file_path']);
                    $fileSize = filesize($attachment['file_path']);
                    
                    try {
                        // Add attachment with proper MIME type and disposition for PDF
                        $this->mailer->addStringAttachment(
                            file_get_contents($attachment['file_path']),
                            $fileName,
                            'base64',
                            'application/pdf',
                            'attachment'
                        );
                        
                        $attachedCount++;
                        error_log("✅ Successfully added PDF attachment: {$fileName} from {$attachment['file_path']} (Size: {$fileSize} bytes)");
                    } catch (Exception $e) {
                        error_log("❌ Failed to add attachment {$fileName}: " . $e->getMessage());
                    }
                } else {
                    $filePath = $attachment['file_path'] ?? 'unknown';
                    error_log("❌ Attachment file not found: {$filePath}");
                }
            }
            
            error_log("📧 Sending email with {$attachedCount} successfully attached files");
            
            $this->mailer->send();
            
            return [
                'success' => true,
                'message' => 'Email sent successfully',
                'recipient' => $toEmail,
                'subject' => $subject,
                'attachments_count' => count($attachments)
            ];
            
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage()
            ];
        }
    }
    
    public function sendSimpleEmail($toEmail, $subject, $body) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            
            $this->mailer->addAddress($toEmail);
            
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $body;
            $this->mailer->AltBody = $this->stripHtml($body);
            
            $this->mailer->send();
            
            return [
                'success' => true,
                'message' => 'Email sent successfully',
                'recipient' => $toEmail,
                'subject' => $subject
            ];
            
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage()
            ];
        }
    }
    
    private function stripHtml($html) {
        $text = strip_tags($html);
        $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');
        
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);
        
        return $text;
    }
    
    public function testConnection() {
        if (defined('USE_MOCK_EMAIL') && USE_MOCK_EMAIL) {
            return [
                'success' => true,
                'message' => 'Mock email service active - no SMTP connection needed'
            ];
        }
        
        if (!$this->mailer) {
            return [
                'success' => false,
                'message' => 'Email service not available'
            ];
        }
        
        try {
            $this->mailer->smtpConnect();
            return [
                'success' => true,
                'message' => 'SMTP connection successful'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'SMTP connection failed: ' . $e->getMessage()
            ];
        }
    }
    
    public function updateConfig($newConfig) {
        $this->config = array_merge($this->config, $newConfig);
        $this->initializeMailer();
    }

    /**
     * Send notification email to admins about new contact message
     */
    public function sendContactNotification($adminEmail, $adminName, $contactName, $contactEmail, $message, $contactId) {
        $subject = "New Contact Message - Eventra ESRS";
        
        $body = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .message-box { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6366f1; margin: 15px 0; }
                .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                .btn { background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
            </style>
        </head>
        <body>
            <div class='header'>
                <h2>New Contact Message Received</h2>
            </div>
            <div class='content'>
                <p>Hello {$adminName},</p>
                <p>A new contact message has been received through the Eventra ESRS website.</p>
                
                <h3>Contact Details:</h3>
                <ul>
                    <li><strong>Name:</strong> {$contactName}</li>
                    <li><strong>Email:</strong> {$contactEmail}</li>
                    <li><strong>Contact ID:</strong> #{$contactId}</li>
                </ul>
                
                <h3>Message:</h3>
                <div class='message-box'>
                    " . nl2br(htmlspecialchars($message)) . "
                </div>
                
                <p>Please log in to the admin dashboard to respond to this inquiry.</p>
                
                <a href='#' class='btn'>View in Admin Dashboard</a>
            </div>
            <div class='footer'>
                <p>This is an automated message from Eventra ESRS. Please do not reply to this email.</p>
                <p>Generated on " . date('Y-m-d H:i:s') . " UTC</p>
            </div>
        </body>
        </html>";

        return $this->sendEmailWithAttachments($adminEmail, $subject, $body, []);
    }

    /**
     * Send reply email to contact message sender
     */
    public function sendContactReply($userEmail, $userName, $originalMessage, $replyMessage) {
        $subject = "Re: Your Inquiry - Eventra ESRS";
        
        $body = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .message-box { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6366f1; margin: 15px 0; }
                .original-message { background-color: #e5e7eb; padding: 15px; border-left: 4px solid #9ca3af; margin: 15px 0; }
                .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='header'>
                <h2>Response to Your Inquiry</h2>
            </div>
            <div class='content'>
                <p>Dear {$userName},</p>
                <p>Thank you for contacting us. We have received your message and are pleased to respond to your inquiry.</p>
                
                <h3>Our Response:</h3>
                <div class='message-box'>
                    " . nl2br(htmlspecialchars($replyMessage)) . "
                </div>
                
                <h3>Your Original Message:</h3>
                <div class='original-message'>
                    " . nl2br(htmlspecialchars($originalMessage)) . "
                </div>
                
                <p>If you have any further questions, please don't hesitate to contact us again.</p>
                
                <p>Best regards,<br>
                The Eventra ESRS Team</p>
            </div>
            <div class='footer'>
                <p>University Event Management System - Eventra ESRS</p>
                <p>Generated on " . date('Y-m-d H:i:s') . " UTC</p>
            </div>
        </body>
        </html>";

        return $this->sendEmailWithAttachments($userEmail, $subject, $body, []);
    }
}

$emailService = new EmailService();

if (defined('USE_MOCK_EMAIL') && USE_MOCK_EMAIL) {
    class MockEmailService extends EmailService {
        public function sendEmailWithAttachments($toEmail, $subject, $body, $attachments = []) {
            error_log("MOCK EMAIL - To: {$toEmail}, Subject: {$subject}, Attachments: " . count($attachments));
            
            return [
                'success' => true,
                'message' => 'Mock email logged successfully',
                'recipient' => $toEmail,
                'subject' => $subject,
                'attachments_count' => count($attachments),
                'mock' => true
            ];
        }
        
        public function sendSimpleEmail($toEmail, $subject, $body) {
            error_log("MOCK EMAIL - To: {$toEmail}, Subject: {$subject}");
            
            return [
                'success' => true,
                'message' => 'Mock email logged successfully',
                'recipient' => $toEmail,
                'subject' => $subject,
                'mock' => true
            ];
        }

        public function sendContactNotification($adminEmail, $adminName, $contactName, $contactEmail, $message, $contactId) {
            error_log("MOCK EMAIL - Contact Notification - Admin: {$adminEmail}, Contact: {$contactName} ({$contactEmail})");
            
            return [
                'success' => true,
                'message' => 'Mock contact notification email logged successfully',
                'recipient' => $adminEmail,
                'contact_name' => $contactName,
                'contact_id' => $contactId,
                'mock' => true
            ];
        }

        public function sendContactReply($userEmail, $userName, $originalMessage, $replyMessage) {
            error_log("MOCK EMAIL - Contact Reply - To: {$userEmail}, User: {$userName}");
            
            return [
                'success' => true,
                'message' => 'Mock contact reply email logged successfully',
                'recipient' => $userEmail,
                'user_name' => $userName,
                'mock' => true
            ];
        }
    }
    
    $emailService = new MockEmailService();
}
?>
