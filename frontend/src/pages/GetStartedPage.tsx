import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GetStartedPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0 rounded-lg">
            <Card.Body className="p-5">
              <h1 className="text-primary mb-4">Getting Started with Career Guidance</h1>
              
              <section className="mb-5">
                <h3>What is this site?</h3>
                <p className="lead">
                  This application is an AI-powered Career Guidance System designed to help students make informed decisions about their future. 
                  By leveraging advanced Machine Learning algorithms, we analyze your academic performance and personal strengths to provide personalized recommendations.
                </p>
                <div className="alert alert-info">
                  <strong>Note:</strong> To protect your data and save your results, you must be logged in to receive AI recommendations.
                </div>
              </section>

              <section className="mb-5">
                <h3>How it Works</h3>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start">
                    <div className="bg-primary text-white rounded-circle px-3 py-2 me-3">1</div>
                    <div>
                      <h5>Create an Account</h5>
                      <p className="text-muted">Sign up to save your recommendations and track your progress over time.</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <div className="bg-primary text-white rounded-circle px-3 py-2 me-3">2</div>
                    <div>
                      <h5>Input Your Data</h5>
                      <p className="text-muted">Enter your academic grades, interests, skills, and complete a brief aptitude assessment.</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <div className="bg-primary text-white rounded-circle px-3 py-2 me-3">3</div>
                    <div>
                      <h5>Get AI Recommendations</h5>
                      <p className="text-muted">Our models compare your profile against thousands of data points to find your best matches.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-5">
                <h3>Our Methodology</h3>
                <p>
                  We don't just look at grades. Our system evaluates:
                </p>
                <ul>
                  <li><strong>Academic Strength:</strong> Your performance across various subject categories.</li>
                  <li><strong>Multiple Intelligences:</strong> Your aptitude in areas like Logical-Mathematical, Linguistic, and Interpersonal skills.</li>
                  <li><strong>Market Trends:</strong> We match you with courses and careers that have strong job applicability and future growth potential.</li>
                </ul>
              </section>

              <div className="text-center mt-4">
                {!token ? (
                  <div className="d-flex flex-column align-items-center gap-3">
                    <p className="text-muted">Ready to begin? Please log in or create an account.</p>
                    <div className="d-flex gap-3">
                      <Button variant="primary" size="lg" onClick={() => navigate('/login')} className="px-5">
                        Login
                      </Button>
                      <Button variant="outline-primary" size="lg" onClick={() => navigate('/register')} className="px-5">
                        Register
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="success" size="lg" onClick={() => navigate('/form')} className="px-5">
                    Go to Recommendation Form
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GetStartedPage;
