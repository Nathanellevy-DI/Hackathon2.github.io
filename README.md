# 🏋️ FitTrack - Personal Fitness Tracker

A modern, mobile-first fitness tracking web application built with React and Node.js/Express.

![FitTrack](https://img.shields.io/badge/FitTrack-v1.0.0-6366f1)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57)

## ✨ Features

- **📊 Dashboard** - Overview of daily stats, recent workouts, and progress
- **🏋️ Workout Logging** - Log exercises with sets, reps, weight, and duration  
- **📈 Progress Tracking** - Visual charts showing fitness progress over time
- **🎯 Goal Setting** - Set and track fitness goals
- **📱 Mobile-First** - Optimized for phone screens, works great as a web app
- **🎨 Modern UI** - Dark theme, glassmorphism, smooth animations

---

## 🚀 Quick Start

### Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Step 1: Start the Frontend (React)

```bash
# Navigate to the client folder
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at **http://localhost:5173** 🎉

> **Note:** The frontend works immediately with local storage! You can start using the app right away without setting up the backend.

---

## 🔧 Backend Setup (Optional)

The app works perfectly with local storage, but if you want persistent server-side storage, follow these steps:

### Step 2: Install Backend Dependencies

```bash
# Open a NEW terminal window
# Navigate to the server folder
cd server

# Install dependencies
npm install
```

### Step 3: Start the Backend Server

```bash
# From the server folder
npm run dev
```

The API will be running at **http://localhost:5000** 🚀

### That's it! 

The frontend will automatically detect the backend and switch from local storage to the database.

---

## 📁 Project Structure

```
hackathon2/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WorkoutForm.jsx
│   │   │   ├── WorkoutList.jsx
│   │   │   ├── ProgressChart.jsx
│   │   │   ├── Goals.jsx
│   │   │   └── Navbar.jsx
│   │   ├── styles/
│   │   │   └── index.css      # All styles with animations
│   │   ├── utils/
│   │   │   └── api.js         # API utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
├── server/                    # Express Backend
│   ├── routes/
│   │   ├── workouts.js
│   │   └── goals.js
│   ├── models/
│   │   └── database.js        # SQLite database
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/workouts` | Get all workouts |
| `POST` | `/api/workouts` | Create new workout |
| `DELETE` | `/api/workouts/:id` | Delete workout |
| `GET` | `/api/goals` | Get all goals |
| `POST` | `/api/goals` | Create new goal |
| `PUT` | `/api/goals/:id` | Update goal progress |
| `DELETE` | `/api/goals/:id` | Delete goal |

---

## 💾 Database Schema

The app uses SQLite for data persistence:

```sql
-- Workouts
CREATE TABLE workouts (
    id INTEGER PRIMARY KEY,
    exercise_name TEXT NOT NULL,
    category TEXT,
    sets INTEGER,
    reps INTEGER,
    weight REAL,
    duration INTEGER,
    notes TEXT,
    date TEXT
);

-- Goals
CREATE TABLE goals (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    target_value REAL,
    current_value REAL,
    unit TEXT,
    deadline TEXT,
    completed INTEGER,
    created_at TEXT
);
```

---

## 📱 Mobile Usage

The app is fully responsive and works great on mobile devices:

1. Open the app in your mobile browser
2. On iOS: Tap Share → "Add to Home Screen"
3. On Android: Tap menu → "Add to Home screen"

---

## 🎨 Tech Stack

**Frontend:**
- React 19 with Vite
- React Router for navigation
- Recharts for visualizations
- Lucide React for icons
- Custom CSS with animations

**Backend:**
- Node.js with Express
- SQLite (better-sqlite3)
- CORS enabled for frontend

---

## 🛠️ Development

### Running Both Frontend & Backend

**Terminal 1 (Frontend):**
```bash
cd client
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd server
npm run dev
```

### Building for Production

```bash
# Build the React app
cd client
npm run build
```

---

## 📝 License

MIT License - feel free to use this project for your hackathon! 🎉

---

Made with 💪 for Hackathon #2
