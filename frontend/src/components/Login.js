import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login(props) {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password
                })
            });
            const json = await response.json();
            if (json.authtoken) {
                localStorage.setItem('token', json.authtoken);
                props.showAlert('Logged in successfully! Welcome back.', 'success');
                navigate('/');
            } else {
                props.showAlert(json.error || 'Invalid credentials. Please try again.', 'danger');
            }
        } catch (err) {
            props.showAlert('Server error. Please try again later.', 'danger');
        }
        setLoading(false);
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-brand">
                    <span className="auth-logo-icon">
                        <i className="fa-solid fa-book-open"></i>
                    </span>
                    <h2 className="auth-title">iNotebook</h2>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            value={credentials.email}
                            onChange={onChange}
                            required
                            autoComplete="email"
                        />
                        <label htmlFor="email">
                            <i className="fa-solid fa-envelope me-2"></i>Email address
                        </label>
                    </div>

                    <div className="form-floating mb-4">
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={onChange}
                            required
                            autoComplete="current-password"
                        />
                        <label htmlFor="password">
                            <i className="fa-solid fa-lock me-2"></i>Password
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 auth-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Signing in...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-right-to-bracket me-2"></i>Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/signup" className="auth-link">Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
