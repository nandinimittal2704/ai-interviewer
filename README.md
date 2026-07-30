# AI Interviewer

AI Interviewer is an intelligent mock interview platform built for job seekers who want to practice real interview conversations, receive instant feedback, and improve their confidence before the real interview.

Created by Nandini Mittal.

Live demo: https://mockinterviewerai.netlify.app/

## Features

- AI-powered mock interviews for multiple roles such as frontend, backend, full stack, DSA, system design, and HR
- Practice by typing or speaking answers
- Instant AI-based feedback and scoring
- Dashboard to review interview sessions and progress
- Secure authentication with protected routes
- Modern and responsive UI built with React and Vite

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB
- JWT authentication
- Google Generative AI integration

## Project Structure

- backend/ - Express API, MongoDB connection, interview routes, auth routes, and AI services
- frontend/ - React + Vite user interface and pages

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ai-interviewer
```

### 2. Install dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

### 3. Set up environment variables

Create a `.env` file inside the backend folder with the following values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key
```

### 4. Run the app

#### Start the backend

```bash
cd backend
npm run dev
```

#### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend will run on the Vite development server and the backend will run on the port defined in your environment file.

## API Health Check

You can verify the backend server is running by visiting:

```text
http://localhost:5000/api/health
```

## Usage

1. Open the frontend in your browser.
2. Sign up or log in.
3. Choose a role and interview settings.
4. Start answering questions and receive feedback from the AI interviewer.

## Notes

- Make sure MongoDB is available and reachable before starting the backend.
- The AI feedback feature depends on a valid Gemini API key.
- The live demo is available at https://mockinterviewerai.netlify.app/

## Author

Nandini Mittal
https://github.com/nandinimittal2704
