import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Alert, Col, Row, Image, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfileForm from '../components/UserProfileForm'; // Import the UserProfileForm component
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js/auto';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const DEFAULT_AVATAR_URL = 'https://via.placeholder.com/150?text=No+Image'; // Placeholder for default avatar

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/users/me/', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch user details');
          }
          const data = await response.json();
          setUserDetails(data);
        } catch (err: any) {
          setError(err.message);
        }
      }
    };

    fetchUserDetails();
  }, [token]);

  const handleCloseEditModal = () => setShowEditModal(false);
  const handleShowEditModal = () => setShowEditModal(true);

  const [recommendationHistory, setRecommendationHistory] = useState<any[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendationHistory = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/recommendations/history/', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch recommendation history');
          }
          const data = await response.json();
          setRecommendationHistory(data);
        } catch (err: any) {
          setHistoryError(err.message);
        }
      }
    };

    fetchRecommendationHistory();
  }, [token]);

  const handleUserUpdate = (updatedUser: any) => {
    setUserDetails(updatedUser);
  };

  // Process history data for chart
  const chartData = {
    labels: recommendationHistory.map((rec: any) => new Date(rec.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Recommended Courses',
        data: recommendationHistory.filter((rec: any) => rec.course_name).map((rec: any) => 1), // Count each course recommendation
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Recommended Careers',
        data: recommendationHistory.filter((rec: any) => rec.career_name).map((rec: any) => 1), // Count each career recommendation
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Recommendation History',
      },
    },
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-primary mb-1">Student Dashboard</h1>
          <p className="text-muted">Welcome back, {userDetails ? userDetails.username : 'Guest'}!</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={handleShowEditModal} className="rounded-pill px-4">
            <i className="bi bi-person-gear me-2"></i>Edit Profile
          </Button>
          <Link to="/form">
            <Button variant="primary" className="rounded-pill px-4 shadow-sm">
              <i className="bi bi-plus-lg me-2"></i>New Assessment
            </Button>
          </Link>
        </div>
      </div>

      {error && <Alert variant="danger" className="shadow-sm border-0">{error}</Alert>}

      <Row className="g-4">
        {/* Profile Card */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 text-center h-100 p-3">
            <Card.Body>
              <div className="mb-4 position-relative d-inline-block">
                <Image
                  src={userDetails?.profile_image_url || DEFAULT_AVATAR_URL}
                  alt="Profile"
                  roundedCircle
                  className="shadow"
                  style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid #f8f9fa' }}
                  onError={(e: any) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_URL; }}
                />
                <div className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" style={{ width: '20px', height: '20px' }}></div>
              </div>
              <h4 className="fw-bold mb-1">{userDetails ? userDetails.username : 'Guest'}</h4>
              <p className="text-muted small mb-4">{userDetails?.email}</p>
              
              <div className="bg-light rounded-3 p-3 mb-3 text-start">
                {userDetails?.school_attended && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small text-muted">School:</span>
                    <span className="small fw-bold">{userDetails.school_attended}</span>
                  </div>
                )}
                {userDetails?.id_birth_cert_number && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small text-muted">ID/Cert No:</span>
                    <span className="small fw-bold">{userDetails.id_birth_cert_number}</span>
                  </div>
                )}
                {userDetails?.phone_number && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small text-muted">Phone:</span>
                    <span className="small fw-bold">{userDetails.phone_number}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted">Assessments:</span>
                  <span className="small fw-bold">{recommendationHistory.length}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="small text-muted">Last Active:</span>
                  <span className="small fw-bold">
                    {recommendationHistory.length > 0 
                      ? new Date(recommendationHistory[0].created_at).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Chart Card */}
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Analytics Overview</h5>
              <Badge bg="primary" pill className="px-3">Performance Trends</Badge>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              {historyError && <Alert variant="danger">{historyError}</Alert>}
              {recommendationHistory.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-graph-up text-muted display-1 mb-3"></i>
                  <p className="text-muted">Take your first assessment to see your progress chart!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity Table */}
        <Col lg={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
              <h5 className="fw-bold mb-0">Recent Recommendations</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {recommendationHistory.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="px-4 border-0">Date</th>
                        <th className="border-0">Recommendation</th>
                        <th className="border-0 text-center">Type</th>
                        <th className="px-4 border-0 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendationHistory.slice(0, 5).map((rec: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 text-muted small">
                            {new Date(rec.created_at).toLocaleDateString()}
                          </td>
                          <td className="fw-bold">
                            {rec.course_name || rec.career_name}
                          </td>
                          <td className="text-center">
                            <Badge bg={rec.course_name ? "info" : "success"} pill>
                              {rec.course_name ? "Course" : "Career"}
                            </Badge>
                          </td>
                          <td className="px-4 text-end">
                            <Link to="/report">
                              <Button variant="link" className="text-decoration-none p-0">View Report</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No recent activity found.</p>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="bg-white text-center py-3">
              <Link to="/ratings" className="text-decoration-none small">See all user feedback</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {userDetails && (
        <UserProfileForm
          show={showEditModal}
          handleClose={handleCloseEditModal}
          currentUser={userDetails}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
};

export default DashboardPage;
