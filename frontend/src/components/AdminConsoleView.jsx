import React, { useEffect, useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  Search, 
  User, 
  CreditCard, 
  RefreshCw, 
  Terminal, 
  ShieldAlert, 
  Info,
  TrendingUp
} from 'lucide-react';
import { getAdminUsersSummary } from '../utils/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AdminConsoleView({ token, refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUserIds, setExpandedUserIds] = useState(new Set());

  const fetchUsersSummary = async () => {
    try {
      const data = await getAdminUsersSummary(token);
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Failed to fetch user directory.');
      }
    } catch (err) {
      setError(err.message || 'Gateway connection timeout.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsersSummary();
    }
  }, [token, refreshTrigger]);

  const toggleFolder = (userId) => {
    const next = new Set(expandedUserIds);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }
    setExpandedUserIds(next);
  };

  const getRiskColor = (risk) => {
    switch (risk?.toUpperCase()) {
      case 'HIGH': return 'text-cyber-red bg-cyber-red/10 border-cyber-red/20';
      case 'MEDIUM': return 'text-cyber-blue bg-cyber-blue/10 border-cyber-blue/20';
      default: return 'text-cyber-green bg-cyber-green/10 border-cyber-green/20';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl p-8 text-center text-cyber-blue font-mono">
        Decrypting secure user directory...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl p-8 text-center text-cyber-red font-mono border border-cyber-red/20 rounded-xl bg-cyber-red/5">
        Error: {error}
      </div>
    );
  }

  // Filtering
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalUsers = users.length;
  const totalTxs = users.reduce((sum, u) => sum + u.transactions.length, 0);
  const avgRisk = users.length > 0 
    ? Math.round(users.reduce((sum, u) => {
        const userAvg = u.transactions.length > 0
          ? u.transactions.reduce((s, tx) => s + tx.risk_score, 0) / u.transactions.length
          : 0;
        return sum + userAvg;
      }, 0) / users.length)
    : 0;

  return (
    <div className="w-full max-w-6xl mt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-cyber-blue animate-pulse" />
          <div>
            <h2 className="text-lg font-bold tracking-wider text-white">ADMINISTRATOR USER DIRECTORY</h2>
            <p className="text-xs text-gray-500 font-mono">Manage corporate profiles, transaction audit sheets, and custom analytics telemetry</p>
          </div>
        </div>
        <button
          onClick={fetchUsersSummary}
          className="p-2 rounded border border-white/10 hover:border-cyber-blue/50 text-gray-400 hover:text-white transition-all bg-black/20"
          title="Force Refresh Directory"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-black/40 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Total User Accounts</span>
            <User className="w-4 h-4 text-cyber-blue" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {totalUsers}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">registered</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-black/40 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Secure Logs Captured</span>
            <CreditCard className="w-4 h-4 text-cyber-green" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-cyber-green text-glow-green">
              {totalTxs}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">transfers</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-black/40 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Average Network Risk</span>
            <ShieldAlert className="w-4 h-4 text-cyber-red" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-cyber-red text-glow-red">
              {avgRisk}%
            </span>
            <span className="text-[10px] text-gray-500 font-mono">severity</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-500" />
        </span>
        <input
          type="text"
          placeholder="Search user profiles by username or corporate email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue transition-all"
        />
      </div>

      {/* Directory Folders */}
      <div className="space-y-4">
        {filteredUsers.map((u) => {
          const isExpanded = expandedUserIds.has(u.id);
          const hasRiskTx = u.transactions.some(tx => tx.risk_score >= 70 || tx.status === 'BLOCKED');

          return (
            <div 
              key={u.id} 
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isExpanded 
                  ? 'bg-black/60 border-cyber-blue shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                  : 'bg-black/30 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Folder Header */}
              <div 
                onClick={() => toggleFolder(u.id)}
                className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-cyber-blue">
                    {isExpanded ? (
                      <FolderOpen className="w-5 h-5 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] text-cyber-blue" />
                    ) : (
                      <Folder className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-mono text-xs font-semibold text-white block">
                      {u.username}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500 block">
                      {u.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Indicators */}
                  <span className="font-mono text-[9px] text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                    {u.transactions.length} Transactions
                  </span>
                  
                  {hasRiskTx ? (
                    <span className="font-mono text-[9px] text-cyber-red bg-cyber-red/10 border border-cyber-red/20 px-2 py-0.5 rounded animate-pulse font-semibold">
                      Anomaly Risk Detected
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] text-cyber-green bg-cyber-green/10 border border-cyber-green/20 px-2 py-0.5 rounded font-semibold">
                      Verified Safe
                    </span>
                  )}

                  <span className="text-[10px] text-gray-500 font-mono">
                    {isExpanded ? 'Collapse [-]' : 'Expand [+]'}
                  </span>
                </div>
              </div>

              {/* Folder Body (Expanded Content) */}
              {isExpanded && (
                <div className="border-t border-white/5 p-6 space-y-6 bg-black/40">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Column 1 & 2: User profile & transactions */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Profile Grid */}
                      <div className="glass-panel p-5 rounded-xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
                        <h4 className="text-xs font-mono tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
                          <User className="w-4 h-4 text-cyber-blue" />
                          Corporate Account Details
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3 bg-black/30 border border-white/5 rounded-xl font-mono">
                            <span className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Aadhaar (UIDAI Verified)</span>
                            <span className="text-xs text-white font-semibold">{u.aadhaar}</span>
                          </div>
                          
                          <div className="p-3 bg-black/30 border border-white/5 rounded-xl font-mono">
                            <span className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Assurance Phone</span>
                            <span className="text-xs text-white font-semibold">{u.phone}</span>
                          </div>

                          <div className="p-3 bg-black/30 border border-white/5 rounded-xl font-mono">
                            <span className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Security Level</span>
                            <span className="text-xs text-cyber-blue font-bold">Tier-1 Access Control</span>
                          </div>

                          <div className="p-3 bg-black/30 border border-white/5 rounded-xl font-mono">
                            <span className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Account Enrolled</span>
                            <span className="text-xs text-white">
                              {new Date(u.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Table */}
                      <div className="glass-panel p-5 rounded-xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyber-green to-transparent"></div>
                        <h4 className="text-xs font-mono tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-cyber-green" />
                          Transaction Audit Sheet
                        </h4>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-mono text-[10px] border-collapse">
                            <thead>
                              <tr className="border-b border-white/5 text-gray-500 uppercase tracking-widest text-[8px] pb-2">
                                <th className="pb-2 font-semibold">Transaction ID</th>
                                <th className="pb-2 font-semibold">Recipient</th>
                                <th className="pb-2 font-semibold text-center">Threat Risk</th>
                                <th className="pb-2 font-semibold">Amount</th>
                                <th className="pb-2 font-semibold text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {u.transactions.map((tx) => (
                                <tr key={tx.transaction_id} className="hover:bg-white/5 transition-colors">
                                  <td className="py-2 text-gray-400 font-semibold max-w-[120px] truncate" title={tx.transaction_id}>
                                    {tx.transaction_id}
                                  </td>
                                  <td className="py-2 text-white">{tx.receiver}</td>
                                  <td className="py-2 text-center">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${getRiskColor(tx.risk_score >= 75 ? 'HIGH' : tx.risk_score >= 35 ? 'MEDIUM' : 'LOW')}`}>
                                      {tx.risk_score}%
                                    </span>
                                  </td>
                                  <td className="py-2 text-white font-semibold">
                                    ₹{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                  </td>
                                  <td className={`py-2 text-right font-bold ${
                                    tx.status === 'BLOCKED' ? 'text-cyber-red' :
                                    tx.status === 'PENDING' ? 'text-cyber-blue' :
                                    'text-cyber-green'
                                  }`}>
                                    {tx.status}
                                  </td>
                                </tr>
                              ))}
                              {u.transactions.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-6 text-center text-gray-500">
                                    No transaction audit entries registered.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>

                    {/* Column 3: Analytics Chart */}
                    <div className="lg:col-span-1">
                      <div className="glass-panel p-5 rounded-xl border border-white/10 relative overflow-hidden h-full flex flex-col justify-between">
                        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
                        
                        <div>
                          <h4 className="text-xs font-mono tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-cyber-blue" />
                            Financial Telemetry
                          </h4>

                          <div className="w-full h-56 bg-black/20 rounded-lg p-1 border border-white/5 mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={u.chart_data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                                <defs>
                                  <linearGradient id={`colorAmt-${u.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#121214',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontFamily: 'monospace',
                                    fontSize: 10,
                                    color: '#fff'
                                  }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="amount" 
                                  stroke="#3b82f6" 
                                  strokeWidth={2} 
                                  fillOpacity={1} 
                                  fill={`url(#colorAmt-${u.id})`} 
                                  name="Transfer (₹)" 
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 font-mono text-[9px] text-gray-500 leading-normal flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                          <span>Interactive telemetry trends representing transaction velocity and frequency metrics.</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-gray-500 font-mono text-xs border border-dashed border-white/10 rounded-2xl bg-black/10">
            No matching corporate identity files found.
          </div>
        )}
      </div>
    </div>
  );
}
