import React, { useEffect, useState } from 'react';
import { Terminal, ShieldX, UserCheck, Eye, RefreshCw, Activity } from 'lucide-react';
import { getAdminMetrics } from '../utils/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AdminPanel({ refreshTrigger }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const data = await getAdminMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to retrieve security event stream.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Poll logs every 5 seconds for live simulation updates
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  if (loading || !metrics) {
    return (
      <div className="w-full max-w-6xl p-8 text-center text-cyber-blue font-mono">
        Connecting to Security Ops Gateway...
      </div>
    );
  }

  // Get color for risk severity
  const getRiskColor = (risk) => {
    switch (risk.toUpperCase()) {
      case 'HIGH': return 'text-cyber-red bg-cyber-red/10 border-cyber-red/20';
      case 'MEDIUM': return 'text-cyber-blue bg-cyber-blue/10 border-cyber-blue/20';
      default: return 'text-cyber-green bg-cyber-green/10 border-cyber-green/20';
    }
  };

  return (
    <div className="w-full max-w-6xl mt-8 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-cyber-blue animate-pulse" />
          <div>
            <h2 className="text-lg font-bold tracking-wider text-white">SEC-OPS INTEL CONSOLE</h2>
            <p className="text-xs text-gray-500 font-mono">Real-time risk scoring, insider audit logs, & threat intelligence</p>
          </div>
        </div>
        <button
          onClick={fetchMetrics}
          className="p-2 rounded border border-white/10 hover:border-cyber-blue/50 text-gray-400 hover:text-white transition-all bg-black/20"
          title="Force Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Cyber Threat Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-black/40 border border-cyber-red/20 shadow-[inset_0_0_10px_rgba(239,68,68,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Blocked ATO Incidents</span>
            <ShieldX className="w-4 h-4 text-cyber-red" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-cyber-red text-glow-red">
              {metrics.stats.blockedATO}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">attempts</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-black/40 border border-cyber-blue/20 shadow-[inset_0_0_10px_rgba(59,130,246,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Insider Threat Alerts</span>
            <Eye className="w-4 h-4 text-cyber-blue" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-cyber-blue text-glow-blue">
              {metrics.stats.insiderAccessAlerts}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">triggers</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-black/40 border border-cyber-green/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">KYC Fraud Intercepts</span>
            <UserCheck className="w-4 h-4 text-cyber-green" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-cyber-green text-glow-green">
              {metrics.stats.kycFraudPreventions}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">preventions</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts incident flow visualization */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel relative border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyber-blue" />
              Incidents Flow Matrix
            </h3>

            <div className="w-full h-64 bg-black/20 rounded-lg p-2 border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.charts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorATO" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInsider" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="hour" stroke="#6b7280" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121214',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: '#fff'
                    }}
                  />
                  <Area type="monotone" dataKey="ATO" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorATO)" name="Account Takeovers" />
                  <Area type="monotone" dataKey="Insider" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorInsider)" name="Insider Spike" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[9px] text-gray-500 font-mono mt-4">
            Visual threat matrix. Telemetry updated over RPC connection.
          </div>
        </div>

        {/* Live log list */}
        <div className="p-6 rounded-2xl glass-panel relative border border-white/10 flex flex-col justify-between">
          <div className="flex flex-col h-full">
            <h3 className="text-xs font-mono tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyber-blue animate-pulse" />
              Edge Security Stream
            </h3>

            <div className="flex-1 overflow-y-auto max-h-64 space-y-3 pr-1">
              {metrics.logs.map((log, idx) => (
                <div key={idx} className="p-2.5 rounded bg-black/40 border border-white/5 font-mono text-[10px] space-y-1.5 leading-normal">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${getRiskColor(log.risk)}`}>
                      {log.risk}
                    </span>
                  </div>
                  <div>
                    <span className="text-white font-semibold">{log.event}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>{log.user}</span>
                    <span className={`${
                      log.status.includes('Blocked') ? 'text-cyber-red' :
                      log.status.includes('Step-up') ? 'text-cyber-blue' :
                      'text-cyber-green'
                    }`}>{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
