package com.alumniconnect.entity;

import com.alumniconnect.entity.enums.MentorshipAvailability;
import com.alumniconnect.entity.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Alumni profile entity containing professional information.
 * Linked 1:1 with User via user_id foreign key.
 * verificationStatus must be VERIFIED before alumni appear in public search.
 */
@Entity
@Table(name = "alumni_profiles", indexes = {
        @Index(name = "idx_alumni_verification", columnList = "verification_status"),
        @Index(name = "idx_alumni_company", columnList = "current_company"),
        @Index(name = "idx_alumni_location", columnList = "location")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String department;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "current_company", length = 150)
    private String currentCompany;

    @Column(name = "job_title", length = 150)
    private String jobTitle;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(length = 150)
    private String location;

    @Column(name = "professional_bio", columnDefinition = "TEXT")
    private String professionalBio;

    @Column(name = "github_url", length = 255)
    private String githubUrl;

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 20)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "mentorship_availability", nullable = false, length = 20)
    @Builder.Default
    private MentorshipAvailability mentorshipAvailability = MentorshipAvailability.UNAVAILABLE;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "alumni_skills",
            joinColumns = @JoinColumn(name = "alumni_profile_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"alumni_profile_id", "skill_id"})
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    @OneToMany(mappedBy = "alumniProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AlumniExperience> experiences = new ArrayList<>();

    @OneToMany(mappedBy = "alumniProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AlumniEducation> educations = new ArrayList<>();

    @OneToMany(mappedBy = "alumniProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AlumniCertification> certifications = new ArrayList<>();
}
