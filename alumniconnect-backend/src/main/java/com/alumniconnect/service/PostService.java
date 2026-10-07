package com.alumniconnect.service;

import com.alumniconnect.dto.request.CommentRequest;
import com.alumniconnect.dto.request.PostRequest;
import com.alumniconnect.dto.response.CommentResponse;
import com.alumniconnect.dto.response.PagedResponse;
import com.alumniconnect.dto.response.PostResponse;
import com.alumniconnect.entity.*;
import com.alumniconnect.entity.enums.PostCategory;
import com.alumniconnect.entity.enums.Role;
import com.alumniconnect.exception.BadRequestException;
import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final AlumniProfileRepository alumniProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public PostResponse createPost(Long alumniUserId, PostRequest request) {
        AlumniProfile alumni = alumniProfileRepository.findByUserId(alumniUserId)
                .orElseThrow(() -> new ResourceNotFoundException("AlumniProfile", "userId", alumniUserId));

        Post post = Post.builder()
                .alumni(alumni)
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .likeCount(0)
                .commentCount(0)
                .isVisible(true)
                .build();

        post = postRepository.save(post);
        return mapToResponse(post, alumniUserId);
    }

    @Transactional
    public PostResponse updatePost(Long userId, Long postId, PostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        if (!post.getAlumni().getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to edit this post");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setCategory(request.getCategory());

        post = postRepository.save(post);
        return mapToResponse(post, userId);
    }

    @Transactional
    public void deletePost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isOwner = post.getAlumni().getUser().getId().equals(userId);
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new BadRequestException("You are not authorized to delete this post");
        }

        postRepository.delete(post);
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        return mapToResponse(post, currentUserId);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PostResponse> getPosts(PostCategory category, int page, int size, Long currentUserId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage;

        if (category != null) {
            postPage = postRepository.findByIsVisibleTrueAndCategoryOrderByCreatedAtDesc(category, pageable);
        } else {
            postPage = postRepository.findByIsVisibleTrueOrderByCreatedAtDesc(pageable);
        }

        List<PostResponse> content = postPage.getContent().stream()
                .map(p -> mapToResponse(p, currentUserId))
                .collect(Collectors.toList());

        return PagedResponse.from(postPage, content);
    }

    @Transactional
    public boolean toggleLike(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (postLikeRepository.existsByUserIdAndPostId(userId, postId)) {
            postLikeRepository.deleteByUserIdAndPostId(userId, postId);
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            postRepository.save(post);
            return false;
        } else {
            PostLike like = PostLike.builder().user(user).post(post).build();
            postLikeRepository.save(like);
            post.setLikeCount(post.getLikeCount() + 1);
            postRepository.save(post);
            return true;
        }
    }

    @Transactional
    public CommentResponse addComment(Long userId, Long postId, CommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Comment comment = Comment.builder()
                .post(post)
                .user(user)
                .content(request.getContent())
                .build();

        comment = commentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        return mapToCommentResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isOwner = comment.getUser().getId().equals(userId);
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new BadRequestException("You are not authorized to delete this comment");
        }

        Post post = comment.getPost();
        commentRepository.delete(comment);

        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepository.save(post);
    }

    private PostResponse mapToResponse(Post p, Long currentUserId) {
        AlumniProfile a = p.getAlumni();

        Boolean isLiked = false;
        if (currentUserId != null) {
            isLiked = postLikeRepository.existsByUserIdAndPostId(currentUserId, p.getId());
        }

        return PostResponse.builder()
                .id(p.getId())
                .alumniId(a.getId())
                .alumniUserId(a.getUser().getId())
                .alumniName(a.getUser().getFullName())
                .alumniCompany(a.getCurrentCompany())
                .alumniJobTitle(a.getJobTitle())
                .alumniProfilePictureUrl(a.getUser().getProfilePictureUrl())
                .title(p.getTitle())
                .content(p.getContent())
                .category(p.getCategory())
                .likeCount(p.getLikeCount())
                .commentCount(p.getCommentCount())
                .isVisible(p.getIsVisible())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .isLikedByCurrentUser(isLiked)
                .build();
    }

    private CommentResponse mapToCommentResponse(Comment c) {
        User u = c.getUser();
        return CommentResponse.builder()
                .id(c.getId())
                .postId(c.getPost().getId())
                .userId(u.getId())
                .userName(u.getFullName())
                .userEmail(u.getEmail())
                .userProfilePictureUrl(u.getProfilePictureUrl())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
