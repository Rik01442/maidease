import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { maidAPI } from '../api/endpoints';
import '../styles/Maids.css';

export const MaidsList = () => {
  const [maids, setMaids] = useState([]);
  const [filteredMaids, setFilteredMaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    minRate: 0,
    maxRate: 500,
    minExperience: 0,
  });

  useEffect(() => {
    fetchMaids();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, maids]);

  const fetchMaids = async () => {
    try {
      setLoading(true);
      const response = await maidAPI.getAvailableMaids();
      setMaids(response.data || []);
    } catch (err) {
      setError('Failed to load maids');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = maids.filter((maid) => {
      const matchSearch =
        !filters.search ||
        maid.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (maid.skills && maid.skills.toLowerCase().includes(filters.search.toLowerCase()));

      const matchRate =
        maid.hourly_rate >= filters.minRate && maid.hourly_rate <= filters.maxRate;

      const matchExperience = maid.experience_years >= filters.minExperience;

      return matchSearch && matchRate && matchExperience;
    });

    setFilteredMaids(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        <p>Loading maids...</p>
      </div>
    );
  }

  return (
    <div className="maids-container">
      <h1>Browse Service Providers</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search by Name or Skills</label>
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>
              Hourly Rate: ${filters.minRate} - ${filters.maxRate}
            </label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.minRate}
                onChange={(e) => handleFilterChange('minRate', parseInt(e.target.value))}
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxRate}
                onChange={(e) => handleFilterChange('maxRate', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Minimum Experience (years)</label>
            <input
              type="number"
              placeholder="Years"
              value={filters.minExperience}
              onChange={(e) => handleFilterChange('minExperience', parseInt(e.target.value))}
            />
          </div>

          <button className="btn-reset" onClick={() => setFilters({ search: '', minRate: 0, maxRate: 500, minExperience: 0 })}>
            Reset Filters
          </button>
        </div>
      </div>

      <div className="maids-grid">
        {filteredMaids.length > 0 ? (
          filteredMaids.map((maid) => (
            <div key={maid.id} className="maid-card">
              <div className="maid-header">
                <h3>{maid.full_name}</h3>
                <div className="rating">
                  {renderStars(maid.average_rating || 0)}
                  <span className="rating-value">
                    {maid.average_rating ? maid.average_rating.toFixed(1) : 'No ratings'}
                  </span>
                </div>
              </div>

              {maid.bio && <p className="maid-bio">{maid.bio}</p>}

              <div className="maid-details">
                <div className="detail">
                  <span className="label">Skills:</span>
                  <span className="value">{maid.skills || 'Not specified'}</span>
                </div>
                <div className="detail">
                  <span className="label">Experience:</span>
                  <span className="value">{maid.experience_years} years</span>
                </div>
                <div className="detail">
                  <span className="label">Rate:</span>
                  <span className="value">${maid.hourly_rate}/hour</span>
                </div>
                <div className="detail">
                  <span className="label">Availability:</span>
                  <span className="value">
                    {maid.availability_schedule || 'Flexible'}
                  </span>
                </div>
              </div>

              <div className="maid-actions">
                <Link to={`/maid/${maid.id}`} className="btn btn-view">
                  View Profile
                </Link>
                <Link to={`/book/${maid.id}`} className="btn btn-book">
                  Book Now
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No service providers match your filters. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
