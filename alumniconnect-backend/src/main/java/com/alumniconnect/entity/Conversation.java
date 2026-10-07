package com.alumniconnect.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Conversation entity representing a chat thread between two users.
 * Enforced as unique pair — only one conversation can exist between two users.
 */
@Entity
@Table(name = "conversations",
        uniqueConstraints = @UniqueConstraint(name = "uk_conversation_participants",
                columnNames = {"participant_one_id", "participant_two_id"}),
        indexes = {
                @Index(name = "idx_conversation_p1", columnList = "participant_one_id"),
                @Index(name = "idx_conversation_p2", columnList = "participant_two_id"),
                @Index(name = "idx_conversation_last_msg", columnList = "last_message_at")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_one_id", nullable = false)
    private User participantOne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_two_id", nullable = false)
    private User participantTwo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;
}
