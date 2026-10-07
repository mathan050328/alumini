package com.alumniconnect.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Normalized skill entity shared across Student and Alumni profiles via join tables.
 */
@Entity
@Table(name = "skills", indexes = {
        @Index(name = "idx_skill_name", columnList = "name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;
}
