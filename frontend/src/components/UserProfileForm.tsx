import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileFormProps {
  show: boolean;
  handleClose: () => void;
  currentUser: any;
  onUserUpdate: (updatedUser: any) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ show, handleClose, currentUser, onUserUpdate }) => {
  const { token } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // New state for the actual file object
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
      setProfileImageUrl(currentUser.profile_image_url || '');
      if (currentUser.profile_image_url) {
        setImagePreviewUrl(currentUser.profile_image_url);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreviewUrl(objectUrl);
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    let finalProfileImageUrl = profileImageUrl; // Start with current or existing URL

    if (selectedFile) {
      // Upload the new image file first
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const uploadResponse = await fetch('http://localhost:8000/upload-profile-image/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errData = await uploadResponse.json();
          throw new Error(errData.detail || 'Failed to upload image');
        }
        const uploadResult = await uploadResponse.json();
        finalProfileImageUrl = uploadResult.url; // Get the URL from the backend
      } catch (uploadError: any) {
        setError(uploadError.message);
        return;
      }
    } else if (profileImageUrl !== (currentUser.profile_image_url || '')) {
      // If no new file selected but profileImageUrl was manually changed or cleared
      finalProfileImageUrl = profileImageUrl; // Use the manually set URL or empty string
    } else {
      // If no file selected and no manual change, keep the existing URL
      finalProfileImageUrl = currentUser.profile_image_url || '';
    }

    const updateData: { username?: string; password?: string; profile_image_url?: string } = {};
    if (username !== currentUser.username) {
      updateData.username = username;
    }
    if (password) {
      updateData.password = password;
    }
    // Only send profile_image_url if it has changed
    if (finalProfileImageUrl !== (currentUser.profile_image_url || '')) {
      updateData.profile_image_url = finalProfileImageUrl;
    }

    if (Object.keys(updateData).length === 0) {
      setError('No changes to save');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/users/me/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setSuccess('Profile updated successfully!');
      onUserUpdate(updatedUser); // Update user in parent component
      handleClose(); // Close modal on successful update
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formProfileImageFile">
            <Form.Label>Profile Image</Form.Label>
            <Form.Control
              type="file"
              onChange={handleFileChange}
            />
            {/* Display current profile image or selected file preview */}
            {(imagePreviewUrl) && (
              <div className="mt-2">
                <img
                  src={imagePreviewUrl}
                  alt="Profile Preview"
                  style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                  onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=Error'; }}
                />
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserProfileForm;