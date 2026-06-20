import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { verifyStepUp } from '../utils/api';

export default function StepUpModal({ isOpen, onClose, transactionDetails, email, trustScore, onVerificationSuccess }) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => otpRefs[0].current?.focus(), 100);
      setError('');
      setOtp(['', '', '', '']);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 4) {
      setError('Please enter the 4-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await verifyStepUp(email, code, transactionDetails.amount, transactionDetails.recipient);
      if (res.success) {
        onVerificationSuccess(res.message);
        onClose();
      } else {
        setError(res.message || 'MFA validation failed.');
      }
    } catch (err) {
      setError(err.message || 'Verification rejected by Security Gateway.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-2xl glass-panel relative border border-cyber-red/30 shadow-2xl overflow-hidden cyber-scanlines">
        {/* Pulsing red security danger border */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-cyber-red animate-pulse-slow"></div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5 text-cyber-red text-glow-red">
            <ShieldAlert className="w-5 h-5" />
            <span className="font-mono font-bold tracking-widest text-xs uppercase">Step-up Challenge Triggered</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5 bg-cyber-red/10 border border-cyber-red/20 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-cyber-red shrink-0" />
            <div>
              <h4 className="text-xs font-mono font-bold uppercase text-cyber-red">Elevated Risk Exception</h4>
              <p className="text-[11px] text-red-200/80 font-mono mt-1 leading-relaxed">
                The session trust score is currently degraded ({trustScore}/100). Secure action "Transfer Funds" has been intercepted. Complete secondary authentication challenge.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 p-3 bg-black/40 border border-white/5 rounded-lg font-mono text-xs text-gray-300 space-y-1">
          <div><span className="text-gray-500">Operation:</span> Fund Transfer</div>
          <div><span className="text-gray-500">Recipient:</span> {transactionDetails?.recipient}</div>
          <div><span className="text-gray-500">Amount:</span> ₹{transactionDetails?.amount}</div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-cyber-red/15 border border-cyber-red/30">
            <p className="text-xs text-cyber-red font-mono text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest text-center mb-3">
              Enter Transaction Verification OTP
            </label>
            <div className="flex justify-center gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-[#0d0d0e] border border-cyber-red/20 rounded-lg text-cyber-red font-mono focus:outline-none focus:border-cyber-red focus:ring-2 focus:ring-cyber-red/20"
                />
              ))}
            </div>
            <p className="text-[9px] text-gray-500 font-mono text-center mt-2">
              (Use Test OTP: 1234)
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border border-white/10 rounded-lg font-mono text-xs uppercase tracking-wider transition-all"
            >
              Abend Tx
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-cyber-red hover:bg-red-600 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg border border-cyber-red/40 shadow-[0_0_15px_rgba(239,68,68,0.25)] transition-all disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Verify Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
