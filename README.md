# AI-Powered Learning Assistant

An AI-powered full-stack learning platform that helps users upload study documents, generate summaries, create flashcards, take quizzes, and track quiz performance through an interactive dashboard.

## Features

* User authentication with JWT
* Upload and manage study documents
* Extract text from PDF documents
* Generate AI-based flashcards from uploaded content
* Generate AI-based quizzes from uploaded content
* Attempt quizzes and view results
* Track learning progress and quiz performance
* Responsive React dashboard UI
* REST API backend with Express and MongoDB

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* Lucide React
* React Hot Toast
* React Markdown

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Multer
* pdf-parse
* Google Gemini API

## Project Structure

```bash
ai-powered-learning-assistant/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   └── learning-assistant/
│       ├── src/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── utils/
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
│
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kushy-27/ai-powered-learning-assistant.git
cd ai-powered-learning-assistant
```

## Backend Setup

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create a backend `.env` file

Create a `.env` file inside the `backend` folder:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the backend server

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

The backend server will run on:

```bash
http://localhost:8000
```

## Frontend Setup

### 5. Install frontend dependencies

Open a new terminal and run:

```bash
cd frontend/learning-assistant
npm install
```

### 6. Run the frontend development server

```bash
npm run dev
```

The frontend will run on the local Vite development URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## API Routes

The backend exposes the following main API route groups:

```bash
/api/auth
/api/documents
/api/flashcards
/api/ai
/api/quizzes
/api/progress
```

## Available Scripts

### Backend

Inside the `backend` folder:

```bash
npm run dev
```

Runs the backend with Nodemon.

```bash
npm start
```

Runs the backend with Node.js.

### Frontend

Inside the `frontend/learning-assistant` folder:

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the frontend for production.

```bash
npm run lint
```

Runs ESLint.

```bash
npm run preview
```

Previews the production build locally.

## Core Workflow

1. User registers or logs in.
2. User uploads a study document.
3. Backend extracts text from the uploaded PDF.
4. AI generates flashcards or quizzes from the document content.
5. User studies flashcards and attempts quizzes.
6. Quiz performance is stored and shown in the dashboard.

## License

This project is licensed under the ISC License.
