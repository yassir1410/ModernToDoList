# Todo List Application

This is a full-stack Todo List application built with Spring Boot and Next.js.

## Project Structure

- `backend/`: Spring Boot backend application
- `frontend/`: Next.js frontend application

## Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Build and run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

The backend will start on `http://localhost:8080`

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:3000`

## Features

- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Responsive design
- Real-time updates
- Error handling with toast notifications

## Technologies Used

### Backend

- Spring Boot 3.2.3
- Spring Data JPA
- H2 Database
- Lombok

### Frontend

- Next.js 14
- React 18
- Chakra UI
- Axios
- TypeScript
