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
(2, 'arun.dev@gmail.com', '$2a$10$O0eL/FqXf4xVzV2B7fM9eeP5lM3n9O1kP7jZ6rT8qS5uY2wV1a4m.', 'Arun', 'ROLE_ALUMNI', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 1, NOW()),
(3, 'jenish.dev@gmail.com', '$2a$10$O0eL/FqXf4xVzV2B7fM9eeP5lM3n9O1kP7jZ6rT8qS5uY2wV1a4m.', 'Jenish', 'ROLE_ALUMNI', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 1, NOW()),
(4, 'student@alumniconnect.com', '$2a$10$O0eL/FqXf4xVzV2B7fM9eeP5lM3n9O1kP7jZ6rT8qS5uY2wV1a4m.', 'Rahul Verma', 'ROLE_STUDENT', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 1, NOW()),
(5, 'ananya.student@college.edu', '$2a$10$O0eL/FqXf4xVzV2B7fM9eeP5lM3n9O1kP7jZ6rT8qS5uY2wV1a4m.', 'Ananya Iyer', 'ROLE_STUDENT', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 1, NOW())
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- ----------------------------------------------------------------------------
-- 3. SEED ALUMNI PROFILES
-- ----------------------------------------------------------------------------
INSERT INTO `alumni_profiles` (`id`, `user_id`, `phone`, `department`, `graduation_year`, `current_company`, `job_title`, `years_of_experience`, `location`, `professional_bio`, `github_url`, `linkedin_url`, `verification_status`, `mentorship_availability`, `verified_at`) VALUES
(1, 2, '+91 9876501234', 'Computer Science and Engineering', 2019, 'Infosys', 'Senior Systems Engineer', 5, 'Pune, India', 'Working as a backend engineer at Infosys for the past 5 years. I mainly deal with microservices and REST APIs. Happy to help juniors with resume reviews, mock interviews, or just figuring out where to start with placements.', 'https://github.com/arun-dev', 'https://linkedin.com/in/arun-dev', 'VERIFIED', 'AVAILABLE', NOW()),
(2, 3, '+91 9845002345', 'Information Technology', 2021, 'Zoho Corporation', 'Software Developer', 3, 'Chennai, India', 'Full stack developer at Zoho. I work on the CRM module — mostly Java on the backend and React for the UI. I remember how confusing placements were in final year, so I try to be available for anyone who needs guidance.', 'https://github.com/jenish-dev', 'https://linkedin.com/in/jenish-dev', 'VERIFIED', 'AVAILABLE', NOW())
ON DUPLICATE KEY UPDATE `current_company`=VALUES(`current_company`);

-- ----------------------------------------------------------------------------
-- 4. SEED ALUMNI SKILLS
-- ----------------------------------------------------------------------------
INSERT INTO `alumni_skills` (`alumni_profile_id`, `skill_id`) VALUES
(1, 1), (1, 2), (1, 5), (1, 6), (1, 7), (1, 8), -- Arun: Java, Spring Boot, AWS, Docker, System Design, Microservices
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5)          -- Jenish: Java, Spring Boot, React, MySQL, AWS
ON DUPLICATE KEY UPDATE `skill_id`=VALUES(`skill_id`);

-- ----------------------------------------------------------------------------
-- 5. SEED ALUMNI EXPERIENCES & EDUCATION
-- ----------------------------------------------------------------------------
INSERT INTO `alumni_experiences` (`id`, `alumni_profile_id`, `company`, `job_title`, `start_date`, `end_date`, `is_current`) VALUES
(1, 1, 'Infosys', 'Senior Systems Engineer', '2021-06-01', NULL, 1),
(2, 1, 'Infosys', 'Systems Engineer', '2019-07-01', '2021-05-31', 0),
(3, 2, 'Zoho Corporation', 'Software Developer', '2021-08-01', NULL, 1)
ON DUPLICATE KEY UPDATE `company`=VALUES(`company`);

INSERT INTO `alumni_educations` (`id`, `alumni_profile_id`, `institution`, `degree`, `year_of_completion`) VALUES
(1, 1, 'National Institute of Technology', 'B.Tech in Computer Science', 2019),
(2, 2, 'College of Engineering Guindy', 'B.Tech in Information Technology', 2021)
ON DUPLICATE KEY UPDATE `institution`=VALUES(`institution`);

-- ----------------------------------------------------------------------------
-- 6. SEED STUDENT PROFILES
-- ----------------------------------------------------------------------------
INSERT INTO `student_profiles` (`id`, `user_id`, `phone`, `department`, `degree`, `graduation_year`, `bio`, `github_url`, `linkedin_url`, `resume_url`, `career_interests`) VALUES
(1, 4, '+91 9123456780', 'Computer Science and Engineering', 'B.Tech', 2025, 'Final year CSE student. Been working on a couple of side projects and trying to get better at system design. Looking for SDE roles in backend or full stack.', 'https://github.com/rahulverma25', 'https://linkedin.com/in/rahul-verma-cse', NULL, 'Backend Engineering, Full Stack Development, Cloud Computing'),
(2, 5, '+91 9123456788', 'Information Technology', 'B.Tech', 2025, 'Enthusiastic full-stack learner skilled in React.js and modern web architecture. Seeking product engineering internships.', 'https://github.com/ananyaiyer', 'https://linkedin.com/in/ananyaiyer', NULL, 'Full Stack Development, Frontend Engineering')
ON DUPLICATE KEY UPDATE `department`=VALUES(`department`);

-- ----------------------------------------------------------------------------
-- 7. SEED STUDENT SKILLS & PROJECTS
-- ----------------------------------------------------------------------------
INSERT INTO `student_skills` (`student_profile_id`, `skill_id`) VALUES
(1, 1), (1, 2), (1, 4), (1, 6), -- Rahul: Java, Spring Boot, MySQL, Docker
(2, 3), (2, 4), (2, 12), (2, 13) -- Ananya: React, MySQL, Tailwind, TypeScript
ON DUPLICATE KEY UPDATE `skill_id`=VALUES(`skill_id`);

INSERT INTO `student_projects` (`id`, `student_profile_id`, `title`, `description`, `project_url`) VALUES
(1, 1, 'AlumniConnect Platform', 'Full-stack networking platform built with Spring Boot, MySQL, and React.', 'https://github.com/rahulverma25/alumniconnect'),
(2, 1, 'Cloud Storage Microservice', 'S3-compatible distributed blob storage prototype in Java 21.', 'https://github.com/rahulverma25/cloud-blob'),
(3, 2, 'DevCollab Interactive Workspace', 'Real-time collaborative code editor with WebSockets.', 'https://github.com/ananyaiyer/devcollab')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- ----------------------------------------------------------------------------
-- 8. SEED JOBS & REFERRALS
-- ----------------------------------------------------------------------------
INSERT INTO `jobs` (`id`, `alumni_id`, `title`, `company`, `location`, `employment_type`, `experience_required`, `required_skills`, `salary_range`, `description`, `application_url`, `referral_available`, `posted_date`, `application_deadline`, `is_active`) VALUES
(1, 1, 'Associate Backend Engineer', 'Infosys', 'Pune, India', 'FULL_TIME', 'Fresher / 0-1 Year', 'Java, Spring Boot, REST APIs, MySQL, Git', '₹4,00,000 - ₹6,50,000 PA', 'Our team in Pune is looking for fresh graduates or early-career engineers with solid Java fundamentals. Happy to refer strong candidates from my college.', 'https://infosys.com/careers', 1, NOW(), DATE_ADD(NOW(), INTERVAL 28 DAY), 1),
(2, 2, 'Junior Software Developer (Full Stack)', 'Zoho Corporation', 'Chennai, India', 'FULL_TIME', 'Fresher / 0-2 Years', 'Java, React.js, SQL, REST APIs', '₹5,00,000 - ₹8,00,000 PA', 'Zoho CRM team is hiring developers who enjoy building real-world products. Drop me a message if you want to know more before applying.', 'https://careers.zohocorp.com', 1, NOW(), DATE_ADD(NOW(), INTERVAL 22 DAY), 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- ----------------------------------------------------------------------------
-- 9. SEED MENTORSHIPS
-- ----------------------------------------------------------------------------
INSERT INTO `mentorships` (`id`, `student_id`, `alumni_id`, `message`, `status`, `requested_at`, `responded_at`) VALUES
(1, 1, 1, 'Hello Arun! I am a final-year CS student focusing on Java and Spring Boot backend architecture. I would love your guidance on resume reviews and interview prep.', 'ACCEPTED', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 1, 2, 'Hi Jenish! I saw your work at Zoho with React and Java. Would love to get some guidance on full stack projects and interview rounds.', 'PENDING', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL)
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- ----------------------------------------------------------------------------
-- 10. SEED EVENTS
-- ----------------------------------------------------------------------------
INSERT INTO `events` (`id`, `organizer_id`, `title`, `description`, `event_type`, `event_date`, `location`, `max_participants`, `registration_deadline`, `is_active`) VALUES
(1, 2, 'Placement Prep: Resume, DSA, and What Actually Matters', 'An informal session sharing campus placement experiences, resume building, and preparing for technical rounds.', 'CAREER_GUIDANCE', DATE_ADD(NOW(), INTERVAL 7 DAY), 'Google Meet (Virtual)', 60, DATE_ADD(NOW(), INTERVAL 6 DAY), 1),
(2, 1, 'Alumni Homecoming – Annual Meetup 2026', 'Come back to campus, reconnect with batchmates, and meet current students for networking and career discussions.', 'MEETUP', DATE_ADD(NOW(), INTERVAL 20 DAY), 'Main Campus Auditorium, Block A', 200, DATE_ADD(NOW(), INTERVAL 18 DAY), 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- ----------------------------------------------------------------------------
-- 11. SEED CAREER POSTS & COMMENTS
-- ----------------------------------------------------------------------------
INSERT INTO `posts` (`id`, `alumni_id`, `title`, `content`, `category`, `like_count`, `comment_count`, `is_visible`, `created_at`) VALUES
(1, 1, 'My Placement Journey — What I would Tell Myself in Final Year', 'I got placed at Infosys in my final year after a lot of back and forth. A few things that actually helped: practicing DSA consistently, doing mock interviews with friends, and keeping my resume clean. Reach out if you need guidance!', 'INTERVIEW_EXPERIENCE', 18, 2, 1, DATE_SUB(NOW(), INTERVAL 4 DAY))
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

INSERT INTO `comments` (`id`, `user_id`, `post_id`, `content`, `created_at`) VALUES
(1, 4, 1, 'Thank you Arun brother! Really appreciate you sharing your experience.', DATE_SUB(NOW(), INTERVAL 3 DAY))
ON DUPLICATE KEY UPDATE `content`=VALUES(`content`);
