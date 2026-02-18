import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column vh-100 bg-dark p-3 text-white" style={{ width: '280px' }}>
      <h4 className="mb-4">Career Guidance System</h4>
      <Nav variant="pills" className="flex-column mb-auto">
        <Nav.Item className="mb-2">
          <Nav.Link as={NavLink} to="/" end>About / Home</Nav.Link>
        </Nav.Item>
        {token && (
          <>
            <Nav.Item className="mb-2">
              <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={NavLink} to="/form">Recommendation Form</Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={NavLink} to="/report">View Report</Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={NavLink} to="/insights">Data Insights</Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={NavLink} to="/model">Model Details</Nav.Link>
            </Nav.Item>
          </>
        )}
      </Nav>
      <hr />
      <div className="mt-auto">
        {!token ? (
          <>
            <Nav.Item className="mb-2">
              <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={NavLink} to="/register">Register</Nav.Link>
            </Nav.Item>
          </>
        ) : (
          <Button variant="outline-light" className="w-100" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>
      <hr />
      <div className="small">Alexia ml project</div>
    </div>
  );
};

export default Sidebar;