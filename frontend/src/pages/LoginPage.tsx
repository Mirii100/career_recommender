import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.loggedOut) {
      setLogoutMessage('You have successfully logged out. Goodbye and see you soon!');
      // Clear state to prevent message showing on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLogoutMessage(null);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center">
      {/* Animated Background Icons */}
      <div className="floating-icons">
        <i className="bi bi-mortarboard" style={{ top: '10%', left: '10%', fontSize: '3rem' }}></i>
        <i className="bi bi-mortarboard-fill" style={{ top: '20%', left: '80%', fontSize: '4rem' }}></i>
        <i className="bi bi-mortarboard" style={{ top: '70%', left: '15%', fontSize: '2.5rem' }}></i>
        <i className="bi bi-mortarboard-fill" style={{ top: '80%', left: '70%', fontSize: '3.5rem' }}></i>
        <i className="bi bi-mortarboard" style={{ top: '40%', left: '85%', fontSize: '2rem' }}></i>
        <i className="bi bi-mortarboard-fill" style={{ top: '50%', left: '5%', fontSize: '3rem' }}></i>
      </div>

      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden auth-card">
              <Card.Header className="bg-primary text-white text-center py-4 border-0">
                <div className="mb-2">
                  <i className="bi bi-person-circle display-4"></i>
                </div>
                <h3 className="fw-bold mb-0">Welcome Back</h3>
                <p className="small opacity-75">Login to continue your journey</p>
              </Card.Header>
              <Card.Body className="p-4 p-lg-5">
                {logoutMessage && <Alert variant="success" className="text-center py-2 small shadow-sm border-0">{logoutMessage}</Alert>}
                {error && <Alert variant="danger" className="text-center py-2 small">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold">Username or Email</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username or email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="rounded-pill px-4 py-2 bg-light border-0"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-pill px-4 py-2 bg-light border-0"
                      required
                    />
                  </Form.Group>
                  <div className="d-grid gap-2 mt-4">
                    <Button variant="primary" type="submit" className="rounded-pill py-2 fw-bold shadow-sm">
                      Sign In
                    </Button>
                  </div>
                  <div className="text-center mt-3">
                    <Link className="small text-decoration-none" to="/forgot-password">Forgot Password?</Link>
                  </div>
                </Form>
              </Card.Body>
              <Card.Footer className="text-center py-4 bg-white border-0">
                <div className="small text-muted">
                  Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none">Create one</Link>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .auth-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          position: relative;
          overflow: hidden;
        }
        .floating-icons i {
          position: absolute;
          color: rgba(0, 123, 255, 0.05);
          animation: float 6s ease-in-out infinite;
          z-index: 0;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .auth-card {
          z-index: 1;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9) !important;
        }
        .auth-wrapper .bi-mortarboard:nth-child(2n) { animation-delay: 1s; }
        .auth-wrapper .bi-mortarboard:nth-child(3n) { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

export default LoginPage;
