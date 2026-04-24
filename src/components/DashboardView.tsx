import React, { useMemo } from 'react';
import { Activity, Heart, Footprints, Moon, TrendingUp } from 'lucide-react';

const DashboardView: React.FC = () => {

  const categories = ['Work', 'Health', 'Growth', 'Social', 'Rest', 'Creativity'];
  
  // Calculate category weights based on tags or block types
  const balanceData = useMemo(() => {
    const weights = categories.map(() => 40 + Math.random() * 50); // Mock data for now
    return weights;
  }, []);

  const biometrics = {
    steps: 7432,
    sleep: 7.5,
    heart: 68,
    energy: 85
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 h-full flex flex-col">
      <header className="mb-12">
        <div className="flex items-center gap-3 text-[#6b705c] mb-4 font-black uppercase tracking-[0.3em] text-[10px]">
          <Activity className="w-4 h-4" /> Biometric Analysis
        </div>
        <h1 className="text-5xl font-black text-[#2f3e46] tracking-tighter">Life Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Life Balance Radar */}
        <section className="bg-white rounded-[3rem] p-10 shadow-xl shadow-black/5 border border-black/5 flex flex-col items-center justify-center">
           <h3 className="text-xs font-black text-[#a5a58d] uppercase tracking-widest mb-10">Equilibrium Compass</h3>
           <svg viewBox="0 0 400 400" className="w-full max-w-[300px] overflow-visible">
              {/* Radar background circles */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
                <circle key={r} cx="200" cy="200" r={150 * r} fill="none" stroke="#e0e2db" strokeWidth="1" strokeDasharray="4 4" />
              ))}
              {/* Axis lines */}
              {categories.map((c, i) => {
                const angle = (i / categories.length) * Math.PI * 2;
                const x = 200 + Math.cos(angle) * 150;
                const y = 200 + Math.sin(angle) * 150;
                return (
                  <g key={c}>
                    <line x1="200" y1="200" x2={x} y2={y} stroke="#e0e2db" strokeWidth="1" />
                    <text 
                      x={200 + Math.cos(angle) * 175} 
                      y={200 + Math.sin(angle) * 175} 
                      textAnchor="middle" 
                      className="text-[10px] font-black fill-[#a5a58d] uppercase tracking-tighter"
                    >
                      {c}
                    </text>
                  </g>
                );
              })}
              {/* Radar Shape */}
              <polygon 
                points={balanceData.map((w, i) => {
                  const angle = (i / categories.length) * Math.PI * 2;
                  const x = 200 + Math.cos(angle) * (1.5 * w);
                  const y = 200 + Math.sin(angle) * (1.5 * w);
                  return `${x},${y}`;
                }).join(' ')}
                fill="rgba(107, 112, 92, 0.2)"
                stroke="#6b705c"
                strokeWidth="3"
                className="animate-pulse"
              />
           </svg>
        </section>

        {/* Biometric Cards */}
        <div className="grid grid-cols-2 gap-6">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-black/5 flex flex-col justify-between group hover:border-[#6b705c]/20 transition-all">
              <Footprints className="w-8 h-8 text-orange-400 opacity-40 group-hover:opacity-100 transition-opacity" />
              <div>
                <div className="text-3xl font-black text-[#2f3e46]">{biometrics.steps}</div>
                <div className="text-[10px] font-black text-[#a5a58d] uppercase tracking-widest">Daily Steps</div>
              </div>
           </div>
           <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-black/5 flex flex-col justify-between group hover:border-[#6b705c]/20 transition-all">
              <Moon className="w-8 h-8 text-blue-400 opacity-40 group-hover:opacity-100 transition-opacity" />
              <div>
                <div className="text-3xl font-black text-[#2f3e46]">{biometrics.sleep}h</div>
                <div className="text-[10px] font-black text-[#a5a58d] uppercase tracking-widest">Rest Cycle</div>
              </div>
           </div>
           <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-black/5 flex flex-col justify-between group hover:border-[#6b705c]/20 transition-all">
              <Heart className="w-8 h-8 text-red-400 opacity-40 group-hover:opacity-100 transition-opacity" />
              <div>
                <div className="text-3xl font-black text-[#2f3e46]">{biometrics.heart}</div>
                <div className="text-[10px] font-black text-[#a5a58d] uppercase tracking-widest">Avg BPM</div>
              </div>
           </div>
           <div className="bg-[#6b705c] rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between text-white group">
              <TrendingUp className="w-8 h-8 text-white/40" />
              <div>
                <div className="text-3xl font-black">{biometrics.energy}%</div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Focus Potential</div>
              </div>
           </div>
        </div>
      </div>
      
      <div className="mt-8 p-8 bg-[#fdfbf7] rounded-[2rem] border border-black/5">
         <h4 className="text-[10px] font-black text-[#6b705c] uppercase tracking-[0.2em] mb-4">Correlation Insight</h4>
         <p className="text-sm font-medium text-[#52796f] leading-relaxed">
           Your **Creativity** and **Growth** scores are trending upwards alongside your average sleep duration. Consistent 7h+ rest cycles are correlating with a 25% increase in task completion velocity.
         </p>
      </div>
    </div>
  );
};

export default DashboardView;
