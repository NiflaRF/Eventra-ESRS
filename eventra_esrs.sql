-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 16, 2025 at 07:27 AM
-- Server version: 9.1.0
-- PHP Version: 8.1.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eventra_esrs`
--

-- ------------------------------------
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text,
  `type` enum('booking','event_plan','venue','user','system') NOT NULL,
  `target_id` int DEFAULT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--


--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `venue_id` int NOT NULL,
  `event_title` varchar(255) NOT NULL,
  `description` text,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `participants` int NOT NULL,
  `status` enum('pending','approved','rejected','under_review') DEFAULT 'pending',
  `urgency` enum('low','medium','high') DEFAULT 'medium',
  `facilities` json DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `rejected_by` int DEFAULT NULL,
  `approval_comment` text,
  `rejection_comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approved_by` (`approved_by`),
  KEY `rejected_by` (`rejected_by`),
  KEY `idx_status` (`status`),
  KEY `idx_date` (`date`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_venue_id` (`venue_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--


--
-- Table structure for table `email_logs`
--

DROP TABLE IF EXISTS `email_logs`;
CREATE TABLE IF NOT EXISTS `email_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_plan_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `recipient_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_type` enum('signed_letters','approval_notification','rejection_notification','reminder','general') COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `letters_sent` text COLLATE utf8mb4_unicode_ci,
  `sent_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('sent','failed','pending') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sent',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `delivery_confirmation` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_plan_id` (`event_plan_id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_recipient_email` (`recipient_email`),
  KEY `idx_email_type` (`email_type`),
  KEY `idx_sent_at` (`sent_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--


--
-- Table structure for table `email_verification_tokens`
--

DROP TABLE IF EXISTS `email_verification_tokens`;
CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(100) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
CREATE TABLE IF NOT EXISTS `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `venue_id` int NOT NULL,
  `date` date NOT NULL,
  `participants` int NOT NULL,
  `status` enum('Completed','Ongoing','Cancelled') DEFAULT 'Completed',
  `rating` decimal(3,2) DEFAULT NULL,
  `feedback_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_date` (`date`),
  KEY `idx_venue_id` (`venue_id`)
) ENGINE=MyISAM DEFAULT  CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_feedback`
--

DROP TABLE IF EXISTS `event_feedback`;
CREATE TABLE IF NOT EXISTS `event_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `attendee_name` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_rating` (`rating`)
) ;

-- --------------------------------------------------------

--
-- Table structure for table `event_plans`
--

DROP TABLE IF EXISTS `event_plans`;
CREATE TABLE IF NOT EXISTS `event_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('Conference','Cultural Events','Sports Events','Social Events','Club Events') NOT NULL,
  `organizer` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `participants` int NOT NULL,
  `status` enum('draft','submitted','approved','rejected') DEFAULT 'draft',
  `current_stage` int DEFAULT '1',
  `facilities` json DEFAULT NULL,
  `documents` json DEFAULT NULL,
  `approval_documents` json DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_date` (`date`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--


--
-- Table structure for table `event_plan_approvals`
--

DROP TABLE IF EXISTS `event_plan_approvals`;
CREATE TABLE IF NOT EXISTS `event_plan_approvals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_plan_id` int NOT NULL,
  `approval_type` enum('vc','admin','warden','student_union') NOT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `comments` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_approval` (`event_plan_id`,`approval_type`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('booking_request','booking_approved','booking_rejected','booking_action_confirmation','letter_sent','letter_received','service_provider_notified','final_approval','event_plan_submitted','event_plan_request','event_plan_approved','event_plan_rejected','event_plan_action_confirmation','system') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('unread','read') COLLATE utf8mb4_unicode_ci DEFAULT 'unread',
  `related_booking_id` int DEFAULT NULL,
  `related_venue_id` int DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `related_booking_id` (`related_booking_id`),
  KEY `related_venue_id` (`related_venue_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM AUTO_INCREMENT=198 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--


--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(100) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores password reset tokens for user password recovery';

--


--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
CREATE TABLE IF NOT EXISTS `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `data` json DEFAULT NULL,
  `generated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `generated_by` (`generated_by`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_requests`
--

DROP TABLE IF EXISTS `service_requests`;
CREATE TABLE IF NOT EXISTS `service_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) NOT NULL,
  `requested_by_user_id` int NOT NULL,
  `venue_id` int NOT NULL,
  `date_time` datetime NOT NULL,
  `service_type` enum('Sound System','Media') NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `description` text,
  `approved_by` int DEFAULT NULL,
  `rejected_by` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `requested_by_user_id` (`requested_by_user_id`),
  KEY `venue_id` (`venue_id`),
  KEY `approved_by` (`approved_by`),
  KEY `rejected_by` (`rejected_by`),
  KEY `idx_status` (`status`),
  KEY `idx_service_type` (`service_type`),
  KEY `idx_date_time` (`date_time`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `signed_letters`
--

DROP TABLE IF EXISTS `signed_letters`;
CREATE TABLE IF NOT EXISTS `signed_letters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `event_plan_id` int DEFAULT NULL,
  `from_role` enum('vice-chancellor','warden','student-union','administration','service-provider') COLLATE utf8mb4_unicode_ci NOT NULL,
  `to_role` enum('super-admin','user') COLLATE utf8mb4_unicode_ci NOT NULL,
  `letter_type` enum('approval','rejection','confirmation') COLLATE utf8mb4_unicode_ci NOT NULL,
  `letter_content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signature_data` json DEFAULT NULL,
  `status` enum('pending','sent','received') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `received_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_from_role` (`from_role`),
  KEY `idx_status` (`status`),
  KEY `fk_signed_letters_event_plan` (`event_plan_id`)
) ENGINE=MyISAM AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--


--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('student','faculty','service-provider','super-admin','vice-chancellor','administration','student-union','warden') COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `faculty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `event_interests` text COLLATE utf8mb4_unicode_ci,
  `service_type` enum('Sound System','Media') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `is_email_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `password_hash`, `role`, `department`, `faculty`, `designation`, `bio`, `event_interests`, `service_type`, `status`, `is_email_verified`, `created_at`, `updated_at`) VALUES
(1, 'Super Administrator', 'superadmin@university.edu', '$2y$10$eYZ8UB1kcl38lX0rZZA8peN0WV2aIwtWq8a3xkVrhWFveC4cE590e', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super-admin', NULL, NULL, NULL, NULL, NULL, NULL, 'active', 1, '2025-08-02 18:09:16', '2025-08-12 17:38:52'),
(2, 'Service Provider', 'serviceprovider@university.edu', '$2y$10$eYZ8UB1kcl38lX0rZZA8peN0WV2aIwtWq8a3xkVrhWFveC4cE590e', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'service-provider', NULL, NULL, NULL, NULL, NULL, 'Sound System', 'active', 1, '2025-08-02 18:09:16', '2025-08-12 17:38:52'),
(3, 'Vice Chancellor', 'vicechancellor@university.edu', '$2y$10$eYZ8UB1kcl38lX0rZZA8peN0WV2aIwtWq8a3xkVrhWFveC4cE590e', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vice-chancellor', NULL, NULL, NULL, NULL, NULL, NULL, 'active', 1, '2025-08-02 18:09:16', '2025-08-12 17:38:52'),
(4, 'Administration of UWU', 'administrationuwu@university.edu', '$2y$10$eYZ8UB1kcl38lX0rZZA8peN0WV2aIwtWq8a3xkVrhWFveC4cE590e', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'administration', NULL, NULL, NULL, NULL, NULL, NULL, 'active', 1, '2025-08-02 18:09:16', '2025-08-12 17:38:52'),
(5, 'Student Union', 'studentunion@university.edu', '$2y$10$eYZ8UB1kcl38lX0rZZA8peN0WV2aIwtWq8a3xkVrhWFveC4cE590e', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student-union', NULL, NULL, NULL, NULL, NULL, NULL, 'active', 1, '2025-08-02 18:09:16', '2025-08-12 17:38:52'),
(6, 'Warden', 'warden@university.edu', '$2y$10$eYZ8UB1kcl38lX0rZZA8peN0WV2aIwtWq8a3xkVrhWFveC4cE590e', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'warden', NULL, NULL, NULL, NULL, NULL, NULL, 'active', 1, '2025-08-02 18:09:16', '2025-08-12 17:38:52'),
(7, 'Amal', 'amal@university.edu', '$2y$10$eYZ8UB1kcl38lX0rZZA8peN0WV2aIwtWq8a3xkVrhWFveC4cE590e', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Computer Science', NULL, NULL, NULL, NULL, NULL, 'active', 1, '2025-08-02 18:09:17', '2025-08-12 17:38:52'),
(8, 'FAS', 'fas@university.edu', '$2y$10$eYZ8UB1kcl38lX0rZZA8peN0WV2aIwtWq8a3xkVrhWFveC4cE590e', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty', 'Computer Science and Informatics', NULL, NULL, NULL, NULL, NULL, 'active', 1, '2025-08-02 18:09:17', '2025-08-12 17:38:52'),


-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_token` varchar(100) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`),
  KEY `user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `venues`
--

DROP TABLE IF EXISTS `venues`;
CREATE TABLE IF NOT EXISTS `venues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `capacity` int NOT NULL,
  `location` varchar(255) NOT NULL,
  `type` enum('Auditorium','Lecture Theater','Outdoor','Laboratories') NOT NULL,
  `availability` enum('Available','Booked','Maintenance') DEFAULT 'Available',
  `restrictions` text,
  `images` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_availability` (`availability`),
  KEY `idx_type` (`type`),
  KEY `idx_capacity` (`capacity`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `venues`
--

INSERT INTO `venues` (`id`, `name`, `capacity`, `location`, `type`, `availability`, `restrictions`, `images`, `created_at`, `updated_at`) VALUES
(1, 'E Block Main Auditorium', 500, 'Academic Block E', 'Auditorium', 'Available', 'No food and drinks allowed', '[\"/E1.jpg\"]', '2025-08-02 18:09:16', '2025-08-02 18:09:16'),
(2, 'Technology Lecture Theater 1', 250, 'Technology Building', 'Lecture Theater', 'Available', 'Professional events only', '[\"/Tecno.jpg\"]', '2025-08-02 18:09:16', '2025-08-02 18:09:16'),
(3, 'Open Ground', 1000, 'Campus Premises', 'Outdoor', 'Available', 'Weather dependent', '[\"/Ground.jpg\"]', '2025-08-02 18:09:16', '2025-08-02 18:09:16'),
(4, 'Namunukula Open Air Theater', 700, 'Campus Center', 'Outdoor', 'Available', 'Weather dependent', '[\"/Open Air Theater.jpg\"]', '2025-08-02 18:09:16', '2025-08-02 18:09:16');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD CONSTRAINT `fk_email_logs_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_email_logs_event_plan` FOREIGN KEY (`event_plan_id`) REFERENCES `event_plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

-- Table for Contact Messages----
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('unread', 'read', 'replied') DEFAULT 'unread',
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `replied_by` INT DEFAULT NULL,
  `reply_message` TEXT DEFAULT NULL,
  `replied_at` TIMESTAMP NULL DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
