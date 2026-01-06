import { useState } from 'react';
import { X, Dumbbell, Search } from 'lucide-react';
import { workoutsApi, exerciseLibrary } from '../utils/api';

const WorkoutForm = ({ onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState(initialData || {
        exerciseName: '',
        category: 'strength',
        sets: '',
        reps: '',
        weight: '',
        duration: '',
        notes: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
    const [saving, setSaving] = useState(false);

    const filteredExercises = exerciseLibrary.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categories = ['strength', 'cardio', 'flexibility', 'sports'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExerciseSelect = (exercise) => {
        setFormData(prev => ({
            ...prev,
            exerciseName: exercise.name,
            category: exercise.category
        }));
        setShowExerciseLibrary(false);
        setSearchQuery('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.exerciseName.trim()) return;

        setSaving(true);
        try {
            await workoutsApi.create({
                exerciseName: formData.exerciseName,
                category: formData.category,
                sets: formData.sets ? parseInt(formData.sets) : null,
                reps: formData.reps ? parseInt(formData.reps) : null,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                duration: formData.duration ? parseInt(formData.duration) : null,
                notes: formData.notes
            });
            onSave();
        } catch (error) {
            console.error('Error saving workout:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        <Dumbbell size={24} style={{ marginRight: '8px' }} />
                        Log Workout
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Exercise Name */}
                        <div className="form-group">
                            <label className="form-label">Exercise</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    name="exerciseName"
                                    value={formData.exerciseName}
                                    onChange={handleChange}
                                    onFocus={() => setShowExerciseLibrary(true)}
                                    placeholder="Search or type exercise name..."
                                    className="form-input"
                                    required
                                />
                                <Search
                                    size={18}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)'
                                    }}
                                />
                            </div>

                            {/* Exercise Library Dropdown */}
                            {showExerciseLibrary && (
                                <div
                                    className="glass-card"
                                    style={{
                                        position: 'absolute',
                                        zIndex: 100,
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        marginTop: '8px',
                                        padding: '8px'
                                    }}
                                >
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Filter exercises..."
                                        className="form-input"
                                        style={{ marginBottom: '8px' }}
                                    />
                                    <div className="exercise-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                        {filteredExercises.slice(0, 8).map(exercise => (
                                            <div
                                                key={exercise.id}
                                                className="exercise-item"
                                                onClick={() => handleExerciseSelect(exercise)}
                                            >
                                                <div className="exercise-emoji">{exercise.emoji}</div>
                                                <div className="exercise-name">{exercise.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-block mt-md"
                                        onClick={() => setShowExerciseLibrary(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sets & Reps Row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Sets</label>
                                <input
                                    type="number"
                                    name="sets"
                                    value={formData.sets}
                                    onChange={handleChange}
                                    placeholder="e.g., 3"
                                    className="form-input"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Reps</label>
                                <input
                                    type="number"
                                    name="reps"
                                    value={formData.reps}
                                    onChange={handleChange}
                                    placeholder="e.g., 12"
                                    className="form-input"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Weight & Duration Row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Weight (kg)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    placeholder="e.g., 50"
                                    className="form-input"
                                    min="0"
                                    step="0.5"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Duration (min)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g., 30"
                                    className="form-input"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="form-group">
                            <label className="form-label">Notes (optional)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="How did it feel? Any PRs?"
                                className="form-textarea"
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
                            disabled={saving || !formData.exerciseName.trim()}
                        >
                            {saving ? (
                                <>
                                    <div className="loading-spinner" style={{ width: '18px', height: '18px' }}></div>
                                    Saving...
                                </>
                            ) : (
                                <>Save Workout</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkoutForm;
