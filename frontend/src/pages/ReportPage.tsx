import React, { useMemo, useState, useEffect } from 'react';
import { Alert, Row, Col, Card, Accordion, Badge, Button, Spinner, Form, ProgressBar } from 'react-bootstrap';
import { useRecommendations } from '../contexts/RecommendationContext';
import GradesChart from '../components/GradesChart';
import CoursesChart from '../components/CoursesChart';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

// --- Helper Component for Detail Rows ---
const DetailRow = ({ title, content }: { title: string; content: string }) => (
  <p><strong>{title}:</strong> {content}</p>
);

// --- Star Rating Component ---
const StarRating = ({ rating, setRating }: { rating: number; setRating: (rating: number) => void }) => {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ cursor: 'pointer', color: star <= rating ? 'gold' : 'gray', fontSize: '30px' }}
          onClick={() => setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};


const ReportPage: React.FC = () => {
  const { recommendations, isLoading } = useRecommendations();
  const { token } = useAuth(); // Get token from AuthContext
  const [userDetails, setUserDetails] = useState<any>(null);
  const topCourse = useMemo(() => recommendations?.courses[0], [recommendations]);
  const topCareer = useMemo(() => recommendations?.careers[0], [recommendations]); // New: Top career
  const [ratings, setRatings] = useState<{ [id: number]: number }>({});
  const [comments, setComments] = useState<{ [id: number]: string }>({});
  const [averageRatings, setAverageRatings] = useState<{ [id: number]: { avg: number; count: number } }>({});

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/users/me/', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setUserDetails(data);
          }
        } catch (err) {
          console.error('Failed to fetch user details:', err);
        }
      }
    };

    fetchUserDetails();
  }, [token]);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch('http://localhost:8000/ratings/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const allRatings = await response.json();
          const avgRatings: { [id: number]: { total: number; count: number } } = {};
          allRatings.forEach((r: any) => {
            if (!avgRatings[r.recommendation_id]) {
              avgRatings[r.recommendation_id] = { total: 0, count: 0 };
            }
            avgRatings[r.recommendation_id].total += r.rating;
            avgRatings[r.recommendation_id].count += 1;
          });

          const finalAvgRatings: { [id: number]: { avg: number; count: number } } = {};
          for (const id in avgRatings) {
            finalAvgRatings[id] = {
              avg: avgRatings[id].total / avgRatings[id].count,
              count: avgRatings[id].count
            };
          }
          setAverageRatings(finalAvgRatings);
        }
      } catch (error) {
        console.error('Failed to fetch ratings:', error);
      }
    };

    if (token) {
      fetchRatings();
    }
  }, [token]);



  const handleRatingSubmit = async (recommendationId: number, recommendationName: string, ratingOverride?: number) => {
    const finalRating = ratingOverride !== undefined ? ratingOverride : ratings[recommendationId];
    
    if (!finalRating) {
      alert('Please select a rating star first.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/ratings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recommendation_id: recommendationId,
          rating: finalRating,
          comment: comments[recommendationId] || ''
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading recommendations...</p>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <Alert variant="warning">
        No recommendations found. Please <Link to="/form">fill out the form</Link> to get your recommendations.
      </Alert>
    );
  }

  return (
    <div className="printable-area container py-4">
      {/* Professional Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
          <h1 className="text-primary fw-bold mb-0">Academic & Career Path Analysis</h1>
          <p className="text-muted mb-0">Personalized Guidance Report for <strong>{userDetails ? userDetails.username : 'Student'}</strong> | {new Date().toLocaleDateString()}</p>
        </div>
        <Button variant="outline-primary" onClick={() => window.print()} className="no-print shadow-sm px-4">
          <i className="bi bi-printer me-2"></i> Download PDF Report
        </Button>
      </div>

      <Row className="mb-4">
        <Col lg={4}>
          <Card className="shadow-sm border-0 bg-light h-100">
            <Card.Body className="text-center p-4">
              <h5 className="text-muted text-uppercase small fw-bold mb-3">Overall Profile Rating</h5>
              <div className="display-6 fw-bold text-primary mb-2">{recommendations.profile_rating}</div>
              <Badge bg={recommendations.average_points >= 8 ? "success" : "info"} className="px-3 py-2 rounded-pill mb-4">
                Score: {recommendations.average_points.toFixed(2)} / 12.0
              </Badge>
              <div className="text-start small mt-3">
                <p className="mb-1 text-muted">Primary Recommendation:</p>
                <div className="fw-bold border-start border-primary border-4 ps-2 mb-2">
                  {topCourse?.name}
                </div>
                <div className="fw-bold border-start border-success border-4 ps-2">
                  {topCareer?.name}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Model Insights</h5>
            </Card.Header>
            <Card.Body className="p-4 pt-2">
              <p className="text-muted small mb-4">
                Our AI model analyzed your academic performance across {recommendations.subject_grades_points.length} subjects along with your interests and aptitudes.
                The current recommendation engine is operating with <strong>{(recommendations.model_accuracy * 100).toFixed(1)}% accuracy</strong>.
              </p>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="small text-muted mb-1 d-block">Academic Performance</label>
                    <ProgressBar now={(recommendations.average_points / 12) * 100} variant="primary" style={{ height: '10px' }} />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="small text-muted mb-1 d-block">Model Confidence</label>
                    <ProgressBar now={recommendations.model_accuracy * 100} variant="success" style={{ height: '10px' }} />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={6} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">Academic Performance Breakdown</h5>
            </Card.Header>
            <Card.Body><GradesChart data={recommendations.subject_grades_points} /></Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">Suitability Analysis</h5>
            </Card.Header>
            <Card.Body><CoursesChart data={recommendations.courses} /></Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-primary text-white rounded-circle p-2 me-3 d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-mortarboard-fill"></i>
            </div>
            <h3 className="mb-0 fw-bold">Course Recommendations</h3>
          </div>
          <Accordion defaultActiveKey="0" className="shadow-sm">
            {recommendations.courses.map((course, index) => (
              <Accordion.Item eventKey={String(index)} key={index} className="border-0 border-bottom">
                <Accordion.Header>
                  <div className="d-flex flex-column w-100 pe-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-dark">{course.name}</span>
                      <Badge bg="primary" pill>{course.course_type}</Badge>
                    </div>
                    <div className="d-flex align-items-center small">
                      <span className="text-muted me-3">Compatibility:</span>
                      <div className="flex-grow-1" style={{ maxWidth: '150px' }}>
                        <ProgressBar now={(course.similarity_score * 100)} variant="primary" style={{ height: '6px' }} />
                      </div>
                      <span className="ms-2 fw-bold text-primary">{(course.similarity_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="bg-light">
                  <div className="p-2">
                    <p className="text-dark mb-4 lead small"><em>{course.description}</em></p>
                    
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="bg-white p-3 rounded shadow-sm border-start border-primary border-4">
                          <h6 className="fw-bold mb-2">Strategic Reasoning</h6>
                          <p className="mb-0 small">{course.reasoning}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-white p-3 rounded shadow-sm h-100">
                          <h6 className="fw-bold mb-2 small text-uppercase text-muted">Market Insight</h6>
                          <p className="mb-0 x-small">{course.job_applicability}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-white p-3 rounded shadow-sm h-100">
                          <h6 className="fw-bold mb-2 small text-uppercase text-muted">Future Readiness</h6>
                          <p className="mb-0 x-small">{course.future_trends}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-top no-print">
                      <h6 className="fw-bold mb-3">Provide Feedback</h6>
                      <StarRating
                        rating={ratings[course.id!] || 0}
                        setRating={(newRating) => {
                          setRatings({ ...ratings, [course.id!]: newRating });
                          // Auto-submit if comment is empty
                          if (!comments[course.id!] || comments[course.id!].trim() === "") {
                            handleRatingSubmit(course.id!, course.name, newRating);
                          }
                        }}
                      />
                      <Form.Group className="mt-3">
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Your thoughts on this recommendation..."
                          className="bg-white border-0 shadow-sm"
                          value={comments[course.id!] || ''}
                          onChange={(e) => setComments({ ...comments, [course.id!]: e.target.value })}
                        />
                      </Form.Group>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-3 px-4 rounded-pill"
                        onClick={() => handleRatingSubmit(course.id!, course.name)}
                      >
                        Submit Feedback
                      </Button>
                    </div>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>

        <Col lg={6} className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-success text-white rounded-circle p-2 me-3 d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-briefcase-fill"></i>
            </div>
            <h3 className="mb-0 fw-bold">Career Recommendations</h3>
          </div>
          <Accordion defaultActiveKey="0" className="shadow-sm">
            {recommendations.careers.map((career, index) => (
              <Accordion.Item eventKey={String(index)} key={index} className="border-0 border-bottom">
                <Accordion.Header>
                  <div className="d-flex flex-column w-100 pe-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-dark">{career.name}</span>
                      <Badge bg="success" pill>Career Path</Badge>
                    </div>
                    <div className="d-flex align-items-center small">
                      <span className="text-muted me-2">AI Confidence: High</span>
                    </div>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="bg-light">
                  <div className="p-2">
                    <p className="text-dark mb-4 lead small"><em>{career.description}</em></p>
                    <div className="bg-white p-3 rounded shadow-sm border-start border-success border-4">
                      <h6 className="fw-bold mb-2">Why this path?</h6>
                      <p className="mb-0 small">{career.reasoning}</p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-top no-print">
                      <h6 className="fw-bold mb-3">Rate this Career Recommendation</h6>
                      <StarRating
                        rating={ratings[career.id!] || 0}
                        setRating={(newRating) => {
                          setRatings({ ...ratings, [career.id!]: newRating });
                          // Auto-submit if comment is empty
                          if (!comments[career.id!] || comments[career.id!].trim() === "") {
                            handleRatingSubmit(career.id!, career.name, newRating);
                          }
                        }}
                      />
                      <Form.Group className="mt-3">
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Your thoughts on this career path..."
                          className="bg-white border-0 shadow-sm"
                          value={comments[career.id!] || ''}
                          onChange={(e) => setComments({ ...comments, [career.id!]: e.target.value })}
                        />
                      </Form.Group>
                      <Button
                        variant="success"
                        size="sm"
                        className="mt-3 px-4 rounded-pill"
                        onClick={() => handleRatingSubmit(career.id!, career.name)}
                      >
                        Submit Feedback
                      </Button>
                    </div>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>
    </div>
  );
};

export default ReportPage;