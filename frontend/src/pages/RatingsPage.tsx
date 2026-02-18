import React, { useState, useEffect } from 'react';
import { Table, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

interface Rating {
  id: number;
  recommendation_id: number;
  rating: number;
  comment: string;
}

const RatingsPage: React.FC = () => {
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchAllRatings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8000/ratings/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch ratings');
        }
        const data = await response.json();
        setAllRatings(data);
      } catch (err) {
        setError('Could not load ratings.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchAllRatings();
    }
  }, [token]);

  if (isLoading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h2>All User Ratings</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Recommendation ID</th>
            <th>Rating</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {allRatings.map((rating) => (
            <tr key={rating.id}>
              <td>{rating.id}</td>
              <td>{rating.recommendation_id}</td>
              <td>{rating.rating}</td>
              <td>{rating.comment}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RatingsPage;
