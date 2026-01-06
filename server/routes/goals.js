const express = require('express');
const router = express.Router();
const { goalOperations } = require('../models/database');

// GET /api/goals - Get all goals
router.get('/', (req, res) => {
    try {
        const goals = goalOperations.getAll();
        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// GET /api/goals/:id - Get single goal
router.get('/:id', (req, res) => {
    try {
        const goal = goalOperations.getById(parseInt(req.params.id));
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.json(goal);
    } catch (error) {
        console.error('Error fetching goal:', error);
        res.status(500).json({ error: 'Failed to fetch goal' });
    }
});

// POST /api/goals - Create new goal
router.post('/', (req, res) => {
    try {
        const { title, targetValue, unit, deadline } = req.body;

        if (!title || !targetValue) {
            return res.status(400).json({ error: 'Title and target value are required' });
        }

        const goal = goalOperations.create({
            title,
            targetValue: parseFloat(targetValue),
            unit: unit || 'workouts',
            deadline: deadline || null
        });

        res.status(201).json(goal);
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// PUT /api/goals/:id - Update goal
router.put('/:id', (req, res) => {
    try {
        const { currentValue, completed, title } = req.body;

        const goal = goalOperations.update(parseInt(req.params.id), {
            currentValue,
            completed,
            title
        });

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json(goal);
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// DELETE /api/goals/:id - Delete goal
router.delete('/:id', (req, res) => {
    try {
        const result = goalOperations.delete(parseInt(req.params.id));
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

module.exports = router;
