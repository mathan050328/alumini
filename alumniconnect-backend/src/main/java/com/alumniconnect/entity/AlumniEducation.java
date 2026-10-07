package com.alumniconnect.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Alumni education history — child of AlumniProfile.
 */
@Entity
@Table(name = "alumni_education")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumni_profile_id", nullable = false)
    private AlumniProfile alumniProfile;

    @Column(nullable = false, length = 200)
    private String institution;

    @Column(nullable = false, length = 150)
    private String degree;

    @Column(name = "year_of_completion")
    private Integer yearOfCompletion;
}
