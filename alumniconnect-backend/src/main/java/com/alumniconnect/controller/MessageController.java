package com.alumniconnect.controller;

import com.alumniconnect.dto.request.MessageRequest;
import com.alumniconnect.dto.response.ConversationResponse;
import com.alumniconnect.dto.response.MessageResponse;
import com.alumniconnect.entity.Conversation;
import com.alumniconnect.security.UserPrincipal;
import com.alumniconnect.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Direct messaging and conversation endpoints")
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/conversations")
    @Operation(summary = "Get all active conversations for current user")
    public ResponseEntity<List<ConversationResponse>> getConversations(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(messageService.getUserConversations(currentUser.getId()));
    }

    @GetMapping("/conversations/{conversationId}")
    @Operation(summary = "Get all messages in a specific conversation")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long conversationId) {
        return ResponseEntity.ok(messageService.getConversationMessages(currentUser.getId(), conversationId));
    }

    @PostMapping("/conversations/{conversationId}")
    @Operation(summary = "Send a message within an existing conversation")
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long conversationId,
            @Valid @RequestBody MessageRequest request) {
        MessageResponse response = messageService.sendMessage(currentUser.getId(), conversationId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/conversations")
    @Operation(summary = "Start or retrieve conversation with another user")
    public ResponseEntity<Map<String, Long>> startConversation(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Long> payload) {
        Long recipientId = payload.get("recipientId");
        Conversation conversation = messageService.getOrCreateConversation(currentUser.getId(), recipientId);
        return ResponseEntity.ok(Collections.singletonMap("conversationId", conversation.getId()));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get total unread message count across all conversations")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long count = messageService.getTotalUnreadCount(currentUser.getId());
        return ResponseEntity.ok(Collections.singletonMap("unreadCount", count));
    }
}
