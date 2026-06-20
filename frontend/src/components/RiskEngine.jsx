import React from 'react';
import { RadioReceiver, ShieldAlert, Cpu, AlertCircle } from 'lucide-react';

export default function RiskEngine({ activeRisk, onRiskChange }) {
  const vectors = [
    {
      id: 'Normal',
      name: 'Normal Behavior',
      risk: 'LOW RISK',
      score: '98/100',
      color: 'border-cyber-green/30 hover:border-cyber-green text-cyber-green',
      activeColor: 'bg-cyber-green/10 border-cyber-green shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      desc: 'Access matching normal behavior, known device fingerprint, and standard locations.'
    },
    {
      id: 'NewDevice',
      name: 'New Device Login',
      risk: 'MEDIUM RISK',
      score: '65/100',
      color: 'border-cyber-blue/30 hover:border-cyber-blue text-cyber-blue',
      activeColor: 'bg-cyber-blue/10 border-cyber-blue shadow-[0_0_15px_rgba(59,130,246,0.15)]',
      desc: 'Access from an unrecognized browser context/device. Requires standard verification.'
    },
    {
      id: 'ImpossibleTravel',
      name: 'Impossible Travel',
      risk: 'HIGH RISK / ATO',
      score: '24/100',
      color: 'border-cyber-red/30 hover:border-cyber-red text-cyber-red',
      activeColor: 'bg-cyber-red/10 border-cyber-red shadow-[0_0_15px_rgba(239,68,68,0.15)]',
      desc: 'Locations updated at velocity violating flight limits (Mumbai -> London in 5 minutes).'
    }
  ];

  return (
    <div className="w-full max-w-6xl p-6 rounded-2xl glass-panel relative border border-white/10 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <Cpu className="w-5 h-5 text-cyber-blue" />
        <div>
          <h2 className="text-sm font-mono tracking-widest text-gray-400 uppercase">Interactive Risk Simulation Engine</h2>
          <p className="text-[10px] text-gray-500 font-mono">Alter contextual signal values to verify adaptive authentication steps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vectors.map((vector) => {
          const isActive = activeRisk === vector.id;
          return (
            <button
              key={vector.id}
              onClick={() => onRiskChange(vector.id)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-300 ${
                isActive ? vector.activeColor : `${vector.color} bg-black/20`
              }`}
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold font-mono text-sm tracking-wide text-white">{vector.name}</span>
                  <span className="text-[10px] font-mono font-extrabold tracking-widest px-2 py-0.5 rounded border border-white/5 bg-black/40">
                    {vector.risk}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-sans leading-relaxed">{vector.desc}</p>
              </div>

              <div className="mt-4 flex items-center justify-between w-full pt-3 border-t border-white/5">
                <span className="text-[10px] font-mono tracking-wider uppercase text-gray-500">Target Score</span>
                <span className="font-mono text-sm font-semibold text-white">{vector.score}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-cyber-blue/5 border border-cyber-blue/10 rounded-lg flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-cyber-blue shrink-0" />
        <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
          <strong>Dynamic Adaptive Logic</strong>: In low risk mode, security operations allow instant processing of secure tasks. Changing the vector to Medium/High updates the server's session parameters immediately, prompting automatic step-up challenges for high-value actions.
        </p>
      </div>
    </div>
  );
}
