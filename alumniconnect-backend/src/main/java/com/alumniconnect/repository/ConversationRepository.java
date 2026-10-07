package com.alumniconnect.repository;

import com.alumniconnect.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Find all conversations for a given user (as either participant).
     * Ordered by last message time descending for inbox-style display.
     */
    @Query("SELECT c FROM Conversation c WHERE c.participantOne.id = :userId " +
           "OR c.participantTwo.id = :userId ORDER BY c.lastMessageAt DESC")
    List<Conversation> findByParticipantId(@Param("userId") Long userId);

    /**
     * Find existing conversation between two users (order-independent pair check).
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participantOne.id = :userOne AND c.participantTwo.id = :userTwo) OR " +
           "(c.participantOne.id = :userTwo AND c.participantTwo.id = :userOne)")
    Optional<Conversation> findByParticipants(
            @Param("userOne") Long userOne,
            @Param("userTwo") Long userTwo);
}
