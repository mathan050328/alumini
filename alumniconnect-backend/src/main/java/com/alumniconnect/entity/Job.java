package com.alumniconnect.entity;

import com.alumniconnect.entity.enums.EmploymentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Job posting entity — created by Alumni.
 * Includes employment type, skills required, salary, and referral availability.
 */
@Entity
@Table(name = "jobs", indexes = {
        @Index(name = "idx_job_alumni", columnList = "alumni_id"),
        @Index(name = "idx_job_active", columnList = "is_active"),
        @Index(name = "idx_job_company", columnList = "company"),
        @Index(name = "idx_job_location", columnList = "location")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumni_id", nullable = false)
    private AlumniProfile alumni;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 150)
    private String company;

    @Column(length = 150)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 20)
    private EmploymentType employmentType;

    @Column(name = "experience_required", length = 100)
    private String experienceRequired;

    @Column(name = "required_skills", columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(name = "salary_range", length = 100)
    private String salaryRange;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "application_url", length = 500)
    private String applicationUrl;

    @Column(name = "referral_available")
    @Builder.Default
    private Boolean referralAvailable = false;

    @Column(name = "posted_date")
    private LocalDate postedDate;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
