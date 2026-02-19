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
    <div className="d-flex flex-column vh-100 bg-dark p-3 text-white shadow no-print" style={{ width: '280px' }}>
      <h4 className="mb-4 text-center fw-bold border-bottom pb-3">Career Guidance AI</h4>
      <Nav variant="pills" className="flex-column mb-auto gap-1">
        <Nav.Item>
          <Nav.Link as={NavLink} to="/" end className="d-flex align-items-center rounded-3 py-2 px-3">
            <i className="bi bi-house-door me-3"></i>About / Home
          </Nav.Link>
        </Nav.Item>
        {token && (
          <>
            <Nav.Item>
              <Nav.Link as={NavLink} to="/dashboard" className="d-flex align-items-center rounded-3 py-2 px-3">
                <i className="bi bi-speedometer2 me-3"></i>Dashboard
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="/form" className="d-flex align-items-center rounded-3 py-2 px-3">
                <i className="bi bi-file-earmark-person me-3"></i>Recommendation Form
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="/report" className="d-flex align-items-center rounded-3 py-2 px-3">
                <i className="bi bi-file-earmark-bar-graph me-3"></i>View Report
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="/insights" className="d-flex align-items-center rounded-3 py-2 px-3">
                <i className="bi bi-lightbulb me-3"></i>Data Insights
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="/model" className="d-flex align-items-center rounded-3 py-2 px-3">
                <i className="bi bi-cpu me-3"></i>Model Details
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="/ratings" className="d-flex align-items-center rounded-3 py-2 px-3">
                <i className="bi bi-star me-3"></i>User Ratings
              </Nav.Link>
            </Nav.Item>
          </>
        )}
      </Nav>
      <hr className="my-4" />
      <div className="mt-auto">
        {!token ? (
          <>
            <Nav.Item className="mb-2">
              <Nav.Link as={NavLink} to="/login" className="d-flex align-items-center rounded-3 py-2 px-3">
                <i className="bi bi-box-arrow-in-right me-3"></i>Login
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link as={NavLink} to="/register" className="d-flex align-items-center rounded-3 py-2 px-3">
                <i className="bi bi-person-plus me-3"></i>Register
              </Nav.Link>
            </Nav.Item>
          </>
        ) : (
          <Button variant="outline-light" className="w-100 rounded-pill py-2 shadow-sm d-flex align-items-center justify-content-center" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left me-2"></i>Logout
          </Button>
        )}
      </div>
      <hr className="my-4 opacity-25" />
      <div className="small text-center opacity-50 fw-light">Alexia ML Project v2.0</div>
    </div>
  );
};

export default Sidebar;