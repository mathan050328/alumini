package com.alumniconnect.dto.response;

import com.alumniconnect.entity.enums.PostCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    private Long id;
    private Long alumniId;
    private Long alumniUserId;
    private String alumniName;
    private String alumniCompany;
    private String alumniJobTitle;
    private String alumniProfilePictureUrl;

    private String title;
    private String content;
    private PostCategory category;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean isVisible;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Contextual field
    private Boolean isLikedByCurrentUser;
}
