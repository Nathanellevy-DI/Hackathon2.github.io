import { useState, useEffect } from 'react';
import {
    Sparkles,
    Dumbbell,
    RefreshCw,
    ChevronRight,
    Zap,
    Target,
    Clock,
    Check
} from 'lucide-react';
import { aiSuggestions, getExerciseEmoji, workoutsApi, goalsApi } from '../utils/api';

const AISuggestions = ({ onLogWorkout }) => {
    const [suggestion, setSuggestion] = useState(null);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [goalSuggestion, setGoalSuggestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('quick');
    const [fitnessLevel, setFitnessLevel] = useState('beginner');
    const [focus, setFocus] = useState('strength');

    useEffect(() => {
        loadSuggestions();
    }, [fitnessLevel, focus]);

    const loadSuggestions = async () => {
        setLoading(true);
        try {
            const [quickSuggestion, plan, goals] = await Promise.all([
                aiSuggestions.getWorkoutSuggestion({ fitnessLevel, focus }),
                aiSuggestions.getDailyPlan({ fitnessLevel, focus }),
                goalsApi.getAll()
            ]);

            setSuggestion(quickSuggestion);
            setDailyPlan(plan);

            // Get goal-based suggestion if there are active goals
            const activeGoal = goals.find(g => !g.completed);
            if (activeGoal) {
                const goalBasedSuggestion = await aiSuggestions.getGoalBasedSuggestion(activeGoal);
                setGoalSuggestion({ ...goalBasedSuggestion, goal: activeGoal });
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadSuggestions();
    };

    const handleLogWorkout = async (exercise) => {
        if (onLogWorkout) {
            onLogWorkout(exercise);
        }
    };

    if (loading) {
        return (
            <div className="glass-card">
                <div className="flex items-center justify-center" style={{ padding: 'var(--spacing-xl)' }}>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-suggestions glass-card glass-card--no-hover">
            <div className="section-header">
                <h3 className="section-title">
                    <Sparkles size={20} className="animate-pulse" style={{ color: 'var(--accent)' }} />
                    AI Workout Coach
                </h3>
                <button className="btn btn-icon btn-secondary" onClick={handleRefresh}>
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Level & Focus Selectors */}
            <div className="ai-selectors">
                <div className="selector-group">
                    <label className="selector-label">Level:</label>
                    <div className="selector-buttons">
                        {['beginner', 'intermediate', 'advanced'].map(level => (
                            <button
                                key={level}
                                className={`selector-btn ${fitnessLevel === level ? 'active' : ''}`}
                                onClick={() => setFitnessLevel(level)}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="selector-group">
                    <label className="selector-label">Focus:</label>
                    <div className="selector-buttons">
                        {['strength', 'cardio'].map(f => (
                            <button
                                key={f}
                                className={`selector-btn ${focus === f ? 'active' : ''}`}
                                onClick={() => setFocus(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="ai-tabs">
                <button
                    className={`ai-tab ${activeTab === 'quick' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quick')}
                >
                    <Zap size={16} />
                    Quick Pick
                </button>
                <button
                    className={`ai-tab ${activeTab === 'plan' ? 'active' : ''}`}
                    onClick={() => setActiveTab('plan')}
                >
                    <Dumbbell size={16} />
                    Daily Plan
                </button>
                {goalSuggestion && (
                    <button
                        className={`ai-tab ${activeTab === 'goal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('goal')}
                    >
                        <Target size={16} />
                        Goal Focus
                    </button>
                )}
            </div>

            {/* Quick Suggestion Tab */}
            {activeTab === 'quick' && suggestion && (
                <div className="ai-suggestion-card animate-fade-in">
                    <div className="suggestion-header">
                        <span className="suggestion-emoji">{suggestion.emoji}</span>
                        <div className="suggestion-info">
                            <h4 className="suggestion-exercise">{suggestion.exercise}</h4>
                            <p className="suggestion-details">
                                {suggestion.sets && suggestion.reps && `${suggestion.sets} × ${suggestion.reps} reps`}
                                {suggestion.duration && `${suggestion.duration} minutes`}
                            </p>
                        </div>
                    </div>

                    <p className="suggestion-reason">
                        💡 {suggestion.reason}
                    </p>

                    {suggestion.tip && (
                        <p className="suggestion-tip">
                            ⚡ Tip: {suggestion.tip}
                        </p>
                    )}

                    <p className="suggestion-motivation">
                        {suggestion.motivation}
                    </p>

                    <button
                        className="btn btn-primary btn-block mt-md"
                        onClick={() => handleLogWorkout({
                            exerciseName: suggestion.exercise,
                            sets: suggestion.sets,
                            reps: suggestion.reps,
                            duration: suggestion.duration,
                            category: focus
                        })}
                    >
                        <Check size={18} />
                        Log This Workout
                    </button>
                </div>
            )}

            {/* Daily Plan Tab */}
            {activeTab === 'plan' && dailyPlan && (
                <div className="ai-plan animate-fade-in">
                    <div className="plan-header">
                        <Clock size={16} />
                        <span>Est. {dailyPlan.totalDuration} minutes</span>
                    </div>

                    <p className="suggestion-motivation mb-md">
                        {dailyPlan.motivation}
                    </p>

                    <div className="plan-workouts">
                        {/* Warmup */}
                        <div className="plan-workout warmup">
                            <span className="plan-workout-emoji">🔥</span>
                            <div className="plan-workout-details">
                                <span className="plan-workout-name">{dailyPlan.warmup.exercise}</span>
                                <span className="plan-workout-meta">{dailyPlan.warmup.duration} min</span>
                            </div>
                        </div>

                        {/* Main Workouts */}
                        {dailyPlan.mainWorkouts.map((workout, idx) => (
                            <div key={idx} className="plan-workout">
                                <span className="plan-workout-emoji">{workout.emoji}</span>
                                <div className="plan-workout-details">
                                    <span className="plan-workout-name">{workout.exercise}</span>
                                    <span className="plan-workout-meta">
                                        {workout.sets && workout.reps && `${workout.sets} × ${workout.reps}`}
                                        {workout.duration && `${workout.duration} min`}
                                    </span>
                                </div>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleLogWorkout({
                                        exerciseName: workout.exercise,
                                        sets: workout.sets,
                                        reps: workout.reps,
                                        duration: workout.duration,
                                        category: focus
                                    })}
                                >
                                    Log
                                </button>
                            </div>
                        ))}

                        {/* Cooldown */}
                        <div className="plan-workout cooldown">
                            <span className="plan-workout-emoji">😌</span>
                            <div className="plan-workout-details">
                                <span className="plan-workout-name">{dailyPlan.cooldown.exercise}</span>
                                <span className="plan-workout-meta">{dailyPlan.cooldown.duration} min</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Goal-Based Tab */}
            {activeTab === 'goal' && goalSuggestion && (
                <div className="ai-goal-suggestion animate-fade-in">
                    <div className="goal-focus-header">
                        <span className="goal-focus-emoji">{goalSuggestion.emoji}</span>
                        <div>
                            <h4 className="goal-focus-title">Focus: {goalSuggestion.focus}</h4>
                            <p className="goal-focus-goal">
                                For: {goalSuggestion.goal.title}
                            </p>
                        </div>
                    </div>

                    <p className="suggestion-tip mb-md">
                        💡 {goalSuggestion.tip}
                    </p>

                    <div className="plan-workouts">
                        {goalSuggestion.exercises.map((workout, idx) => (
                            <div key={idx} className="plan-workout">
                                <span className="plan-workout-emoji">{getExerciseEmoji(workout.exercise)}</span>
                                <div className="plan-workout-details">
                                    <span className="plan-workout-name">{workout.exercise}</span>
                                    <span className="plan-workout-meta">
                                        {workout.sets && workout.reps && `${workout.sets} × ${workout.reps}`}
                                        {workout.duration && `${workout.duration} min`}
                                    </span>
                                    <span className="plan-workout-reason">{workout.reason}</span>
                                </div>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleLogWorkout({
                                        exerciseName: workout.exercise,
                                        sets: workout.sets,
                                        reps: workout.reps,
                                        duration: workout.duration,
                                        category: workout.sets ? 'strength' : 'cardio'
                                    })}
                                >
                                    Log
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AISuggestions;
