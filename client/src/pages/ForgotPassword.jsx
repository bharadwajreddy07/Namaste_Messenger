import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await forgotPassword(email);
      setMessage(response.message || 'Password reset email sent successfully!');
      setSubmitted(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="text-center mb-4">
                <div className="mx-auto mb-3 bg-success rounded-circle d-flex align-items-center justify-content-center" 
                     style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-envelope-check-fill text-white fs-4"></i>
                </div>
                <h2 className="fw-bold text-success mb-2">Check your email</h2>
                <p className="text-muted">We've sent a password reset link to your email address.</p>
              </div>

              <div className="card shadow-lg border-0">
                <div className="card-body p-4 text-center">
                  {message && (
                    <div className="alert alert-success py-2" role="alert">
                      <small>{message}</small>
                    </div>
                  )}
                  
                  <p className="text-muted mb-3">
                    Check your inbox for an email from us with instructions on how to reset your password.
                  </p>
                  
                  <small className="text-muted">
                    If you don't see the email, check your spam folder.
                  </small>

                  <div className="mt-4">
                    <Link
                      to="/login"
                      className="btn btn-primary w-100"
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="text-center mb-4">
              <div className="mx-auto mb-3 bg-warning rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '60px', height: '60px'}}>
                <i className="bi bi-key-fill text-white fs-4"></i>
              </div>
              <h2 className="fw-bold text-primary mb-2">Reset Password</h2>
              <p className="text-muted">Enter your email address and we'll send you a reset link.</p>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-warning w-100 py-2 mb-3"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ms-2">Sending...</span>
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="text-decoration-none d-flex align-items-center justify-content-center"
                    >
                      <i className="bi bi-arrow-left me-1"></i>
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

export default ForgotPassword;