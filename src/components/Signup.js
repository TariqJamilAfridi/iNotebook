import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup(props) {
    const [user, setUser] = useState({ name: '', email: '', password: '', cpassword: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (user.password !== user.cpassword) {
            props.showAlert('Passwords do not match.', 'danger');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/createuser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: user.name,
                    email: user.email,
                    password: user.password
                })
            });
            const json = await response.json();
            if (json.authtoken) {
                localStorage.setItem('token', json.authtoken);
                props.showAlert('Account created! Welcome to iNotebook.', 'success');
                navigate('/');
            } else {
                const msg =
                    json.error ||
                    (json.errors && json.errors[0]?.msg) ||
                    'Signup failed. Please try again.';
                props.showAlert(msg, 'danger');
            }
        } catch (err) {
            props.showAlert('Server error. Please try again later.', 'danger');
        }
        setLoading(false);
    };

    const onChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-brand">
                    <span className="auth-logo-icon">
                        <i className="fa-solid fa-book-open"></i>
                    </span>
                    <h2 className="auth-title">iNotebook</h2>
                    <p className="auth-subtitle">Create your free account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={user.name}
                            onChange={onChange}
                            required
                            minLength={3}
                            autoComplete="name"
                        />
                        <label htmlFor="name">
                            <i className="fa-solid fa-user me-2"></i>Full Name
                        </label>
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            value={user.email}
                            onChange={onChange}
                            required
                            autoComplete="email"
                        />
                        <label htmlFor="email">
                            <i className="fa-solid fa-envelope me-2"></i>Email address
                        </label>
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={user.password}
                            onChange={onChange}
                            required
                            minLength={5}
                            autoComplete="new-password"
                        />
                        <label htmlFor="password">
                            <i className="fa-solid fa-lock me-2"></i>Password
                        </label>
                    </div>

                    <div className="form-floating mb-4">
                        <input
                            type="password"
                            className="form-control"
                            id="cpassword"
                            name="cpassword"
                            placeholder="Confirm Password"
                            value={user.cpassword}
                            onChange={onChange}
                            required
                            minLength={5}
                            autoComplete="new-password"
                        />
                        <label htmlFor="cpassword">
                            <i className="fa-solid fa-lock me-2"></i>Confirm Password
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
                                Creating account...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-user-plus me-2"></i>Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
