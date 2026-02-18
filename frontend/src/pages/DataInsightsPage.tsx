import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const gradeData = {
  labels: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'],
  datasets: [
    {
      label: 'Number of Students',
      data: [10, 15, 20, 25, 30, 28, 22, 18, 12, 8, 5, 2],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    },
  ],
};

const subjectData = {
    labels: ['Mathematics', 'Kiswahili', 'English', 'Chemistry', 'Physics', 'Biology', 'History', 'Geography'],
    datasets: [
      {
        label: 'Number of Students',
        data: [150, 180, 200, 120, 110, 130, 90, 100],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };


interface Rating {
  id: number;
  recommendation_id: number;
  rating: number;
  comment: string | null;
}

const DataInsightsPage: React.FC = () => {
  const { token } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch('http://localhost:8000/ratings/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch ratings');
        }
        const data: Rating[] = await response.json();
        setRatings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRatings();
    } else {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
    }
  }, [token]);

  const { averageRating, ratingCounts } = useMemo(() => {
    if (ratings.length === 0) {
      return { averageRating: 0, ratingCounts: {} };
    }

    const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
    const avg = totalRating / ratings.length;

    const counts: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      counts[i] = ratings.filter(item => item.rating === i).length;
    }

    return { averageRating: avg, ratingCounts: counts };
  }, [ratings]);

  return (
    <div>
      <h1>Data Insights</h1>
      <p>This page provides insights into the data used for training the recommendation model and user feedback.</p>
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Subject Distribution</Card.Title>
              <Bar data={subjectData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Grade Distribution</Card.Title>
              <Bar data={gradeData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h2 className="mt-5">User Ratings and Comments</h2>
      <p><Link to="/ratings">View all ratings in a table</Link></p>
      {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && ratings.length === 0 && <p>No ratings found yet.</p>}
      {!loading && !error && ratings.length > 0 && (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Rating Summary</Card.Title>
              <p>Average Rating: <strong>{averageRating.toFixed(2)} / 5</strong></p>
              <Row>
                {[5, 4, 3, 2, 1].map(star => (
                  <Col key={star} xs={2}>
                    {star} Star: {ratingCounts[star] || 0}
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
          <Row>
            {ratings.map((ratingItem) => (
              <Col md={4} className="mb-4" key={ratingItem.id}>
                <Card>
                  <Card.Body>
                    <Card.Title>Rating ID: {ratingItem.id}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Recommendation ID: {ratingItem.recommendation_id}</Card.Subtitle>
                    <Card.Text>
                      <strong>Rating:</strong> {ratingItem.rating} / 5
                      <br />
                      <strong>Comment:</strong> {ratingItem.comment || 'No comment provided.'}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default DataInsightsPage;
