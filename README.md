# 🏋️ FitTrack - Personal Fitness Tracker

A modern, mobile-first fitness tracking web application built with React and Node.js/Express.

## ✨ Features

- **📊 Dashboard** - Overview of daily stats, recent workouts, and progress
- **🏋️ Workout Logging** - Log exercises with sets, reps, weight, and duration  
- **📈 Progress Tracking** - Visual charts showing fitness progress over time
- **🎯 Goal Setting** - Set and track fitness goals
- **📱 Mobile-First** - Optimized for phone screens, works great as a web app
- **🎨 Modern UI** - Dark theme, glassmorphism, smooth animations


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
├── server/                    # Node Js & Express & some sql lite Backend
│   ├── routes/
│   │   ├── workouts.js
│   │   └── goals.js
│   ├── models/
│   │   └── database.js        
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


