import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const features = [
    {
      title: 'Real-time Messaging',
      description: 'Send and receive messages instantly with our lightning-fast real-time chat system.',
    },
    {
      title: 'User Management',
      description: 'Connect with friends, see who\'s online, and manage your connections seamlessly.',
      icon: '👥'
    },
    {
      title: 'Lightning Fast',
      description: 'Built with modern technologies for optimal performance and smooth user experience.',
      icon: '⚡'
    },
    {
      title: 'Secure & Private',
      description: 'Your conversations are protected with JWT authentication and secure communication.',
      icon: '🔒'
    },
    {
      title: 'Responsive Design',
      description: 'Chat anywhere, anytime with our mobile-friendly responsive interface.',
      icon: '📱'
    },
    {
      title: 'Cross-platform',
      description: 'Access your chats from any device with our web-based platform.',
      icon: '🌐'
    }
  ];

  return (
    <div>
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="fw-bold mb-4">
                Welcome to ChatApp
              </h1>
              <p className="lead mb-5">
                Connect, chat, and collaborate in real-time with our modern messaging platform. 
                Experience seamless communication with beautiful design and powerful features.
              </p>
              
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-center mb-5">
                <Link to="/register" className="btn btn-primary btn-lg px-4 py-3">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4 py-3">
                  Sign In
                </Link>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="display-4 fw-bold mb-4">Powerful Features</h2>
              <p className="lead text-muted">
                Everything you need for modern communication, built with cutting-edge technology
              </p>
            </div>
          </div>

          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="card feature-card h-100">
                  <div className="card-body">
                    <div className="feature-icon mb-3">
                      <span style={{fontSize: '2rem'}}>{feature.icon}</span>
                    </div>
                    <h5 className="card-title fw-bold mb-3">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-primary py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h2 className="display-4 fw-bold text-white mb-4">
                Ready to Start Chatting?
              </h2>
              <p className="lead text-white mb-4">
                Join thousands of users who are already enjoying seamless communication. 
                Sign up today and experience the future of messaging.
              </p>
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                <Link to="/register" className="btn btn-light btn-lg">
                  Create Account
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">
                  Sign In Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;