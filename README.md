# Notes Management Web Application

A full-stack multi-container microservices web application 
built with Docker Compose and automated GitHub Actions CI/CD pipeline.

## Course
INT332 - DevOps Virtualization and Configuration Management  
Lovely Professional University

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript, Nginx |
| Backend | Python Flask REST API |
| Database | MySQL 8.0 |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Version Control | Git, GitHub |

## Features
- Create, Read, Edit, Delete notes (CRUD)
- Click any note to open full content editor
- Read Mode and Edit Mode for each note
- Search notes by title and content
- Dark Mode support
- Auto-save while editing
- Persistent data storage with Docker volumes
- Automated 3-job CI/CD pipeline

- ## Architecture
Browser → Nginx (Port 80) → Flask API (Port 5000) → MySQL (Port 3306)

## How to Run
```bash
git clone https://github.com/MaadhavaM/multi-container-microservices-app.git
cd multi-container-microservices-app
docker-compose up --build
```
Open browser: **http://localhost:8082**

## CI/CD Pipeline (GitHub Actions)
Every git push automatically triggers 3 jobs:
1. **Test Backend** — Python syntax validation
2. **Build Docker Images** — builds backend and frontend images  
3. **Validate Compose** — verifies docker-compose.yml

## Project Structure

multi-container-microservices-app/
├── .github/workflows/ci.yml   ← CI/CD pipeline
├── backend/
│   ├── app.py                 ← Flask REST API
│   ├── requirements.txt       ← Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── index.html             ← Web application
│   └── Dockerfile
├── docker-compose.yml         ← Multi-container orchestration
└── README.md
