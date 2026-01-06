import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Dumbbell,
    Flame,
    Timer,
    Target,
    TrendingUp,
    Plus,
    ChevronRight,
    Zap
} from 'lucide-react';
import { statsApi, workoutsApi, formatDuration, formatDate, getExerciseEmoji } from '../utils/api';
import WorkoutForm from './WorkoutForm';
import AISuggestions from './AISuggestions';

const Dashboard = () => {
    const [stats, setStats] = useState({
        todayWorkouts: 0,
        todayDuration: 0,
        todayCalories: 0,
        streak: 0,
        weekWorkouts: 0,
        activeGoals: 0
    });
    const [recentWorkouts, setRecentWorkouts] = useState([]);
    const [showWorkoutForm, setShowWorkoutForm] = useState(false);
    const [prefillWorkout, setPrefillWorkout] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, workouts] = await Promise.all([
                statsApi.getDashboardStats(),
                workoutsApi.getAll()
            ]);
            setStats(statsData);
            setRecentWorkouts(workouts.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWorkoutAdded = () => {
        setShowWorkoutForm(false);
        setPrefillWorkout(null);
        loadData();
    };

    const handleLogFromAI = (workout) => {
        setPrefillWorkout(workout);
        setShowWorkoutForm(true);
    };

    const statCards = [
        {
            icon: Dumbbell,
            value: stats.todayWorkouts,
            label: 'Today',
            colorClass: 'stat-icon--primary'
        },
        {
            icon: Timer,
            value: formatDuration(stats.todayDuration),
            label: 'Duration',
            colorClass: 'stat-icon--accent'
        },
        {
            icon: Flame,
            value: stats.todayCalories,
            label: 'Calories',
            colorClass: 'stat-icon--orange'
        },
        {
            icon: Zap,
            value: `${stats.streak} days`,
            label: 'Streak',
            colorClass: 'stat-icon--green'
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">
                    <span className="text-gradient">Good {getGreeting()}!</span> 💪
                </h1>
                <p className="page-subtitle">Let's crush your fitness goals today</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map(({ icon: Icon, value, label, colorClass }, index) => (
                    <div key={index} className="stat-card">
                        <div className={`stat-icon ${colorClass}`}>
                            <Icon size={24} />
                        </div>
                        <div className="stat-value">{value}</div>
                        <div className="stat-label">{label}</div>
                    </div>
                ))}
            </div>

            {/* AI Suggestions */}
            <AISuggestions onLogWorkout={handleLogFromAI} />

            {/* Quick Actions */}
            <div className="glass-card mb-lg">
                <div className="section-header">
                    <h3 className="section-title">
                        <Plus size={20} />
                        Quick Actions
                    </h3>
                </div>
                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => setShowWorkoutForm(true)}
                    >
                        <Plus size={20} />
                        Log Workout
                    </button>
                    <Link to="/goals" className="btn btn-secondary btn-lg">
                        <Target size={20} />
                        Set Goal
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card glass-card--no-hover">
                <div className="section-header">
                    <h3 className="section-title">
                        <TrendingUp size={20} />
                        Recent Activity
                    </h3>
                    <Link to="/workouts" className="section-action">
                        View All <ChevronRight size={16} />
                    </Link>
                </div>

                {recentWorkouts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Dumbbell size={32} />
                        </div>
                        <h4 className="empty-title">No workouts yet</h4>
                        <p className="empty-text">Start your fitness journey by logging your first workout!</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowWorkoutForm(true)}
                        >
                            <Plus size={18} />
                            Log Your First Workout
                        </button>
                    </div>
                ) : (
                    <div className="workout-list">
                        {recentWorkouts.map((workout) => (
                            <div key={workout.id} className="workout-item">
                                <div className="workout-emoji">
                                    {workout.emoji || getExerciseEmoji(workout.exerciseName, workout.category)}
                                </div>
                                <div className="workout-details">
                                    <div className="workout-name">{workout.exerciseName}</div>
                                    <div className="workout-meta">
                                        {workout.sets && workout.reps && (
                                            <span>{workout.sets} × {workout.reps}</span>
                                        )}
                                        {workout.weight && <span>{workout.weight} kg</span>}
                                        {workout.duration && <span>{formatDuration(workout.duration)}</span>}
                                        <span>{formatDate(workout.date)}</span>
                                    </div>
                                </div>
                                <span className={`category-badge category-badge--${workout.category || 'strength'}`}>
                                    {workout.category || 'Strength'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Workout Form Modal */}
            {showWorkoutForm && (
                <WorkoutForm
                    onClose={() => {
                        setShowWorkoutForm(false);
                        setPrefillWorkout(null);
                    }}
                    onSave={handleWorkoutAdded}
                    initialData={prefillWorkout}
                />
            )}

            {/* Floating Action Button */}
            <button
                className="fab"
                onClick={() => setShowWorkoutForm(true)}
                aria-label="Add workout"
            >
                <Plus size={28} />
            </button>
        </div>
    );
};

// Helper function to get time-based greeting
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
};

export default Dashboard;
