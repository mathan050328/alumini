# AlumniConnect REST API Specification

Base URL: `/api`  
Swagger UI (Local): `http://localhost:8080/swagger-ui/index.html`  
OpenAPI JSON: `http://localhost:8080/v3/api-docs`

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Student or Alumni account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |

---

## 2. Student Endpoints (`/api/students`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students/profile` | Student | Get authenticated student's profile |
| `PUT` | `/api/students/profile` | Student | Update profile details (bio, links, etc.) |
| `POST` | `/api/students/profile/skills` | Student | Bulk add skills to profile |
| `DELETE` | `/api/students/profile/skills/{id}` | Student | Remove skill from profile |
| `POST` | `/api/students/profile/projects` | Student | Add personal/academic project |
| `DELETE` | `/api/students/profile/projects/{id}` | Student | Remove project |
| `POST` | `/api/students/profile/picture` | Student | Upload profile image (multipart) |
| `POST` | `/api/students/profile/resume` | Student | Upload student resume PDF |
| `GET` | `/api/students/dashboard` | Student | Fetch student dashboard overview stats |
| `GET` | `/api/students/recommended-alumni` | Student | Get weighted skill-matched alumni |

---

## 3. Alumni Endpoints (`/api/alumni`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/alumni` | Authenticated | Paginated & filtered alumni search |
| `GET` | `/api/alumni/{id}` | Authenticated | Fetch public alumni profile by ID |
| `GET` | `/api/alumni/profile` | Alumni | Get authenticated alumni profile |
| `PUT` | `/api/alumni/profile` | Alumni | Update alumni profile information |
| `POST` | `/api/alumni/profile/skills` | Alumni | Add skills to alumni profile |
| `DELETE` | `/api/alumni/profile/skills/{id}` | Alumni | Remove skill from profile |
| `POST` | `/api/alumni/profile/experience` | Alumni | Add work experience entry |
| `DELETE` | `/api/alumni/profile/experience/{id}`| Alumni | Delete work experience entry |
| `POST` | `/api/alumni/profile/picture` | Alumni | Upload alumni avatar image |
| `PATCH` | `/api/alumni/profile/mentorship-status` | Alumni | Toggle mentorship availability |

---

## 4. Mentorship Endpoints (`/api/mentorships`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/mentorships` | Student | Submit new mentorship request |
| `GET` | `/api/mentorships/sent` | Student | View sent mentorship requests |
| `GET` | `/api/mentorships/received` | Alumni | View received mentorship requests |
| `PATCH` | `/api/mentorships/{id}/accept` | Alumni | Accept pending mentorship request |
| `PATCH` | `/api/mentorships/{id}/reject` | Alumni | Reject pending mentorship request |
| `PATCH` | `/api/mentorships/{id}/complete` | Alumni | Mark active mentorship as completed |
| `PATCH` | `/api/mentorships/{id}/cancel` | Student | Cancel pending mentorship request |

---

## 5. Jobs & Referral Endpoints (`/api/jobs`, `/api/applications`, `/api/referrals`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/jobs` | Alumni | Post new job opening |
| `GET` | `/api/jobs` | Authenticated | Search & filter active jobs |
| `GET` | `/api/jobs/{id}` | Authenticated | Get detailed job description |
| `GET` | `/api/jobs/my-posts` | Alumni | View jobs posted by authenticated alumni |
| `POST` | `/api/applications` | Student | Submit application with cover letter |
| `GET` | `/api/applications/my` | Student | View submitted job applications |
| `GET` | `/api/applications/job/{jobId}` | Alumni | View applicants for a posted job |
| `PATCH` | `/api/applications/{id}/status` | Alumni | Update application status |
| `POST` | `/api/saved-jobs/{jobId}` | Student | Bookmark job |
| `DELETE`| `/api/saved-jobs/{jobId}` | Student | Remove bookmark |
| `GET` | `/api/saved-jobs` | Student | List bookmarked jobs |
| `POST` | `/api/referrals` | Student | Request referral from alumni for a job |
| `GET` | `/api/referrals/sent` | Student | List sent referral requests |
| `GET` | `/api/referrals/received` | Alumni | List received referral requests |
| `PATCH` | `/api/referrals/{id}/accept` | Alumni | Accept referral request |
| `PATCH` | `/api/referrals/{id}/reject` | Alumni | Reject referral request |

---

## 6. Events Endpoints (`/api/events`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/events` | Alumni, Admin | Create webinar, meetup, or workshop |
| `GET` | `/api/events` | Authenticated | List upcoming events with pagination |
| `GET` | `/api/events/{id}` | Authenticated | View event details |
| `POST` | `/api/events/{id}/register` | Authenticated | Register for event (capacity checks) |
| `DELETE`| `/api/events/{id}/register` | Authenticated | Cancel event registration |
| `GET` | `/api/events/my-registrations` | Authenticated | Get user's registered events |

---

## 7. Knowledge Hub & Career Posts (`/api/posts`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/posts` | Alumni | Publish interview experience / advice |
| `GET` | `/api/posts` | Authenticated | List posts by category |
| `GET` | `/api/posts/{id}` | Authenticated | Get full post & comments |
| `POST` | `/api/posts/{id}/like` | Authenticated | Like a post |
| `DELETE`| `/api/posts/{id}/like` | Authenticated | Unlike a post |
| `GET` | `/api/posts/{id}/comments` | Authenticated | Fetch comments for a post |
| `POST` | `/api/posts/{id}/comments` | Authenticated | Post comment |
| `DELETE`| `/api/posts/{id}/comments/{cid}`| Authenticated | Delete comment |

---

## 8. Real-Time Chat & Notifications (`/api/messages`, `/api/notifications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/messages/conversations` | Authenticated | List active user conversations |
| `GET` | `/api/messages/conversations/{id}` | Authenticated | Fetch message history for thread |
| `POST` | `/api/messages/conversations` | Authenticated | Start new conversation thread |
| `POST` | `/api/messages/conversations/{id}` | Authenticated | Send message in thread |
| `GET` | `/api/notifications` | Authenticated | Paginated notifications list |
| `GET` | `/api/notifications/unread-count` | Authenticated | Get badge count of unread alerts |
| `PATCH` | `/api/notifications/{id}/read` | Authenticated | Mark notification read |
| `PATCH` | `/api/notifications/read-all` | Authenticated | Mark all notifications read |

---

## 9. Administrator Endpoints (`/api/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin Only | Platform-wide aggregation metrics |
| `GET` | `/api/admin/users` | Admin Only | List users with search & role filter |
| `PATCH` | `/api/admin/users/{id}/suspend` | Admin Only | Suspend user account |
| `PATCH` | `/api/admin/users/{id}/activate`| Admin Only | Activate user account |
| `GET` | `/api/admin/alumni/pending` | Admin Only | List alumni awaiting verification |
| `PATCH` | `/api/admin/alumni/{id}/verify` | Admin Only | Approve and verify alumni profile |
| `PATCH` | `/api/admin/alumni/{id}/reject` | Admin Only | Reject alumni verification |
| `PATCH` | `/api/admin/posts/{id}/visibility`| Admin Only | Moderate & toggle post visibility |
