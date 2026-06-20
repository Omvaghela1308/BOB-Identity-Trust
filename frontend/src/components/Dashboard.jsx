import React, { useState } from 'react';
import { User, ShieldCheck, Laptop, Network, Globe, Send, ArrowRightLeft } from 'lucide-react';

export default function Dashboard({ session, user, onInitiateTransfer }) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('BARB0VJUNI');
  const [txSuccess, setTxSuccess] = useState('');
  const [txError, setTxError] = useState('');

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!recipient) {
      setTxError('Please enter the Account Holder Name.');
      return;
    }
    if (!ifscCode) {
      setTxError('Please enter the IFSC Code.');
      return;
    }
    if (!accountNumber) {
      setTxError('Please enter the Account Number.');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setTxError('Please enter a valid transfer amount.');
      return;
    }
    
    setTxError('');
    setTxSuccess('');
    onInitiateTransfer({ 
      amount, 
      recipient, 
      accountNumber, 
      ifscCode,
      setTxSuccess, 
      setTxError 
    });
  };

  // Determine color matching for Trust Score
  const score = session.trustScore;
  let colorClass = 'text-cyber-green text-glow-green';
  let strokeColor = '#10b981'; // Green
  let cardGlow = 'glass-panel-glow-green';
  let safetyLabel = 'Low Risk - Authorized';

  if (score < 50) {
    colorClass = 'text-cyber-red text-glow-red animate-pulse';
    strokeColor = '#ef4444'; // Red
    cardGlow = 'glass-panel-glow-red border-cyber-red/50';
    safetyLabel = 'CRITICAL RISK - ANOMALOUS ACCESS';
  } else if (score < 80) {
    colorClass = 'text-cyber-blue text-glow-blue';
    strokeColor = '#3b82f6'; // Blue
    cardGlow = 'glass-panel-glow-blue border-cyber-blue/50';
    safetyLabel = 'Moderate Risk - Adaptive Step-up Enforced';
  }

  // Circular gauge config
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl mt-4">
      {/* Session Trust Score Card */}
      <div className={`p-6 rounded-2xl transition-all duration-500 ${cardGlow}`}>
        <h2 className="text-sm font-mono tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyber-blue" />
          Identity Assurance
        </h2>

        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-gray-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={strokeColor}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="trust-score-circle"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold font-mono tracking-tighter ${colorClass}`}>
                {score}
              </span>
              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Score</span>
            </div>
          </div>

          <div className="text-center mt-6">
            <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full border bg-black/40 ${
              score >= 80 ? 'border-cyber-green/30 text-cyber-green' :
              score >= 50 ? 'border-cyber-blue/30 text-cyber-blue' :
              'border-cyber-red/30 text-cyber-red animate-pulse'
            }`}>
              {safetyLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Active Session Metadata */}
      <div className="p-6 rounded-2xl glass-panel relative border border-white/10 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-mono tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-cyber-blue" />
            Identity Details
          </h2>

          <div className="space-y-4">
            <div className="p-3 bg-black/30 rounded-lg border border-white/5">
              <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">Active User</span>
              <span className="font-mono text-sm text-gray-200">{user?.email || 'N/A'}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-black/30 rounded-lg border border-white/5 flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">Device Fingerprint</span>
                  <span className="font-mono text-xs text-gray-300">{session?.deviceId || 'DEV-BOB-9842'}</span>
                </div>
              </div>

              <div className="p-3 bg-black/30 rounded-lg border border-white/5 flex items-center gap-2.5">
                <Network className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">IP Address</span>
                  <span className="font-mono text-xs text-gray-300">{session?.ip || '127.0.0.1'}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-black/30 rounded-lg border border-white/5 flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">Geographic Location</span>
                <span className="font-mono text-xs text-gray-300">{session?.location || 'Unknown Location'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-gray-500 font-mono text-right mt-4 italic">
          Metadata analyzed at edge node. Privacy-shield enabled.
        </div>
      </div>

      {/* Secure Action / Funds Transfer Card */}
      <div className="p-6 rounded-2xl glass-panel relative border border-white/10 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-mono tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-cyber-blue" />
            Secure Gateway Execution
          </h2>

          {txSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-cyber-green/10 border border-cyber-green/30">
              <p className="text-xs text-cyber-green font-mono">{txSuccess}</p>
            </div>
          )}

          {txError && (
            <div className="mb-4 p-3 rounded-lg bg-cyber-red/10 border border-cyber-red/30">
              <p className="text-xs text-cyber-red font-mono">{txError}</p>
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Account Holder Name</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="ex: Om Vaghela"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyber-blue"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">IFSC Code (Bank of Baroda)</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="ex: BARB0VJUNI"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyber-blue"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Account Number (BOB)</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="ex: 12345678901234"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyber-blue"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Transfer Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-gray-500">₹</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50,000"
                  className="w-full pl-7 pr-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyber-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-cyber-blue hover:bg-blue-600 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 border border-cyber-blue/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <Send className="w-3.5 h-3.5" />
              Send Funds
            </button>
          </form>
        </div>

        <p className="text-[9px] text-gray-500 font-mono mt-4">
          * High risk simulation triggers multi-factor transaction check.
        </p>
      </div>
    </div>
  );
}
