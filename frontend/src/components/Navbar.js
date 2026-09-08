import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ showAlert, theme, toggleTheme }) {
    const location = useLocation();
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');
    const isDark = theme === 'dark';

    const handleLogout = () => {
        localStorage.removeItem('token');
        showAlert('You have been logged out.', 'info');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar navbar-expand-lg main-navbar">
            <div className="container">
                {/* Brand */}
                <Link className="navbar-brand brand-logo" to="/">
                    <i className="fa-solid fa-book-open me-2"></i>
                    iNotebook
                </Link>

                {/* Mobile: theme toggle + hamburger */}
                <div className="d-flex align-items-center gap-2 d-lg-none">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        title={isDark ? 'Light mode' : 'Dark mode'}
                    >
                        <span className={`theme-toggle-track ${isDark ? 'dark' : 'light'}`}>
                            <span className="theme-toggle-thumb">
                                <i className={`fa-solid ${isDark ? 'fa-moon' : 'fa-sun'}`}></i>
                            </span>
                        </span>
                    </button>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarMain"
                        aria-controls="navbarMain"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <i className="fa-solid fa-bars nav-hamburger-icon"></i>
                    </button>
                </div>

                <div className="collapse navbar-collapse" id="navbarMain">
                    {/* Left nav links */}
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {isLoggedIn && (
                            <li className="nav-item">
                                <Link className={`nav-link ${isActive('/')}`} to="/">
                                    <i className="fa-solid fa-house me-1"></i>Home
                                </Link>
                            </li>
                        )}
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/about')}`} to="/about">
                                <i className="fa-solid fa-circle-info me-1"></i>About
                            </Link>
                        </li>
                    </ul>

                    {/* Right: theme toggle (desktop) + auth buttons */}
                    <div className="navbar-auth d-flex gap-2 align-items-center">

                        {/* Desktop theme toggle */}
                        <button
                            className="theme-toggle d-none d-lg-flex"
                            onClick={toggleTheme}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            title={isDark ? 'Light mode' : 'Dark mode'}
                        >
                            <span className={`theme-toggle-track ${isDark ? 'dark' : 'light'}`}>
                                <span className="theme-toggle-thumb">
                                    <i className={`fa-solid ${isDark ? 'fa-moon' : 'fa-sun'}`}></i>
                                </span>
                            </span>
                        </button>

                        {isLoggedIn ? (
                            <button
                                className="btn btn-outline-light btn-sm nav-btn"
                                onClick={handleLogout}
                            >
                                <i className="fa-solid fa-right-from-bracket me-1"></i>Logout
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={`btn btn-outline-light btn-sm nav-btn ${isActive('/login')}`}
                                >
                                    <i className="fa-solid fa-right-to-bracket me-1"></i>Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className={`btn btn-primary btn-sm nav-btn ${isActive('/signup')}`}
                                >
                                    <i className="fa-solid fa-user-plus me-1"></i>Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
