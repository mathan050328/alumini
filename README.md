# AlumniConnect

AlumniConnect is a full-stack web application that connects university students, alumni, and administrators on a unified platform for mentorship, job referrals, career discussions, and alumni-led events.

## Tech Stack

- **Backend**: Java 21, Spring Boot 3.3, Spring Security (JWT), Spring Data JPA, WebSocket (STOMP)
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Axios, Recharts
- **Database**: H2 (local development profile) / MySQL 8.0 (production profile)
- **DevOps**: Docker, Docker Compose, Nginx, GitHub Actions

## Core Features

- **Role-Based Access Control**: Dedicated workflows and dashboards for Students, Alumni, and Administrators secured with stateless JWT authentication and BCrypt password hashing.
- **Alumni Directory & Search**: Multi-criteria filtering by name, company, department, graduation year, location, and skills using Spring Data JPA Specifications.
- **Mentorship Workflow**: End-to-end request lifecycle (`PENDING`, `ACCEPTED`, `COMPLETED`, `REJECTED`, `CANCELLED`) with availability toggles and real-time notifications.
- **Job Board & Referrals**: Alumni post internal job openings and review candidate applications (`APPLIED`, `REVIEWED`, `SHORTLISTED`, `REJECTED`). Students can apply with cover letters, bookmark jobs, and request referrals directly from alumni.
- **Mentor Recommendation Engine**: Weighted matching service that ranks alumni mentors for students based on shared technical skills, department alignment, and career interests.
- **Direct Messaging**: One-on-one conversations between students and alumni with unread message tracking.
- **Events & Knowledge Hub**: Alumni and admins organize workshops, webinars, and meetups with participant capacity limits, and publish career articles with comments and likes.
- **Admin Portal**: Alumni profile verification, user account management (search, role filter, suspend/activate), and platform analytics charts.

## Project Structure

```text
AlumniConnect/
├── alumniconnect-backend/           # Spring Boot REST API
│   ├── src/main/java/com/alumniconnect/
│   │   ├── config/                  # Security, CORS, WebSocket, OpenAPI, Data Seeder
│   │   ├── controller/              # REST controllers
│   │   ├── dto/                     # Request and response payloads
│   │   ├── entity/                  # JPA entities and domain enums
│   │   ├── exception/               # Custom exceptions and global handler
│   │   ├── repository/              # Spring Data JPA repositories
│   │   ├── security/                # JWT filter and token provider
│   │   ├── service/                 # Business logic and domain services
│   │   └── util/                    # Application constants
│   └── src/test/                    # Unit and controller tests
├── alumniconnect-frontend/          # React + Vite SPA
│   └── src/
│       ├── api/                     # Axios instance and endpoint modules
│       ├── components/              # Layout, common UI, and route guards
│       ├── context/                 # Authentication context
│       ├── pages/                   # Feature and role pages
│       └── utils/                   # Formatters, validators, and constants
├── database/                        # MySQL schema and seed scripts
├── docs/                            # API reference and deployment notes
└── docker-compose.yml               # Multi-container orchestration
```

## Running Locally

### Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+ and npm

### 1. Start the Backend

By default, the backend runs with the `dev` profile using a file-backed H2 database (`./data/alumniconnect`) and automatically seeds sample data on first startup.

```bash
cd alumniconnect-backend
mvn spring-boot:run
```

- Backend API: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 2. Start the Frontend

```bash
cd alumniconnect-frontend
npm install
npm run dev
```

- Frontend URL: `http://localhost:5173`

## Default Test Accounts

The development seeder initializes the following accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| Administrator | `admin@alumniconnect.com` | `Admin@123` |
| Alumni (Google) | `sundar.alumni@google.com` | `Password@123` |
| Alumni (Amazon) | `priya.alumni@amazon.com` | `Password@123` |
| Student | `student@alumniconnect.com` | `Password@123` |

## Running with Docker

To run the full stack with MySQL 8, Spring Boot, and Nginx:

```bash
docker-compose up --build
```

## Running Tests

```bash
cd alumniconnect-backend
mvn test
```

## Additional Documentation

- [REST API Reference](docs/API_DOCUMENTATION.md)
- [Production Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [MySQL Schema](database/schema.sql)
