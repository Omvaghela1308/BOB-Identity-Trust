import React, { useState, useRef, useEffect } from 'react';
import { Shield, Mail, KeyRound, AlertTriangle, User, Phone, FileText, Lock, CheckCircle2 } from 'lucide-react';
import { sendOtp, verifyOtp, registerUser } from '../utils/api';

export default function LoginCard({ onLoginSuccess, onRegisterSuccess }) {
  const [view, setView] = useState('login'); // 'login' or 'register'
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP (only for login)
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Registration States
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Focus first OTP box on entering Step 2
  useEffect(() => {
    if (view === 'login' && step === 2) {
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    }
  }, [step, view]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid corporate email address.');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      const res = await sendOtp(email);
      if (res.success) {
        setStep(2);
        setInfo(res.message);
      } else {
        setError(res.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Connection to security gateway failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 4) {
      setError('Please enter the 4-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await verifyOtp(email, code);
      if (res.success) {
        onLoginSuccess(res.user, res.session);
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRegSuccess('');

    if (!regUsername || !regEmail || !regPhone || !regAadhaar || !regPassword) {
      setError('All registration fields are required.');
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser(regUsername, regEmail, regPhone, regAadhaar, regPassword);

      if (data.success) {
        if (onRegisterSuccess) {
          onRegisterSuccess('Identity Enrollment Complete - Corporate Credentials Registered!');
        }
        setRegSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          setView('login');
          setStep(1);
          setEmail(regEmail);
          setRegSuccess('');
          setRegUsername('');
          setRegEmail('');
          setRegPhone('');
          setRegAadhaar('');
          setRegPassword('');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchView = (targetView) => {
    setView(targetView);
    setStep(1);
    setError('');
    setInfo('');
    setRegSuccess('');
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl glass-panel text-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col justify-between relative overflow-hidden cyber-scanlines">
      {/* Decorative neon blue top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent animate-pulse-slow"></div>

      {/* Visual Identity / Header */}
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center mb-3">
          <Shield className="w-6 h-6 text-cyber-blue text-glow-blue animate-pulse-slow" />
        </div>
        <h2 className="text-xl font-bold tracking-widest text-white uppercase text-glow-blue">
          {view === 'login' ? 'Portal Verification' : 'Enroll Identity'}
        </h2>
        <p className="text-[10px] text-cyber-blue font-mono uppercase tracking-wider mt-1">
          {view === 'login' ? 'BOB Risk-Based Access Engine' : 'Register Corporate Access'}
        </p>
      </div>

      {/* Message Notifications */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-cyber-red/10 border border-cyber-red/30 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-cyber-red shrink-0 mt-0.5" />
          <p className="text-xs text-cyber-red font-mono">{error}</p>
        </div>
      )}

      {info && (
        <div className="mb-4 p-3 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-start gap-2.5">
          <KeyRound className="w-4 h-4 text-cyber-blue shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300 font-mono">{info}</p>
        </div>
      )}

      {regSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-cyber-green/10 border border-cyber-green/30 flex items-start gap-2.5 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-cyber-green shrink-0 mt-0.5" />
          <p className="text-xs text-cyber-green font-mono">{regSuccess}</p>
        </div>
      )}

      {view === 'login' ? (
        /* Login Card View */
        step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2 pl-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="identity@bankofbaroda.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyber-blue hover:bg-blue-600 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl border border-cyber-blue/40 shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Send 4-Digit OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest text-center mb-3">
                Enter Verification OTP
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-[#0d0d0e] border border-white/10 rounded-xl text-cyber-blue font-mono focus:outline-none focus:border-cyber-blue focus:ring-2 focus:ring-cyber-blue/30"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyber-blue hover:bg-blue-600 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl border border-cyber-blue/40 shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Verify & Login'}
            </button>

            <div className="flex justify-between items-center font-mono text-[10px] px-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-cyber-blue hover:underline"
              >
                Change Email
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-gray-500 hover:text-gray-400"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )
      ) : (
        /* Register Card View */
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 pl-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-cyber-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 pl-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-cyber-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 pl-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-cyber-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 pl-1">
                Aadhaar Number
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={regAadhaar}
                  onChange={(e) => setRegAadhaar(e.target.value)}
                  placeholder="Aadhaar"
                  className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-cyber-blue"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-cyber-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-cyber-blue hover:bg-blue-600 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl border border-cyber-blue/40 shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all disabled:opacity-50"
          >
            {loading ? 'Registering Access...' : 'Register'}
          </button>
        </form>
      )}

      {/* Switch Toggles Footer */}
      <div className="mt-6 border-t border-white/5 pt-4 text-center font-mono text-xs">
        {view === 'login' ? (
          <button
            onClick={() => handleSwitchView('register')}
            className="text-gray-400 hover:text-cyber-blue transition-colors"
          >
            Don't have an account? <span className="text-cyber-blue">Register</span>
          </button>
        ) : (
          <button
            onClick={() => handleSwitchView('login')}
            className="text-gray-400 hover:text-cyber-blue transition-colors"
          >
            Already have an identity? <span className="text-cyber-blue">Login</span>
          </button>
        )}
      </div>
    </div>
  );
}
