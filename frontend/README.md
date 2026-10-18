# NextMovie - Cinema Ticket Booking Frontend

A complete, modern, responsive frontend for **NextMovie** built with **React 19**, **Vite**, **React Router v7**, **Tailwind CSS v4**, **React Icons**, and **Context API**.

---

## 🚀 Features & Pages

- **Interactive Navbar**:
  - Brand identity with glowing cinema icon
  - Live movie search with debounced autocomplete suggestions
  - Global city/location selector modal (persisted in local storage)
  - Responsive mobile drawer menu
  - Dynamic user profile menu with role badge (`USER`, `ADMIN`, `THEATER_ADMIN`), direct links to *My Bookings*, *Admin Dashboard*, and *Sign Out*

- **Home Page (`/`)**:
  - Cinematic hero spotlight banner for featured premieres
  - Location status strip with instant city switcher
  - Recently released movies showcase
  - Trending catalog preview
  - Popular theatres in selected city
  - Cinema experience & audio formats showcase (IMAX, Dolby Cinema Atmos, 4DX, VIP Lounge)

- **Movies Catalog (`/movies`)**:
  - Full-text search with instant filter reset
  - Language filter tabs (English, Hindi, Telugu, Tamil, Kannada, Malayalam, Odia, Bengali, Marathi)
  - Sorting (Title A-Z, Title Z-A, Recently Released)
  - Responsive poster cards with IMDb ratings, genres, and duration
  - Pagination controls

- **Movie Details (`/movies/:movieUuid`)**:
  - Large cinematic backdrop and high-res poster
  - Comprehensive metadata: IMDb rating, Rotten Tomatoes / Metascore from backend ratings, runtime, age certificate, director, writer, cast, box office earnings, and awards
  - Interactive 7-day date selector (Today, Tomorrow, upcoming dates)
  - Showtimes grouped by Theatre/Multiplex with screen format and direct booking action

- **Theatres Directory (`/theatres`)**:
  - Filter cinemas by popular Indian cities (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Bhubaneswar, etc.)
  - Multiplex cards with address, state, PIN code, and active status
  - Direct "Explore Shows" navigation

- **Shows Explorer (`/shows`)**:
  - Shows filtering by selected date and active city
  - Query parameter support for filtering by specific theatre (`?theatre=...`) or movie (`?movie=...`)
  - Real-time show status badges (`UPCOMING`, `RUNNING`, `COMPLETED`, `CANCELLED`)

- **Interactive Seat Selection (`/book/:showUuid`)**:
  - Top header displaying movie title, theatre, screen, date, and showtime
  - Screen curved glowing orientation bar (`SCREEN THIS WAY`)
  - Interactive seat layout organized by rows (A, B, C...) and seat numbers
  - Color-coded seat states:
    - **Available**: Interactive, styled by seat category (`VIP`, `RECLINER`, `PREMIUM`, `REGULAR`)
    - **Selected**: Glowing neon accent with checkmark
    - **Booked**: Disabled with cross indicator
    - **Locked**: Disabled with lock icon indicating temporary in-progress hold
  - Seat legend with live category prices
  - Live price breakdown (subtotal, convenience fee, grand total in INR ₹)
  - Protected checkout: unauthenticated users are prompted to log in and redirected back seamlessly
  - Real-time seat locking via `POST /bookings` with pessimistic lock concurrency

- **Booking Confirmation & Details (`/booking/confirmation/:bookingUuid`)**:
  - Authentic perforated cinema e-ticket design
  - Cutout ticket notches, barcode representation, and booking reference ID
  - Movie, theatre, screen, date, showtime, and seat numbers breakdown
  - Print / Save Ticket action

- **My Bookings (`/my-bookings`)**:
  - User's personal reservation history
  - Status badges (`CONFIRMED`, `PENDING`, `CANCELLED`)
  - Direct link to view e-tickets

- **Authentication (`/login`, `/register`)**:
  - Client-side validation matching backend DTO rules:
    - Name: min 3 characters
    - Password: min 8 characters
    - Indian mobile number: 10 digits starting with 6-9 (`^[6-9]\d{9}$`)
  - Automatic JWT token management and localStorage persistence
  - Dark-themed toast notifications

- **Admin Dashboard (`/admin`)**:
  - Protected by `role === 'ADMIN'`
  - **Overview**: KPI stat cards for movies, theatres, shows, bookings, and users
  - **Movies**: Table of all catalog movies, Delete action, "Add Custom Movie" modal, and **"Import from IMDb"** modal (fetches full movie details and posters via backend OMDb integration)
  - **Theatres**: List theatres, toggle active/inactive status, create new theatre with 6-digit Indian PIN code validation, delete theatre
  - **Screens & Seats**: Select theatre, view screens, add new screen (`IMAX`, `DOLBY_CINEMA`, `STANDARD`, etc.), view seat layout, add individual seats, and **"Auto-Generate Grid"** tool
  - **Shows**: Schedule screenings with movie, screen, show date, start/end time, show status, and custom pricing map per seat category (`REGULAR`, `PREMIUM`, `RECLINER`, `VIP`)
  - **Bookings**: Inspect all customer reservations, seat allocations, and payment totals
  - **Users**: View registered users, update user roles (`USER`, `ADMIN`, `THEATER_ADMIN`), toggle account status (`ACTIVE`, `INACTIVE`), and delete accounts

---

## 🛠️ Architecture & Tech Stack

```
frontend/src/
├── api/
│   ├── axiosClient.js          # Centralized Axios with Bearer token & error formatting
│   ├── authApi.js              # /auth/login, /auth/signup
│   ├── movieApi.js             # /movies, /movies/recent, /movies/search, /movies/import
│   ├── theatreApi.js           # /theatres, /theatres/city, /theatres/{id}/screens
│   ├── screenApi.js            # /screens, /screens/theatre, /screens/{id}/seats
│   ├── seatApi.js              # /seats, /seats/screen
│   ├── showApi.js              # /shows, /shows/movie, /shows/theatre, /shows/{id}/seats
│   ├── showSeatApi.js          # /show-seats
│   ├── bookingApi.js           # /bookings, /bookings/my, /bookings/{id}
│   └── userApi.js              # /users, /users/{id}/role, /users/{id}/status
├── context/
│   ├── AuthContext.jsx         # User auth, roles, token handling
│   └── CityContext.jsx         # Selected city, popular cities, modal toggle
├── components/
│   ├── common/                 # Navbar, Footer, Modal, CityModal, Badge, EmptyState, LoadingSkeleton, ProtectedRoute
│   ├── movie/                  # MovieCard, MovieHero
│   ├── booking/                # SeatGrid, SeatLegend, BookingSummary, TicketView
│   └── admin/                  # AdminStats, MovieManager, TheatreManager, ScreenManager, ShowManager, BookingManager, UserManager
├── pages/                      # Home, Movies, MovieDetails, Theatres, Shows, SeatBooking, BookingDetails, MyBookings, Login, Register, AdminDashboard, NotFound
├── utils/
│   ├── constants.js            # API base URL, cities, seat types, formats
│   └── formatters.js           # Currency (₹ INR), dates, times, durations
├── App.jsx                     # Router layout and global toast container
├── main.jsx                    # Root render with Context Providers
└── index.css                   # Glassmorphism, cinema glow, scrollbars, fonts
```

---

## 💻 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application runs at `http://localhost:5173`.

3. **Backend API**:
   The frontend connects to the Spring Boot backend at `http://localhost:8080/api/v1`. To customize the base URL, set `VITE_API_BASE_URL` in a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```
