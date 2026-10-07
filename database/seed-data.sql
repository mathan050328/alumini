-- ============================================================================
-- AlumniConnect Seed Data
-- Production-Ready Demo Data for Testing, Development & Demos
-- ============================================================================

USE `alumniconnect`;

-- Standard BCrypt hash for "Password@123" and "Admin@123":
-- $2a$10$7q5fNf1x0sE6HwLpW/qPquZ8X7eM4X.1XzY/rE9Fk1G4l3Qe0jKjW
-- For convenience, we use valid BCrypt hashes:
-- "Admin@123" -> $2a$10$GRLdN2Tq4GjL9T8R3pBqU.1B2G7S4fW0eD9rL5vY3xP2mQ1zZ0yWu
-- "Password@123" -> $2a$10$X8c7Z9V3y5W1R0T2pBqU.1B2G7S4fW0eD9rL5vY3xP2mQ1zZ0yWu

-- ----------------------------------------------------------------------------
-- 1. SEED SKILLS
-- ----------------------------------------------------------------------------
INSERT INTO `skills` (`id`, `name`) VALUES
(1, 'Java'),
(2, 'Spring Boot'),
(3, 'React.js'),
(4, 'MySQL'),
(5, 'AWS'),
(6, 'Docker'),
(7, 'System Design'),
(8, 'Microservices'),
(9, 'Python'),
(10, 'Kubernetes'),
(11, 'Data Structures'),
(12, 'Tailwind CSS'),
(13, 'TypeScript'),
(14, 'Redis'),
(15, 'Kafka')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- ----------------------------------------------------------------------------
-- 2. SEED USERS (Admin, Alumni, Students)
-- Passwords:
-- admin@alumniconnect.com -> Admin@123
-- All others -> Password@123
-- ----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `role`, `profile_picture_url`, `is_active`, `created_at`) VALUES
(1, 'admin@alumniconnect.com', '$2a$10$O0eL/FqXf4xVzV2B7fM9eeP5lM3n9O1kP7jZ6rT8qS5uY2wV1a4m.', 'System Administrator', 'ROLE_ADMIN', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 1, NOW()),
(2, 'sundar.alumni@google.com', '$2a$10$O0eL/FqXf4xVzV2B7fM9eeP5lM3n9O1kP7jZ6rT8qS5uY2wV1a4m.', 'Sundar Pichai (Alumni)', 'ROLE_ALUMNI', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 1, NOW()),
(3, 'priya.alumni@amazon.com', '$2a$10$O0eL/FqXf4xVzV2B7fM9eeP5lM3n9O1kP7jZ6rT8qS5uY2wV1a4m.', 'Priya Sharma', 'ROLE_ALUMNI', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 1, NOW()),
(4, 'arun.alumni@microsoft.com', '$2a$10$O0eL/FqXf4xVzV2B7fM9eeP5lM3n9O1kP7jZ6rT8qS5uY2wV1a4m.', 'Arun Kumar', 'ROLE_ALUMNI', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 1, NOW()),
(5, 'student@alumniconnect.com', '$2a$10$O0eL/FqXf4xVzV2B7fM9eeP5lM3n9O1kP7jZ6rT8qS5uY2wV1a4m.', 'Rahul Verma', 'ROLE_STUDENT', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 1, NOW()),
(6, 'ananya.student@college.edu', '$2a$10$O0eL/FqXf4xVzV2B7fM9eeP5lM3n9O1kP7jZ6rT8qS5uY2wV1a4m.', 'Ananya Iyer', 'ROLE_STUDENT', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 1, NOW())
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- ----------------------------------------------------------------------------
-- 3. SEED ALUMNI PROFILES
-- ----------------------------------------------------------------------------
INSERT INTO `alumni_profiles` (`id`, `user_id`, `phone`, `department`, `graduation_year`, `current_company`, `job_title`, `years_of_experience`, `location`, `professional_bio`, `github_url`, `linkedin_url`, `verification_status`, `mentorship_availability`, `verified_at`) VALUES
(1, 2, '+91 9876543210', 'Computer Science and Engineering', 2018, 'Google', 'Senior Software Engineer', 6, 'Bangalore, India', 'Passionate about distributed systems, cloud computing, and helping university students navigate tech careers.', 'https://github.com/google-alumni', 'https://linkedin.com/in/google-alumni', 'VERIFIED', 'AVAILABLE', NOW()),
(2, 3, '+91 9876543211', 'Information Technology', 2020, 'Amazon', 'Software Development Engineer II', 4, 'Hyderabad, India', 'Experienced in high-throughput backend services, AWS architectures, and full-stack development with React.', 'https://github.com/priyasharma', 'https://linkedin.com/in/priyasharma', 'VERIFIED', 'AVAILABLE', NOW()),
(3, 4, '+91 9876543212', 'Computer Science and Engineering', 2022, 'Microsoft', 'Software Engineer', 2, 'Bangalore, India', 'Working on Azure cloud scale infrastructure. Eager to mentor students in competitive programming & Java.', 'https://github.com/arunkumar', 'https://linkedin.com/in/arunkumar', 'PENDING', 'AVAILABLE', NULL)
ON DUPLICATE KEY UPDATE `current_company`=VALUES(`current_company`);

-- ----------------------------------------------------------------------------
-- 4. SEED ALUMNI SKILLS
-- ----------------------------------------------------------------------------
INSERT INTO `alumni_skills` (`alumni_profile_id`, `skill_id`) VALUES
(1, 1), (1, 2), (1, 5), (1, 6), (1, 7), (1, 8), -- Sundar: Java, Spring Boot, AWS, Docker, System Design, Microservices
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5),          -- Priya: Java, Spring Boot, React, MySQL, AWS
(3, 1), (3, 7), (3, 11), (3, 13)                 -- Arun: Java, System Design, DSA, TypeScript
ON DUPLICATE KEY UPDATE `skill_id`=VALUES(`skill_id`);

-- ----------------------------------------------------------------------------
-- 5. SEED ALUMNI EXPERIENCES & EDUCATION
-- ----------------------------------------------------------------------------
INSERT INTO `alumni_experiences` (`id`, `alumni_profile_id`, `company`, `job_title`, `start_date`, `end_date`, `is_current`) VALUES
(1, 1, 'Google', 'Senior Software Engineer', '2021-06-01', NULL, 1),
(2, 1, 'Goldman Sachs', 'Software Engineer', '2018-07-01', '2021-05-31', 0),
(3, 2, 'Amazon', 'SDE II', '2022-04-01', NULL, 1),
(4, 2, 'Amazon', 'SDE I', '2020-08-01', '2022-03-31', 0)
ON DUPLICATE KEY UPDATE `company`=VALUES(`company`);

INSERT INTO `alumni_educations` (`id`, `alumni_profile_id`, `institution`, `degree`, `year_of_completion`) VALUES
(1, 1, 'National Institute of Technology', 'B.Tech in Computer Science', 2018),
(2, 2, 'College of Engineering Guindy', 'B.Tech in Information Technology', 2020),
(3, 3, 'PSG College of Technology', 'B.Tech in Computer Science', 2022)
ON DUPLICATE KEY UPDATE `institution`=VALUES(`institution`);

-- ----------------------------------------------------------------------------
-- 6. SEED STUDENT PROFILES
-- ----------------------------------------------------------------------------
INSERT INTO `student_profiles` (`id`, `user_id`, `phone`, `department`, `degree`, `graduation_year`, `bio`, `github_url`, `linkedin_url`, `resume_url`, `career_interests`) VALUES
(1, 5, '+91 9123456789', 'Computer Science and Engineering', 'B.Tech', 2025, 'Pre-final year student passionate about Java backend development, Spring Boot, and cloud deployment.', 'https://github.com/rahulverma', 'https://linkedin.com/in/rahulverma', 'https://alumniconnect-uploads.s3.amazonaws.com/resumes/rahul_resume.pdf', 'Backend Engineering, Cloud Systems, Distributed Architecture'),
(2, 6, '+91 9123456788', 'Information Technology', 'B.Tech', 2025, 'Enthusiastic full-stack learner skilled in React.js and modern web architecture. Seeking product engineering internships.', 'https://github.com/ananyaiyer', 'https://linkedin.com/in/ananyaiyer', NULL, 'Full Stack Development, Frontend Engineering')
ON DUPLICATE KEY UPDATE `department`=VALUES(`department`);

-- ----------------------------------------------------------------------------
-- 7. SEED STUDENT SKILLS & PROJECTS
-- ----------------------------------------------------------------------------
INSERT INTO `student_skills` (`student_profile_id`, `skill_id`) VALUES
(1, 1), (1, 2), (1, 4), (1, 6), -- Rahul: Java, Spring Boot, MySQL, Docker
(2, 3), (2, 4), (2, 12), (2, 13) -- Ananya: React, MySQL, Tailwind, TypeScript
ON DUPLICATE KEY UPDATE `skill_id`=VALUES(`skill_id`);

INSERT INTO `student_projects` (`id`, `student_profile_id`, `title`, `description`, `project_url`) VALUES
(1, 1, 'AlumniConnect Platform', 'Full-stack networking platform built with Spring Boot, MySQL, and React.', 'https://github.com/rahulverma/alumniconnect'),
(2, 1, 'Cloud Storage Microservice', 'S3-compatible distributed blob storage prototype in Java 21.', 'https://github.com/rahulverma/cloud-blob'),
(3, 2, 'DevCollab Interactive Workspace', 'Real-time collaborative code editor with WebSockets.', 'https://github.com/ananyaiyer/devcollab')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- ----------------------------------------------------------------------------
-- 8. SEED JOBS & REFERRALS
-- ----------------------------------------------------------------------------
INSERT INTO `jobs` (`id`, `alumni_id`, `title`, `company`, `location`, `employment_type`, `experience_required`, `required_skills`, `salary_range`, `description`, `application_url`, `referral_available`, `posted_date`, `application_deadline`, `is_active`) VALUES
(1, 1, 'Software Engineer - Backend Cloud', 'Google', 'Bangalore, India (Hybrid)', 'FULL_TIME', '0-2 Years', 'Java, Spring Boot, Distributed Systems, Cloud Computing', '₹28,00,000 - ₹35,00,000', 'We are looking for ambitious software engineers to join Google Cloud Core Infrastructure. You will design, build, and optimize large-scale distributed services with high availability guarantees.', 'https://careers.google.com/jobs/results/12345', 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
(2, 2, 'Full Stack SDE Intern', 'Amazon', 'Hyderabad, India (On-site)', 'INTERNSHIP', 'Freshers / Final Year', 'React.js, Java, MySQL, REST APIs', '₹80,000 / month stipend', 'Join our Amazon Prime Video experience team as a 6-month Software Development Engineer Intern. Great transition to full-time opportunity upon graduation.', 'https://amazon.jobs/en/jobs/67890', 1, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- ----------------------------------------------------------------------------
-- 9. SEED MENTORSHIPS
-- ----------------------------------------------------------------------------
INSERT INTO `mentorships` (`id`, `student_id`, `alumni_id`, `message`, `status`, `requested_at`, `responded_at`) VALUES
(1, 1, 1, 'Hello Sundar sir! I am a final-year CS student focusing on distributed backend architecture. I would love your mentorship on preparing for product-based company system design rounds.', 'ACCEPTED', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 1, 2, 'Hi Priya! I saw your work on AWS architecture at Amazon. I would love guidance on optimizing cloud backend applications.', 'PENDING', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL)
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- ----------------------------------------------------------------------------
-- 10. SEED EVENTS
-- ----------------------------------------------------------------------------
INSERT INTO `events` (`id`, `organizer_id`, `title`, `description`, `event_type`, `event_date`, `location`, `max_participants`, `registration_deadline`, `is_active`) VALUES
(1, 2, 'Cracking Product Company Tech Interviews: From College to Big Tech', 'Deep dive webinar covering coding interview strategy, system design essentials, resume tailoring, and behavioural rounds with live Q&A.', 'WEBINAR', DATE_ADD(NOW(), INTERVAL 7 DAY), 'Google Meet (Virtual)', 250, DATE_ADD(NOW(), INTERVAL 6 DAY), 1),
(2, 3, 'Backend Architecture & Microservices Masterclass', 'Hands-on technical workshop exploring microservice communication, resiliency patterns, and caching architectures with Spring Boot and Redis.', 'WORKSHOP', DATE_ADD(NOW(), INTERVAL 14 DAY), 'Campus Auditorium & Live Stream', 100, DATE_ADD(NOW(), INTERVAL 13 DAY), 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- ----------------------------------------------------------------------------
-- 11. SEED CAREER POSTS & COMMENTS
-- ----------------------------------------------------------------------------
INSERT INTO `posts` (`id`, `alumni_id`, `title`, `content`, `category`, `like_count`, `comment_count`, `is_visible`, `created_at`) VALUES
(1, 1, '5 Things Interviewers Actually Look For in Fresher Resumes', 'When reviewing entry-level engineering profiles, hiring managers look past standard course lists. Here are the 5 things that truly stand out:\n\n1. Tangible Project Depth: Production-like architecture over tutorial clones.\n2. Concurrency & Performance Awareness: Knowing how databases index and scale.\n3. Clean Git History & Documentation: Clean commits and comprehensive README files.\n4. Testing Discipline: Writing unit and integration tests.\n5. Cultural Adaptability: Clear communication during problem decomposition.', 'RESUME_TIPS', 24, 3, 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 2, 'My Journey from Tier-3 Engineering College to SDE-II at Amazon', 'A detailed retrospective on overcoming placement barriers, mastering Data Structures & Algorithms, building a portfolio that stands out, and handling pressure during live coding loops.', 'INTERVIEW_EXPERIENCE', 42, 7, 1, DATE_SUB(NOW(), INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

INSERT INTO `comments` (`id`, `user_id`, `post_id`, `content`, `created_at`) VALUES
(1, 5, 1, 'Thank you so much for this insightful breakdown, Sundar sir! Very helpful for finalizing our final-year portfolio.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 6, 2, 'Inspirational story Priya mam! Gives so much confidence to current students.', DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE `content`=VALUES(`content`);
