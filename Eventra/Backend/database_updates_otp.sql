-- Update the email_verification_tokens table to support OTP verification
-- Run this script to update your existing database

USE eventra_esrs;

-- Drop the existing email_verification_tokens table
DROP TABLE IF EXISTS email_verification_tokens;

-- Create a new email_verification_codes table for OTP verification
CREATE TABLE email_verification_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL, -- NULL for pending registrations, filled after verification
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL, -- 6-digit OTP
    user_data JSON NULL, -- Temporary storage for user registration data
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL,
    attempts INT DEFAULT 0, -- Track verification attempts
    max_attempts INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at),
    INDEX idx_verification_code (verification_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update users table to ensure is_email_verified column exists and defaults to false
ALTER TABLE users MODIFY COLUMN is_email_verified BOOLEAN DEFAULT FALSE;