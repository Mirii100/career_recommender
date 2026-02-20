import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, password_confirmation: confirmPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to register');
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper d-flex align-items-center justify-content-center">
      {/* Animated Background Icons */}
      <div className="floating-icons">
        <i className="bi bi-mortarboard" style={{ top: '15%', left: '15%', fontSize: '4rem' }}></i>
        <i className="bi bi-mortarboard-fill" style={{ top: '10%', left: '75%', fontSize: '3rem' }}></i>
        <i className="bi bi-mortarboard" style={{ top: '75%', left: '80%', fontSize: '3.5rem' }}></i>
        <i className="bi bi-mortarboard-fill" style={{ top: '85%', left: '20%', fontSize: '2.5rem' }}></i>
        <i className="bi bi-mortarboard" style={{ top: '45%', left: '5%', fontSize: '3rem' }}></i>
        <i className="bi bi-mortarboard-fill" style={{ top: '55%', left: '90%', fontSize: '4.5rem' }}></i>
      </div>

      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={5}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden auth-card">
              <Card.Header className="bg-success text-white text-center py-4 border-0">
                <div className="mb-2">
                  <i className="bi bi-person-plus display-4"></i>
                </div>
                <h3 className="fw-bold mb-0">Join Us</h3>
                <p className="small opacity-75">Start your educational journey today</p>
              </Card.Header>
              <Card.Body className="p-4 p-lg-5">
                {error && <Alert variant="danger" className="text-center py-2 small">{error}</Alert>}
                {success && <Alert variant="success" className="text-center py-2 small">{success}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Username</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="rounded-pill px-4 py-2 bg-light border-0"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="rounded-pill px-4 py-2 bg-light border-0"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="rounded-pill px-4 py-2 bg-light border-0"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold">Confirm</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="rounded-pill px-4 py-2 bg-light border-0"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-grid gap-2 mt-2">
                    <Button variant="success" type="submit" className="rounded-pill py-2 fw-bold shadow-sm">
                      Create Account
                    </Button>
                  </div>
                </Form>
              </Card.Body>
              <Card.Footer className="text-center py-4 bg-white border-0">
                <div className="small text-muted">
                  Already have an account? <Link to="/login" className="text-success fw-bold text-decoration-none">Log in here</Link>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .auth-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #cbebff 100%);
          position: relative;
          overflow: hidden;
        }
        .floating-icons i {
          position: absolute;
          color: rgba(40, 167, 69, 0.05);
          animation: float 8s ease-in-out infinite;
          z-index: 0;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-15deg); }
        }
        .auth-card {
          z-index: 1;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9) !important;
        }
        .auth-wrapper .bi-mortarboard:nth-child(2n) { animation-delay: 1.5s; }
        .auth-wrapper .bi-mortarboard:nth-child(3n) { animation-delay: 3s; }
      `}</style>
    </div>
  );
};

export default RegisterPage;
