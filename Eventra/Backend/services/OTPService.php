<?php
/**
 * OTP (One-Time Password) Service
 * Handles email verification with OTP codes
 * Eventra ESRS Backend
 */

require_once __DIR__ . '/../config/email.php';

class OTPService {
    private $conn;
    private $table_name = "email_verification_codes";
    private $emailService;
    
    public function __construct($db) {
        $this->conn = $db;
        $this->emailService = new EmailService();
        
        // Set timezone for consistent time handling
        date_default_timezone_set('UTC');
        // Set MySQL timezone to UTC as well
        $this->conn->exec("SET time_zone = '+00:00'");
    }
    
    /**
     * Generate a 6-digit OTP code
     */
    private function generateOTP() {
        return sprintf("%06d", mt_rand(100000, 999999));
    }
    
    /**
     * Send OTP code to email for registration verification
     * Stores user data temporarily until verification
     */
    public function sendRegistrationOTP($email, $userData) {
        try {
            // Clean up expired codes for this email
            $this->cleanupExpiredCodes($email);
            
            // Check if there's a recent valid code
            if ($this->hasRecentValidCode($email)) {
                return [
                    'success' => false,
                    'message' => 'An OTP was already sent to this email. Please wait before requesting a new one.'
                ];
            }
            
            // Generate new OTP
            $otp = $this->generateOTP();
            $expiresAt = date('Y-m-d H:i:s', time() + (10 * 60)); // 10 minutes actual expiration (UI shows 2 minutes)
            
            // Store OTP with user data
            $query = "INSERT INTO " . $this->table_name . " 
                     (email, verification_code, user_data, expires_at) 
                     VALUES (:email, :verification_code, :user_data, :expires_at)";
            
            $stmt = $this->conn->prepare($query);
            $userDataJson = json_encode($userData);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':verification_code', $otp);
            $stmt->bindParam(':user_data', $userDataJson);
            $stmt->bindParam(':expires_at', $expiresAt);
            
            if ($stmt->execute()) {
                // Send OTP email
                $emailSent = $this->sendOTPEmail($email, $otp, $userData['name']);
                
                if ($emailSent) {
                    return [
                        'success' => true,
                        'message' => 'Verification code sent to your email. Please check your inbox.'
                    ];
                } else {
                    // Delete the OTP record if email failed
                    $this->deleteOTPRecord($email);
                    return [
                        'success' => false,
                        'message' => 'Failed to send verification email. Please try again.'
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to generate verification code. Please try again.'
                ];
            }
        } catch (Exception $e) {
            error_log("OTP Service Error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'An error occurred while sending verification code.'
            ];
        }
    }
    
    /**
     * Verify OTP code and complete user registration
     */
    public function verifyRegistrationOTP($email, $otp) {
        try {
            // Find valid OTP record
            $query = "SELECT * FROM " . $this->table_name . " 
                     WHERE email = :email 
                     AND verification_code = :otp 
                     AND expires_at > NOW() 
                     AND verified_at IS NULL 
                     AND attempts < max_attempts
                     ORDER BY created_at DESC 
                     LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':otp', $otp);
            $stmt->execute();
            
            $record = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$record) {
                // Increment attempts for any recent record
                $this->incrementAttempts($email);
                return [
                    'success' => false,
                    'message' => 'Invalid or expired verification code.'
                ];
            }
            
            // Get user data from the record
            $userData = json_decode($record['user_data'], true);
            
            if (!$userData) {
                return [
                    'success' => false,
                    'message' => 'Invalid user data. Please restart the registration process.'
                ];
            }
            
            // Create the user account
            require_once __DIR__ . '/../models/User.php';
            $user = new User($this->conn);
            
            $user->name = $userData['name'];
            $user->email = $userData['email'];
            $user->password_hash = $userData['password_hash'];
            $user->role = $userData['role'];
            $user->department = $userData['department'] ?? null;
            $user->faculty = $userData['faculty'] ?? null;
            $user->designation = $userData['designation'] ?? null;
            $user->bio = $userData['bio'] ?? null;
            $user->event_interests = $userData['event_interests'] ?? null;
            $user->service_type = $userData['service_type'] ?? null;
            $user->status = 'active';
            $user->is_email_verified = true; // Mark as verified
            
            $userId = $user->create();
            
            if ($userId) {
                // Mark OTP as verified
                $updateQuery = "UPDATE " . $this->table_name . " 
                               SET verified_at = NOW(), user_id = :user_id 
                               WHERE id = :id";
                $updateStmt = $this->conn->prepare($updateQuery);
                $updateStmt->bindParam(':user_id', $userId);
                $updateStmt->bindParam(':id', $record['id']);
                $updateStmt->execute();
                
                // Clean up other OTP records for this email
                $this->cleanupOtherRecords($email, $record['id']);
                
                return [
                    'success' => true,
                    'message' => 'Email verified successfully. Your account has been created.',
                    'user_id' => $userId
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to create user account. Please contact support.'
                ];
            }
            
        } catch (Exception $e) {
            error_log("OTP Verification Error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'An error occurred during verification.'
            ];
        }
    }
    
    /**
     * Resend OTP code
     */
    public function resendOTP($email) {
        try {
            // Find the most recent unverified record
            $query = "SELECT * FROM " . $this->table_name . " 
                     WHERE email = :email 
                     AND verified_at IS NULL 
                     ORDER BY created_at DESC 
                     LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            
            $record = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$record) {
                return [
                    'success' => false,
                    'message' => 'No pending verification found. Please restart registration.'
                ];
            }
            
            // Check if we can resend (not too recent)
            $lastSent = strtotime($record['created_at']);
            $cooldownPeriod = 60; // 1 minute cooldown
            
            if (time() - $lastSent < $cooldownPeriod) {
                return [
                    'success' => false,
                    'message' => 'Please wait before requesting a new code.'
                ];
            }
            
            $userData = json_decode($record['user_data'], true);
            
            // Generate new OTP and update record
            $newOTP = $this->generateOTP();
            $expiresAt = date('Y-m-d H:i:s', time() + (10 * 60)); // 10 minutes actual expiration (UI shows 2 minutes)
            
            $updateQuery = "UPDATE " . $this->table_name . " 
                           SET verification_code = :otp, 
                               expires_at = :expires_at, 
                               attempts = 0,
                               created_at = NOW()
                           WHERE id = :id";
            
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':otp', $newOTP);
            $updateStmt->bindParam(':expires_at', $expiresAt);
            $updateStmt->bindParam(':id', $record['id']);
            
            if ($updateStmt->execute()) {
                // Send new OTP email
                $emailSent = $this->sendOTPEmail($email, $newOTP, $userData['name']);
                
                if ($emailSent) {
                    return [
                        'success' => true,
                        'message' => 'New verification code sent to your email.'
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Failed to send verification email. Please try again.'
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to generate new verification code.'
                ];
            }
            
        } catch (Exception $e) {
            error_log("OTP Resend Error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'An error occurred while resending verification code.'
            ];
        }
    }
    
    /**
     * Send OTP email to user
     */
    private function sendOTPEmail($email, $otp, $name) {
        $subject = "Verify Your Email - Eventra ESRS";
        $message = $this->generateOTPEmailTemplate($otp, $name);
        
        $result = $this->emailService->sendSimpleEmail($email, $subject, $message);
        return $result['success'] ?? false;
    }
    
    /**
     * Generate OTP email template (optimized for speed)
     */
    private function generateOTPEmailTemplate($otp, $name) {
        return "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                .container { max-width: 500px; margin: 0 auto; }
                .header { background: #bd7880; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; }
                .otp { background: #bd7880; color: white; font-size: 24px; font-weight: bold; padding: 15px; margin: 15px 0; border-radius: 8px; letter-spacing: 2px; }
                .note { color: #666; font-size: 12px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Eventra ESRS</h1>
                    <h3>Email Verification</h3>
                </div>
                <div class='content'>
                    <h3>Hello " . htmlspecialchars($name) . ",</h3>
                    <p>Your verification code is:</p>
                    <div class='otp'>" . $otp . "</div>
                    <p><strong>This code expires in 2 minutes.</strong></p>
                    <p>Enter this code to complete your registration.</p>
                    <div class='note'>
                        <p>If you didn't request this, please ignore this email.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>";
    }
    
    /**
     * Clean up expired codes for an email
     */
    private function cleanupExpiredCodes($email) {
        $query = "DELETE FROM " . $this->table_name . " 
                 WHERE email = :email AND expires_at < NOW()";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
    }
    
    /**
     * Check if there's a recent valid code
     */
    private function hasRecentValidCode($email) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " 
                 WHERE email = :email 
                 AND expires_at > NOW() 
                 AND verified_at IS NULL 
                 AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] > 0;
    }
    
    /**
     * Increment verification attempts
     */
    private function incrementAttempts($email) {
        $query = "UPDATE " . $this->table_name . " 
                 SET attempts = attempts + 1 
                 WHERE email = :email 
                 AND verified_at IS NULL 
                 AND expires_at > NOW()";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
    }
    
    /**
     * Delete OTP record
     */
    private function deleteOTPRecord($email) {
        $query = "DELETE FROM " . $this->table_name . " WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
    }
    
    /**
     * Clean up other OTP records for email except the specified one
     */
    private function cleanupOtherRecords($email, $keepId) {
        $query = "DELETE FROM " . $this->table_name . " 
                 WHERE email = :email AND id != :keep_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':keep_id', $keepId);
        $stmt->execute();
    }
}
?>