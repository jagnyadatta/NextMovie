import React from 'react';
import { Link } from 'react-router-dom';
import { FiFilm, FiHeart, FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#05070B] text-slate-400 text-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-md shadow-red-500/20">
                <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                  <FiFilm className="text-red-500 text-lg" />
                </div>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Next<span className="text-red-500">Movie</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Next-generation cinema ticketing platform with real-time seat locks, multi-theatre scheduling, and seamless instant booking.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <FiTwitter className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <FiInstagram className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <FiGithub className="text-sm" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/movies" className="hover:text-white transition-colors">
                  All Movies
                </Link>
              </li>
              <li>
                <Link to="/theatres" className="hover:text-white transition-colors">
                  Cinemas & Theatres
                </Link>
              </li>
              <li>
                <Link to="/shows" className="hover:text-white transition-colors">
                  Today's Showtimes
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-white transition-colors">
                  Booking History
                </Link>
              </li>
            </ul>
          </div>

          {/* Cinema Formats */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Experience
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>IMAX with Laser</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Dolby Cinema Atmos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>4DX Motion Seats</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>VIP Recliner Lounges</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Support
            </h4>
            <p className="text-xs text-slate-400">
              Need assistance with your reservation or corporate bookings?
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <FiMail className="text-red-500" />
              <span>support@nextmovie.local</span>
            </div>
            <div className="pt-2 text-xs text-slate-500">
              API Base: <code className="text-red-400">/api/v1</code>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} NextMovie Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Built with <FiHeart className="text-red-500 mx-1" /> for cinephiles worldwide
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
