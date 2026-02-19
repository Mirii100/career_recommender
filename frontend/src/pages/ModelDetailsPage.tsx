import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';

interface ModelMetrics {
  random_forest_course: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  xgboost_course: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  svm_course: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  career_recommendation: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
}

const ModelDetailsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8000/model-metrics/');
        if (!response.ok) {
          throw new Error('Failed to fetch model metrics');
        }
        const data: ModelMetrics = await response.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div>
      <h1>Model Details</h1>
      <p>This page provides details about the recommendation model.</p>
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Model Architecture</Card.Title>
              <Card.Text>
                The recommendation model is a content-based filtering model. It uses a cosine similarity metric to find the similarity between the user's profile and the available courses and careers.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Model Performance</Card.Title>
              {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}
              {error && <Alert variant="danger">{error}</Alert>}
              {!loading && !error && metrics && (
                <div>
                  <h3>Random Forest Course Model</h3>
                  <Card.Text>
                    Accuracy: <strong>{(metrics.random_forest_course.accuracy * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    Precision: <strong>{(metrics.random_forest_course.precision * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    Recall: <strong>{(metrics.random_forest_course.recall * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    F1-Score: <strong>{(metrics.random_forest_course.f1_score * 100).toFixed(2)}%</strong>
                  </Card.Text>

                  <h3 className="mt-4">XGBoost Course Model</h3>
                  <Card.Text>
                    Accuracy: <strong>{(metrics.xgboost_course.accuracy * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    Precision: <strong>{(metrics.xgboost_course.precision * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    Recall: <strong>{(metrics.xgboost_course.recall * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    F1-Score: <strong>{(metrics.xgboost_course.f1_score * 100).toFixed(2)}%</strong>
                  </Card.Text>

                  <h3 className="mt-4">SVM Course Model</h3>
                  <Card.Text>
                    Accuracy: <strong>{(metrics.svm_course.accuracy * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    Precision: <strong>{(metrics.svm_course.precision * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    Recall: <strong>{(metrics.svm_course.recall * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    F1-Score: <strong>{(metrics.svm_course.f1_score * 100).toFixed(2)}%</strong>
                  </Card.Text>

                  <h3 className="mt-4">Career Recommendation Model</h3>
                  <Card.Text>
                    Accuracy: <strong>{(metrics.career_recommendation.accuracy * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    Precision: <strong>{(metrics.career_recommendation.precision * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    Recall: <strong>{(metrics.career_recommendation.recall * 100).toFixed(2)}%</strong>
                  </Card.Text>
                  <Card.Text>
                    F1-Score: <strong>{(metrics.career_recommendation.f1_score * 100).toFixed(2)}%</strong>
                  </Card.Text>
                </div>
              )}
              {!loading && !error && !metrics && <p>No model metrics available.</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ModelDetailsPage;