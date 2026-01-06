const express = require('express');
const router = express.Router();
const { workoutOperations } = require('../models/database');

// GET /api/workouts - Get all workouts
router.get('/', (req, res) => {
    try {
        const workouts = workoutOperations.getAll();
        res.json(workouts);
    } catch (error) {
        console.error('Error fetching workouts:', error);
        res.status(500).json({ error: 'Failed to fetch workouts' });
    }
});

// GET /api/workouts/:id - Get single workout
router.get('/:id', (req, res) => {
    try {
        const workout = workoutOperations.getById(parseInt(req.params.id));
        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        res.json(workout);
    } catch (error) {
        console.error('Error fetching workout:', error);
        res.status(500).json({ error: 'Failed to fetch workout' });
    }
});

// POST /api/workouts - Create new workout
router.post('/', (req, res) => {
    try {
        const { exerciseName, category, sets, reps, weight, duration, notes } = req.body;

        if (!exerciseName) {
            return res.status(400).json({ error: 'Exercise name is required' });
        }

        const workout = workoutOperations.create({
            exerciseName,
            category,
            sets,
            reps,
            weight,
            duration,
            notes,
            date: new Date().toISOString()
        });

        res.status(201).json(workout);
    } catch (error) {
        console.error('Error creating workout:', error);
        res.status(500).json({ error: 'Failed to create workout' });
    }
});

// DELETE /api/workouts/:id - Delete workout
router.delete('/:id', (req, res) => {
    try {
        const result = workoutOperations.delete(parseInt(req.params.id));
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        res.json({ message: 'Workout deleted successfully' });
    } catch (error) {
        console.error('Error deleting workout:', error);
        res.status(500).json({ error: 'Failed to delete workout' });
    }
});

module.exports = router;
