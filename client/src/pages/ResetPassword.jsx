import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, formData.password, formData.confirmPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="text-center mb-4">
                <div className="mx-auto mb-3 bg-success rounded-circle d-flex align-items-center justify-content-center" 
                     style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-check-circle-fill text-white fs-4"></i>
                </div>
                <h2 className="fw-bold text-success mb-2">Password Reset Successful</h2>
                <p className="text-muted">Your password has been successfully reset. You will be redirected to the login page.</p>
              </div>

              <div className="card shadow-lg border-0">
                <div className="card-body p-4 text-center">
                  <div className="alert alert-success py-2" role="alert">
                    <small>Password reset successfully!</small>
                  </div>
                  
                  <p className="text-muted mb-4">
                    You can now sign in with your new password.
                  </p>

                  <Link
                    to="/login"
                    className="btn btn-success w-100"
                  >
                    Go to Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="col-md-6 col-lg-4">
            <div className="text-center mb-4">
              <div className="mx-auto mb-3 bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '60px', height: '60px'}}>
                <i className="bi bi-shield-lock-fill text-white fs-4"></i>
              </div>
              <h2 className="fw-bold text-primary mb-2">Reset Your Password</h2>
              <p className="text-muted">Enter your new password below</p>
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
                    <label htmlFor="password" className="form-label fw-medium">
                      New Password
                    </label>
                    <div className="input-group">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        className="form-control"
                        placeholder="Enter your new password"
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
                    <label htmlFor="confirmPassword" className="form-label fw-medium">
                      Confirm New Password
                    </label>
                    <div className="input-group">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        className="form-control"
                        placeholder="Confirm your new password"
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
                    disabled={loading || (formData.password !== formData.confirmPassword && formData.confirmPassword)}
                    className="btn btn-primary w-100 py-2 mb-3"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ms-2">Resetting...</span>
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="text-decoration-none"
                    >
                      <small>Back to Sign In</small>
                    </Link>
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

export default ResetPassword;