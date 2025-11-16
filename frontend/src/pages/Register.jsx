import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage, validateRegistrationPayload } from '../utils/payloadValidator';
import '../styles/Register.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    role: 'customer',
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log('🔘 Submit button clicked', formData);

    // Validate password match
    if (formData.password !== formData.confirm_password) {
      console.error('❌ Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    console.log('🔄 Loading set to true, attempting registration...');

    try {
      // Build payload with only required fields
      const dataToSend = {
        email: formData.email,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        role: formData.role,
        password: formData.password,
      };

      console.log('📝 Data to send:', dataToSend);

      // Use centralized validation
      const validatedData = validateRegistrationPayload(dataToSend);
      console.log('✅ Validation passed:', validatedData);

      console.log('Sending registration data:', validatedData);
      console.log('🚀 Calling register() function...');

      const result = await register(validatedData);
      console.log('✅ Register returned successfully:', result);
      
      navigate('/login');
    } catch (err) {
      console.error('💥 Error caught in try-catch:', err);
      // Handle validation errors
      if (err.message) {
        setError(err.message);
        console.error('Validation error:', err.message);
      } else {
        // Handle API errors
        const errorMessage = getApiErrorMessage(err);
        console.error('Registration error response:', err.response?.data);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      console.log('🔄 Loading set to false');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create MaidEase Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="customer">Customer</option>
              <option value="maid">Maid/Service Provider</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};
