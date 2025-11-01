import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, initializeAuth } = useAuth();
  const navigate = useNavigate();

  // Initialize auth when component mounts (for checking existing auth)
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/chat');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="text-center mb-4">
              <div className="mx-auto mb-3 bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '60px', height: '60px'}}>
                <i className="bi bi-chat-dots-fill text-white fs-4"></i>
              </div>
              <h2 className="fw-bold text-primary mb-2">Welcome Back</h2>
              <p className="text-muted">Sign in to your account to continue chatting</p>
            </div>

            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger py-2" role="alert">
                      <small>{error}</small>
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium">
                      Email or Username
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="text"
                      autoComplete="username"
                      required
                      className="form-control"
                      placeholder="Enter your email or username"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium">
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        className="form-control"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={togglePasswordVisibility}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Link
                      to="/forgot-password"
                      className="text-decoration-none small"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-100 py-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ms-2">Signing in...</span>
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-decoration-none">
                        Sign up here
                      </Link>
                    </small>
                  </div>
                </form>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;