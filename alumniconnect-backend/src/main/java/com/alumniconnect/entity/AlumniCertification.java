package com.alumniconnect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Alumni certification — child of AlumniProfile.
 */
@Entity
@Table(name = "alumni_certifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniCertification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumni_profile_id", nullable = false)
    private AlumniProfile alumniProfile;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "issuing_organization", length = 200)
    private String issuingOrganization;

    @Column(name = "issue_date")
    private LocalDate issueDate;
}
