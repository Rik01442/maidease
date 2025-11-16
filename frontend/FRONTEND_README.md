# MaidEase Frontend

A modern React + Vite frontend for the MaidEase household service management platform.

## Features

- **Authentication**: User registration and login with JWT tokens
- **Token Refresh**: Automatic token refresh on 401 responses
- **Dashboard**: Role-based dashboards for customers and service providers
- **Browse Services**: Search and filter available service providers
- **Bookings**: Create, manage, and track service bookings
- **Reviews**: Leave and view ratings for completed services
- **Profile Management**: View and edit user profiles

## Tech Stack

- **React 19.2.0** - UI library
- **Vite 7.2.2** - Build tool
- **React Router 6.33.0** - Client-side routing
- **Axios 1.7.7** - HTTP client with interceptors
- **Context API** - State management

## Project Structure

```
src/
├── api/
│   ├── client.js          # Axios instance with interceptors
│   └── endpoints.js       # API endpoint wrappers
├── components/
│   ├── Header.jsx         # Navigation header
│   ├── Footer.jsx         # Footer component
│   └── ProtectedRoute.jsx # Auth protection wrapper
├── contexts/
│   └── AuthContext.jsx    # Global auth state
├── pages/
│   ├── Login.jsx          # Login page
│   ├── Register.jsx       # Registration page
│   ├── Dashboard.jsx      # Home dashboard
│   ├── MaidsList.jsx      # Browse service providers
│   ├── MaidDetail.jsx     # Service provider profile
│   ├── BookingForm.jsx    # Create booking
│   ├── BookingsList.jsx   # Manage bookings
│   ├── ReviewForm.jsx     # Submit review
│   └── UserProfile.jsx    # User profile editor
├── styles/
│   ├── Header.css
│   ├── Footer.css
│   ├── Login.css
│   ├── Register.css
│   ├── Dashboard.css
│   ├── Maids.css
│   ├── MaidDetail.css
│   ├── BookingForm.css
│   ├── BookingsList.css
│   ├── ReviewForm.css
│   └── UserProfile.css
├── App.jsx               # Main app with routing
├── App.css              # Global styles
├── index.css            # Base styles
└── main.jsx            # Entry point
```

## Installation

### Prerequisites
- Node.js 16+ and npm 7+

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API endpoint** (if needed):
   Edit `src/api/client.js` to update the API base URL

3. **Start development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Building

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Key Features

### Authentication Flow

1. **Registration**: New users can create accounts as customers or service providers
2. **Login**: Users authenticate with email/password
3. **Token Management**: 
   - Access tokens (30 minutes) stored in localStorage
   - Refresh tokens (7 days) for auto-renewal
   - Automatic 401 handling with token refresh

### Protected Routes

All authenticated pages are wrapped with `ProtectedRoute` component which:
- Checks for valid access token
- Redirects to login if unauthenticated
- Shows loading spinner while checking auth

### API Client

The Axios client (`src/api/client.js`) includes:
- Request interceptor: Adds Bearer token to all requests
- Response interceptor: 
  - Handles 401 responses
  - Calls `/auth/refresh` endpoint
  - Retries failed request with new token
  - Redirects to login if refresh fails

### Component Hierarchy

```
App (Router setup)
├── Header (Navigation)
├── Main Content
│   ├── Public Routes
│   │   ├── Login
│   │   └── Register
│   └── Protected Routes
│       ├── Dashboard
│       ├── MaidsList
│       ├── MaidDetail
│       ├── BookingForm
│       ├── BookingsList
│       ├── ReviewForm
│       └── UserProfile
└── Footer
```

## API Integration

All API endpoints are wrapped in `src/api/endpoints.js`:

```javascript
// Authentication
authAPI.register(userData)
authAPI.login(email, password)
authAPI.refresh(refreshToken)

// User
userAPI.getProfile()
userAPI.updateProfile(data)

// Maids
maidAPI.getAvailableMaids(params)
maidAPI.getMaidProfile(maidId)

// Bookings
bookingAPI.createBooking(bookingData)
bookingAPI.getMyBookings()
bookingAPI.getMaidBookings()
bookingAPI.getBookingDetail(bookingId)
bookingAPI.updateBookingStatus(bookingId, status)

// Reviews
reviewAPI.createReview(reviewData)
reviewAPI.getReviewsForMaid(maidId)
```

## State Management

### AuthContext

Provides global auth state:
```javascript
const {
  user,           // Current user object
  loading,        // Auth loading state
  error,          // Error message
  isAuthenticated, // Boolean check
  register,       // Register function
  login,          // Login function
  logout,         // Logout function
  updateProfile   // Update profile function
} = useAuth();
```

## Styling

- **Global styles**: `App.css` and `index.css`
- **Component styles**: Individual CSS files in `src/styles/`
- **CSS Variables**: Defined in `index.css` for theming
- **Responsive Design**: Mobile-first approach with media queries
- **BEM Naming**: Block Element Modifier conventions

## Environment Variables

Create `.env` file if needed (currently not required as API base URL is set in code):

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Development Workflow

1. **Component Creation**: Create new component in `src/pages/` or `src/components/`
2. **Styling**: Add corresponding CSS file in `src/styles/`
3. **API Integration**: Add endpoint wrapper in `src/api/endpoints.js`
4. **Routing**: Add route in `App.jsx`
5. **Testing**: Use `npm run dev` for local testing

## Common Issues

### CORS Errors
- Ensure backend is running on `http://localhost:8000`
- Check CORS configuration in backend

### Token Not Refreshing
- Verify `/auth/refresh` endpoint is accessible
- Check token format in localStorage
- Ensure refresh token is valid (not expired)

### Login Not Working
- Verify backend auth endpoint: `/api/v1/auth/login`
- Check email/password format
- Review backend error logs

## Build Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Push notifications for bookings
- [ ] Payment integration
- [ ] Real-time chat
- [ ] Advanced search filters
- [ ] Map integration for location
- [ ] Mobile app (React Native)
- [ ] Dark mode support
- [ ] Multi-language support

## Troubleshooting

### Port 5173 Already in Use
```bash
npm run dev -- --port 3000
```

### Module Not Found
```bash
npm install
```

### Cache Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

This project is part of the MaidEase platform.
