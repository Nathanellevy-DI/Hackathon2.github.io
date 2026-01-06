const Database = require('better-sqlite3');
const path = require('path');

// Create database file in server directory
const dbPath = path.join(__dirname, '..', 'fittrack.db');
let db;

// ============================================
// DATABASE INITIALIZATION
// ============================================

const initializeDatabase = async () => {
    try {
        db = new Database(dbPath);

        // Enable foreign keys
        db.pragma('foreign_keys = ON');

        // Create tables
        db.exec(`
      -- Workouts table
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_name TEXT NOT NULL,
        category TEXT DEFAULT 'strength',
        sets INTEGER,
        reps INTEGER,
        weight REAL,
        duration INTEGER,
        notes TEXT,
        date TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Goals table
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        target_value REAL NOT NULL,
        current_value REAL DEFAULT 0,
        unit TEXT DEFAULT 'workouts',
        deadline TEXT,
        completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Exercise library table
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        muscle_group TEXT,
        emoji TEXT,
        description TEXT
      );
    `);

        // Seed exercise library if empty
        const exerciseCount = db.prepare('SELECT COUNT(*) as count FROM exercises').get();
        if (exerciseCount.count === 0) {
            seedExercises();
        }

        console.log('✅ Database initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};

// ============================================
// SEED DATA
// ============================================

const seedExercises = () => {
    const exercises = [
        // Strength
        { name: 'Bench Press', category: 'strength', muscle_group: 'Chest', emoji: '🏋️' },
        { name: 'Squats', category: 'strength', muscle_group: 'Legs', emoji: '🦵' },
        { name: 'Deadlift', category: 'strength', muscle_group: 'Back', emoji: '💪' },
        { name: 'Shoulder Press', category: 'strength', muscle_group: 'Shoulders', emoji: '🏋️' },
        { name: 'Bicep Curls', category: 'strength', muscle_group: 'Arms', emoji: '💪' },
        { name: 'Tricep Dips', category: 'strength', muscle_group: 'Arms', emoji: '💪' },
        { name: 'Pull-ups', category: 'strength', muscle_group: 'Back', emoji: '🏋️' },
        { name: 'Lunges', category: 'strength', muscle_group: 'Legs', emoji: '🦵' },
        { name: 'Plank', category: 'strength', muscle_group: 'Core', emoji: '🧘' },
        { name: 'Push-ups', category: 'strength', muscle_group: 'Chest', emoji: '💪' },

        // Cardio
        { name: 'Running', category: 'cardio', muscle_group: 'Full Body', emoji: '🏃' },
        { name: 'Cycling', category: 'cardio', muscle_group: 'Legs', emoji: '🚴' },
        { name: 'Swimming', category: 'cardio', muscle_group: 'Full Body', emoji: '🏊' },
        { name: 'Jump Rope', category: 'cardio', muscle_group: 'Full Body', emoji: '⚡' },
        { name: 'HIIT', category: 'cardio', muscle_group: 'Full Body', emoji: '🔥' },
        { name: 'Rowing', category: 'cardio', muscle_group: 'Full Body', emoji: '🚣' },

        // Flexibility
        { name: 'Yoga', category: 'flexibility', muscle_group: 'Full Body', emoji: '🧘' },
        { name: 'Stretching', category: 'flexibility', muscle_group: 'Full Body', emoji: '🤸' },
        { name: 'Pilates', category: 'flexibility', muscle_group: 'Core', emoji: '🧘' },

        // Sports
        { name: 'Basketball', category: 'sports', muscle_group: 'Full Body', emoji: '🏀' },
        { name: 'Soccer', category: 'sports', muscle_group: 'Full Body', emoji: '⚽' },
        { name: 'Tennis', category: 'sports', muscle_group: 'Full Body', emoji: '🎾' },
        { name: 'Boxing', category: 'sports', muscle_group: 'Full Body', emoji: '🥊' },
    ];

    const insert = db.prepare(`
    INSERT INTO exercises (name, category, muscle_group, emoji)
    VALUES (@name, @category, @muscle_group, @emoji)
  `);

    const insertMany = db.transaction((exercises) => {
        for (const exercise of exercises) {
            insert.run(exercise);
        }
    });

    insertMany(exercises);
    console.log('✅ Exercise library seeded');
};

// ============================================
// WORKOUT OPERATIONS
// ============================================

const workoutOperations = {
    getAll: () => {
        return db.prepare(`
      SELECT 
        id,
        exercise_name as exerciseName,
        category,
        sets,
        reps,
        weight,
        duration,
        notes,
        date
      FROM workouts 
      ORDER BY date DESC
    `).all();
    },

    getById: (id) => {
        return db.prepare(`
      SELECT 
        id,
        exercise_name as exerciseName,
        category,
        sets,
        reps,
        weight,
        duration,
        notes,
        date
      FROM workouts 
      WHERE id = ?
    `).get(id);
    },

    create: (workout) => {
        const result = db.prepare(`
      INSERT INTO workouts (exercise_name, category, sets, reps, weight, duration, notes, date)
      VALUES (@exerciseName, @category, @sets, @reps, @weight, @duration, @notes, @date)
    `).run({
            exerciseName: workout.exerciseName,
            category: workout.category || 'strength',
            sets: workout.sets || null,
            reps: workout.reps || null,
            weight: workout.weight || null,
            duration: workout.duration || null,
            notes: workout.notes || null,
            date: workout.date || new Date().toISOString()
        });

        return { id: result.lastInsertRowid, ...workout };
    },

    delete: (id) => {
        return db.prepare('DELETE FROM workouts WHERE id = ?').run(id);
    }
};

// ============================================
// GOAL OPERATIONS
// ============================================

const goalOperations = {
    getAll: () => {
        return db.prepare(`
      SELECT 
        id,
        title,
        target_value as targetValue,
        current_value as currentValue,
        unit,
        deadline,
        completed,
        created_at as createdAt
      FROM goals 
      ORDER BY completed ASC, created_at DESC
    `).all();
    },

    getById: (id) => {
        return db.prepare(`
      SELECT 
        id,
        title,
        target_value as targetValue,
        current_value as currentValue,
        unit,
        deadline,
        completed,
        created_at as createdAt
      FROM goals 
      WHERE id = ?
    `).get(id);
    },

    create: (goal) => {
        const result = db.prepare(`
      INSERT INTO goals (title, target_value, current_value, unit, deadline)
      VALUES (@title, @targetValue, @currentValue, @unit, @deadline)
    `).run({
            title: goal.title,
            targetValue: goal.targetValue,
            currentValue: goal.currentValue || 0,
            unit: goal.unit || 'workouts',
            deadline: goal.deadline || null
        });

        return { id: result.lastInsertRowid, ...goal, completed: false };
    },

    update: (id, updates) => {
        const fields = [];
        const values = { id };

        if (updates.currentValue !== undefined) {
            fields.push('current_value = @currentValue');
            values.currentValue = updates.currentValue;
        }
        if (updates.completed !== undefined) {
            fields.push('completed = @completed');
            values.completed = updates.completed ? 1 : 0;
        }
        if (updates.title !== undefined) {
            fields.push('title = @title');
            values.title = updates.title;
        }

        if (fields.length === 0) return null;

        db.prepare(`UPDATE goals SET ${fields.join(', ')} WHERE id = @id`).run(values);
        return goalOperations.getById(id);
    },

    delete: (id) => {
        return db.prepare('DELETE FROM goals WHERE id = ?').run(id);
    }
};

// ============================================
// EXERCISE OPERATIONS
// ============================================

const exerciseOperations = {
    getAll: () => {
        return db.prepare(`
      SELECT 
        id,
        name,
        category,
        muscle_group as muscleGroup,
        emoji,
        description
      FROM exercises 
      ORDER BY category, name
    `).all();
    }
};

module.exports = {
    initializeDatabase,
    workoutOperations,
    goalOperations,
    exerciseOperations
};
