-- ============================================================================
-- AlumniConnect Database Schema
-- Production Relational Schema for MySQL 8.0+
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `alumniconnect` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `alumniconnect`;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Core credentials, identity, and role management
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `profile_picture_url` VARCHAR(500) DEFAULT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_email` (`email`),
    INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. SKILLS TABLE
-- Central taxonomy of skills shared across students and alumni
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `skills`;
CREATE TABLE `skills` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    INDEX `idx_skill_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. STUDENT PROFILES TABLE
-- Academic, career interests, and social profile links for students
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_profiles`;
CREATE TABLE `student_profiles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL UNIQUE,
    `phone` VARCHAR(20) DEFAULT NULL,
    `department` VARCHAR(100) DEFAULT NULL,
    `degree` VARCHAR(100) DEFAULT NULL,
    `graduation_year` INT DEFAULT NULL,
    `bio` TEXT DEFAULT NULL,
    `github_url` VARCHAR(255) DEFAULT NULL,
    `linkedin_url` VARCHAR(255) DEFAULT NULL,
    `resume_url` VARCHAR(500) DEFAULT NULL,
    `career_interests` VARCHAR(500) DEFAULT NULL,
    CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. STUDENT SKILLS (Many-to-Many Join Table)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_skills`;
CREATE TABLE `student_skills` (
    `student_profile_id` BIGINT NOT NULL,
    `skill_id` BIGINT NOT NULL,
    PRIMARY KEY (`student_profile_id`, `skill_id`),
    CONSTRAINT `fk_ss_student` FOREIGN KEY (`student_profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ss_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. STUDENT PROJECTS TABLE
-- Academic and personal portfolios
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_projects`;
CREATE TABLE `student_projects` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `student_profile_id` BIGINT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `project_url` VARCHAR(500) DEFAULT NULL,
    CONSTRAINT `fk_sp_student` FOREIGN KEY (`student_profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. STUDENT CERTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_certifications`;
CREATE TABLE `student_certifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `student_profile_id` BIGINT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `issuing_organization` VARCHAR(150) NOT NULL,
    `issue_date` DATE DEFAULT NULL,
    CONSTRAINT `fk_sc_student` FOREIGN KEY (`student_profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. ALUMNI PROFILES TABLE
-- Professional experience, company details, verification, mentorship status
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `alumni_profiles`;
CREATE TABLE `alumni_profiles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL UNIQUE,
    `phone` VARCHAR(20) DEFAULT NULL,
    `department` VARCHAR(100) DEFAULT NULL,
    `graduation_year` INT DEFAULT NULL,
    `current_company` VARCHAR(150) DEFAULT NULL,
    `job_title` VARCHAR(100) DEFAULT NULL,
    `years_of_experience` INT DEFAULT 0,
    `location` VARCHAR(100) DEFAULT NULL,
    `professional_bio` TEXT DEFAULT NULL,
    `github_url` VARCHAR(255) DEFAULT NULL,
    `linkedin_url` VARCHAR(255) DEFAULT NULL,
    `verification_status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `mentorship_availability` VARCHAR(20) NOT NULL DEFAULT 'UNAVAILABLE',
    `verified_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_alumni_company` (`current_company`),
    INDEX `idx_alumni_location` (`location`),
    INDEX `idx_alumni_verification` (`verification_status`),
    INDEX `idx_alumni_mentorship` (`mentorship_availability`),
    CONSTRAINT `fk_alumni_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. ALUMNI SKILLS (Many-to-Many Join Table)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `alumni_skills`;
CREATE TABLE `alumni_skills` (
    `alumni_profile_id` BIGINT NOT NULL,
    `skill_id` BIGINT NOT NULL,
    PRIMARY KEY (`alumni_profile_id`, `skill_id`),
    CONSTRAINT `fk_as_alumni` FOREIGN KEY (`alumni_profile_id`) REFERENCES `alumni_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_as_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. ALUMNI EXPERIENCES TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `alumni_experiences`;
CREATE TABLE `alumni_experiences` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `alumni_profile_id` BIGINT NOT NULL,
    `company` VARCHAR(150) NOT NULL,
    `job_title` VARCHAR(100) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE DEFAULT NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT `fk_ae_alumni` FOREIGN KEY (`alumni_profile_id`) REFERENCES `alumni_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. ALUMNI EDUCATIONS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `alumni_educations`;
CREATE TABLE `alumni_educations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `alumni_profile_id` BIGINT NOT NULL,
    `institution` VARCHAR(150) NOT NULL,
    `degree` VARCHAR(100) NOT NULL,
    `year_of_completion` INT NOT NULL,
    CONSTRAINT `fk_aed_alumni` FOREIGN KEY (`alumni_profile_id`) REFERENCES `alumni_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. ALUMNI CERTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `alumni_certifications`;
CREATE TABLE `alumni_certifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `alumni_profile_id` BIGINT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `issuing_organization` VARCHAR(150) NOT NULL,
    `issue_date` DATE DEFAULT NULL,
    CONSTRAINT `fk_ac_alumni` FOREIGN KEY (`alumni_profile_id`) REFERENCES `alumni_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. MENTORSHIPS TABLE
-- Mentorship engagement lifecycle between student and alumni
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `mentorships`;
CREATE TABLE `mentorships` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `student_id` BIGINT NOT NULL,
    `alumni_id` BIGINT NOT NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `requested_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `responded_at` TIMESTAMP NULL DEFAULT NULL,
    `completed_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_mentorship_student` (`student_id`),
    INDEX `idx_mentorship_alumni` (`alumni_id`),
    INDEX `idx_mentorship_status` (`status`),
    CONSTRAINT `fk_m_student` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_m_alumni` FOREIGN KEY (`alumni_id`) REFERENCES `alumni_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 13. JOBS TABLE
-- Job openings posted by alumni
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `alumni_id` BIGINT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `company` VARCHAR(150) NOT NULL,
    `location` VARCHAR(100) DEFAULT NULL,
    `employment_type` VARCHAR(30) NOT NULL,
    `experience_required` VARCHAR(50) DEFAULT NULL,
    `required_skills` VARCHAR(500) DEFAULT NULL,
    `salary_range` VARCHAR(100) DEFAULT NULL,
    `description` TEXT NOT NULL,
    `application_url` VARCHAR(500) DEFAULT NULL,
    `referral_available` BOOLEAN NOT NULL DEFAULT FALSE,
    `posted_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `application_deadline` TIMESTAMP NULL DEFAULT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_job_company` (`company`),
    INDEX `idx_job_active` (`is_active`),
    INDEX `idx_job_employment_type` (`employment_type`),
    CONSTRAINT `fk_j_alumni` FOREIGN KEY (`alumni_id`) REFERENCES `alumni_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 14. JOB APPLICATIONS TABLE
-- Student applications submitted directly to posted jobs
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `job_applications`;
CREATE TABLE `job_applications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `student_id` BIGINT NOT NULL,
    `job_id` BIGINT NOT NULL,
    `cover_letter` TEXT DEFAULT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'APPLIED',
    `applied_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_student_job_application` (`student_id`, `job_id`),
    CONSTRAINT `fk_ja_student` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ja_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 15. SAVED JOBS TABLE (Bookmarks)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `saved_jobs`;
CREATE TABLE `saved_jobs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `student_id` BIGINT NOT NULL,
    `job_id` BIGINT NOT NULL,
    `saved_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_student_job_saved` (`student_id`, `job_id`),
    CONSTRAINT `fk_sj_student` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_sj_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 16. REFERRAL REQUESTS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `referral_requests`;
CREATE TABLE `referral_requests` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `student_id` BIGINT NOT NULL,
    `alumni_id` BIGINT NOT NULL,
    `job_id` BIGINT NOT NULL,
    `message` TEXT DEFAULT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `requested_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `responded_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_referral_status` (`status`),
    CONSTRAINT `fk_rr_student` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rr_alumni` FOREIGN KEY (`alumni_id`) REFERENCES `alumni_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rr_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 17. EVENTS TABLE
-- Meetups, webinars, workshops organised by alumni or administrators
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `organizer_id` BIGINT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `event_type` VARCHAR(30) NOT NULL,
    `event_date` TIMESTAMP NOT NULL,
    `location` VARCHAR(150) DEFAULT NULL,
    `max_participants` INT DEFAULT NULL,
    `registration_deadline` TIMESTAMP NULL DEFAULT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_event_date` (`event_date`),
    INDEX `idx_event_type` (`event_type`),
    CONSTRAINT `fk_e_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 18. EVENT REGISTRATIONS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `event_registrations`;
CREATE TABLE `event_registrations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `event_id` BIGINT NOT NULL,
    `registered_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_event_registration` (`user_id`, `event_id`),
    CONSTRAINT `fk_er_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_er_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 19. CONVERSATIONS TABLE
-- 1-to-1 conversation metadata between users
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `participant_one_id` BIGINT NOT NULL,
    `participant_two_id` BIGINT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_message_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_participants` (`participant_one_id`, `participant_two_id`),
    CONSTRAINT `fk_c_user1` FOREIGN KEY (`participant_one_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_c_user2` FOREIGN KEY (`participant_two_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 20. MESSAGES TABLE
-- Individual chat messages within conversations
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `conversation_id` BIGINT NOT NULL,
    `sender_id` BIGINT NOT NULL,
    `content` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_msg_conv` (`conversation_id`),
    INDEX `idx_msg_unread` (`conversation_id`, `is_read`),
    CONSTRAINT `fk_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 21. NOTIFICATIONS TABLE
-- Real-time and persistent alerts for users
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `link` VARCHAR(255) DEFAULT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_notif_user_unread` (`user_id`, `is_read`),
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 22. POSTS TABLE
-- Knowledge sharing, interview experiences, career advice
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `alumni_id` BIGINT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `like_count` INT NOT NULL DEFAULT 0,
    `comment_count` INT NOT NULL DEFAULT 0,
    `is_visible` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_post_category` (`category`),
    INDEX `idx_post_visible` (`is_visible`),
    CONSTRAINT `fk_p_alumni` FOREIGN KEY (`alumni_id`) REFERENCES `alumni_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 23. POST LIKES TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `post_likes`;
CREATE TABLE `post_likes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `post_id` BIGINT NOT NULL,
    `liked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_post_like` (`user_id`, `post_id`),
    CONSTRAINT `fk_pl_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pl_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 24. COMMENTS TABLE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `post_id` BIGINT NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_comment_post` (`post_id`),
    CONSTRAINT `fk_comm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comm_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
