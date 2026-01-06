import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Calendar,
    Flame,
    Dumbbell,
    Timer
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { workoutsApi } from '../utils/api';

const ProgressChart = () => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');

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

    // Prepare chart data
    const getChartData = () => {
        const now = new Date();
        let startDate = new Date();
        let dateFormat = 'short';

        switch (timeRange) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                dateFormat = 'month';
                break;
        }

        // Filter workouts within date range
        const filteredWorkouts = workouts.filter(w =>
            new Date(w.date) >= startDate
        );

        // Group by date
        const groupedData = {};

        if (timeRange === 'year') {
            // Group by month for yearly view
            filteredWorkouts.forEach(workout => {
                const date = new Date(workout.date);
                const key = `${date.getFullYear()}-${date.getMonth()}`;
                if (!groupedData[key]) {
                    groupedData[key] = {
                        date: date.toLocaleDateString('en-US', { month: 'short' }),
                        workouts: 0,
                        duration: 0,
                        calories: 0
                    };
                }
                groupedData[key].workouts += 1;
                groupedData[key].duration += workout.duration || 0;
                groupedData[key].calories += (workout.duration || 0) * 5;
            });
        } else {
            // Generate all dates in range
            const current = new Date(startDate);
            while (current <= now) {
                const key = current.toISOString().split('T')[0];
                groupedData[key] = {
                    date: current.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                    workouts: 0,
                    duration: 0,
                    calories: 0
                };
                current.setDate(current.getDate() + 1);
            }

            // Fill in workout data
            filteredWorkouts.forEach(workout => {
                const key = new Date(workout.date).toISOString().split('T')[0];
                if (groupedData[key]) {
                    groupedData[key].workouts += 1;
                    groupedData[key].duration += workout.duration || 0;
                    groupedData[key].calories += (workout.duration || 0) * 5;
                }
            });
        }

        return Object.values(groupedData);
    };

    // Category distribution for pie chart
    const getCategoryData = () => {
        const categories = {};
        workouts.forEach(workout => {
            const cat = workout.category || 'strength';
            categories[cat] = (categories[cat] || 0) + 1;
        });

        const colors = {
            strength: '#ef4444',
            cardio: '#22d3ee',
            flexibility: '#ec4899',
            sports: '#10b981'
        };

        return Object.entries(categories).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: colors[name] || '#6366f1'
        }));
    };

    const chartData = getChartData();
    const categoryData = getCategoryData();

    // Calculate totals
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = totalDuration * 5;

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="progress-page">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">
                    <TrendingUp size={28} />
                    <span className="text-gradient">Progress</span>
                </h1>
                <p className="page-subtitle">Track your fitness journey over time</p>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card">
                    <div className="stat-icon stat-icon--primary">
                        <Dumbbell size={24} />
                    </div>
                    <div className="stat-value">{totalWorkouts}</div>
                    <div className="stat-label">Total Workouts</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon--accent">
                        <Timer size={24} />
                    </div>
                    <div className="stat-value">{Math.round(totalDuration / 60)}h</div>
                    <div className="stat-label">Total Hours</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon--orange">
                        <Flame size={24} />
                    </div>
                    <div className="stat-value">{totalCalories.toLocaleString()}</div>
                    <div className="stat-label">Calories Burned</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon--green">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-value">
                        {workouts.length > 0
                            ? Math.ceil((new Date() - new Date(workouts[workouts.length - 1].date)) / (1000 * 60 * 60 * 24))
                            : 0}
                    </div>
                    <div className="stat-label">Days Active</div>
                </div>
            </div>

            {/* Activity Chart */}
            <div className="chart-container">
                <div className="chart-header">
                    <h3 className="chart-title">Workout Activity</h3>
                    <div className="chart-filters">
                        {['week', 'month', 'year'].map(range => (
                            <button
                                key={range}
                                className={`filter-btn ${timeRange === range ? 'active' : ''}`}
                                onClick={() => setTimeRange(range)}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(30, 30, 60, 0.9)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="workouts"
                                stroke="#6366f1"
                                fillOpacity={1}
                                fill="url(#colorWorkouts)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="empty-state">
                        <p className="text-muted">No workout data available for this period</p>
                    </div>
                )}
            </div>

            {/* Duration Chart */}
            <div className="chart-container">
                <div className="chart-header">
                    <h3 className="chart-title">Duration (minutes)</h3>
                </div>

                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(30, 30, 60, 0.9)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Bar
                                dataKey="duration"
                                fill="#22d3ee"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="empty-state">
                        <p className="text-muted">No duration data available</p>
                    </div>
                )}
            </div>

            {/* Category Distribution */}
            <div className="chart-container">
                <div className="chart-header">
                    <h3 className="chart-title">Workout Categories</h3>
                </div>

                {categoryData.length > 0 ? (
                    <div className="flex items-center justify-center gap-lg" style={{ flexWrap: 'wrap' }}>
                        <ResponsiveContainer width={200} height={200}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(30, 30, 60, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="flex flex-col gap-sm">
                            {categoryData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-sm">
                                    <div
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: entry.color
                                        }}
                                    />
                                    <span>{entry.name}: {entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p className="text-muted">Log workouts to see category distribution</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressChart;
