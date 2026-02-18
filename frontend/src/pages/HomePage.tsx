import React from 'react';
import { Card } from 'react-bootstrap';

const HomePage = () => {
  return (
    <Card>
      <Card.Body>
        <Card.Title as="h2">Welcome to the Career Guidance System</Card.Title>
        <Card.Text>
          This system is designed to provide personalized course and career guidance for high school graduates.
          It aims to bridge the gap between educational outcomes and long-term career success by integrating academic results, student interests, and local labor market insights.
        </Card.Text>
        <Card.Text>
          Navigate through the sidebar to:
          <ul>
            <li><strong>Recommendation Form:</strong> Enter your details to get personalized course and career recommendations.</li>
            <li><strong>View Report:</strong> See your detailed recommendation report after submitting the form.</li>
            <li><strong>Data Insights:</strong> Explore visualizations about the courses, careers, and skills in our dataset.</li>
            <li><strong>Model Details:</strong> Learn about the machine learning model powering these recommendations.</li>
          </ul>
        </Card.Text>
        <Card.Text>
          This project is motivated by the persistent challenges faced by students in making informed decisions about their future education and careers, particularly in contexts like Kenya and other Sub-Saharan African countries.
          By leveraging AI, we aim to reduce dropout rates, minimize skill mismatches, and contribute to aligning education with workforce needs.
        </Card.Text>
        <img src="/recommeder_image.png" alt="Recommender System" style={{ maxWidth: '100%', height: 'auto', marginTop: '20px' }} />
      </Card.Body>
    </Card>
  );
};

export default HomePage;
