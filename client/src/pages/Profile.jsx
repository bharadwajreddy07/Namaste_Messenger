import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">
            <i className="bi bi-chat-dots-fill me-2"></i>
            Namaste Messenger
          </Link>
          
          <div className="d-flex align-items-center">
            <Link to="/chat" className="btn btn-outline-light btn-sm me-2">
              <i className="bi bi-chat-left-text me-1"></i>
              Back to Chat
            </Link>
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={logout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Profile Content */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {/* Profile Header */}
            <div className="card shadow-lg border-0 mb-4">
              <div className="card-body text-center p-5">
                <div className="mb-4">
                  <div className="mx-auto bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                       style={{width: '100px', height: '100px'}}>
                    <i className="bi bi-person-fill text-white" style={{fontSize: '3rem'}}></i>
                  </div>
                </div>
                <h2 className="fw-bold mb-2">{user?.username || 'User'}</h2>
                <p className="text-muted mb-3">{user?.email || 'user@example.com'}</p>
                <span className="badge bg-success px-3 py-2">
                  <i className="bi bi-circle-fill me-1" style={{fontSize: '8px'}}></i>
                  Online
                </span>
              </div>
            </div>

            {/* Profile Information */}
            <div className="card shadow-lg border-0">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-person-lines-fill me-2"></i>
                  Profile Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-sm-4">
                    <strong>Username:</strong>
                  </div>
                  <div className="col-sm-8">
                    {user?.username || 'Not available'}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-sm-4">
                    <strong>Email:</strong>
                  </div>
                  <div className="col-sm-8">
                    {user?.email || 'Not available'}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-sm-4">
                    <strong>Member since:</strong>
                  </div>
                  <div className="col-sm-8">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently joined'}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-sm-4">
                    <strong>Status:</strong>
                  </div>
                  <div className="col-sm-8">
                    <span className="badge bg-success">Active</span>
                  </div>
                </div>
                
                <hr />
                
                <div className="alert alert-info">
                  <h6>
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Profile Features Coming Soon
                  </h6>
                  <p className="mb-0 small">
                    Profile editing, avatar upload, and more customization options will be available in future updates.
                  </p>
                </div>

                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary" disabled>
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit Profile (Coming Soon)
                  </button>
                  <Link to="/chat" className="btn btn-primary">
                    <i className="bi bi-chat-left-text me-2"></i>
                    Back to Chat
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;