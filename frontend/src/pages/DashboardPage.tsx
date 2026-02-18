import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Alert, Col, Row, Image } from 'react-bootstrap';
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
    <Row>
      <Col md={8}>
        <Card>
          <Card.Body>
            <Card.Title>Welcome to your Dashboard, {userDetails ? userDetails.username : 'Guest'}!</Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            <Card.Text>
              From here you can take the career assessment to get your recommendations.
            </Card.Text>
            <Link to="/form">
              <Button variant="primary" className="me-2">Take Assessment</Button>
            </Link>
            <Button variant="secondary" onClick={handleShowEditModal}>
              Edit Profile
            </Button>
          </Card.Body>
        </Card>

        <Card className="mt-4">
          <Card.Body>
            <Card.Title>Recommendation History</Card.Title>
            {historyError && <Alert variant="danger">{historyError}</Alert>}
            {recommendationHistory.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Alert variant="info">No recommendation history available yet. Take an assessment to get started!</Alert>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="text-center">
          <Card.Body>
            <Image
              src={userDetails?.profile_image_url || DEFAULT_AVATAR_URL}
              alt="Profile" roundedCircle
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              onError={(e: any) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_URL; }}
            />
            <Card.Title className="mt-3">{userDetails ? userDetails.username : 'Guest'}</Card.Title>
          </Card.Body>
        </Card>
      </Col>

      {userDetails && (
        <UserProfileForm
          show={showEditModal}
          handleClose={handleCloseEditModal}
          currentUser={userDetails}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </Row>
  );
};

export default DashboardPage;
