# Learner Management System - Spring Boot Backend

## Features
- Student registration
- Student/admin login
- Student CRUD
- Course CRUD
- Course details
- Course enrollment
- Duplicate enrollment prevention
- Student enrollment list
- Admin enrollment list
- Automatic MySQL table creation with JPA

## Requirements
- Java 17+
- Maven
- XAMPP/MySQL
- Postman (recommended)

## Database setup

Start MySQL in XAMPP and create only the database:

```sql
CREATE DATABASE learner_management;
```

You do NOT need to create the tables manually.

Check `src/main/resources/application.properties` and update the MySQL password if needed.

## Run

From the project folder:

```bash
mvn spring-boot:run
```

Or open the project in IntelliJ/Eclipse/VS Code and run `LearnerManagementApplication`.

## Default admin

Username: `admin`
Password: `admin123`
Role: `ADMIN`

The admin is created automatically on startup if it does not already exist.

## Main API endpoints

### Auth
POST `/api/auth/register`
POST `/api/auth/login`

### Students
GET `/api/students`
GET `/api/students/{id}`
POST `/api/students`
PUT `/api/students/{id}`
DELETE `/api/students/{id}`

### Courses
GET `/api/courses`
GET `/api/courses/{id}`
POST `/api/courses`
PUT `/api/courses/{id}`
DELETE `/api/courses/{id}`

### Enrollments
POST `/api/enrollments`
GET `/api/enrollments`
GET `/api/enrollments/student/{studentId}`

## Important note

This learning version stores passwords as plain text. Before using it as a real application, add Spring Security, BCrypt password hashing, JWT authentication, and role-based authorization.
