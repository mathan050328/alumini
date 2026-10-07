# 🎯 AlumniConnect — Comprehensive Technical Interview & Viva Guide

This document is engineered to help you explain and defend every architectural decision, line of code, and design pattern in **AlumniConnect** during **technical interviews, system design rounds, and final-year viva examinations**.

---

## 📑 Table of Contents
1. [Project Elevator Pitch](#1-project-elevator-pitch)
2. [Architectural Overview & Design Patterns](#2-architectural-overview--design-patterns)
3. [Technology Stack Rationale](#3-technology-stack-rationale)
4. [Deep Dive: Security & Authentication](#4-deep-dive-security--authentication)
5. [Deep Dive: Database Engineering & Optimization](#5-deep-dive-database-engineering--optimization)
6. [Deep Dive: Recommendation Algorithm](#6-deep-dive-recommendation-algorithm)
7. [Deep Dive: Real-Time Communication](#7-deep-dive-real-time-communication)
8. [25+ Technical Interview Questions & Model Answers](#8-25-technical-interview-questions--model-answers)

---

## 1. Project Elevator Pitch

> *"AlumniConnect is an enterprise-grade full-stack platform built with Java 21, Spring Boot 3, MySQL, and React 18. It solves the fragmentation between university students and alumni by providing structured mentorship workflows, alumni-exclusive job postings with referral tracking, verified knowledge sharing, real-time messaging, and an automated rule-based skill recommendation engine. Rather than a basic CRUD system, it models complex domain lifecycles, enforces strict role-based access control, prevents race conditions in event registrations, and is packaged for cloud deployment with Docker and CI/CD pipelines."*

---

## 2. Architectural Overview & Design Patterns

### Layered Architecture
```
Client (React SPA)
       │ HTTP / HTTPS (JWT in Authorization Header) & WebSocket (STOMP)
       ▼
Controller Layer (@RestController)
       │ DTO Validation (@Valid, Bean Validation)
       ▼
Service Layer (@Service, @Transactional)
       │ Business Logic, Workflow Transitions, Recommendation Scoring
       ▼
Repository Layer (Spring Data JPA, JpaSpecificationExecutor)
       │ JPQL / SQL Queries, Pagination, Dynamic Specifications
       ▼
Database (MySQL 8.0 Engine, InnoDB)
```

### Key Design Patterns Implemented
1. **DTO Pattern (Data Transfer Object)**: Decouples API contract from database schema. Sensitive fields (e.g., password hash, internal audit flags) are never exposed over the wire.
2. **Repository Pattern**: Abstract data access logic behind Spring Data JPA interfaces.
3. **Specification Pattern (`JpaSpecificationExecutor`)**: Enables dynamic multi-parameter querying (combining name, company, department, and skills) without constructing fragile dynamic SQL strings.
4. **Strategy / Filter Pattern (Spring Security Filter Chain)**: Intercepts every HTTP request with `JwtAuthenticationFilter` prior to reaching the controller.
5. **Builder Pattern (Lombok `@Builder`)**: Ensures clean, immutable object creation across entities and DTOs.
6. **Observer / Notification Pattern**: Decoupled notification generation upon critical domain events (mentorship accepted, referral submitted).

---

## 3. Technology Stack Rationale

### Why Java 21 & Spring Boot 3?
- **Java 21 (LTS)**: Leverages modern language enhancements: Record patterns, pattern matching for switch, sequenced collections, and preparation for Virtual Threads (`Project Loom`).
- **Spring Boot 3.3**: Uses Jakarta EE 10 baseline, native observability support with Micrometer, and Spring Framework 6.

### Why Relational Database (MySQL) instead of MongoDB?
- **Domain Nature**: Alumni networking is fundamentally relational:
  - Users have 1:1 profiles.
  - Mentorship connects 1 Student with 1 Alumni.
  - Job applications connect Students with Jobs with strict uniqueness (`student_id`, `job_id`).
  - Events have strict capacity limits.
- **ACID Transactions**: Required to prevent race conditions (e.g., double-applying for a job, exceeding event registration caps). MongoDB's document model would cause excessive data duplication and manual referential integrity enforcement.

### Why React 18 with Vite?
- **Vite Build Performance**: Uses native ES modules during development and Rolldown/Rollup for production packaging, booting in milliseconds compared to Webpack.
- **Tailwind CSS v4**: Utility-first CSS compiling to a tiny ~60KB gzipped production bundle without unused CSS rules.

---

## 4. Deep Dive: Security & Authentication

### The Stateless JWT Authentication Lifecycle
1. User submits credentials to `POST /api/auth/login`.
2. `AuthService` delegates to `AuthenticationManager.authenticate()` which triggers `CustomUserDetailsService.loadUserByUsername()`.
3. Passwords are verified via `BCryptPasswordEncoder` (salted, adaptive hashing with work factor 10).
4. On success, `JwtTokenProvider` signs an HMAC-SHA256 (`HS256`) token with:
   - Subject: `userId`
   - Claims: `email`, `role`
   - Expiration timestamp: 24 hours
5. The React client stores the JWT in `localStorage` and automatically attaches it to the `Authorization: Bearer <token>` header using an Axios request interceptor.
6. On subsequent requests, `JwtAuthenticationFilter` intercepts the request:
   - Validates signature and expiration using `Jwts.parser().verifyWith(secretKey)`.
   - Populates `SecurityContextHolder.getContext().setAuthentication(...)`.
7. `SecurityConfig` enforces Role-Based Access Control (`hasRole('STUDENT')`, `hasRole('ALUMNI')`, `hasRole('ADMIN')`).

---

## 5. Deep Dive: Database Engineering & Optimization

### Avoiding the JPA N+1 Problem
- **The Issue**: Fetching 20 jobs with lazy-loaded alumni relations can execute 1 query for the jobs + 20 individual queries for each alumni.
- **Our Solution**:
  1. We utilize `@EntityGraph` and custom JPQL `JOIN FETCH` queries in repositories (e.g., in `JobRepository` and `ConversationRepository`).
  2. Read-only endpoints use `@Transactional(readOnly = true)` to avoid unnecessary Hibernate dirty checking.
  3. DTO projection ensures only needed columns are selected.

### Indexing Strategy
- High-cardinality filter columns are indexed in MySQL:
  - `users(email)`: Unique index.
  - `alumni_profiles(current_company, location, verification_status)`: Compound/Single column indexes for fast directory filtering.
  - `mentorships(student_id, alumni_id, status)`: B-Tree index for dashboard lookups.
  - `notifications(user_id, is_read)`: Composite index for fast unread count queries.

### Data Integrity Constraints
- Unique composite constraint on `job_applications(student_id, job_id)` prevents accidental multiple submissions.
- Unique composite constraint on `saved_jobs(student_id, job_id)` prevents duplicate bookmarks.
- Unique composite constraint on `event_registrations(user_id, event_id)` guarantees registration uniqueness.

---

## 6. Deep Dive: Recommendation Algorithm

The platform features a **rule-based, weighted scoring engine** in `RecommendationService`:

$$\text{Total Score} = S_{\text{skills}} + S_{\text{dept}} + S_{\text{interests}}$$

1. **Skill Overlap ($S_{\text{skills}}$ — Max 60 Points)**:
   $$S_{\text{skills}} = \left( \frac{|\text{StudentSkills} \cap \text{AlumniSkills}|}{|\text{StudentSkills}|} \right) \times 60$$
2. **Department Match ($S_{\text{dept}}$ — 20 Points)**:
   $$S_{\text{dept}} = 20 \quad \text{if student.dept} == \text{alumni.dept}, \quad 0 \text{ otherwise}$$
3. **Career Interest Alignment ($S_{\text{interests}}$ — Up to 20 Points)**:
   Alumni company and job title are checked against student career interest keywords.

The result is sorted in descending order of score, yielding accurate, interpretable recommendations.

---

## 7. Deep Dive: Real-Time Communication

- Uses **WebSocket protocol with STOMP sub-protocol** over SockJS.
- Endpoint: `/ws`
- Broker: Simple in-memory message broker enabled for `/topic` and `/queue`.
- Message Flow:
  - Client subscribes to private user queue.
  - `MessageService` saves message to MySQL database (persistence).
  - Controller dispatches payload to destination broker for instant peer delivery.
  - Offline users receive persistent database records + unread notification alerts.

---

## 8. 25+ Technical Interview Questions & Model Answers

### Q1: Can you explain the end-to-end architecture of AlumniConnect?
**Answer:** "AlumniConnect is a layered, full-stack web application. The frontend is a React 18 Single Page Application styled with Tailwind CSS, utilizing React Router for navigation and Axios for HTTP. The backend is built on Spring Boot 3 and Java 21 following a Controller-Service-Repository architecture. The database is a normalized MySQL 8 relational schema with foreign key constraints, composite unique keys, and targeted indexes. We use Spring Security with stateless JWT for authentication, STOMP WebSockets for instant messaging, and Docker Compose for container orchestration."

### Q2: Why did you choose JWT over traditional server-side HTTP Sessions?
**Answer:** "Server-side sessions require state storage on the application server (such as Tomcat memory or Redis). In a microservices or containerized deployment with multiple replicas behind a load balancer, sticky sessions or distributed session stores would be required. JWT tokens are self-contained and stateless; each request bears its own cryptographically verified claims, making our backend stateless, horizontally scalable, and cloud-ready."

### Q3: How do you protect passwords in your system?
**Answer:** "We use `BCryptPasswordEncoder` provided by Spring Security. BCrypt applies an adaptive cryptographic hashing algorithm that incorporates a random 128-bit salt and an exponential cost factor (default 10 = $2^{10}$ key expansion rounds). This makes pre-computed rainbow table attacks impossible and protects against high-speed brute force attacks."

### Q4: How do you handle role-based authorization?
**Answer:** "We have three distinct roles: `ROLE_STUDENT`, `ROLE_ALUMNI`, and `ROLE_ADMIN`. In `SecurityConfig`, we define endpoint rules such as `/api/admin/**` requiring `hasRole('ADMIN')`. Within services, we also check ownership (e.g., verifying that the alumni accepting a mentorship request is indeed the recipient of that request)."

### Q5: How did you implement the Alumni search and discovery feature?
**Answer:** "Rather than writing multiple static SQL queries, we utilized Spring Data JPA's `JpaSpecificationExecutor`. We dynamically chain `Specification<AlumniProfile>` predicates depending on which query parameters the client supplies (name, company, department, location, skills). This dynamically compiles into an optimized SQL query executed with `Pageable` for server-side pagination."

### Q6: What prevents duplicate mentorship requests from the same student to the same alumni?
**Answer:** "We enforce this at two layers. First, in `MentorshipService`, before creating a request, we query `findByStudentIdAndAlumniIdAndStatusIn(studentId, alumniId, [PENDING, ACCEPTED])`. If an active record is found, we throw a `DuplicateResourceException`. Second, for job applications and event registrations, we also enforce composite unique constraints at the database schema level (`uk_student_job_application`)."

### Q7: How do you prevent event over-registration?
**Answer:** "When a user registers for an event in `EventService`, we run within a `@Transactional` boundary:
1. Check if the event registration deadline has passed.
2. Count active registrations (`eventRegistrationRepository.countByEventId(eventId)`).
3. If current registrations reach `maxParticipants`, reject with a `BadRequestException`."

### Q8: What is the N+1 query problem, and where could it happen here?
**Answer:** "The N+1 problem occurs when an entity with `@ManyToOne` or `@OneToMany` lazy relationships is retrieved in a list of $N$ items, and accessing each child executes an additional query, resulting in $1 + N$ queries. In AlumniConnect, we avoid this by using `@EntityGraph` and JPQL `JOIN FETCH` when retrieving posts with alumni profiles and conversations with participants."

### Q9: Why use DTOs instead of directly exposing JPA entities in controllers?
**Answer:** "Directly exposing entities causes four major problems:
1. Security leakage: sensitive columns like password hashes or internal status fields could be serialized into JSON.
2. Infinite recursion: bidirectional relationships (`User` $\leftrightarrow$ `StudentProfile`) trigger Jackson serialization loops.
3. Tight coupling: changing database schema breaks frontend contracts.
4. Over-fetching: transferring more data than the view requires."

### Q10: How does your skill recommendation engine work?
**Answer:** "It is a deterministic weighted scoring system. It evaluates verified alumni against a student's profile across three factors:
- Skill intersection: $\frac{\text{matching skills}}{\text{student skills}} \times 60$ points.
- Department match: 20 points if both are in the same department.
- Career interest keyword matching: up to 20 points if alumni's company or designation matches the student's career interest string.
Alumni are ranked in descending order of score."

### Q11: How do you handle file uploads for resumes and profile pictures?
**Answer:** "We created `FileStorageService`. Uploaded files are validated against allowed MIME types (`image/jpeg`, `image/png`, `application/pdf`) and maximum file size limits (5MB for avatars, 10MB for resumes). Files are stored with secure UUID-prefixed filenames to prevent directory traversal attacks (`..`). In production, this service can easily switch to AWS S3 via AWS SDK v2."

### Q12: How are WebSocket messages secured?
**Answer:** "WebSocket STOMP endpoints are configured with CORS allowed origins. During conversation initiation, users can only access conversations where their `userId` is either `participantOne` or `participantTwo`. Any attempt to fetch message history for a conversation that does not include the authenticated user is rejected with an `UnauthorizedException`."

### Q13: How is global error handling implemented?
**Answer:** "We use `@RestControllerAdvice` in `GlobalExceptionHandler`. It captures custom domain exceptions:
- `ResourceNotFoundException` $\rightarrow$ 404 Not Found
- `DuplicateResourceException` $\rightarrow$ 409 Conflict
- `BadRequestException` $\rightarrow$ 400 Bad Request
- `UnauthorizedException` $\rightarrow$ 401 Unauthorized
- `MethodArgumentNotValidException` $\rightarrow$ 400 Bad Request with field-level validation errors.
All responses follow a consistent `ApiErrorResponse` JSON structure."

### Q14: How does the Alumni Verification workflow operate?
**Answer:** "When an alumni registers, their `verificationStatus` defaults to `PENDING`. Only alumni with `VERIFIED` status are displayed in public search queries and allowed to post jobs or accept mentorship requests. Administrators review pending profiles in the Admin Dashboard and execute `/api/admin/alumni/{id}/verify` or `/reject`."

### Q15: How did you test your backend?
**Answer:** "We used JUnit 5 and Mockito. We wrote unit tests for service layers (`AuthServiceTest`, `MentorshipServiceTest`, `RecommendationServiceTest`) mocking repository dependencies to verify business logic and edge cases. We wrote unit tests for `JwtTokenProviderTest` verifying generation, validation, and expiry. Finally, we wrote integration tests for controllers (`AuthControllerTest`) using `@WebMvcTest` and `MockMvc` to verify HTTP contracts, JSON serialization, and Bean Validation."

### Q16: How do you run the full stack locally with a single command?
**Answer:** "Using Docker Compose. By running `docker-compose up --build`, Docker initiates three containers: MySQL 8 with automated schema and seed scripts via `/docker-entrypoint-initdb.d`, Spring Boot backend running on JRE 21, and the React frontend served through an Nginx alpine reverse proxy."

### Q17: What does your CI/CD pipeline do?
**Answer:** "We configured GitHub Actions (`.github/workflows/ci.yml`). On every push or pull request to `main`, it runs:
1. Backend CI: sets up Java 21, runs all Maven tests, packages the JAR.
2. Frontend CI: sets up Node 20, runs clean install, builds the Vite production bundle.
3. Docker verification: builds Docker images for both services to ensure no container build breaks."

---

## 💡 Quick Tips for the Interview
- **When asked about design decisions**, always start with the **problem**, then the **trade-offs**, then your **solution**.
- **Mention real-world constraints**: Talk about race conditions, validation, security, and scalability.
- **Reference your automated tests**: Highlighting that you wrote 15 unit and integration tests immediately distinguishes your project from tutorial copies!
