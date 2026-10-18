export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const POPULAR_CITIES = [
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Bhubaneswar',
  'Ahmedabad',
  'Jaipur',
  'Chandigarh',
  'Kochi'
];

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  THEATER_ADMIN: 'THEATER_ADMIN'
};

export const SEAT_TYPES = {
  REGULAR: { label: 'Regular', color: 'border-slate-500 bg-slate-800/60 text-slate-200', defaultPrice: 150 },
  PREMIUM: { label: 'Premium', color: 'border-blue-500 bg-blue-950/60 text-blue-200', defaultPrice: 250 },
  RECLINER: { label: 'Recliner', color: 'border-purple-500 bg-purple-950/60 text-purple-200', defaultPrice: 400 },
  VIP: { label: 'VIP', color: 'border-amber-500 bg-amber-950/60 text-amber-200', defaultPrice: 550 }
};

export const SHOW_STATUS = {
  UPCOMING: { label: 'Upcoming', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  RUNNING: { label: 'Now Showing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  COMPLETED: { label: 'Completed', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
};

export const SCREEN_TYPES = [
  'STANDARD',
  'IMAX',
  'IMAX_3D',
  'DOLBY_CINEMA',
  'FOUR_DX',
  'MX4D'
];

export const LANGUAGES = [
  'All',
  'English',
  'Hindi',
  'Telugu',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Odia',
  'Bengali',
  'Marathi'
];
