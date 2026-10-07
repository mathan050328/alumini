package com.alumniconnect.repository;

import com.alumniconnect.entity.Post;
import com.alumniconnect.entity.enums.PostCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByIsVisibleTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByIsVisibleTrueAndCategoryOrderByCreatedAtDesc(PostCategory category, Pageable pageable);

    List<Post> findByAlumniIdOrderByCreatedAtDesc(Long alumniId);

    Long countByIsVisibleTrue();
}
