import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Shield, 
  LogOut, 
  LayoutDashboard, 
  User, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import LoginCard from './components/LoginCard';
import Dashboard from './components/Dashboard';
import RiskEngine from './components/RiskEngine';
import StepUpModal from './components/StepUpModal';
import AdminPanel from './components/AdminPanel';
import AdminConsoleView from './components/AdminConsoleView';
import { simulateRisk, transferFunds, getAdminMetrics } from './utils/api';

// Self-contained Transactions Audit Trail Table Component
function TransactionsTable({ refreshTrigger, currentUser }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAdminMetrics();
        // Filter events related to transactions and belong to the logged-in user
        const txs = data.logs.filter(
          log => (log.event.toLowerCase().includes('transfer') || 
                  log.event.toLowerCase().includes('transaction')) &&
                 (log.user === currentUser?.email || log.user === currentUser?.username)
        );
        setLogs(txs);
      } catch (err) {
        console.error('Failed to retrieve transactions list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [refreshTrigger, currentUser]);

  const getRiskColor = (risk) => {
    switch (risk.toUpperCase()) {
      case 'HIGH': return 'text-cyber-red bg-cyber-red/10 border-cyber-red/20';
      case 'MEDIUM': return 'text-cyber-blue bg-cyber-blue/10 border-cyber-blue/20';
      default: return 'text-cyber-green bg-cyber-green/10 border-cyber-green/20';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl text-center font-mono text-cyber-blue text-xs p-8">
        Querying transaction ledger stream...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl bg-black/40 border border-white/10 rounded-2xl p-6 glass-panel relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 uppercase tracking-widest text-[9px] pb-3">
              <th className="pb-3 font-semibold">Timestamp</th>
              <th className="pb-3 font-semibold">Sender Identity</th>
              <th className="pb-3 font-semibold">Transaction Details</th>
              <th className="pb-3 font-semibold text-center">Threat Risk</th>
              <th className="pb-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3.5 text-white font-semibold">{log.user}</td>
                <td className="py-3.5 text-gray-200">{log.event}</td>
                <td className="py-3.5 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColor(log.risk)}`}>
                    {log.risk}
                  </span>
                </td>
                <td className={`py-3.5 text-right font-semibold ${
                  log.status.toLowerCase().includes('blocked') ? 'text-cyber-red' :
                  log.status.toLowerCase().includes('step-up') ? 'text-cyber-blue' :
                  'text-cyber-green'
                }`}>
                  {log.status}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 font-mono">
                  No secure transaction attempts registered in current session audit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [riskVector, setRiskVector] = useState('Normal');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'profile', 'transactions'
  
  const isAdmin = user?.email === 'bob.security11@gmail.com';

  // Theme state & synchronization
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Success Overlay states & helper
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const triggerSuccessOverlay = (message, duration = 2500) => {
    setSuccessMessage(message);
    setShowSuccessOverlay(true);
    setTimeout(() => {
      setShowSuccessOverlay(false);
    }, duration);
  };

  // Transaction states for step-up challenge
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [txDetails, setTxDetails] = useState(null);
  const [activeCallbacks, setActiveCallbacks] = useState(null);

  // Trigger admin panels updates
  const [adminRefresh, setAdminRefresh] = useState(0);

  const handleLoginSuccess = (userData, sessionData) => {
    triggerSuccessOverlay("Access Authorized - Welcome to Sec-Ops Portal!");
    setUser(userData);
    setSession(sessionData);
    setRiskVector('Normal');
    if (userData.email === 'bob.security11@gmail.com') {
      setActiveTab('overview');
    } else {
      setActiveTab('dashboard');
    }
    setAdminRefresh(prev => prev + 1);
  };

  const handleLogout = () => {
    setShowLogoutOverlay(true);
    setTimeout(() => {
      setShowLogoutOverlay(false);
      setUser(null);
      setSession(null);
    }, 2000);
  };

  // Triggered when simulator slider options are selected
  const handleRiskVectorChange = async (newVector) => {
    setRiskVector(newVector);
    try {
      const res = await simulateRisk(newVector, user?.email);
      if (res.success && session) {
        setSession(prev => ({
          ...prev,
          trustScore: res.trustScore,
          riskLevel: res.riskLevel,
          ip: res.session.ip,
          location: res.session.location,
          deviceId: res.session.deviceId
        }));
        setAdminRefresh(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to notify gateway of simulation event.');
    }
  };

  // Called when user clicks "Send Funds" from dashboard
  const handleInitiateTransfer = async ({ amount, recipient, accountNumber, ifscCode, setTxSuccess, setTxError }) => {
    try {
      const res = await transferFunds(user.email, amount, recipient);
      const customMsg = `${user.username} sends funds to the ${recipient}`;
      
      if (res.success && res.status === 'completed') {
        setTxSuccess(customMsg);
        triggerSuccessOverlay(customMsg, 3500);
        setAdminRefresh(prev => prev + 1);
      } else if (res.status === 'step-up-required') {
        // High risk, request secondary authentication
        setTxDetails({ amount, recipient, accountNumber, ifscCode });
        setActiveCallbacks({ 
          setTxSuccess: () => {
            setTxSuccess(customMsg);
            triggerSuccessOverlay(customMsg, 3500);
          }, 
          setTxError 
        });
        setStepUpOpen(true);
      } else {
        setTxError(res.message || 'Transaction rejected.');
      }
    } catch (err) {
      setTxError('Security gateway connection timeout.');
    }
  };

  // Step-up verification succeeded
  const handleStepUpSuccess = (successMsg) => {
    if (activeCallbacks?.setTxSuccess) {
      activeCallbacks.setTxSuccess(successMsg);
    }
    setAdminRefresh(prev => prev + 1);
  };

  // 1. Logged Out View
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 md:p-8 relative">
        <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 border-b border-white/5 mb-8">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyber-blue text-glow-blue" />
            <span className="font-mono font-bold tracking-widest text-sm text-white">
              BOB IDENTITY TRUST FRAMEWORK
            </span>
          </div>
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-cyber-blue" /> : <Sun className="w-4 h-4 text-yellow-400" />}
          </button>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
          <LoginCard 
            onLoginSuccess={handleLoginSuccess} 
            onRegisterSuccess={(msg) => triggerSuccessOverlay(msg)}
          />
        </main>

        <footer className="w-full max-w-6xl mx-auto text-center border-t border-white/5 pt-8 mt-12 text-[10px] text-gray-600 font-mono tracking-widest uppercase">
          © 2026 Bank of Baroda Hackathon. All identity channels encrypted.
        </footer>
      </div>
    );
  }

  // 2. Logged In View: Branch into Admin Portal Layout or User Portal Layout
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#08080a] flex text-gray-100 relative">
        {/* Admin Left Sidebar */}
        <aside className="w-64 bg-[#0d0d0f] border-r border-white/5 flex flex-col justify-between p-6 shrink-0 relative">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyber-blue text-glow-blue" />
              <div>
                <span className="block font-mono font-bold tracking-widest text-xs text-white">
                  Sec-Ops Portal
                </span>
                <span className="block text-[8px] text-gray-500 font-mono uppercase tracking-wider">Security Control</span>
              </div>
            </div>

            {/* User profile snippet */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-1">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Logged In As</span>
              <span className="font-mono text-xs text-cyber-blue font-semibold truncate">
                {user.username}
              </span>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider border transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'bg-cyber-blue/10 border-cyber-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-cyber-blue" />
                Sec-Ops Overview
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider border transition-all duration-300 ${
                  activeTab === 'users'
                    ? 'bg-cyber-blue/10 border-cyber-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <User className="w-4 h-4 text-cyber-blue" />
                User Directory
              </button>
            </nav>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-cyber-red hover:bg-red-600 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl border border-cyber-red/40 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation Bar */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#09090b]/80 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs text-gray-400 uppercase tracking-widest">
              {activeTab === 'overview' && 'Security Operations Overview'}
              {activeTab === 'users' && 'System User Directory & Telemetry'}
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4 text-cyber-blue" /> : <Sun className="w-4 h-4 text-yellow-400" />}
              </button>

              {/* Secure status badge */}
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-cyber-green bg-cyber-green/10 border border-cyber-green/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
                Ops Engine Active
              </span>

              {/* Date Display */}
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-gray-400">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                19 June 2026
              </span>

              {/* User details badge */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs text-gray-300">
                <div className="w-5 h-5 rounded-full bg-cyber-blue flex items-center justify-center font-bold text-white uppercase text-[10px]">
                  A
                </div>
                <span className="font-semibold">Security Admin</span>
              </div>
            </div>
          </header>

          {/* Content Body */}
          <main className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6 flex flex-col items-center">
                <AdminPanel refreshTrigger={adminRefresh} />
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6 flex flex-col items-center">
                <AdminConsoleView 
                  token={session?.token} 
                  refreshTrigger={adminRefresh} 
                />
              </div>
            )}
          </main>
        </div>

        {/* Full screen success overlay with transparent light green style */}
        {showSuccessOverlay && (
          <div className="fixed inset-0 bg-cyber-green/15 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-fade-in transition-all duration-500">
            <div className="p-8 rounded-2xl glass-panel-glow-green border border-cyber-green/50 flex flex-col items-center gap-4 text-center max-w-sm mx-4 bg-[#0d0d0f]/90 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              <div className="w-16 h-16 rounded-full bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center animate-bounce">
                <ShieldCheck className="w-8 h-8 text-cyber-green text-glow-green" />
              </div>
              <h3 className="text-lg font-bold font-mono text-white tracking-wider uppercase text-glow-green">Success</h3>
              <p className="text-base sm:text-lg font-bold font-mono text-gray-200 leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Full screen logout success overlay with transparent light red style */}
        {showLogoutOverlay && (
          <div className="fixed inset-0 bg-cyber-red/15 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-fade-in transition-all duration-500">
            <div className="p-8 rounded-2xl glass-panel-glow-red border border-cyber-red/50 flex flex-col items-center gap-4 text-center max-w-sm mx-4 bg-[#0d0d0f]/90 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
              <div className="w-16 h-16 rounded-full bg-cyber-red/10 border border-cyber-red/30 flex items-center justify-center animate-bounce">
                <LogOut className="w-8 h-8 text-cyber-red text-glow-red" />
              </div>
              <h3 className="text-lg font-bold font-mono text-white tracking-wider uppercase text-glow-red">Success</h3>
              <p className="text-xs text-gray-200 font-mono leading-relaxed">Successfully Logout</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Normal User Portal Layout
  return (
    <div className="min-h-screen bg-[#08080a] flex text-gray-100 relative">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#0d0d0f] border-r border-white/5 flex flex-col justify-between p-6 shrink-0 relative">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyber-blue text-glow-blue" />
            <div>
              <span className="block font-mono font-bold tracking-widest text-xs text-white">
                Identity Trust Platform
              </span>
              <span className="block text-[8px] text-gray-500 font-mono uppercase tracking-wider">Identity Security</span>
            </div>
          </div>

          {/* User profile snippet */}
          <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-1">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Logged In As</span>
            <span className="font-mono text-xs text-cyber-blue font-semibold truncate">
              {user.username}
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider border transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-cyber-blue/10 border-cyber-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyber-blue" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider border transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-cyber-blue/10 border-cyber-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4 text-cyber-blue" />
              Profile
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider border transition-all duration-300 ${
                activeTab === 'transactions'
                  ? 'bg-cyber-blue/10 border-cyber-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-4 h-4 text-cyber-blue" />
              Transactions
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 bg-cyber-red hover:bg-red-600 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl border border-cyber-red/40 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#09090b]/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-2 font-mono text-xs text-gray-400 uppercase tracking-widest">
            {activeTab === 'dashboard' && 'Security Operations Dashboard'}
            {activeTab === 'profile' && 'User Secure Identity profile'}
            {activeTab === 'transactions' && 'Transactional Activity Logs'}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-cyber-blue" /> : <Sun className="w-4 h-4 text-yellow-400" />}
            </button>

            {/* Secure status badge */}
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-cyber-green bg-cyber-green/10 border border-cyber-green/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
              Secure
            </span>

            {/* Date Display */}
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              19 June 2026
            </span>

            {/* User details badge */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs text-gray-300">
              <div className="w-5 h-5 rounded-full bg-cyber-blue flex items-center justify-center font-bold text-white uppercase text-[10px]">
                {user.username.charAt(0)}
              </div>
              <span className="font-semibold">{user.username}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 flex flex-col items-center">
              {/* Header inside Dashboard */}
              <div className="w-full max-w-6xl flex flex-col justify-start mb-2">
                <h1 className="text-xl font-bold tracking-wider text-white">Security Dashboard</h1>
                <p className="text-xs text-gray-500 font-mono">Monitor users, transactions and fraud activity</p>
              </div>

              {/* Trust Scoring & session status */}
              <Dashboard 
                session={session} 
                user={user}
                onInitiateTransfer={handleInitiateTransfer} 
              />

              {/* Risk simulation triggers */}
              <RiskEngine 
                activeRisk={riskVector} 
                onRiskChange={handleRiskVectorChange} 
              />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 flex flex-col items-center">
              <div className="w-full max-w-2xl flex flex-col justify-start mb-2">
                <h1 className="text-xl font-bold tracking-wider text-white">User Profile</h1>
                <p className="text-xs text-gray-500 font-mono">Manage secure identity credentials</p>
              </div>

              {/* Profile Card */}
              <div className="w-full max-w-2xl bg-black/40 border border-white/15 rounded-2xl p-6 glass-panel relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
                
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <h2 className="text-sm font-mono tracking-widest text-gray-300 uppercase flex items-center gap-2">
                    <User className="w-4 h-4 text-cyber-blue" />
                    Identity Assurance Profile
                  </h2>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-cyber-green bg-cyber-green/10 border border-cyber-green/20 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green" /> Identity Verified
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl">
                      <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Username</span>
                      <span className="font-mono text-sm text-white font-semibold">{user.username}</span>
                    </div>
                    <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl">
                      <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Assurance Level</span>
                      <span className="font-mono text-sm text-cyber-blue font-semibold">Tier-1 Trust</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl">
                    <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Corporate Email Address</span>
                    <span className="font-mono text-sm text-white">{user.email}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl">
                      <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Registered Phone</span>
                      <span className="font-mono text-sm text-white">{user.phone || 'N/A'}</span>
                    </div>
                    <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl">
                      <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Aadhaar Number (UIDAI)</span>
                      <span className="font-mono text-sm text-white">{user.aadhaar || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6 flex flex-col items-center">
              <div className="w-full max-w-6xl flex flex-col justify-start mb-2">
                <h1 className="text-xl font-bold tracking-wider text-white">Transaction History</h1>
                <p className="text-xs text-gray-500 font-mono">Audit logs of all secure transfers</p>
              </div>

              {/* Transactions Table Widget */}
              <TransactionsTable refreshTrigger={adminRefresh} currentUser={user} />
            </div>
          )}
        </main>
      </div>

      {/* Secondary step-up MFA challenge overlay modal */}
      <StepUpModal
        isOpen={stepUpOpen}
        onClose={() => {
          setStepUpOpen(false);
          if (activeCallbacks?.setTxError) {
            activeCallbacks.setTxError('Transaction cancelled by user during MFA challenge.');
          }
        }}
        transactionDetails={txDetails}
        email={user?.email}
        trustScore={session?.trustScore}
        onVerificationSuccess={handleStepUpSuccess}
      />

      {/* Full screen success overlay with transparent light green style */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-cyber-green/15 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-fade-in transition-all duration-500">
          <div className="p-8 rounded-2xl glass-panel-glow-green border border-cyber-green/50 flex flex-col items-center gap-4 text-center max-w-sm mx-4 bg-[#0d0d0f]/90 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <div className="w-16 h-16 rounded-full bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center animate-bounce">
              <ShieldCheck className="w-8 h-8 text-cyber-green text-glow-green" />
            </div>
            <h3 className="text-lg font-bold font-mono text-white tracking-wider uppercase text-glow-green">Success</h3>
            <p className="text-base sm:text-lg font-bold font-mono text-gray-200 leading-relaxed">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Full screen logout success overlay with transparent light red style */}
      {showLogoutOverlay && (
        <div className="fixed inset-0 bg-cyber-red/15 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-fade-in transition-all duration-500">
          <div className="p-8 rounded-2xl glass-panel-glow-red border border-cyber-red/50 flex flex-col items-center gap-4 text-center max-w-sm mx-4 bg-[#0d0d0f]/90 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <div className="w-16 h-16 rounded-full bg-cyber-red/10 border border-cyber-red/30 flex items-center justify-center animate-bounce">
              <LogOut className="w-8 h-8 text-cyber-red text-glow-red" />
            </div>
            <h3 className="text-lg font-bold font-mono text-white tracking-wider uppercase text-glow-red">Success</h3>
            <p className="text-xs text-gray-200 font-mono leading-relaxed">Successfully Logout</p>
          </div>
        </div>
      )}
    </div>
  );
}

