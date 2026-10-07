package com.alumniconnect.repository;

import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    Long countByRole(Role role);

    Long countByIsActiveTrue();
}
