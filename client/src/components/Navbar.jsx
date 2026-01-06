import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, TrendingUp, Target, User } from 'lucide-react';

const Navbar = () => {
    const navItems = [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
        { to: '/progress', icon: TrendingUp, label: 'Progress' },
        { to: '/goals', icon: Target, label: 'Goals' },
    ];

    return (
        <nav className="navbar">
            <div className="nav-container">
                <NavLink to="/" className="nav-brand">
                    <Dumbbell size={24} />
                    <span>FitTrack</span>
                </NavLink>

                <div className="nav-links">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <Icon className="nav-icon" size={22} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
