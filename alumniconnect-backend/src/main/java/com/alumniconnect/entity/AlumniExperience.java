package com.alumniconnect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Alumni work experience — child of AlumniProfile.
 */
@Entity
@Table(name = "alumni_experiences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumni_profile_id", nullable = false)
    private AlumniProfile alumniProfile;

    @Column(nullable = false, length = 150)
    private String company;

    @Column(name = "job_title", nullable = false, length = 150)
    private String jobTitle;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_current")
    @Builder.Default
    private Boolean isCurrent = false;
}
