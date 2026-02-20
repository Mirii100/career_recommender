import React from 'react';
import { Card, Button, Row, Col, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { token } = useAuth();

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-5">
          <Row className="align-items-center">
            <Col lg={7}>
              <h1 className="display-4 fw-bold mb-4 text-primary">Your Future, Guided by AI</h1>
              <Card.Text className="lead mb-4">
                This system is designed to provide personalized course and career guidance for high school graduates.
                It bridges the gap between educational outcomes and long-term career success by integrating academic results, student interests, and local labor market insights.
              </Card.Text>
              
              {!token ? (
                <div className="d-flex gap-3 mb-4">
                  <Link to="/get-started" className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow text-decoration-none">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary btn-lg px-5 py-3 rounded-pill text-decoration-none">
                    Sign In
                  </Link>
                </div>
              ) : (
                <div className="mb-4">
                  <Link to="/dashboard" className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow text-decoration-none">
                    Go to Dashboard
                  </Link>
                </div>
              )}
            </Col>
            <Col lg={5} className="text-center">
              <img 
                src="/recommeder_image.png" 
                alt="Recommender System" 
                className="img-fluid rounded-3 shadow"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-4">
              <h3 className="h5 fw-bold mb-3">Key Features</h3>
              <ul className="list-unstyled">
                <li className="mb-2"><strong>✓ Recommendation Form:</strong> Personalized AI-driven suggestions.</li>
                <li className="mb-2"><strong>✓ View Report:</strong> Detailed insights into your career path.</li>
                <li className="mb-2"><strong>✓ Data Insights:</strong> Explore labor market trends and skills.</li>
                <li className="mb-2"><strong>✓ Model Details:</strong> Transparent view into our ML algorithms.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-4">
              <h3 className="h5 fw-bold mb-3">Our Mission</h3>
              <Card.Text>
                We aim to reduce dropout rates, minimize skill mismatches, and align education with workforce needs in Kenya and other Sub-Saharan African countries.
              </Card.Text>
              <Card.Text className="text-muted small">
                By leveraging advanced AI models like Random Forest and XGBoost, we provide precision guidance for your educational journey.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
