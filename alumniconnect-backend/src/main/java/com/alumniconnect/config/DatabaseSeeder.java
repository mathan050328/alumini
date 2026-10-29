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
import org.springframework.transaction.annotation.Transactional;

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
    private final StudentProjectRepository studentProjectRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final AlumniExperienceRepository alumniExperienceRepository;
    private final SkillRepository skillRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final SavedJobRepository savedJobRepository;
    private final ReferralRequestRepository referralRequestRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final MentorshipRepository mentorshipRepository;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        boolean needsSync = !userRepository.existsByRollNumberIgnoreCase("22CS101")
                || !userRepository.existsByRollNumberIgnoreCase("22IT102")
                || !userRepository.existsByRollNumberIgnoreCase("18CS042")
                || !userRepository.existsByRollNumberIgnoreCase("19IT089")
                || userRepository.existsByRollNumberIgnoreCase("21CS101")
                || userRepository.existsByRollNumberIgnoreCase("17IT089");

        if (needsSync) {
            logger.info("Syncing and initializing clean database with Mathan, Kumar, Arun, and Sujith...");
            resetAndSeedCleanDataset();
        } else {
            ensurePendingAlumniVerified();
        }
    }

    private void resetAndSeedCleanDataset() {
        try {
            notificationRepository.deleteAllInBatch();
            messageRepository.deleteAllInBatch();
            conversationRepository.deleteAllInBatch();
            commentRepository.deleteAllInBatch();
            postLikeRepository.deleteAllInBatch();
            postRepository.deleteAllInBatch();
            eventRegistrationRepository.deleteAllInBatch();
            eventRepository.deleteAllInBatch();
            savedJobRepository.deleteAllInBatch();
            jobApplicationRepository.deleteAllInBatch();
            referralRequestRepository.deleteAllInBatch();
            jobRepository.deleteAllInBatch();
            mentorshipRepository.deleteAllInBatch();
            studentProjectRepository.deleteAllInBatch();
            alumniExperienceRepository.deleteAllInBatch();
            studentProfileRepository.deleteAllInBatch();
            alumniProfileRepository.deleteAllInBatch();

            List<User> users = userRepository.findAll();
            for (User u : users) {
                if (u.getRole() != Role.ROLE_ADMIN && !"ADMIN01".equalsIgnoreCase(u.getRollNumber())) {
                    userRepository.delete(u);
                }
            }
        } catch (Exception ex) {
            logger.warn("Non-fatal table reset notice: {}", ex.getMessage());
        }

        seedSkills();
        Skill javaSkill = findSkill("Java");
        Skill springSkill = findSkill("Spring Boot");
        Skill reactSkill = findSkill("React.js");
        Skill awsSkill = findSkill("AWS");
        Skill dockerSkill = findSkill("Docker");
        Skill pythonSkill = findSkill("Python");
        Skill tailwindSkill = findSkill("Tailwind CSS");
        Skill mysqlSkill = findSkill("MySQL");

        User admin = userRepository.findByRollNumberIgnoreCase("ADMIN01")
                .orElseGet(this::createAdminUser);

        // Alumni 1: Arun V
        AlumniProfile arunAlumni = createAlumni(
                "18CS042",
                "arun.v@gmail.com",
                "Arun V",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                "+91 9876501234",
                "Computer Science and Engineering",
                2022,
                "Infosys",
                "Senior Systems Engineer",
                4,
                "Bangalore, India",
                "Senior backend engineer at Infosys specializing in enterprise microservices, Spring Boot, and cloud architecture. Happy to guide college juniors on campus placements, system design fundamentals, and mock technical rounds.",
                "https://github.com/arun-v",
                "https://linkedin.com/in/arun-v",
                Arrays.asList(javaSkill, springSkill, dockerSkill, awsSkill, mysqlSkill)
        );

        // Alumni 2: Sujith R
        AlumniProfile sujithAlumni = createAlumni(
                "19IT089",
                "sujith.r@gmail.com",
                "Sujith R",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
                "+91 9845002345",
                "Information Technology",
                2023,
                "Zoho Corporation",
                "Full Stack Developer",
                3,
                "Chennai, India",
                "Full stack engineer at Zoho Corporation working on core CRM applications with React and Java. Always open to help students with modern web development, resume reviews, and career guidance.",
                "https://github.com/sujith-dev",
                "https://linkedin.com/in/sujith-r",
                Arrays.asList(javaSkill, reactSkill, tailwindSkill, springSkill)
        );

        // Student 1: Mathan Kumar
        createStudent(
                "22CS101",
                "mathan.kumar@example.com",
                "Mathan Kumar",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "+91 9123456789",
                "Computer Science and Engineering",
                "B.Tech",
                2026,
                "Pre-final year CSE student passionate about full stack software engineering and cloud technologies. Currently building scalable web platforms and seeking internship and SDE opportunities. Open to connecting with alumni for guidance.",
                "https://github.com/mathan050328",
                "https://linkedin.com/in/mathan-kumar",
                "Full Stack Development, Cloud Computing, System Design",
                Arrays.asList(javaSkill, springSkill, reactSkill, dockerSkill, mysqlSkill)
        );

        // Student 2: Kumar S
        createStudent(
                "22IT102",
                "kumar.s@example.com",
                "Kumar S",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
                "+91 9234567890",
                "Information Technology",
                "B.Tech",
                2026,
                "Third-year IT student focused on modern frontend architecture, microservices, and distributed systems. Active open source contributor and competitive programmer.",
                "https://github.com/kumar-dev",
                "https://linkedin.com/in/kumar-tech",
                "Frontend Engineering, DevOps, Microservices",
                Arrays.asList(reactSkill, pythonSkill, tailwindSkill, awsSkill)
        );

        seedJobs(arunAlumni, sujithAlumni);
        seedEvents(arunAlumni.getUser(), admin);
        seedPosts(arunAlumni, sujithAlumni);

        logger.info("Clean dataset initialized successfully with Mathan, Kumar, Arun, and Sujith.");
    }

    private void ensurePendingAlumniVerified() {
        List<AlumniProfile> pendingAlumni = alumniProfileRepository.findByVerificationStatus(VerificationStatus.PENDING);
        for (AlumniProfile profile : pendingAlumni) {
            profile.setVerificationStatus(VerificationStatus.VERIFIED);
            if (profile.getVerifiedAt() == null) {
                profile.setVerifiedAt(LocalDateTime.now());
            }
            alumniProfileRepository.save(profile);
        }
    }

    private void seedSkills() {
        List<String> skillNames = Arrays.asList(
                "Java", "Spring Boot", "React.js", "MySQL", "AWS",
                "Docker", "System Design", "Microservices", "Python",
                "Kubernetes", "Data Structures", "Tailwind CSS", "TypeScript",
                "GraphQL", "Redis", "Kafka", "Machine Learning", "PostgreSQL", "REST API"
        );
        for (String name : skillNames) {
            if (skillRepository.findByNameIgnoreCase(name).isEmpty()) {
                skillRepository.save(Skill.builder().name(name).build());
            }
        }
    }

    private Skill findSkill(String name) {
        return skillRepository.findByNameIgnoreCase(name).orElse(null);
    }

    private User createAdminUser() {
        User admin = User.builder()
                .rollNumber("ADMIN01")
                .email("admin@alumniconnect.com")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("System Administrator")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .passwordChanged(true)
                .isEmailVerified(true)
                .build();
        return userRepository.save(admin);
    }

    private AlumniProfile createAlumni(
            String rollNumber,
            String email,
            String fullName,
            String avatarUrl,
            String phone,
            String department,
            int graduationYear,
            String company,
            String jobTitle,
            int experience,
            String location,
            String bio,
            String githubUrl,
            String linkedinUrl,
            List<Skill> skills
    ) {
        User user = User.builder()
                .rollNumber(rollNumber)
                .email(email)
                .password(passwordEncoder.encode("Password@123"))
                .fullName(fullName)
                .role(Role.ROLE_ALUMNI)
                .isActive(true)
                .passwordChanged(true)
                .isEmailVerified(true)
                .profilePictureUrl(avatarUrl)
                .build();
        userRepository.save(user);

        AlumniProfile profile = AlumniProfile.builder()
                .user(user)
                .phone(phone)
                .department(department)
                .graduationYear(graduationYear)
                .currentCompany(company)
                .jobTitle(jobTitle)
                .yearsOfExperience(experience)
                .location(location)
                .professionalBio(bio)
                .githubUrl(githubUrl)
                .linkedinUrl(linkedinUrl)
                .verificationStatus(VerificationStatus.VERIFIED)
                .mentorshipAvailability(MentorshipAvailability.AVAILABLE)
                .verifiedAt(LocalDateTime.now())
                .skills(new HashSet<>(skills))
                .build();
        return alumniProfileRepository.save(profile);
    }

    private void createStudent(
            String rollNumber,
            String email,
            String fullName,
            String avatarUrl,
            String phone,
            String department,
            String degree,
            int graduationYear,
            String bio,
            String githubUrl,
            String linkedinUrl,
            String careerInterests,
            List<Skill> skills
    ) {
        User studentUser = User.builder()
                .rollNumber(rollNumber)
                .email(email)
                .password(passwordEncoder.encode("Password@123"))
                .fullName(fullName)
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .passwordChanged(false)
                .isEmailVerified(true)
                .profilePictureUrl(avatarUrl)
                .build();
        userRepository.save(studentUser);

        StudentProfile studentProfile = StudentProfile.builder()
                .user(studentUser)
                .phone(phone)
                .department(department)
                .degree(degree)
                .graduationYear(graduationYear)
                .bio(bio)
                .githubUrl(githubUrl)
                .linkedinUrl(linkedinUrl)
                .careerInterests(careerInterests)
                .skills(new HashSet<>(skills))
                .build();
        studentProfileRepository.save(studentProfile);
    }

    private void seedJobs(AlumniProfile arunAlumni, AlumniProfile sujithAlumni) {
        Job job1 = Job.builder()
                .alumni(arunAlumni)
                .title("Associate Backend Engineer")
                .company("Infosys")
                .location("Bangalore, India")
                .employmentType(EmploymentType.FULL_TIME)
                .experienceRequired("Fresher / 0-1 Year")
                .requiredSkills("Java, Spring Boot, REST APIs, MySQL, Git")
                .salaryRange("₹5L - ₹7L PA")
                .description("Our backend team at Infosys Bangalore is looking for fresh graduates with strong Java and REST API fundamentals. Happy to provide referrals to college juniors.")
                .applicationUrl("https://infosys.com/careers")
                .referralAvailable(true)
                .postedDate(LocalDate.now().minusDays(3))
                .applicationDeadline(LocalDate.now().plusDays(25))
                .isActive(true)
                .build();
        jobRepository.save(job1);

        Job job2 = Job.builder()
                .alumni(sujithAlumni)
                .title("Software Developer (Full Stack)")
                .company("Zoho Corporation")
                .location("Chennai, India")
                .employmentType(EmploymentType.FULL_TIME)
                .experienceRequired("Fresher / 0-2 Years")
                .requiredSkills("Java, React.js, PostgreSQL, REST APIs")
                .salaryRange("₹6L - ₹8.5L PA")
                .description("Zoho's CRM team is hiring developers passionate about building clean user experiences and robust web services. Send me a message for a direct referral.")
                .applicationUrl("https://careers.zohocorp.com")
                .referralAvailable(true)
                .postedDate(LocalDate.now().minusDays(1))
                .applicationDeadline(LocalDate.now().plusDays(20))
                .isActive(true)
                .build();
        jobRepository.save(job2);
    }

    private void seedEvents(User alumniOrganizer, User adminOrganizer) {
        Event event1 = Event.builder()
                .organizer(alumniOrganizer)
                .title("Placement Prep: DSA, System Design, and What Actually Matters")
                .description("An interactive session sharing campus placement strategies, DSA roadmap, and mock technical interview tips.")
                .eventType(EventType.CAREER_GUIDANCE)
                .eventDate(LocalDateTime.now().plusDays(7).withHour(18).withMinute(30))
                .location("Google Meet (link shared on registration)")
                .maxParticipants(80)
                .registrationDeadline(LocalDateTime.now().plusDays(6))
                .isActive(true)
                .build();
        eventRepository.save(event1);

        Event event2 = Event.builder()
                .organizer(adminOrganizer)
                .title("Alumni Homecoming & Networking Meetup 2026")
                .description("Annual campus gathering reconnecting past batches with current students for career mentoring and networking dinner.")
                .eventType(EventType.MEETUP)
                .eventDate(LocalDateTime.now().plusDays(20).withHour(10).withMinute(0))
                .location("Main Campus Auditorium, Block A")
                .maxParticipants(200)
                .registrationDeadline(LocalDateTime.now().plusDays(18))
                .isActive(true)
                .build();
        eventRepository.save(event2);
    }

    private void seedPosts(AlumniProfile arun, AlumniProfile sujith) {
        Post post1 = Post.builder()
                .alumni(arun)
                .title("My Campus Placement Journey — What I'd Tell Myself in College")
                .category(PostCategory.INTERVIEW_EXPERIENCE)
                .content("A few key takeaways from campus placements: stay consistent with DSA, build at least 2 solid full-stack projects you can explain deeply, and keep your resume clean and concise. If you need a resume review, feel free to reach out!")
                .likeCount(24)
                .commentCount(5)
                .isVisible(true)
                .build();
        postRepository.save(post1);

        Post post2 = Post.builder()
                .alumni(sujith)
                .title("Full Stack Roadmap for 2026: Balancing Frontend & Backend")
                .category(PostCategory.CAREER_ADVICE)
                .content("In industry, teams value engineers who understand how the frontend communicates with the backend — state management, REST contracts, and database query optimization. Happy to answer questions from juniors.")
                .likeCount(19)
                .commentCount(3)
                .isVisible(true)
                .build();
        postRepository.save(post2);
    }
}
