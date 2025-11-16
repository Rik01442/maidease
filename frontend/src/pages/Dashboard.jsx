import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { maidAPI, bookingAPI, reviewAPI } from '../api/endpoints';
import { getApiErrorMessage } from '../utils/payloadValidator';
import '../styles/Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [maidStats, setMaidStats] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewedBookings, setReviewedBookings] = useState(new Set());
  const [dismissBioPrompt, setDismissBioPrompt] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (user?.role === 'maid') {
      fetchMaidStats();
    } else {
      fetchCustomerData();
    }
  }, [user?.role]);

  const fetchMaidStats = async () => {
    try {
      setLoading(true);
      // Fetch bookings - maid profile is already in user context
      const bookingsRes = await bookingAPI.getMaidBookings();
      console.log('Maid bookings response:', bookingsRes);
      setMaidStats(user); // Use user data instead of separate profile call
      setUpcomingBookings(bookingsRes.data || []);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Maid stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const bookingsRes = await bookingAPI.getMyBookings();
      setUpcomingBookings(bookingsRes.data || []);
      
      // Check which bookings have reviews
      if (bookingsRes.data) {
        const completedBookings = bookingsRes.data.filter(b => b.status === 'completed');
        const reviewStatus = new Set();
        
        for (const booking of completedBookings) {
          try {
            const checkRes = await reviewAPI.checkReviewExists(booking.id);
            // Check if review exists based on response data
            if (checkRes.data?.exists) {
              reviewStatus.add(booking.id);
            }
          } catch (err) {
            console.warn(`Error checking review for booking ${booking.id}:`, err);
          }
        }
        
        setReviewedBookings(reviewStatus);
      }
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      setActionLoading(bookingId);
      const statusMap = {
        accept: 'accepted',
        decline: 'canceled',
        complete: 'completed'
      };
      await bookingAPI.updateBookingStatus(bookingId, statusMap[action]);
      setSelectedBooking(null);
      fetchMaidStats();
    } catch (err) {
      setError(getApiErrorMessage(err));
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }
    try {
      setActionLoading(bookingId);
      // We'll use the update API to cancel the booking instead of delete
      await bookingAPI.updateBookingStatus(bookingId, 'canceled');
      setSelectedBooking(null);
      fetchMaidStats();
    } catch (err) {
      setError(getApiErrorMessage(err));
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.full_name}!</h1>
        <p className="user-role">{user?.role === 'maid' ? 'Service Provider' : 'Customer'}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {user?.role === 'maid' ? (
        <div className="maid-dashboard">
          {!dismissBioPrompt && !maidStats?.bio && (
            <div className="bio-prompt-banner">
              <div className="bio-prompt-content">
                <h3>📝 Complete Your Profile</h3>
                <p>Add a bio, skills, hourly rate, and availability to attract more customers!</p>
              </div>
              <div className="bio-prompt-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/profile')}
                >
                  Create Your Bio
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setDismissBioPrompt(true)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {maidStats?.bio && (
            <div className="profile-update-card">
              <div className="profile-update-header">
                <h3>👤 Your Profile</h3>
                <p className="profile-status">Profile Complete</p>
              </div>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="label">Hourly Rate:</span>
                  <span className="value">${maidStats?.hourly_rate || 'Not set'}/hr</span>
                </div>
                <div className="profile-info-item">
                  <span className="label">Experience:</span>
                  <span className="value">{maidStats?.experience_years || 0} years</span>
                </div>
                <div className="profile-info-item">
                  <span className="label">Rating:</span>
                  <span className="value">{maidStats?.average_rating ? `${maidStats.average_rating.toFixed(1)}★` : 'No ratings yet'}</span>
                </div>
              </div>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/profile')}
              >
                Update Profile
              </button>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Bookings</h3>
              <p className="stat-value">{upcomingBookings.length}</p>
            </div>
            <div className="stat-card">
              <h3>Average Rating</h3>
              <p className="stat-value">
                {maidStats?.average_rating ? `${maidStats.average_rating.toFixed(1)}★` : 'No ratings yet'}
              </p>
            </div>
            <div className="stat-card">
              <h3>Hourly Rate</h3>
              <p className="stat-value">${maidStats?.hourly_rate || 'Not set'}</p>
            </div>
            <div className="stat-card">
              <h3>Experience</h3>
              <p className="stat-value">{maidStats?.experience_years || 0} years</p>
            </div>
          </div>

          <div className="upcoming-bookings">
            <h2>Upcoming Bookings</h2>
            {upcomingBookings.length > 0 ? (
              <div className="bookings-list">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div 
                      className="booking-info clickable"
                      onClick={() => setSelectedBooking(booking)}
                      style={{ cursor: 'pointer' }}
                    >
                      <p className="booking-customer">
                        👤 {booking.customer?.full_name || 'Unknown'}
                      </p>
                      <p className="booking-service">{booking.service_type.replace('_', ' ')}</p>
                      <p className="booking-date">
                        {new Date(booking.booking_date).toLocaleDateString()} @ {booking.time_slot}
                      </p>
                      <p className="booking-status" data-status={booking.status}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </p>
                    </div>
                    <div className="booking-actions">
                      {(booking.status === 'pending' || booking.status === 'completed') && (
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                          title="Delete booking"
                        >
                          {actionLoading === booking.id ? '...' : '🗑️'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No upcoming bookings</p>
            )}
          </div>

          {/* Booking Details Modal */}
          {selectedBooking && (
            <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Booking Details</h2>
                  <button 
                    className="modal-close"
                    onClick={() => setSelectedBooking(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <div className="detail-section">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> {selectedBooking.customer?.full_name}</p>
                    <p><strong>Contact:</strong> {selectedBooking.customer?.phone_number || 'Not provided'}</p>
                  </div>

                  <div className="detail-section">
                    <h3>Booking Information</h3>
                    <p><strong>Service:</strong> {selectedBooking.service_type.replace('_', ' ')}</p>
                    <p><strong>Date:</strong> {new Date(selectedBooking.booking_date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {selectedBooking.time_slot}</p>
                    <p><strong>Status:</strong> <span data-status={selectedBooking.status}>{selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}</span></p>
                    <p><strong>Hourly Rate:</strong> ${selectedBooking.total_amount || 'Not specified'}/hour</p>
                    {selectedBooking.notes && (
                      <p><strong>Notes:</strong> {selectedBooking.notes}</p>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <button 
                        className="btn btn-accept"
                        onClick={() => handleBookingAction(selectedBooking.id, 'accept')}
                        disabled={actionLoading === selectedBooking.id}
                      >
                        {actionLoading === selectedBooking.id ? 'Accepting...' : 'Accept'}
                      </button>
                      <button 
                        className="btn btn-decline"
                        onClick={() => handleBookingAction(selectedBooking.id, 'decline')}
                        disabled={actionLoading === selectedBooking.id}
                      >
                        {actionLoading === selectedBooking.id ? 'Declining...' : 'Decline'}
                      </button>
                    </>
                  )}
                  {selectedBooking.status === 'accepted' && (
                    <button 
                      className="btn btn-complete"
                      onClick={() => handleBookingAction(selectedBooking.id, 'complete')}
                      disabled={actionLoading === selectedBooking.id}
                    >
                      {actionLoading === selectedBooking.id ? 'Completing...' : 'Mark Complete'}
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedBooking(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="customer-dashboard">
          <div className="recent-bookings">
            <h2>Recent Bookings</h2>
            {upcomingBookings.length > 0 ? (
              <div className="bookings-list">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-info">
                      <p className="booking-maid">
                        Maid: {booking.maid?.full_name || 'Unknown'}
                      </p>
                      <p className="booking-service">{booking.service_type.replace('_', ' ')}</p>
                      <p className="booking-date">
                        {new Date(booking.booking_date).toLocaleDateString()} @ {booking.time_slot}
                      </p>
                      <p className="booking-amount">
                        💰 ${booking.total_amount || 'TBD'}{typeof booking.total_amount === 'number' ? '/hr' : ''}
                      </p>
                      <p className="booking-status" data-status={booking.status}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </p>
                    </div>
                    <div className="booking-actions-customer">
                      {booking.status === 'pending' && (
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                          title="Remove booking"
                        >
                          {actionLoading === booking.id ? '...' : '🗑️'}
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <>
                          {reviewedBookings.has(booking.id) ? (
                            <span className="btn btn-reviewed">✓ Already Reviewed</span>
                          ) : (
                            <a href={`/review/${booking.id}`} className="btn btn-review">
                              Leave Review
                            </a>
                          )}
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteBooking(booking.id)}
                            disabled={actionLoading === booking.id}
                            title="Remove booking"
                          >
                            {actionLoading === booking.id ? '...' : '🗑️'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No bookings yet. Start by browsing available maids in the header!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
