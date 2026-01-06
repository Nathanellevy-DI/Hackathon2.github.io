// API utility for fitness tracker
// Uses local storage as fallback, can connect to backend when ready

const API_BASE = 'http://localhost:5000/api';

// Check if backend is available
const isBackendAvailable = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Local Storage Keys
const STORAGE_KEYS = {
  WORKOUTS: 'fittrack_workouts',
  GOALS: 'fittrack_goals',
  PROFILE: 'fittrack_profile'
};

// ============================================
// LOCAL STORAGE HELPERS
// ============================================
const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// ============================================
// EMOJI MAPPING - Smart exercise to emoji matching
// ============================================
const exerciseEmojiMap = {
  // Specific exercises
  'bench press': '🏋️‍♂️',
  'squat': '🦵',
  'squats': '🦵',
  'deadlift': '🏋️',
  'shoulder press': '💪',
  'overhead press': '💪',
  'bicep curl': '💪',
  'bicep curls': '💪',
  'tricep': '💪',
  'tricep dips': '💪',
  'pull-up': '🧗',
  'pull-ups': '🧗',
  'pullup': '🧗',
  'pullups': '🧗',
  'chin-up': '🧗',
  'chin-ups': '🧗',
  'lunge': '🦵',
  'lunges': '🦵',
  'plank': '🧘‍♂️',
  'push-up': '💪',
  'push-ups': '💪',
  'pushup': '💪',
  'pushups': '💪',
  'crunch': '🔥',
  'crunches': '🔥',
  'sit-up': '🔥',
  'sit-ups': '🔥',
  'leg press': '🦵',
  'calf raise': '🦵',
  'lat pulldown': '💪',
  'row': '🚣',
  'rows': '🚣',
  'bent over row': '🏋️',
  'cable fly': '🏋️',
  'dumbbell': '🏋️',
  'barbell': '🏋️',
  'kettlebell': '🏋️',

  // Cardio
  'run': '🏃‍♂️',
  'running': '🏃‍♂️',
  'jog': '🏃',
  'jogging': '🏃',
  'sprint': '🏃‍♂️',
  'cycle': '🚴',
  'cycling': '🚴',
  'bike': '🚴',
  'biking': '🚴',
  'swim': '🏊',
  'swimming': '🏊',
  'jump rope': '⚡',
  'jumping rope': '⚡',
  'skipping': '⚡',
  'hiit': '🔥',
  'high intensity': '🔥',
  'interval': '🔥',
  'rowing': '🚣',
  'stair': '🪜',
  'stairs': '🪜',
  'walk': '🚶',
  'walking': '🚶',
  'hike': '🥾',
  'hiking': '🥾',
  'elliptical': '🏃',
  'treadmill': '🏃‍♂️',
  'jump': '⚡',
  'jumping jack': '⚡',
  'burpee': '🔥',
  'burpees': '🔥',
  'mountain climber': '🧗',

  // Flexibility
  'yoga': '🧘',
  'stretch': '🤸',
  'stretching': '🤸',
  'pilates': '🧘‍♀️',
  'foam roll': '🎯',
  'foam rolling': '🎯',
  'mobility': '🤸',
  'flexibility': '🤸',
  'meditation': '🧘',

  // Sports
  'basketball': '🏀',
  'soccer': '⚽',
  'football': '🏈',
  'tennis': '🎾',
  'badminton': '🏸',
  'volleyball': '🏐',
  'baseball': '⚾',
  'golf': '⛳',
  'boxing': '🥊',
  'kickboxing': '🥊',
  'mma': '🥋',
  'martial art': '🥋',
  'karate': '🥋',
  'judo': '🥋',
  'taekwondo': '🥋',
  'wrestling': '🤼',
  'rock climbing': '🧗',
  'climbing': '🧗',
  'skiing': '⛷️',
  'snowboard': '🏂',
  'skating': '⛸️',
  'ice skating': '⛸️',
  'hockey': '🏒',
  'lacrosse': '🥍',
  'rugby': '🏉',
  'cricket': '🏏',
  'table tennis': '🏓',
  'ping pong': '🏓',
  'surfing': '🏄',
  'skateboard': '🛹',

  // Category defaults
  'strength': '🏋️',
  'cardio': '🏃‍♂️',
  'flexibility': '🧘',
  'sports': '🏅',
  'default': '💪'
};

// Get emoji for exercise name
export const getExerciseEmoji = (exerciseName, category = '') => {
  const name = exerciseName.toLowerCase().trim();

  // Check exact match first
  if (exerciseEmojiMap[name]) {
    return exerciseEmojiMap[name];
  }

  // Check partial match
  for (const [key, emoji] of Object.entries(exerciseEmojiMap)) {
    if (name.includes(key) || key.includes(name)) {
      return emoji;
    }
  }

  // Check category
  if (category && exerciseEmojiMap[category.toLowerCase()]) {
    return exerciseEmojiMap[category.toLowerCase()];
  }

  return exerciseEmojiMap.default;
};

// ============================================
// WORKOUTS API
// ============================================
export const workoutsApi = {
  // Get all workouts
  getAll: async () => {
    const useBackend = await isBackendAvailable();

    if (useBackend) {
      const response = await fetch(`${API_BASE}/workouts`);
      return response.json();
    }

    return getFromStorage(STORAGE_KEYS.WORKOUTS) || [];
  },

  // Create new workout
  create: async (workout) => {
    const useBackend = await isBackendAvailable();

    const newWorkout = {
      id: Date.now(),
      ...workout,
      emoji: getExerciseEmoji(workout.exerciseName, workout.category),
      date: new Date().toISOString()
    };

    if (useBackend) {
      const response = await fetch(`${API_BASE}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkout)
      });
      return response.json();
    }

    const workouts = getFromStorage(STORAGE_KEYS.WORKOUTS) || [];
    workouts.unshift(newWorkout);
    saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);
    return newWorkout;
  },

  // Delete workout
  delete: async (id) => {
    const useBackend = await isBackendAvailable();

    if (useBackend) {
      await fetch(`${API_BASE}/workouts/${id}`, { method: 'DELETE' });
      return true;
    }

    const workouts = getFromStorage(STORAGE_KEYS.WORKOUTS) || [];
    const filtered = workouts.filter(w => w.id !== id);
    saveToStorage(STORAGE_KEYS.WORKOUTS, filtered);
    return true;
  },

  // Get workouts by date range
  getByDateRange: async (startDate, endDate) => {
    const workouts = await workoutsApi.getAll();
    return workouts.filter(w => {
      const date = new Date(w.date);
      return date >= startDate && date <= endDate;
    });
  },

  // Get today's workouts
  getToday: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return workoutsApi.getByDateRange(today, tomorrow);
  },

  // Get this week's workouts
  getThisWeek: async () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return workoutsApi.getByDateRange(startOfWeek, today);
  }
};

// ============================================
// GOALS API - Supports weight loss (negative targets)
// ============================================
export const goalsApi = {
  // Get all goals
  getAll: async () => {
    const useBackend = await isBackendAvailable();

    if (useBackend) {
      const response = await fetch(`${API_BASE}/goals`);
      return response.json();
    }

    return getFromStorage(STORAGE_KEYS.GOALS) || [];
  },

  // Create new goal - supports negative targets for weight loss
  create: async (goal) => {
    const useBackend = await isBackendAvailable();

    // Determine if this is a reduction goal (weight loss, lose inches, etc)
    const isReductionGoal = goal.goalType === 'reduction' ||
      goal.targetValue < 0 ||
      goal.title?.toLowerCase().includes('lose') ||
      goal.title?.toLowerCase().includes('reduce') ||
      goal.title?.toLowerCase().includes('cut') ||
      goal.title?.toLowerCase().includes('drop');

    const newGoal = {
      id: Date.now(),
      ...goal,
      startValue: goal.startValue || 0,
      currentValue: goal.startValue || 0,
      targetValue: goal.targetValue,
      isReductionGoal,
      completed: false,
      createdAt: new Date().toISOString()
    };

    if (useBackend) {
      const response = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      });
      return response.json();
    }

    const goals = getFromStorage(STORAGE_KEYS.GOALS) || [];
    goals.unshift(newGoal);
    saveToStorage(STORAGE_KEYS.GOALS, goals);
    return newGoal;
  },

  // Update goal progress
  update: async (id, updates) => {
    const useBackend = await isBackendAvailable();

    if (useBackend) {
      const response = await fetch(`${API_BASE}/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return response.json();
    }

    const goals = getFromStorage(STORAGE_KEYS.GOALS) || [];
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
      saveToStorage(STORAGE_KEYS.GOALS, goals);
      return goals[index];
    }
    return null;
  },

  // Delete goal
  delete: async (id) => {
    const useBackend = await isBackendAvailable();

    if (useBackend) {
      await fetch(`${API_BASE}/goals/${id}`, { method: 'DELETE' });
      return true;
    }

    const goals = getFromStorage(STORAGE_KEYS.GOALS) || [];
    const filtered = goals.filter(g => g.id !== id);
    saveToStorage(STORAGE_KEYS.GOALS, filtered);
    return true;
  }
};

// ============================================
// PROFILE API
// ============================================
export const profileApi = {
  get: () => {
    return getFromStorage(STORAGE_KEYS.PROFILE) || {
      name: 'Athlete',
      height: null,
      weight: null,
      age: null,
      goal: 'Stay Fit'
    };
  },

  update: (updates) => {
    const current = profileApi.get();
    const updated = { ...current, ...updates };
    saveToStorage(STORAGE_KEYS.PROFILE, updated);
    return updated;
  }
};

// ============================================
// STATS CALCULATOR
// ============================================
export const statsApi = {
  getDashboardStats: async () => {
    const workouts = await workoutsApi.getAll();
    const todayWorkouts = await workoutsApi.getToday();
    const weekWorkouts = await workoutsApi.getThisWeek();
    const goals = await goalsApi.getAll();

    // Calculate total duration today
    const todayDuration = todayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    // Calculate total calories (rough estimate: 5 cal per minute of exercise)
    const todayCalories = todayDuration * 5;

    // Active goals
    const activeGoals = goals.filter(g => !g.completed).length;

    // Streak calculation (consecutive days with workouts)
    const streak = calculateStreak(workouts);

    return {
      todayWorkouts: todayWorkouts.length,
      todayDuration,
      todayCalories,
      weekWorkouts: weekWorkouts.length,
      totalWorkouts: workouts.length,
      activeGoals,
      streak
    };
  }
};

// Helper function to calculate streak
const calculateStreak = (workouts) => {
  if (workouts.length === 0) return 0;

  const sortedWorkouts = [...workouts].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = new Set();
  sortedWorkouts.forEach(w => {
    const date = new Date(w.date);
    date.setHours(0, 0, 0, 0);
    uniqueDays.add(date.getTime());
  });

  const sortedDays = [...uniqueDays].sort((a, b) => b - a);

  for (let i = 0; i < sortedDays.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (sortedDays[i] === expectedDate.getTime()) {
      streak++;
    } else if (i === 0 && sortedDays[i] === expectedDate.getTime() - 86400000) {
      // Yesterday counts if no workout today yet
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// ============================================
// EXERCISE LIBRARY - With proper emojis
// ============================================
export const exerciseLibrary = [
  // Strength
  { id: 1, name: 'Bench Press', category: 'strength', muscleGroup: 'Chest', emoji: '🏋️‍♂️' },
  { id: 2, name: 'Squats', category: 'strength', muscleGroup: 'Legs', emoji: '🦵' },
  { id: 3, name: 'Deadlift', category: 'strength', muscleGroup: 'Back', emoji: '🏋️' },
  { id: 4, name: 'Shoulder Press', category: 'strength', muscleGroup: 'Shoulders', emoji: '💪' },
  { id: 5, name: 'Bicep Curls', category: 'strength', muscleGroup: 'Arms', emoji: '💪' },
  { id: 6, name: 'Tricep Dips', category: 'strength', muscleGroup: 'Arms', emoji: '💪' },
  { id: 7, name: 'Pull-ups', category: 'strength', muscleGroup: 'Back', emoji: '🧗' },
  { id: 8, name: 'Lunges', category: 'strength', muscleGroup: 'Legs', emoji: '🦵' },
  { id: 9, name: 'Plank', category: 'strength', muscleGroup: 'Core', emoji: '🧘‍♂️' },
  { id: 10, name: 'Push-ups', category: 'strength', muscleGroup: 'Chest', emoji: '💪' },
  { id: 29, name: 'Crunches', category: 'strength', muscleGroup: 'Core', emoji: '🔥' },
  { id: 30, name: 'Leg Press', category: 'strength', muscleGroup: 'Legs', emoji: '🦵' },
  { id: 31, name: 'Lat Pulldown', category: 'strength', muscleGroup: 'Back', emoji: '💪' },
  { id: 32, name: 'Dumbbell Rows', category: 'strength', muscleGroup: 'Back', emoji: '🏋️' },

  // Cardio
  { id: 11, name: 'Running', category: 'cardio', muscleGroup: 'Full Body', emoji: '🏃‍♂️' },
  { id: 12, name: 'Cycling', category: 'cardio', muscleGroup: 'Legs', emoji: '🚴' },
  { id: 13, name: 'Swimming', category: 'cardio', muscleGroup: 'Full Body', emoji: '🏊' },
  { id: 14, name: 'Jump Rope', category: 'cardio', muscleGroup: 'Full Body', emoji: '⚡' },
  { id: 15, name: 'HIIT', category: 'cardio', muscleGroup: 'Full Body', emoji: '🔥' },
  { id: 16, name: 'Rowing', category: 'cardio', muscleGroup: 'Full Body', emoji: '🚣' },
  { id: 17, name: 'Stair Climbing', category: 'cardio', muscleGroup: 'Legs', emoji: '🪜' },
  { id: 18, name: 'Walking', category: 'cardio', muscleGroup: 'Legs', emoji: '🚶' },
  { id: 33, name: 'Burpees', category: 'cardio', muscleGroup: 'Full Body', emoji: '🔥' },
  { id: 34, name: 'Jumping Jacks', category: 'cardio', muscleGroup: 'Full Body', emoji: '⚡' },
  { id: 35, name: 'Treadmill', category: 'cardio', muscleGroup: 'Legs', emoji: '🏃‍♂️' },
  { id: 36, name: 'Hiking', category: 'cardio', muscleGroup: 'Full Body', emoji: '🥾' },

  // Flexibility
  { id: 19, name: 'Yoga', category: 'flexibility', muscleGroup: 'Full Body', emoji: '🧘' },
  { id: 20, name: 'Stretching', category: 'flexibility', muscleGroup: 'Full Body', emoji: '🤸' },
  { id: 21, name: 'Pilates', category: 'flexibility', muscleGroup: 'Core', emoji: '🧘‍♀️' },
  { id: 22, name: 'Foam Rolling', category: 'flexibility', muscleGroup: 'Full Body', emoji: '🎯' },
  { id: 37, name: 'Meditation', category: 'flexibility', muscleGroup: 'Mind', emoji: '🧘' },

  // Sports
  { id: 23, name: 'Basketball', category: 'sports', muscleGroup: 'Full Body', emoji: '🏀' },
  { id: 24, name: 'Soccer', category: 'sports', muscleGroup: 'Full Body', emoji: '⚽' },
  { id: 25, name: 'Tennis', category: 'sports', muscleGroup: 'Full Body', emoji: '🎾' },
  { id: 26, name: 'Boxing', category: 'sports', muscleGroup: 'Full Body', emoji: '🥊' },
  { id: 27, name: 'Rock Climbing', category: 'sports', muscleGroup: 'Full Body', emoji: '🧗' },
  { id: 28, name: 'Martial Arts', category: 'sports', muscleGroup: 'Full Body', emoji: '🥋' },
  { id: 38, name: 'Golf', category: 'sports', muscleGroup: 'Full Body', emoji: '⛳' },
  { id: 39, name: 'Volleyball', category: 'sports', muscleGroup: 'Full Body', emoji: '🏐' },
  { id: 40, name: 'Skiing', category: 'sports', muscleGroup: 'Full Body', emoji: '⛷️' },
  { id: 41, name: 'Surfing', category: 'sports', muscleGroup: 'Full Body', emoji: '🏄' }
];

// ============================================
// AI WORKOUT SUGGESTIONS
// ============================================
const workoutSuggestions = {
  beginner: {
    strength: [
      { exercise: 'Push-ups', sets: 3, reps: 10, reason: 'Great for building chest and arm strength' },
      { exercise: 'Squats', sets: 3, reps: 12, reason: 'Foundation for lower body strength' },
      { exercise: 'Plank', sets: 3, duration: 30, reason: 'Core stability is essential for all exercises' },
      { exercise: 'Lunges', sets: 3, reps: 10, reason: 'Improves balance and leg strength' },
    ],
    cardio: [
      { exercise: 'Walking', duration: 30, reason: 'Low impact way to build cardiovascular endurance' },
      { exercise: 'Jump Rope', duration: 10, reason: 'Fun way to improve coordination and stamina' },
      { exercise: 'Cycling', duration: 20, reason: 'Easy on joints while building endurance' },
    ],
  },
  intermediate: {
    strength: [
      { exercise: 'Bench Press', sets: 4, reps: 8, reason: 'Time to add weight to your chest work' },
      { exercise: 'Deadlift', sets: 4, reps: 6, reason: 'King of compound exercises' },
      { exercise: 'Pull-ups', sets: 3, reps: 8, reason: 'Best exercise for back development' },
      { exercise: 'Shoulder Press', sets: 3, reps: 10, reason: 'Build shoulder strength and definition' },
    ],
    cardio: [
      { exercise: 'Running', duration: 30, reason: 'Build endurance and burn calories' },
      { exercise: 'HIIT', duration: 20, reason: 'Maximum fat burn in minimum time' },
      { exercise: 'Rowing', duration: 20, reason: 'Full body cardio workout' },
    ],
  },
  advanced: {
    strength: [
      { exercise: 'Deadlift', sets: 5, reps: 5, weight: 'heavy', reason: 'Focus on strength gains' },
      { exercise: 'Bench Press', sets: 5, reps: 5, weight: 'heavy', reason: 'Progressive overload' },
      { exercise: 'Squats', sets: 5, reps: 5, weight: 'heavy', reason: 'Leg day is essential' },
      { exercise: 'Pull-ups', sets: 4, reps: 12, reason: 'Add weight for progression' },
    ],
    cardio: [
      { exercise: 'HIIT', duration: 25, reason: 'Push your limits' },
      { exercise: 'Running', duration: 45, reason: 'Build elite endurance' },
      { exercise: 'Swimming', duration: 45, reason: 'Complete body conditioning' },
    ],
  },
};

const motivationalMessages = [
  "Let's crush it today! 💪",
  "Every rep counts towards your goals! 🎯",
  "You're stronger than you think! 🔥",
  "Consistency beats intensity - keep showing up! 🏆",
  "Your future self will thank you! ⭐",
  "No excuses, just results! 💯",
  "Champions are made when no one is watching! 🏅",
  "Push through the pain, embrace the gain! 🚀",
];

export const aiSuggestions = {
  // Get personalized workout suggestion
  getWorkoutSuggestion: async (preferences = {}) => {
    const {
      fitnessLevel = 'beginner',
      focus = 'strength',
      recentWorkouts = [],
      availableTime = 30
    } = preferences;

    // Get workout history to avoid repetition
    const allWorkouts = await workoutsApi.getAll();
    const recentExercises = allWorkouts.slice(0, 5).map(w => w.exerciseName?.toLowerCase());

    // Get suggestions based on fitness level and focus
    const levelSuggestions = workoutSuggestions[fitnessLevel] || workoutSuggestions.beginner;
    const focusSuggestions = levelSuggestions[focus] || levelSuggestions.strength;

    // Filter out recently done exercises
    const freshSuggestions = focusSuggestions.filter(
      s => !recentExercises.includes(s.exercise.toLowerCase())
    );

    // Pick a random suggestion
    const suggestions = freshSuggestions.length > 0 ? freshSuggestions : focusSuggestions;
    const selected = suggestions[Math.floor(Math.random() * suggestions.length)];

    // Get motivational message
    const motivation = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    return {
      ...selected,
      emoji: getExerciseEmoji(selected.exercise, focus),
      motivation,
      tip: getTip(selected.exercise)
    };
  },

  // Get a full workout plan for the day
  getDailyPlan: async (preferences = {}) => {
    const { fitnessLevel = 'beginner', focus = 'strength' } = preferences;
    const levelSuggestions = workoutSuggestions[fitnessLevel] || workoutSuggestions.beginner;
    const focusSuggestions = levelSuggestions[focus] || levelSuggestions.strength;

    // Create a balanced workout plan
    const warmup = { exercise: 'Stretching', duration: 5, reason: 'Warm up your muscles' };
    const mainWorkouts = focusSuggestions.slice(0, 3);
    const cooldown = { exercise: 'Stretching', duration: 5, reason: 'Cool down and recover' };

    return {
      warmup,
      mainWorkouts: mainWorkouts.map(w => ({
        ...w,
        emoji: getExerciseEmoji(w.exercise, focus)
      })),
      cooldown,
      totalDuration: calculatePlanDuration(mainWorkouts),
      motivation: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
    };
  },

  // Get suggestions based on goals
  getGoalBasedSuggestion: async (goal) => {
    if (!goal) return null;

    const goalTitle = goal.title?.toLowerCase() || '';
    let suggestion;

    if (goalTitle.includes('lose') || goalTitle.includes('weight') || goal.isReductionGoal) {
      suggestion = {
        focus: 'Fat Burning',
        exercises: [
          { exercise: 'HIIT', duration: 20, reason: 'Most effective for fat loss' },
          { exercise: 'Running', duration: 30, reason: 'Great calorie burner' },
          { exercise: 'Jump Rope', duration: 15, reason: 'Burns 10+ calories per minute' },
        ],
        tip: 'Combine cardio with a calorie deficit for best results!',
        emoji: '🔥'
      };
    } else if (goalTitle.includes('muscle') || goalTitle.includes('strength') || goalTitle.includes('strong')) {
      suggestion = {
        focus: 'Muscle Building',
        exercises: [
          { exercise: 'Bench Press', sets: 4, reps: 8, reason: 'Chest and triceps' },
          { exercise: 'Squats', sets: 4, reps: 8, reason: 'Leg development' },
          { exercise: 'Deadlift', sets: 4, reps: 6, reason: 'Full body strength' },
        ],
        tip: 'Focus on progressive overload - increase weight gradually!',
        emoji: '💪'
      };
    } else if (goalTitle.includes('flexibility') || goalTitle.includes('flexible')) {
      suggestion = {
        focus: 'Flexibility',
        exercises: [
          { exercise: 'Yoga', duration: 30, reason: 'Improves overall flexibility' },
          { exercise: 'Stretching', duration: 15, reason: 'Target tight muscles' },
          { exercise: 'Pilates', duration: 30, reason: 'Core strength and flexibility' },
        ],
        tip: 'Stretch after your muscles are warm for best results!',
        emoji: '🧘'
      };
    } else {
      suggestion = {
        focus: 'General Fitness',
        exercises: [
          { exercise: 'Running', duration: 20, reason: 'Cardio base' },
          { exercise: 'Push-ups', sets: 3, reps: 12, reason: 'Upper body' },
          { exercise: 'Squats', sets: 3, reps: 15, reason: 'Lower body' },
        ],
        tip: 'Mix cardio and strength for balanced fitness!',
        emoji: '🏅'
      };
    }

    return suggestion;
  }
};

// Helper to get exercise tips
const getTip = (exercise) => {
  const tips = {
    'Push-ups': 'Keep your core tight and body in a straight line',
    'Squats': 'Keep your knees tracking over your toes',
    'Deadlift': 'Keep your back straight, lift with your legs',
    'Plank': 'Engage your core and don\'t let your hips drop',
    'Running': 'Start slow and build up gradually',
    'HIIT': 'Give 100% effort during work intervals',
    'Bench Press': 'Control the weight on the way down',
    'Pull-ups': 'Full range of motion for best results',
  };
  return tips[exercise] || 'Focus on proper form over speed';
};

const calculatePlanDuration = (workouts) => {
  return workouts.reduce((total, w) => {
    if (w.duration) return total + w.duration;
    // Estimate: 45 seconds per set + rest
    if (w.sets && w.reps) return total + (w.sets * 1.5);
    return total + 5;
  }, 10); // Add 10 for warmup/cooldown
};

// Format duration for display
export const formatDuration = (minutes) => {
  if (!minutes) return '0min';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Calculate goal progress percentage
export const calculateGoalProgress = (goal) => {
  if (!goal) return 0;

  if (goal.isReductionGoal) {
    // For reduction goals (weight loss), progress is how much you've reduced
    const startValue = goal.startValue || 0;
    const currentValue = goal.currentValue || startValue;
    const targetReduction = Math.abs(goal.targetValue);
    const actualReduction = startValue - currentValue;

    if (targetReduction === 0) return 0;
    return Math.min(Math.max((actualReduction / targetReduction) * 100, 0), 100);
  } else {
    // For increase goals (workouts completed, etc)
    if (!goal.targetValue || goal.targetValue === 0) return 0;
    return Math.min(Math.max((goal.currentValue / goal.targetValue) * 100, 0), 100);
  }
};

export default {
  workoutsApi,
  goalsApi,
  profileApi,
  statsApi,
  exerciseLibrary,
  formatDuration,
  formatDate,
  getExerciseEmoji,
  aiSuggestions,
  calculateGoalProgress
};
