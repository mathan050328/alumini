package com.alumniconnect.service;

import com.alumniconnect.dto.request.MessageRequest;
import com.alumniconnect.dto.response.ConversationResponse;
import com.alumniconnect.dto.response.MessageResponse;
import com.alumniconnect.entity.Conversation;
import com.alumniconnect.entity.Message;
import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.NotificationType;
import com.alumniconnect.exception.BadRequestException;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.ConversationRepository;
import com.alumniconnect.repository.MessageRepository;
import com.alumniconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Transactional
    public Conversation getOrCreateConversation(Long userOneId, Long userTwoId) {
        if (userOneId.equals(userTwoId)) {
            throw new BadRequestException("Cannot create conversation with yourself");
        }

        return conversationRepository.findByParticipants(userOneId, userTwoId)
                .orElseGet(() -> {
                    User u1 = userRepository.findById(userOneId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userOneId));
                    User u2 = userRepository.findById(userTwoId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userTwoId));

                    Conversation conv = Conversation.builder()
                            .participantOne(u1)
                            .participantTwo(u2)
                            .lastMessageAt(LocalDateTime.now())
                            .build();

                    return conversationRepository.save(conv);
                });
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findByParticipantId(userId);

        return conversations.stream().map(c -> {
            User otherUser = c.getParticipantOne().getId().equals(userId)
                    ? c.getParticipantTwo()
                    : c.getParticipantOne();

            List<Message> messages = messageRepository.findByConversationIdOrderBySentAtAsc(c.getId());
            String lastMessage = messages.isEmpty() ? "" : messages.get(messages.size() - 1).getContent();

            Long unreadCount = messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(c.getId(), userId);

            return ConversationResponse.builder()
                    .id(c.getId())
                    .otherUserId(otherUser.getId())
                    .otherUserName(otherUser.getFullName())
                    .otherUserProfilePictureUrl(otherUser.getProfilePictureUrl())
                    .otherUserRole(otherUser.getRole().name())
                    .lastMessage(lastMessage)
                    .lastMessageAt(c.getLastMessageAt())
                    .unreadCount(unreadCount)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public List<MessageResponse> getConversationMessages(Long userId, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        boolean isParticipant = conversation.getParticipantOne().getId().equals(userId)
                || conversation.getParticipantTwo().getId().equals(userId);

        if (!isParticipant) {
            throw new BadRequestException("You are not authorized to view this conversation");
        }

        List<Message> messages = messageRepository.findByConversationIdOrderBySentAtAsc(conversationId);

        // Mark unread messages sent by the other party as read
        for (Message m : messages) {
            if (!m.getSender().getId().equals(userId) && !m.getIsRead()) {
                m.setIsRead(true);
                messageRepository.save(m);
            }
        }

        return messages.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(Long senderId, Long conversationId, MessageRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        boolean isParticipant = conversation.getParticipantOne().getId().equals(senderId)
                || conversation.getParticipantTwo().getId().equals(senderId);

        if (!isParticipant) {
            throw new BadRequestException("You are not a participant in this conversation");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", senderId));

        User recipient = conversation.getParticipantOne().getId().equals(senderId)
                ? conversation.getParticipantTwo()
                : conversation.getParticipantOne();

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageResponse response = mapToResponse(message);

        // Send via WebSocket to recipient's queue
        try {
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(recipient.getId()),
                    "/queue/messages",
                    response
            );
        } catch (Exception ignored) {}

        // In-app notification
        notificationService.createNotification(
                recipient.getId(),
                NotificationType.NEW_MESSAGE,
                "New message from " + sender.getFullName(),
                request.getContent().length() > 50 ? request.getContent().substring(0, 50) + "..." : request.getContent(),
                "/messages/" + conversation.getId()
        );

        return response;
    }

    @Transactional(readOnly = true)
    public Long getTotalUnreadCount(Long userId) {
        return messageRepository.countTotalUnreadForUser(userId);
    }

    private MessageResponse mapToResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getFullName())
                .senderProfilePictureUrl(m.getSender().getProfilePictureUrl())
                .content(m.getContent())
                .isRead(m.getIsRead())
                .sentAt(m.getSentAt())
                .build();
    }
}
