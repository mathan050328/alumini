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
            ensurePendingAlumniVerified();
            return;
        }

        logger.info("Initializing default development dataset...");

        seedSkills();
        Skill javaSkill = findSkill("Java");
        Skill springSkill = findSkill("Spring Boot");
        Skill reactSkill = findSkill("React.js");
        Skill awsSkill = findSkill("AWS");
        Skill dockerSkill = findSkill("Docker");

        User admin = createAdminUser();

        AlumniProfile arunAlumni = createAlumni(
                "15CS042",
                "arun.dev@gmail.com",
                "Arun",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                "+91 9876501234",
                "Computer Science and Engineering",
                2019,
                "Infosys",
                "Senior Systems Engineer",
                5,
                "Pune, India",
                "Working as a backend engineer at Infosys for the past 5 years. I mainly deal with microservices and REST APIs. " +
                "Happy to help juniors with resume reviews, mock interviews, or just figuring out where to start with placements.",
                "https://github.com/arun-dev",
                "https://linkedin.com/in/arun-dev",
                Arrays.asList(javaSkill, springSkill, dockerSkill, awsSkill)
        );

        AlumniProfile jenishAlumni = createAlumni(
                "17IT089",
                "jenish.dev@gmail.com",
                "Jenish",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                "+91 9845002345",
                "Information Technology",
                2021,
                "Zoho Corporation",
                "Software Developer",
                3,
                "Chennai, India",
                "Full stack developer at Zoho. I work on the CRM module — mostly Java on the backend and React for the UI. " +
                "I remember how confusing placements were in final year, so I try to be available for anyone who needs guidance.",
                "https://github.com/jenish-dev",
                "https://linkedin.com/in/jenish-dev",
                Arrays.asList(javaSkill, reactSkill, awsSkill)
        );

        createDefaultStudent(Arrays.asList(javaSkill, springSkill, reactSkill));
        seedJobs(arunAlumni, jenishAlumni);
        seedEvents(arunAlumni.getUser(), admin);
        seedPosts(arunAlumni);

        logger.info("Development dataset initialized.");
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
                "GraphQL", "Redis", "Kafka", "Machine Learning"
        );
        for (String name : skillNames) {
            skillRepository.save(Skill.builder().name(name).build());
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

    private void createDefaultStudent(List<Skill> skills) {
        User studentUser = User.builder()
                .rollNumber("21CS101")
                .email(null)
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Rahul Verma")
                .role(Role.ROLE_STUDENT)
                .isActive(true)
                .passwordChanged(false)
                .isEmailVerified(false)
                .profilePictureUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150")
                .build();
        userRepository.save(studentUser);

        StudentProfile studentProfile = StudentProfile.builder()
                .user(studentUser)
                .phone("+91 9123456780")
                .department("Computer Science and Engineering")
                .degree("B.Tech")
                .graduationYear(2025)
                .bio("Final year CSE student. Been working on a couple of side projects and trying to get better at system design. " +
                     "Looking for SDE roles in backend or full stack. Open to connecting with alumni for guidance.")
                .githubUrl("https://github.com/rahulverma25")
                .linkedinUrl("https://linkedin.com/in/rahul-verma-cse")
                .careerInterests("Backend Engineering, Full Stack Development, Cloud Computing")
                .skills(new HashSet<>(skills))
                .build();
        studentProfileRepository.save(studentProfile);
    }

    private void seedJobs(AlumniProfile arunAlumni, AlumniProfile jenishAlumni) {
        Job job1 = Job.builder()
                .alumni(arunAlumni)
                .title("Associate Backend Engineer")
                .company("Infosys")
                .location("Pune, India")
                .employmentType(EmploymentType.FULL_TIME)
                .experienceRequired("Fresher / 0-1 Year")
                .requiredSkills("Java, Spring Boot, REST APIs, MySQL, Git")
                .salaryRange("₹4L - ₹6.5L PA")
                .description("Our team in Pune is looking for fresh graduates or early-career engineers with solid Java fundamentals. " +
                              "You'll be working on internal enterprise services. I'm happy to refer strong candidates from my college.")
                .applicationUrl("https://infosys.com/careers")
                .referralAvailable(true)
                .postedDate(LocalDate.now().minusDays(4))
                .applicationDeadline(LocalDate.now().plusDays(28))
                .isActive(true)
                .build();
        jobRepository.save(job1);

        Job job2 = Job.builder()
                .alumni(jenishAlumni)
                .title("Junior Software Developer (Full Stack)")
                .company("Zoho Corporation")
                .location("Chennai, India")
                .employmentType(EmploymentType.FULL_TIME)
                .experienceRequired("Fresher / 0-2 Years")
                .requiredSkills("Java, React.js, SQL, REST APIs")
                .salaryRange("₹5L - ₹8L PA")
                .description("Zoho's CRM team is hiring developers who enjoy building real-world products used by millions. " +
                              "We value problem-solving over competitive programming scores. Good communication and clean code matter here. " +
                              "Drop me a message if you want to know more about the role or the team culture before applying.")
                .applicationUrl("https://careers.zohocorp.com")
                .referralAvailable(true)
                .postedDate(LocalDate.now().minusDays(2))
                .applicationDeadline(LocalDate.now().plusDays(22))
                .isActive(true)
                .build();
        jobRepository.save(job2);
    }

    private void seedEvents(User alumniOrganizer, User adminOrganizer) {
        Event event1 = Event.builder()
                .organizer(alumniOrganizer)
                .title("Placement Prep: Resume, DSA, and What Actually Matters")
                .description("An informal session where I'll share what worked for me during campus placements and what I wish I knew earlier. " +
                              "We'll cover resume building, DSA strategy, and how to handle HR rounds. Feel free to bring your questions.")
                .eventType(EventType.CAREER_GUIDANCE)
                .eventDate(LocalDateTime.now().plusDays(7).withHour(18).withMinute(30))
                .location("Google Meet (link shared on registration)")
                .maxParticipants(60)
                .registrationDeadline(LocalDateTime.now().plusDays(6))
                .isActive(true)
                .build();
        eventRepository.save(event1);

        Event event2 = Event.builder()
                .organizer(adminOrganizer)
                .title("Alumni Homecoming – Annual Meetup 2026")
                .description("Come back to campus, reconnect with batchmates, and meet the current students. " +
                              "The evening includes a networking dinner, a career panel, and a few awards for outstanding alumni.")
                .eventType(EventType.MEETUP)
                .eventDate(LocalDateTime.now().plusDays(20).withHour(10).withMinute(0))
                .location("Main Campus Auditorium, Block A")
                .maxParticipants(200)
                .registrationDeadline(LocalDateTime.now().plusDays(18))
                .isActive(true)
                .build();
        eventRepository.save(event2);
    }

    private void seedPosts(AlumniProfile author) {
        Post post = Post.builder()
                .alumni(author)
                .title("My Placement Journey — What I'd Tell Myself in Final Year")
                .category(PostCategory.INTERVIEW_EXPERIENCE)
                .content("I got placed at Infosys in my final year after a lot of back and forth. I'm not going to pretend I had it all figured out. " +
                         "I failed a couple of rounds at other companies before things clicked. A few things that actually helped: " +
                         "practicing DSA consistently (not in one panic-sprint before the exam), doing mock interviews with friends, " +
                         "and honestly just keeping my resume to one clean page. If you're in final year and anxious about placements, " +
                         "feel free to reach out — I check my messages on this platform.")
                .likeCount(18)
                .commentCount(4)
                .isVisible(true)
                .build();
        postRepository.save(post);
    }
}
