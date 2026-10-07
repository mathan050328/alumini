package com.alumniconnect.entity;

import com.alumniconnect.entity.enums.MentorshipStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Mentorship request entity.
 * Tracks the full lifecycle: PENDING → ACCEPTED/REJECTED → COMPLETED/CANCELLED.
 * Business rule: Only one active (PENDING or ACCEPTED) mentorship allowed per student-alumni pair.
 */
@Entity
@Table(name = "mentorships", indexes = {
        @Index(name = "idx_mentorship_student", columnList = "student_id"),
        @Index(name = "idx_mentorship_alumni", columnList = "alumni_id"),
        @Index(name = "idx_mentorship_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mentorship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumni_id", nullable = false)
    private AlumniProfile alumni;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MentorshipStatus status = MentorshipStatus.PENDING;

    @CreationTimestamp
    @Column(name = "requested_at", updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
