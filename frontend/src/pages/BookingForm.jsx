import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { maidAPI, bookingAPI } from '../api/endpoints';
import { validateBookingPayload, getApiErrorMessage } from '../utils/payloadValidator';
import '../styles/BookingForm.css';

export const BookingForm = () => {
  const { maidId } = useParams();
  const navigate = useNavigate();
  const [maid, setMaid] = useState(null);
  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '',
    service_type: 'house_cleaning',
    job_description: '',
    custom_hourly_rate: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMaidDetails();
  }, [maidId]);

  const fetchMaidDetails = async () => {
    try {
      setLoading(true);
      const response = await maidAPI.getMaidProfile(maidId);
      setMaid(response.data);
    } catch (err) {
      setError('Failed to load maid details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

    if (!formData.booking_date || !formData.booking_time) {
      setError('Please select both date and time');
      return;
    }

    setSubmitting(true);

    try {
      // Validate and construct payload according to backend schema
      const bookingPayload = validateBookingPayload({
        maid_id: maidId,
        service_type: formData.service_type,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        notes: buildNotesFromFormData(formData),
      });

      await bookingAPI.createBooking(bookingPayload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      const errorMessage = err.message || getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Booking error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const buildNotesFromFormData = (data) => {
    const notes = [];
    if (data.job_description) {
      notes.push(`Job Description: ${data.job_description}`);
    }
    if (data.custom_hourly_rate) {
      notes.push(`Proposed Hourly Rate: $${data.custom_hourly_rate}`);
    }
    return notes.length > 0 ? notes.join('\n') : '';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading booking form...</p>
      </div>
    );
  }

  if (error && !maid) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/maids')} className="btn">
          Back to Maids
        </button>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      <div className="booking-form-card">
        <h1>Book {maid?.full_name}</h1>

        {success && (
          <div className="success-message">
            <p>✓ Booking created successfully! Redirecting...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Service Provider Details</h3>
            <div className="provider-info">
              <p>
                <strong>Name:</strong> {maid?.full_name}
              </p>
              <p>
                <strong>Rate:</strong> ${maid?.hourly_rate}/hour
              </p>
              <p>
                <strong>Skills:</strong> {maid?.skills}
              </p>
            </div>
          </div>

          <div className="form-section">
            <h3>Booking Details</h3>

            <div className="form-group">
              <label>Service Type *</label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                required
                disabled={submitting}
              >
                <option value="house_cleaning">House Cleaning</option>
                <option value="kitchen_cleaning">Kitchen Cleaning</option>
                <option value="laundry">Laundry</option>
                <option value="cooking">Cooking</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                name="booking_time"
                value={formData.booking_time}
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Job Description (Tell maid what you need)</label>
              <textarea
                name="job_description"
                value={formData.job_description}
                onChange={handleChange}
                placeholder="Describe the job in detail. e.g., specific areas to clean, materials to use, any preferences, etc."
                rows="4"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Proposed Hourly Rate ($) (Optional - Override maid's rate)</label>
              <input
                type="number"
                name="custom_hourly_rate"
                value={formData.custom_hourly_rate}
                onChange={handleChange}
                placeholder={`Maid's rate: $${maid?.hourly_rate}/hour`}
                step="0.01"
                min="0"
                disabled={submitting}
              />
              <small className="form-hint">Leave empty to use maid's standard rate of ${maid?.hourly_rate}/hour</small>
            </div>
          </div>

          <div className="booking-summary">
            <div className="summary-row">
              <span>Service Provider:</span>
              <span>{maid?.full_name}</span>
            </div>
            <div className="summary-row">
              <span>Hourly Rate:</span>
              <span>${maid?.hourly_rate}/hour</span>
            </div>
            <div className="summary-row">
              <span>Service Type:</span>
              <span>{formData.service_type.replace('_', ' ')}</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={submitting}
          >
            {submitting ? 'Creating Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};
