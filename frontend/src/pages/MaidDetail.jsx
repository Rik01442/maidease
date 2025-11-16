import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { maidAPI, reviewAPI } from '../api/endpoints';
import '../styles/MaidDetail.css';

export const MaidDetail = () => {
  const { maidId } = useParams();
  const [maid, setMaid] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaidDetails();
  }, [maidId]);

  const fetchMaidDetails = async () => {
    try {
      setLoading(true);
      const [maidRes, reviewsRes] = await Promise.all([
        maidAPI.getMaidProfile(maidId),
        reviewAPI.getReviewsForMaid(maidId),
      ]);
      setMaid(maidRes.data);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      setError('Failed to load maid details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`star ${i < Math.round(rating) ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !maid) {
    return (
      <div className="error-container">
        <p>{error || 'Maid not found'}</p>
        <Link to="/maids" className="btn">
          Back to Maids
        </Link>
      </div>
    );
  }

  return (
    <div className="maid-detail-container">
      <Link to="/maids" className="back-link">
        ← Back to Maids
      </Link>

      <div className="maid-profile">
        <div className="profile-header">
          <h1>{maid.full_name}</h1>
          <div className="rating">
            {renderStars(maid.average_rating || 0)}
            <span className="rating-value">
              {maid.average_rating
                ? `${maid.average_rating.toFixed(1)} (${reviews.length} reviews)`
                : 'No ratings yet'}
            </span>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-main">
            {maid.bio && (
              <div className="section">
                <h3>About</h3>
                <p>{maid.bio}</p>
              </div>
            )}

            <div className="details-grid">
              <div className="detail-card">
                <h4>Skills</h4>
                <p>{maid.skills || 'Not specified'}</p>
              </div>
              <div className="detail-card">
                <h4>Experience</h4>
                <p>{maid.experience_years} years</p>
              </div>
              <div className="detail-card">
                <h4>Hourly Rate</h4>
                <p className="rate">${maid.hourly_rate || 'Not specified'}/hour</p>
              </div>
              <div className="detail-card">
                <h4>Availability</h4>
                <p>{maid.availability_schedule || 'Flexible'}</p>
              </div>
            </div>

            <div className="section">
              <h3>Contact Information</h3>
              <p className="contact">
                <strong>Phone:</strong> {maid.phone_number || 'Not provided'}
              </p>
              <p className="contact">
                <strong>Email:</strong> {maid.email}
              </p>
            </div>

            <Link to={`/book/${maid.id}`} className="btn btn-primary btn-large">
              Book Now
            </Link>
          </div>

          <div className="profile-reviews">
            <div className="reviews-section">
              <h3>Reviews ({reviews.length})</h3>
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="review-author">
                          <strong>{review.customer_name}</strong>
                          <div className="review-rating">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="review-text">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
