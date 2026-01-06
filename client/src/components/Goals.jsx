import { useState, useEffect } from 'react';
import {
    Target,
    Plus,
    Trash2,
    Calendar,
    X,
    TrendingDown,
    TrendingUp,
    Minus,
    Sparkles,
    Scale,
    Dumbbell,
    Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { goalsApi, calculateGoalProgress } from '../utils/api';

// Confetti celebration for completing a goal
const celebrateGoalCompletion = () => {
    // First burst
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    // Side bursts
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });
    }, 250);

    // Stars
    setTimeout(() => {
        confetti({
            particleCount: 30,
            spread: 360,
            shapes: ['star'],
            colors: ['#6366f1', '#8b5cf6', '#22d3ee'],
            origin: { y: 0.5 }
        });
    }, 500);
};

const GoalCard = ({ goal, onUpdate, onDelete }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateValue, setUpdateValue] = useState('');

    const progress = calculateGoalProgress(goal);
    const isReduction = goal.isReductionGoal;

    const handleUpdateProgress = async () => {
        if (!updateValue) return;

        const newValue = parseFloat(updateValue);
        let completed = false;

        if (isReduction) {
            // For reduction goals, check if we've reached the target reduction
            const startValue = goal.startValue || 0;
            const targetReduction = Math.abs(goal.targetValue);
            const actualReduction = startValue - newValue;
            completed = actualReduction >= targetReduction;
        } else {
            completed = newValue >= goal.targetValue;
        }

        await onUpdate(goal.id, {
            currentValue: newValue,
            completed
        });

        if (completed && !goal.completed) {
            celebrateGoalCompletion();
        }

        setIsUpdating(false);
        setUpdateValue('');
    };

    const handleQuickIncrement = async () => {
        let newValue;
        let completed = false;

        if (isReduction) {
            // For reduction, decrement the current value
            newValue = (goal.currentValue || goal.startValue || 0) - 1;
            const startValue = goal.startValue || 0;
            const targetReduction = Math.abs(goal.targetValue);
            const actualReduction = startValue - newValue;
            completed = actualReduction >= targetReduction;
        } else {
            newValue = (goal.currentValue || 0) + 1;
            completed = newValue >= goal.targetValue;
        }

        await onUpdate(goal.id, {
            currentValue: newValue,
            completed
        });

        if (completed && !goal.completed) {
            celebrateGoalCompletion();
        }
    };

    // Get goal icon based on unit/type
    const getGoalIcon = () => {
        const unit = goal.unit?.toLowerCase() || '';
        if (unit.includes('lb') || unit.includes('kg') || unit.includes('weight')) {
            return <Scale size={18} />;
        }
        if (unit.includes('workout') || unit.includes('session')) {
            return <Dumbbell size={18} />;
        }
        if (unit.includes('min') || unit.includes('hour')) {
            return <Timer size={18} />;
        }
        return isReduction ? <TrendingDown size={18} /> : <TrendingUp size={18} />;
    };

    // Display current progress text
    const getProgressText = () => {
        if (isReduction) {
            const startValue = goal.startValue || 0;
            const currentValue = goal.currentValue || startValue;
            const reduced = startValue - currentValue;
            const target = Math.abs(goal.targetValue);
            return `${reduced} / ${target} ${goal.unit} lost`;
        }
        return `${goal.currentValue || 0} / ${goal.targetValue} ${goal.unit}`;
    };

    return (
        <div className={`goal-card ${goal.completed ? 'goal-completed' : ''}`}>
            <div className="goal-header">
                <div className="flex items-center gap-sm">
                    {getGoalIcon()}
                    <h4 className="goal-title">{goal.title}</h4>
                </div>
                <span className={`goal-badge ${goal.completed ? 'goal-badge--completed' : 'goal-badge--active'}`}>
                    {goal.completed ? '🎉 Completed' : 'Active'}
                </span>
            </div>

            <div className="goal-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${progress}%`,
                            background: goal.completed
                                ? 'linear-gradient(135deg, #10b981 0%, #22d3ee 100%)'
                                : isReduction
                                    ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                        }}
                    />
                </div>
                <div className="progress-text">
                    <span>{getProgressText()}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Current value display for reduction goals */}
            {isReduction && !goal.completed && (
                <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-sm)' }}>
                    Current: {goal.currentValue || goal.startValue} {goal.unit}
                </div>
            )}

            {goal.deadline && (
                <div className="goal-deadline">
                    <Calendar size={14} />
                    <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                </div>
            )}

            {!goal.completed && (
                <div className="flex gap-sm mt-md" style={{ flexWrap: 'wrap' }}>
                    {!isUpdating ? (
                        <>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleQuickIncrement}
                                style={{ flex: 1 }}
                            >
                                {isReduction ? <Minus size={16} /> : <Plus size={16} />}
                                {isReduction ? 'Log Progress' : 'Add +1'}
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setIsUpdating(true)}
                            >
                                Update
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                type="number"
                                value={updateValue}
                                onChange={(e) => setUpdateValue(e.target.value)}
                                placeholder={isReduction ? "Current weight..." : "New value..."}
                                className="form-input"
                                style={{ flex: 1 }}
                                autoFocus
                            />
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleUpdateProgress}
                            >
                                Save
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setIsUpdating(false)}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                    <button
                        className="btn btn-danger btn-icon"
                        onClick={() => onDelete(goal.id)}
                        aria-label="Delete goal"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

            {goal.completed && (
                <div className="flex gap-sm mt-md">
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onUpdate(goal.id, { completed: false })}
                        style={{ flex: 1 }}
                    >
                        Reopen Goal
                    </button>
                    <button
                        className="btn btn-danger btn-icon"
                        onClick={() => onDelete(goal.id)}
                        aria-label="Delete goal"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

const GoalForm = ({ onClose, onSave }) => {
    const [goalType, setGoalType] = useState('increase'); // 'increase' or 'reduction'
    const [formData, setFormData] = useState({
        title: '',
        targetValue: '',
        startValue: '',
        unit: 'workouts',
        deadline: ''
    });
    const [saving, setSaving] = useState(false);

    const goalTypes = [
        { id: 'increase', label: 'Achieve Goal', icon: TrendingUp, description: 'Reach a target (workouts, reps, etc.)' },
        { id: 'reduction', label: 'Lose/Reduce', icon: TrendingDown, description: 'Weight loss, reduce inches, etc.' }
    ];

    const increaseUnits = ['workouts', 'minutes', 'hours', 'reps', 'km', 'miles', 'days'];
    const reductionUnits = ['lbs', 'kg', 'inches', 'cm', '%'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.targetValue) return;

        setSaving(true);
        try {
            await goalsApi.create({
                title: formData.title,
                targetValue: goalType === 'reduction'
                    ? -Math.abs(parseFloat(formData.targetValue))
                    : parseFloat(formData.targetValue),
                startValue: goalType === 'reduction' ? parseFloat(formData.startValue) || 0 : 0,
                unit: formData.unit,
                deadline: formData.deadline || null,
                goalType
            });
            onSave();
        } catch (error) {
            console.error('Error creating goal:', error);
        } finally {
            setSaving(false);
        }
    };

    const suggestedGoals = goalType === 'increase'
        ? [
            { title: 'Complete 20 workouts this month', target: 20, unit: 'workouts' },
            { title: 'Run 50 km this month', target: 50, unit: 'km' },
            { title: 'Work out 5 days per week', target: 5, unit: 'days' },
        ]
        : [
            { title: 'Lose 10 lbs', target: 10, unit: 'lbs', start: 180 },
            { title: 'Lose 5 kg', target: 5, unit: 'kg', start: 80 },
            { title: 'Reduce waist by 2 inches', target: 2, unit: 'inches', start: 34 },
        ];

    const applySuggestion = (suggestion) => {
        setFormData({
            ...formData,
            title: suggestion.title,
            targetValue: suggestion.target.toString(),
            startValue: suggestion.start?.toString() || '',
            unit: suggestion.unit
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        <Target size={24} style={{ marginRight: '8px' }} />
                        New Goal
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Goal Type Selection */}
                        <div className="form-group">
                            <label className="form-label">Goal Type</label>
                            <div className="goal-type-selector">
                                {goalTypes.map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        className={`goal-type-btn ${goalType === type.id ? 'active' : ''}`}
                                        onClick={() => {
                                            setGoalType(type.id);
                                            setFormData(prev => ({
                                                ...prev,
                                                unit: type.id === 'reduction' ? 'lbs' : 'workouts',
                                                startValue: ''
                                            }));
                                        }}
                                    >
                                        <type.icon size={24} />
                                        <span className="goal-type-label">{type.label}</span>
                                        <span className="goal-type-desc">{type.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Suggestions */}
                        <div className="form-group">
                            <label className="form-label">
                                <Sparkles size={16} style={{ marginRight: '4px' }} />
                                Quick Suggestions
                            </label>
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                {suggestedGoals.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => applySuggestion(suggestion)}
                                    >
                                        {suggestion.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Goal Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder={goalType === 'reduction'
                                    ? "e.g., Lose 10 lbs by summer"
                                    : "e.g., Complete 20 workouts this month"}
                                className="form-input"
                                required
                            />
                        </div>

                        {/* Start Value for Reduction Goals */}
                        {goalType === 'reduction' && (
                            <div className="form-group">
                                <label className="form-label">Starting Value (Current)</label>
                                <input
                                    type="number"
                                    name="startValue"
                                    value={formData.startValue}
                                    onChange={handleChange}
                                    placeholder="e.g., 180 (your current weight)"
                                    className="form-input"
                                    step="0.1"
                                    required
                                />
                                <small className="text-muted">Your current measurement to track from</small>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    {goalType === 'reduction' ? 'Amount to Lose' : 'Target'}
                                </label>
                                <input
                                    type="number"
                                    name="targetValue"
                                    value={formData.targetValue}
                                    onChange={handleChange}
                                    placeholder={goalType === 'reduction' ? "e.g., 10" : "e.g., 20"}
                                    className="form-input"
                                    min="1"
                                    step="0.1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Unit</label>
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    {(goalType === 'reduction' ? reductionUnits : increaseUnits).map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Deadline (optional)</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                className="form-input"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving || !formData.title.trim() || !formData.targetValue ||
                                (goalType === 'reduction' && !formData.startValue)}
                        >
                            {saving ? 'Creating...' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            const data = await goalsApi.getAll();
            setGoals(data);
        } catch (error) {
            console.error('Error loading goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, updates) => {
        await goalsApi.update(id, updates);
        loadGoals();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this goal?')) {
            await goalsApi.delete(id);
            loadGoals();
        }
    };

    const handleGoalAdded = () => {
        setShowForm(false);
        loadGoals();
    };

    const filteredGoals = goals.filter(goal => {
        if (filter === 'active') return !goal.completed;
        if (filter === 'completed') return goal.completed;
        return true;
    });

    const completedCount = goals.filter(g => g.completed).length;
    const activeCount = goals.filter(g => !g.completed).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="goals-page">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">
                    <Target size={28} />
                    <span className="text-gradient">Goals</span>
                </h1>
                <p className="page-subtitle">
                    {activeCount} active · {completedCount} completed
                </p>
            </div>

            {/* Filters */}
            <div className="tabs mb-lg">
                {['all', 'active', 'completed'].map(f => (
                    <button
                        key={f}
                        className={`tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === 'active' && activeCount > 0 && (
                            <span style={{
                                marginLeft: '6px',
                                background: 'rgba(99, 102, 241, 0.3)',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '0.75rem'
                            }}>
                                {activeCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Goals Grid */}
            {filteredGoals.length === 0 ? (
                <div className="glass-card">
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Target size={32} />
                        </div>
                        <h4 className="empty-title">
                            {filter === 'completed'
                                ? 'No completed goals yet'
                                : 'No goals set'}
                        </h4>
                        <p className="empty-text">
                            {filter === 'completed'
                                ? 'Keep working on your active goals!'
                                : 'Set a fitness goal to stay motivated!'}
                        </p>
                        {filter !== 'completed' && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowForm(true)}
                            >
                                <Plus size={18} />
                                Create Goal
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="goals-grid">
                    {filteredGoals.map((goal, index) => (
                        <div key={goal.id} style={{ animationDelay: `${index * 0.1}s` }}>
                            <GoalCard
                                goal={goal}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Goal Form Modal */}
            {showForm && (
                <GoalForm
                    onClose={() => setShowForm(false)}
                    onSave={handleGoalAdded}
                />
            )}

            {/* FAB */}
            <button
                className="fab"
                onClick={() => setShowForm(true)}
                aria-label="Add goal"
            >
                <Plus size={28} />
            </button>
        </div>
    );
};

export default Goals;
