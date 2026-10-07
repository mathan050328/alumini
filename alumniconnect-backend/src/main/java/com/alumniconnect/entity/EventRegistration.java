package com.alumniconnect.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Event registration entity.
 * Unique constraint prevents duplicate registrations.
 */
@Entity
@Table(name = "event_registrations",
        uniqueConstraints = @UniqueConstraint(name = "uk_event_registration_user_event",
                columnNames = {"user_id", "event_id"}),
        indexes = {
                @Index(name = "idx_event_reg_user", columnList = "user_id"),
                @Index(name = "idx_event_reg_event", columnList = "event_id")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @CreationTimestamp
    @Column(name = "registered_at", updatable = false)
    private LocalDateTime registeredAt;
}
