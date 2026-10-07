package com.alumniconnect.repository;

import com.alumniconnect.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationIdOrderBySentAtAsc(Long conversationId);

    /**
     * Count unread messages in a conversation for a specific user
     * (messages sent by the other person that this user hasn't read).
     */
    Long countByConversationIdAndSenderIdNotAndIsReadFalse(Long conversationId, Long userId);

    /**
     * Count total unread messages across all conversations for a user.
     * A message is unread if the current user is NOT the sender and isRead is false.
     */
    @Query("SELECT COUNT(m) FROM Message m " +
           "JOIN Conversation c ON m.conversation.id = c.id " +
           "WHERE (c.participantOne.id = :userId OR c.participantTwo.id = :userId) " +
           "AND m.sender.id != :userId AND m.isRead = false")
    Long countTotalUnreadForUser(@Param("userId") Long userId);
}
