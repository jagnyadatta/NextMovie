import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiFilm,
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowLeft,
  FiRefreshCw,
  FiClock,
  FiCheck,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

export const Register = () => {
  const { signup, login, sendOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Step state: 'FORM' (step 1) or 'OTP' (step 2)
  const [step, setStep] = useState('FORM');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputsRef = useRef([]);

  // Resend cooldown countdown timer
  useEffect(() => {
    let timer = null;
    if (step === 'OTP' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, resendCooldown]);

  // Focus the first OTP box when entering the OTP step
  useEffect(() => {
    if (step === 'OTP' && otpInputsRef.current[0]) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Validate Step 1 form fields
  const validateForm = () => {
    if (formData.name.trim().length < 3) {
      setError('Name must be at least 3 characters long.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid email address.');
      return false;
    }

    // Indian phone number validation: 10 digits starting with 6-9
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(formData.phone.trim())) {
      setError('Please provide a valid 10-digit Indian phone number (starts with 6, 7, 8, or 9).');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }

    return true;
  };

  // Step 1: Request OTP and move to step 2
  const handleInitiateSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      await sendOtp({
        email: formData.email.trim(),
        name: formData.name.trim(),
      });

      toast.success(`Verification code sent to ${formData.email.trim()}`);
      setStep('OTP');
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      const msg = err.message || 'Failed to send verification code. Please check your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const char = cleaned.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-focus next input if a digit was entered
    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP boxes
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6-digit OTP code
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    if (digits.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      digits.forEach((d, idx) => {
        newOtp[idx] = d;
      });
      setOtp(newOtp);

      const targetFocusIdx = Math.min(digits.length, 5);
      otpInputsRef.current[targetFocusIdx]?.focus();
    }
  };

  // Resend OTP code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;

    setError(null);
    setResending(true);
    try {
      await resendOtp({ email: formData.email.trim() });
      toast.success('A new verification code was sent to your email.');
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      otpInputsRef.current[0]?.focus();
    } catch (err) {
      const msg = err.message || 'Failed to resend verification code.';
      setError(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP & Complete Signup
  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otp.join('').trim();
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        otp: fullOtp,
      });

      toast.success('Account verified & created successfully! Logging you in...');

      // Immediately log in with the new credentials
      try {
        await login(formData.email.trim(), formData.password);
        navigate('/', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      const msg = err.message || 'Verification failed. Please check the code and try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-dropdown rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient glows */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-red-600/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-rose-600/15 blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-md shadow-red-500/20">
              <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                <FiFilm className="text-red-500 text-lg" />
              </div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Next<span className="text-red-500">Movie</span>
            </span>
          </Link>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 my-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                step === 'FORM'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {step === 'OTP' ? <FiCheck className="text-xs" /> : <span>1</span>}
              <span>Details</span>
            </div>
            <div className="w-6 h-0.5 bg-slate-700" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                step === 'OTP'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 ring-2 ring-red-500/10'
                  : 'bg-slate-800 text-slate-500 border border-white/5'
              }`}
            >
              <span>2</span>
              <span>Verification</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white">
            {step === 'FORM' ? 'Create New Account' : 'Verify Your Email'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'FORM'
              ? 'Join NextMovie to book cinema seats, save tickets, and get premier access.'
              : 'Enter the 6-digit one-time password sent to your email.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 'FORM' && (
          <form onSubmit={handleInitiateSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  required
                  minLength={3}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                We'll send a 6-digit OTP code to this email to verify your identity.
              </span>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number (10 digits)
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="tel"
                  required
                  pattern="^[6-9]\d{9}$"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                10-digit Indian mobile number (e.g. 9876543210)
              </span>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password (min 8 chars)
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-600/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Email & Continue</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Screen */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyAndSignup} className="space-y-5">
            {/* Target Email Notice Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <FiMail className="text-red-400 text-sm" />
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Code Sent To
                  </div>
                  <div className="text-xs font-semibold text-white truncate">
                    {formData.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('FORM');
                  setError(null);
                }}
                className="text-xs text-red-400 hover:text-red-300 font-medium underline underline-offset-2 shrink-0 cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* 6 Digit Input Boxes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
                Enter 6-Digit Code
              </label>
              <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
                  />
                ))}
              </div>
            </div>

            {/* Timer & Resend Controls */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <FiClock className="text-slate-500 text-xs" />
                {resendCooldown > 0 ? (
                  <span>
                    Resend in <strong className="text-amber-400">{resendCooldown}s</strong>
                  </span>
                ) : (
                  <span className="text-slate-400">Didn't receive the email?</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resending}
                className={`flex items-center gap-1 font-semibold cursor-pointer transition-all ${
                  resendCooldown > 0 || resending
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-red-400 hover:text-red-300 underline underline-offset-4'
                }`}
              >
                <FiRefreshCw className={`text-xs ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Sending...' : 'Resend Code'}</span>
              </button>
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
              <FiShield className="text-red-500 text-sm shrink-0 mt-0.5" />
              <span>
                The code is valid for <strong>5 minutes</strong>. Check your inbox and spam folder if needed.
              </span>
            </div>

            {/* Submit Verification Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-lg shadow-red-600/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Verifying & Creating Account...</span>
                </>
              ) : (
                <span>Verify & Create Account</span>
              )}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                setStep('FORM');
                setError(null);
              }}
              className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition-all pt-1 cursor-pointer"
            >
              <FiArrowLeft className="text-sm" />
              <span>Back to Registration Details</span>
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-red-400 hover:text-red-300 underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
