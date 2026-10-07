# 🎓 AlumniConnect — Smart Alumni Networking, Mentorship & Career Platform

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange.svg?style=flat&logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot 3.3](https://img.shields.io/badge/Spring%20Boot-3.3.0-brightgreen.svg?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue.svg?style=flat&logo=react)](https://react.dev/)
[![MySQL 8](https://img.shields.io/badge/MySQL-8.0-blue.svg?style=flat&logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat&logo=docker)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF.svg?style=flat&logo=github-actions)](https://github.com/features/actions)

> **AlumniConnect** is an enterprise-grade full-stack web application connecting current college students, university alumni, and administrators. Built with a clean layered architecture, robust security, a rule-based skill recommendation engine, real-time messaging, and Dockerized deployment.

---

## 🌟 Key Highlights & Engineering Features

- **🛡️ Enterprise Security**: Spring Security 6 with stateless JWT authentication, BCrypt password hashing, and granular Role-Based Access Control (`STUDENT`, `ALUMNI`, `ADMIN`).
- **🔍 Advanced Discovery Engine**: Dynamic multi-criteria search powered by Spring Data JPA Specifications (filter by name, company, department, graduation year, location, and skills) with server-side pagination.
- **🤝 Complete Mentorship Lifecycle**: Structured workflow (`PENDING` $\rightarrow$ `ACCEPTED` $\rightarrow$ `COMPLETED` / `CANCELLED`) with duplicate request prevention and automated alerts.
- **💼 Job & Referral Board**: Alumni post internal company vacancies; students apply with cover letters and track referral status in real time.
- **🧠 Intelligent Recommendation Engine**: Deterministic weighted matching algorithm connecting students to alumni based on skill overlap, department alignment, and career aspirations.
- **💬 Real-Time Messaging & Alerts**: WebSocket STOMP messaging with isolated 1-on-1 conversations and persistent message history.
- **📊 Admin Control Panel**: Alumni verification review workflow, user account management, and interactive analytics dashboards built with Recharts.
- **🐳 Cloud-Ready & DevOps**: Production multi-stage Docker builds, Docker Compose orchestration, and automated GitHub Actions CI/CD pipeline.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────┐
│              Client Layer (React 18 + Vite)              │
│       Tailwind CSS v4 | React Router v6 | Axios | STOMP  │
└────────────┬─────────────────────────────┬───────────────┘
             │ HTTP / REST (JWT Bearer)    │ WebSocket (STOMP)
             ▼                             ▼
┌──────────────────────────────────────────────────────────┐
│           Reverse Proxy & Web Server (Nginx)             │
│        Static Asset Cache | Gzip | Proxy Forwarding      │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│          Backend Layer (Spring Boot 3.3 / Java 21)       │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Controllers (REST API, Swagger / OpenAPI 3)        │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ Security (JWT Filter, UserDetails, BCrypt)         │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ Services (Business Logic, Recommendation Scoring)  │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ Repositories (Spring Data JPA, Specifications)     │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│             Database Layer (MySQL 8.0 InnoDB)            │
│   Normalized Schema | Foreign Keys | Composite Indexes    │
└──────────────────────────────────────────────────────────┘
```

---

## 🔑 Demo Accounts

The database comes pre-seeded with verified test accounts across all roles:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@alumniconnect.com` | `Admin@123` | Platform oversight & verification |
| **Alumni (Google)** | `sundar.alumni@google.com` | `Password@123` | Verified Senior SDE, Mentor |
| **Alumni (Amazon)** | `priya.alumni@amazon.com` | `Password@123` | Verified SDE II, Mentor |
| **Student** | `student@alumniconnect.com` | `Password@123` | Final-year CS student |

---

## 🚀 Quick Start Guide

### Option 1: Run with Docker Compose (Recommended)

Run the entire full-stack application (MySQL + Backend + Frontend) with one command:

```bash
# Clone the repository
git clone https://github.com/your-username/AlumniConnect.git
cd AlumniConnect

# Launch all containers
docker-compose up --build
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173) or [http://localhost](http://localhost)
- **Backend REST API**: [http://localhost:8080/api](http://localhost:8080/api)
- **Swagger UI API Docs**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

---

### Option 2: Run Locally (Development Mode)

#### Prerequisites
- Java 21+ SDK
- Maven 3.9+
- Node.js 20+ & npm
- MySQL 8.0+ running on port `3306`

#### Step 1: Database Setup
Create database and initialize schema:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed-data.sql
```

#### Step 2: Start Spring Boot Backend
```bash
cd alumniconnect-backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080`.*

#### Step 3: Start React Frontend
```bash
cd ../alumniconnect-frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Testing

Run backend unit and integration tests:

```bash
cd alumniconnect-backend
mvn test
```

All 15 tests verify authentication, JWT creation/validation, mentorship lifecycle, recommendation rankings, and HTTP validation contracts.

---

## 📚 Technical Documentation

- **[Technical Interview & Viva Guide](docs/INTERVIEW_GUIDE.md)**: Detailed explanations of architecture, scalability, design decisions, and 25+ interview Q&As.
- **[REST API Documentation](docs/API_DOCUMENTATION.md)**: Full endpoint reference.
- **[AWS Cloud Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**: Production deployment instructions for AWS EC2, RDS, S3, and CloudWatch.
- **[Database Schema Script](database/schema.sql)**: Complete relational MySQL DDL script.

---

## 📂 Project Structure

```
AlumniConnect/
├── .github/workflows/ci.yml         # GitHub Actions CI/CD Pipeline
├── database/
│   ├── schema.sql                   # MySQL DDL Schema
│   └── seed-data.sql                # Production Demo Data
├── docs/
│   ├── API_DOCUMENTATION.md         # Complete REST API Reference
│   ├── DEPLOYMENT_GUIDE.md          # AWS EC2, RDS, S3 & CloudWatch Guide
│   └── INTERVIEW_GUIDE.md           # Architecture, Viva & Interview Prep
├── docker-compose.yml               # Container orchestration
│
├── alumniconnect-backend/           # Spring Boot 3 + Java 21 API
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/alumniconnect/
│       │   ├── config/              # Security, WebSocket, Swagger, Seeder
│       │   ├── controller/          # 13 REST Controllers
│       │   ├── dto/                 # Request & Response DTOs
│       │   ├── entity/              # 22 JPA Entities & 10 Enums
│       │   ├── exception/           # Global Exception Handling
│       │   ├── repository/          # 18 Spring Data JPA Repositories
│       │   ├── security/            # JWT Token Provider, Auth Filters
│       │   └── service/             # 14 Business Services
│       └── test/                    # JUnit 5 & Mockito Unit/Integration Tests
│
└── alumniconnect-frontend/          # React 18 + Vite + Tailwind CSS
    ├── Dockerfile
    ├── nginx.conf                   # Production Nginx reverse proxy
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/                     # 11 Axios API Modules
        ├── components/              # Common UI, Auth, Layout (Navbar, Sidebar)
        ├── context/                 # AuthContext (JWT State)
        ├── pages/                   # 31 Feature Pages
        └── utils/                   # Formatters, Validators, Constants
```

---

## 📄 License
This project is open-source and available under the MIT License.
