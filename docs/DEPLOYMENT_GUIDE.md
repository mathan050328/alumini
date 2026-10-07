# 🚀 AlumniConnect — AWS Cloud Production Deployment Guide

This guide details the step-by-step production architecture and deployment lifecycle for **AlumniConnect** across **AWS EC2, AWS RDS (MySQL), AWS S3, and AWS CloudWatch**.

---

## 🏛️ Production Cloud Architecture

```
                                      Internet
                                         │
                                   [ Route 53 ]
                                         │
                                [ AWS CloudFront / ALB ]
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
                 [ AWS EC2 / ECS ]               [ AWS S3 Bucket ]
               Nginx + Spring Boot               Resumes & Profiles
                 (Containerized)
                         │
                         ▼
                 [ AWS RDS MySQL ]
               Multi-AZ Replica Cluster
```

---

## 1. AWS RDS (Relational Database Service) Setup

1. **Engine**: MySQL 8.0 Community Edition
2. **Instance Size**: `db.t3.small` (Dev/Test) or `db.m5.large` (Production)
3. **Storage**: 20 GiB GP3 SSD (Autoscaling up to 100 GiB)
4. **VPC & Security Group**:
   - Place RDS inside private subnets across 2 Availability Zones.
   - Attach security group `alumniconnect-rds-sg`:
     - **Inbound Rule**: MySQL/Aurora (Port 3306) restricted exclusively to `alumniconnect-ec2-sg` (EC2 security group ID).
5. **Database Initialization**:
   Connect via bastion host or EC2 instance and run:
   ```bash
   mysql -h your-rds-endpoint.rds.amazonaws.com -u root -p < database/schema.sql
   mysql -h your-rds-endpoint.rds.amazonaws.com -u root -p < database/seed-data.sql
   ```

---

## 2. AWS S3 (Simple Storage Service) Configuration

1. **Bucket Creation**: `alumniconnect-prod-storage`
2. **Region**: `ap-south-1` (Mumbai) or your chosen deployment region
3. **Access Configuration**:
   - Block all public access: **Enabled**
   - Enable SSE-S3 default encryption (AES-256)
4. **IAM Policy for EC2 IAM Instance Profile**:
   Attach an IAM Role to your EC2 instance with the following policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::alumniconnect-prod-storage/*"
       }
     ]
   }
   ```

---

## 3. AWS EC2 Virtual Machine Provisioning

1. **AMI**: Ubuntu Server 24.04 LTS (HVM)
2. **Instance Type**: `t3.medium` (2 vCPU, 4 GiB RAM)
3. **Security Group (`alumniconnect-ec2-sg`)**:
   - Inbound: `80` (HTTP), `443` (HTTPS), `22` (SSH from your IP only)
   - Outbound: All traffic
4. **Instance IAM Role**: Attach the role created in Step 2.

### Host Machine Provisioning Script
SSH into the EC2 instance:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git curl

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu
newgrp docker
```

---

## 4. Environment Configuration & Deployment

Clone the repository to the EC2 server:
```bash
git clone https://github.com/your-username/AlumniConnect.git /opt/alumniconnect
cd /opt/alumniconnect
```

Create production environment configuration (`.env`):
```bash
cat << 'EOF' > .env
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:mysql://your-rds-endpoint.rds.amazonaws.com:3306/alumniconnect?useSSL=true&requireSSL=true
DB_USERNAME=admin
DB_PASSWORD=YourStrongDatabasePassword123!
JWT_SECRET=YourProductionSecretKeyWithMinimum256BitsLengthHS256Algorithm
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=https://alumniconnect.yourdomain.com
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=alumniconnect-prod-storage
EOF
```

Launch application containers with Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 5. SSL / TLS Setup with Let's Encrypt (Certbot)

To secure frontend traffic and WebSocket STOMP packets:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d alumniconnect.yourdomain.com
```

Certbot automatically configures HTTPS renewal crons on Ubuntu.

---

## 6. AWS CloudWatch Monitoring & Alerts

1. **CloudWatch Agent**:
   Install Amazon CloudWatch Agent on EC2 to export CPU utilization, JVM memory metrics, and disk metrics.
2. **Log Groups**:
   Stream Spring Boot logs (`/app/logs/spring.log`) and Nginx access logs to `/aws/ec2/alumniconnect`.
3. **Alarms**:
   - Create alert on **CPUUtilization > 80%** for 5 consecutive minutes (triggers SNS email).
   - Create alert on **RDS FreeStorageSpace < 5GB**.
