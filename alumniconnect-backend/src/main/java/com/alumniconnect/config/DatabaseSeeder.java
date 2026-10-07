package com.alumniconnect.config;

import com.alumniconnect.entity.*;
import com.alumniconnect.entity.enums.*;
import com.alumniconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final SkillRepository skillRepository;
    private final JobRepository jobRepository;
    private final EventRepository eventRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded. Skipping initial seeding.");
            return;
        }

        logger.info("Seeding initial platform data for demonstration & testing...");

        // 1. Seed Skills Master Table
        List<String> skillNames = Arrays.asList(
                "Java", "Spring Boot", "React.js", "MySQL", "AWS",
                "Docker", "System Design", "Microservices", "Python",
                "Kubernetes", "Data Structures", "Tailwind CSS", "TypeScript",
                "GraphQL", "Redis", "Kafka", "Machine Learning"
        );

        for (String name : skillNames) {
            skillRepository.save(Skill.builder().name(name).build());
        }

        Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElse(null);
        Skill springSkill = skillRepository.findByNameIgnoreCase("Spring Boot").orElse(null);
        Skill reactSkill = skillRepository.findByNameIgnoreCase("React.js").orElse(null);
        Skill awsSkill = skillRepository.findByNameIgnoreCase("AWS").orElse(null);
        Skill dockerSkill = skillRepository.findByNameIgnoreCase("Docker").orElse(null);

        // 2. Seed Admin User
        User admin = User.builder()
                .email("admin@alumniconnect.com")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("System Administrator")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .build();
        userRepository.save(admin);

        // 3. Seed Verified Alumni (Working at Google)
        User alumniUser1 = User.builder()
                .email("sundar.alumni@google.com")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Sundar Pichai (Alumni)")
                .role(Role.ROLE_ALUMNI)
                .isActive(true)
                .profilePictureUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                .build();
        userRepository.save(alumniUser1);

        AlumniProfile alumniProfile1 = AlumniProfile.builder()
                .user(alumniUser1)
                .phone("+91 9876543210")
                .department("Computer Science and Engineering")
                .graduationYear(2018)
                .currentCompany("Google")
                .jobTitle("Senior Software Engineer")
                .yearsOfExperience(6)
                .location("Bangalore, India")
                .professionalBio("Passionate about distributed systems, cloud computing, and helping university students navigate tech careers.")
                .githubUrl("https://github.com")
                .linkedinUrl("https://linkedin.com")
                .verificationStatus(VerificationStatus.VERIFIED)
                .mentorshipAvailability(MentorshipAvailability.AVAILABLE)
                .verifiedAt(LocalDateTime.now())
                .skills(new HashSet<>(Arrays.asList(javaSkill, springSkill, awsSkill, dockerSkill)))
                .build();
        alumniProfileRepository.save(alumniProfile1);

        // 4. Seed Verified Alumni (Working at Amazon)
        User alumniUser2 = User.builder()
                .email("priya.alumni@amazon.com")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Priya Sharma")
                .role(Role.ROLE_ALUMNI)
                .isActive(true)
                .profilePictureUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                .build();
        userRepository.save(alumniUser2);

        AlumniProfile alumniProfile2 = AlumniProfile.builder()
                .user(alumniUser2)
                .phone("+91 9876543211")
                .department("Information Technology")
                .graduationYear(2020)
                .currentCompany("Amazon")
                .jobTitle("Software Development Engineer II")
                .yearsOfExperience(4)
                .location("Hyderabad, India")
                .professionalBio("SDE II at Amazon. Open to mentoring students on DSA, LeetCode preparation, and behavioral interviews.")
                .githubUrl("https://github.com")
                .linkedinUrl("https://linkedin.com")
                .verificationStatus(VerificationStatus.VERIFIED)
                .mentorshipAvailability(MentorshipAvailability.AVAILABLE)
                .verifiedAt(LocalDateTime.now())
                .skills(new HashSet<>(Arrays.asList(javaSkill, reactSkill, awsSkill)))
                .build();
        alumniProfileRepository.save(alumniProfile2);

        // 5. Seed Student User
        User studentUser = User.builder()
                .email("student@alumniconnect.com")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Rahul Verma")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .profilePictureUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150")
                .build();
        userRepository.save(studentUser);

        StudentProfile studentProfile = StudentProfile.builder()
                .user(studentUser)
                .phone("+91 9123456780")
                .department("Computer Science and Engineering")
                .degree("B.Tech")
                .graduationYear(2025)
                .bio("Final year CSE student preparing for SDE roles. Strong foundation in Java, Spring Boot, and Full Stack Development.")
                .githubUrl("https://github.com")
                .linkedinUrl("https://linkedin.com")
                .careerInterests("Backend Engineering, Distributed Systems, Cloud Computing")
                .skills(new HashSet<>(Arrays.asList(javaSkill, springSkill, reactSkill)))
                .build();
        studentProfileRepository.save(studentProfile);

        // 6. Seed Sample Jobs
        Job job1 = Job.builder()
                .alumni(alumniProfile1)
                .title("Software Engineer - Cloud Backend")
                .company("Google")
                .location("Bangalore / Hybrid")
                .employmentType(EmploymentType.FULL_TIME)
                .experienceRequired("0-2 Years")
                .requiredSkills("Java, Spring Boot, Distributed Systems, GCP")
                .salaryRange("₹18L - ₹24L PA")
                .description("We are looking for passionate junior engineers to join Google Cloud. You will build and scale high-throughput services with high reliability.")
                .applicationUrl("https://careers.google.com")
                .referralAvailable(true)
                .postedDate(LocalDate.now().minusDays(3))
                .applicationDeadline(LocalDate.now().plusDays(30))
                .isActive(true)
                .build();
        jobRepository.save(job1);

        Job job2 = Job.builder()
                .alumni(alumniProfile2)
                .title("SDE-1 (Full Stack)")
                .company("Amazon")
                .location("Hyderabad, India")
                .employmentType(EmploymentType.FULL_TIME)
                .experienceRequired("Fresher / 0-1 Year")
                .requiredSkills("Java, React, Data Structures, AWS")
                .salaryRange("₹16L - ₹22L PA")
                .description("Amazon Retail team is hiring fresh graduates with exceptional problem-solving and coding abilities. Happy to provide referrals for qualified candidates!")
                .applicationUrl("https://amazon.jobs")
                .referralAvailable(true)
                .postedDate(LocalDate.now().minusDays(1))
                .applicationDeadline(LocalDate.now().plusDays(25))
                .isActive(true)
                .build();
        jobRepository.save(job2);

        // 7. Seed Sample Events
        Event event1 = Event.builder()
                .organizer(alumniUser1)
                .title("Cracking Google: System Design & DSA Masterclass")
                .description("Exclusive interactive webinar for final-year students covering high-level system design, coding rounds, and behavioral preparation.")
                .eventType(EventType.WEBINAR)
                .eventDate(LocalDateTime.now().plusDays(7).withHour(18).withMinute(0))
                .location("Google Meet (Online)")
                .maxParticipants(100)
                .registrationDeadline(LocalDateTime.now().plusDays(6))
                .isActive(true)
                .build();
        eventRepository.save(event1);

        Event event2 = Event.builder()
                .organizer(admin)
                .title("Annual Alumni Grand Meetup 2026")
                .description("Join over 300+ alumni on campus for networking, awards, and career guidance roundtables.")
                .eventType(EventType.MEETUP)
                .eventDate(LocalDateTime.now().plusDays(20).withHour(10).withMinute(0))
                .location("Main Campus Auditorium, Block A")
                .maxParticipants(300)
                .registrationDeadline(LocalDateTime.now().plusDays(18))
                .isActive(true)
                .build();
        eventRepository.save(event2);

        // 8. Seed Sample Career Post
        Post post1 = Post.builder()
                .alumni(alumniProfile1)
                .title("How I Cracked Google as a Tier-3 College Graduate")
                .category(PostCategory.INTERVIEW_EXPERIENCE)
                .content("A lot of students ask me if college tier matters for top product companies. Here is the realistic truth and the exact preparation roadmap I followed: 1) Master core DSA (Blind 75), 2) Build 1-2 non-trivial full stack projects that solve real problems, 3) Write clean, readable code with testing.")
                .likeCount(24)
                .commentCount(5)
                .isVisible(true)
                .build();
        postRepository.save(post1);

        logger.info("Initial seeding completed successfully!");
        logger.info("Demo Accounts Created:");
        logger.info("1. Admin:   admin@alumniconnect.com    | Password: Admin@123");
        logger.info("2. Alumni:  sundar.alumni@google.com  | Password: Password@123");
        logger.info("3. Alumni:  priya.alumni@amazon.com   | Password: Password@123");
        logger.info("4. Student: student@alumniconnect.com | Password: Password@123");
    }
}
