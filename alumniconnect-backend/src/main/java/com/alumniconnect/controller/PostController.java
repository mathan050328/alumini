package com.alumniconnect.controller;

import com.alumniconnect.dto.request.CommentRequest;
import com.alumniconnect.dto.request.PostRequest;
import com.alumniconnect.dto.response.CommentResponse;
import com.alumniconnect.dto.response.PagedResponse;
import com.alumniconnect.dto.response.PostResponse;
import com.alumniconnect.entity.enums.PostCategory;
import com.alumniconnect.security.UserPrincipal;
import com.alumniconnect.service.PostService;
import com.alumniconnect.util.AppConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Career Posts", description = "Alumni career advice articles, discussions, and reactions")
public class PostController {

    private final PostService postService;

    @PostMapping
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Publish a new career advice / interview experience article")
    public ResponseEntity<PostResponse> createPost(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody PostRequest request) {
        PostResponse response = postService.createPost(currentUser.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Browse career posts (paginated, optional category filter)")
    public ResponseEntity<PagedResponse<PostResponse>> getPosts(
            @RequestParam(required = false) PostCategory category,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(postService.getPosts(category, page, size, currentUserId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single post by ID")
    public ResponseEntity<PostResponse> getPostById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(postService.getPostById(id, currentUserId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ALUMNI')")
    @Operation(summary = "Update career post")
    public ResponseEntity<PostResponse> updatePost(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.updatePost(currentUser.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete career post")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        postService.deletePost(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Toggle like/unlike on a post")
    public ResponseEntity<Map<String, Boolean>> toggleLike(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        boolean isLiked = postService.toggleLike(currentUser.getId(), id);
        return ResponseEntity.ok(Collections.singletonMap("liked", isLiked));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a comment to a post")
    public ResponseEntity<CommentResponse> addComment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request) {
        CommentResponse response = postService.addComment(currentUser.getId(), id, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get comments for a post")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getComments(id));
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<Void> deleteComment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long postId,
            @PathVariable Long commentId) {
        postService.deleteComment(currentUser.getId(), commentId);
        return ResponseEntity.noContent().build();
    }
}
