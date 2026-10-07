package com.alumniconnect.entity;

import com.alumniconnect.entity.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Job application entity — student applies to a job.
 * Unique constraint prevents duplicate applications.
 */
@Entity
@Table(name = "job_applications",
        uniqueConstraints = @UniqueConstraint(name = "uk_application_student_job",
                columnNames = {"student_id", "job_id"}),
        indexes = {
                @Index(name = "idx_application_student", columnList = "student_id"),
                @Index(name = "idx_application_job", columnList = "job_id")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @CreationTimestamp
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;
}
