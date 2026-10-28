package com.alumniconnect.repository;

import com.alumniconnect.entity.User;
import com.alumniconnect.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByRollNumber(String rollNumber);

    Optional<User> findByRollNumberIgnoreCase(String rollNumber);

    Optional<User> findByEmailIgnoreCaseOrRollNumberIgnoreCase(String email, String rollNumber);

    Boolean existsByEmail(String email);

    Boolean existsByEmailIgnoreCase(String email);

    Boolean existsByRollNumber(String rollNumber);

    Boolean existsByRollNumberIgnoreCase(String rollNumber);

    List<User> findByRole(Role role);

    Long countByRole(Role role);

    Long countByIsActiveTrue();
}
