import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), // Changed from username to email
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to request password reset.');
      }

      setMessage('If an account with that email exists, a password reset token has been sent to your email (check console).');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Forgot Password</Card.Title>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Request Reset Link
          </Button>
        </Form>
        <div className="text-center mt-3">
          <Link to="/login">Back to Login</Link>
        </div>
      </Card.Body>
    </Card>
  );
}; // Added missing closing brace

export default ForgotPasswordPage;
