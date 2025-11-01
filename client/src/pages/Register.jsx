import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const { register, isAuthenticated, initializeAuth } = useAuth();
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

  // Check password strength
  useEffect(() => {
    if (formData.password) {
      const strength = checkPasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength('');
    }
  }, [formData.password]);

  const checkPasswordStrength = (password) => {
    if (password.length < 6) return 'Too short';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  const getPasswordStrengthClass = (strength) => {
    switch (strength) {
      case 'Too short':
      case 'Weak':
        return 'text-danger';
      case 'Medium':
        return 'text-warning';
      case 'Strong':
        return 'text-success';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center mb-4">
              <div className="mx-auto mb-3 bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '60px', height: '60px'}}>
                <i className="bi bi-person-plus-fill text-white fs-4"></i>
              </div>
              <h2 className="fw-bold text-primary mb-2">Create Account</h2>
              <p className="text-muted">Join our community and start chatting</p>
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
                    <label htmlFor="username" className="form-label fw-medium">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className="form-control"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                    <small className="form-text text-muted">
                      Must be at least 3 characters long
                    </small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="form-control"
                      placeholder="Enter your email address"
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
                        autoComplete="new-password"
                        required
                        className="form-control"
                        placeholder="Create a password"
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
                    {passwordStrength && (
                      <small className={`form-text ${getPasswordStrengthClass(passwordStrength)}`}>
                        Password strength: {passwordStrength}
                      </small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-medium">
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        className="form-control"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <small className={`form-text ${
                        formData.password === formData.confirmPassword ? 'text-success' : 'text-danger'
                      }`}>
                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </small>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-100 py-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ms-2">Creating account...</span>
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Already have an account?{' '}
                      <Link to="/login" className="text-decoration-none">
                        Sign in here
                      </Link>
                    </small>
                  </div>
                </form>
              </div>
            </div>

            <div className="text-center mt-3">
              <small className="text-muted">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-decoration-none">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-decoration-none">Privacy Policy</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;