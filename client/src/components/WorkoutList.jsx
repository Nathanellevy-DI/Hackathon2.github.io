import { useState, useEffect } from 'react';
import {
    Dumbbell,
    Plus,
    Trash2,
    Search,
    Filter,
    Calendar
} from 'lucide-react';
import { workoutsApi, formatDuration, formatDate, getExerciseEmoji } from '../utils/api';
import WorkoutForm from './WorkoutForm';

const WorkoutList = () => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        loadWorkouts();
    }, []);

    const loadWorkouts = async () => {
        try {
            const data = await workoutsApi.getAll();
            setWorkouts(data);
        } catch (error) {
            console.error('Error loading workouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this workout?')) {
            await workoutsApi.delete(id);
            loadWorkouts();
        }
    };

    const handleWorkoutAdded = () => {
        setShowForm(false);
        loadWorkouts();
    };

    const categories = ['all', 'strength', 'cardio', 'flexibility', 'sports'];

    const filteredWorkouts = workouts.filter(workout => {
        const matchesSearch = workout.exerciseName
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' ||
            workout.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Group workouts by date
    const groupedWorkouts = filteredWorkouts.reduce((groups, workout) => {
        const dateKey = formatDate(workout.date);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(workout);
        return groups;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="workouts-page">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">
                    <Dumbbell size={28} />
                    <span className="text-gradient">Workouts</span>
                </h1>
                <p className="page-subtitle">
                    {workouts.length} total workouts logged
                </p>
            </div>

            {/* Search & Filter */}
            <div className="glass-card mb-lg">
                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search workouts..."
                            className="form-input"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>

                    <div className="tabs" style={{ marginBottom: 0 }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`tab ${filterCategory === cat ? 'active' : ''}`}
                                onClick={() => setFilterCategory(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Workouts List */}
            {filteredWorkouts.length === 0 ? (
                <div className="glass-card">
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Dumbbell size={32} />
                        </div>
                        <h4 className="empty-title">No workouts found</h4>
                        <p className="empty-text">
                            {searchQuery || filterCategory !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Start logging your workouts to see them here!'}
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus size={18} />
                            Log Workout
                        </button>
                    </div>
                </div>
            ) : (
                Object.entries(groupedWorkouts).map(([date, dateWorkouts]) => (
                    <div key={date} className="mb-lg">
                        <div className="flex items-center gap-sm mb-md">
                            <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                                {date}
                            </span>
                        </div>
                        <div className="workout-list">
                            {dateWorkouts.map((workout, index) => (
                                <div
                                    key={workout.id}
                                    className="workout-item"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="workout-emoji">
                                        {workout.emoji || getExerciseEmoji(workout.exerciseName, workout.category)}
                                    </div>
                                    <div className="workout-details">
                                        <div className="workout-name">{workout.exerciseName}</div>
                                        <div className="workout-meta">
                                            {workout.sets && workout.reps && (
                                                <span>{workout.sets} × {workout.reps} reps</span>
                                            )}
                                            {workout.weight && <span>{workout.weight} kg</span>}
                                            {workout.duration && (
                                                <span>{formatDuration(workout.duration)}</span>
                                            )}
                                        </div>
                                        {workout.notes && (
                                            <p style={{
                                                color: 'var(--text-muted)',
                                                fontSize: '0.85rem',
                                                marginTop: '4px',
                                                fontStyle: 'italic'
                                            }}>
                                                "{workout.notes}"
                                            </p>
                                        )}
                                    </div>
                                    <span className={`category-badge category-badge--${workout.category || 'strength'}`}>
                                        {workout.category || 'Strength'}
                                    </span>
                                    <button
                                        className="workout-delete"
                                        onClick={() => handleDelete(workout.id)}
                                        aria-label="Delete workout"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Workout Form Modal */}
            {showForm && (
                <WorkoutForm
                    onClose={() => setShowForm(false)}
                    onSave={handleWorkoutAdded}
                />
            )}

            {/* FAB */}
            <button
                className="fab"
                onClick={() => setShowForm(true)}
                aria-label="Add workout"
            >
                <Plus size={28} />
            </button>
        </div>
    );
};

export default WorkoutList;
