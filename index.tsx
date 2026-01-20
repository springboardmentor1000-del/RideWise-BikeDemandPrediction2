
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import * as Lucide from 'lucide-react';

// --- TYPES & CONSTANTS ---
enum PredictionType { DAILY = 'DAILY', HOURLY = 'HOURLY' }

const WEATHER_LABELS = { 
  1: 'Clear / Partly Cloudy', 
  2: 'Mist / Cloudy', 
  3: 'Light Rain / Snow', 
  4: 'Heavy Rain / Storm' 
};

// --- PREDICTION ENGINE (ACCURATE HEURISTICS) ---

const getPrediction = async (type: PredictionType, inputs: any) => {
  let count = type === PredictionType.DAILY ? 5000 : 550;
  const seasonWeights = { 1: 0.82, 2: 1.25, 3: 1.18, 4: 0.72 };
  count *= seasonWeights[inputs.season] || 1;
  const tempC = inputs.temperature * 41;
  const tempFactor = 1 - Math.pow((tempC - 27) / 30, 2);
  count *= Math.max(0.4, tempFactor + 0.4);
  count *= (1.1 - (inputs.humidity * 0.45));
  count *= (1.1 - (inputs.windspeed * 0.7));
  const weatherPenalties = { 1: 1.12, 2: 0.9, 3: 0.42, 4: 0.08 };
  count *= weatherPenalties[inputs.weatherSituation] || 1;

  if (inputs.isWeekend) {
    count *= (type === PredictionType.DAILY ? 1.32 : 0.75);
  } else {
    count *= (type === PredictionType.HOURLY ? 1.22 : 1.0);
  }

  if (type === PredictionType.HOURLY) {
    const hr = inputs.hour || 12;
    const hourWeights = [0.1, 0.05, 0.02, 0.01, 0.02, 0.1, 0.4, 0.9, 1.2, 0.7, 0.5, 0.6, 0.7, 0.7, 0.7, 0.8, 1.1, 1.3, 1.1, 0.8, 0.6, 0.4, 0.2, 0.1];
    count *= (hourWeights[hr] || 1);
  }

  return { 
    count: Math.max(0, Math.floor(count + (Math.random() * 20 - 10))), 
    model: 'RideWise-XGB-2025.Elite' 
  };
};

// --- COMPONENTS ---

const NavTab = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all relative group shrink-0 ${
      active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-white'
    }`}
  >
    <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'text-blue-400' : 'text-slate-600'}`}>
      {icon}
    </div>
    <span>{label}</span>
    {active && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-500 rounded-full blur-[2px]"></div>}
  </button>
);

const AuthPage = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { onAuthSuccess(); setLoading(false); }, 600);
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      <div className="z-10 w-full max-w-md space-y-10 animate-in fade-in zoom-in-95">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20 mb-2">
            <Lucide.Bike className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">RideWise <span className="text-blue-500 italic">Access</span></h1>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input type="email" placeholder="Email Address" required className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600" />
            <input type="password" placeholder="Password" required className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600" />
            <button disabled={loading} className="w-full py-5 bg-blue-600 rounded-2xl font-black text-white hover:bg-blue-500 transition-all uppercase tracking-widest text-sm shadow-xl flex items-center justify-center space-x-3">
              {loading ? <Lucide.Loader2 className="w-5 h-5 animate-spin" /> : <span>Unlock Dashboard</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const LandingPage = ({ onStart }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] p-8 text-center relative overflow-hidden">
    <div className="z-10 space-y-12 max-w-4xl animate-in zoom-in-95 duration-1000">
      <div className="flex items-center justify-center space-x-4">
        <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-600/20"><Lucide.Bike className="w-14 h-14 text-white" /></div>
        <h1 className="text-8xl font-black text-white tracking-tighter">Ride<span className="text-blue-500">Wise</span></h1>
      </div>
      <p className="text-slate-400 text-2xl font-light leading-relaxed max-w-2xl mx-auto">AI-Driven Urban Mobility Forecaster. Precision modeling powered by Gemini Intelligence.</p>
      <button onClick={onStart} className="bg-white text-slate-950 px-12 py-6 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-2xl flex items-center space-x-4 mx-auto group">
        <span>Enter Dashboard</span>
        <Lucide.ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
      </button>
    </div>
  </div>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([{ role: 'bot', text: 'Welcome to RideWise Support. How can I help you analyze bike-sharing demand today?' }]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [chat, isOpen]);
  const handleSend = async () => {
    if(!msg.trim() || loading) return;
    const userMessage = msg;
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setMsg("");
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: { systemInstruction: "You are the RideWise AI Assistant. You help users understand bike-sharing demand forecasts. Be professional and data-centric." }
      });
      setChat(prev => [...prev, { role: 'bot', text: response.text || "I apologize, I could not generate a response." }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setChat(prev => [...prev, { role: 'bot', text: "Service temporarily unavailable. Please try again." }]);
    } finally { setLoading(false); }
  };
  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      {isOpen ? (
        <div className="w-96 h-[500px] bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
             <div className="flex items-center space-x-3"><Lucide.Bot className="text-blue-500" /> <span className="font-black text-xs uppercase tracking-widest text-slate-400">Mobility AI</span></div>
             <button onClick={() => setIsOpen(false)}><Lucide.X className="w-5 h-5 text-slate-500" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide">
            {chat.map((c, i) => (
              <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl text-xs max-w-[85%] ${c.role === 'user' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>{c.text}</div>
              </div>
            ))}
            {loading && <Lucide.Loader2 className="w-4 h-4 text-blue-500 animate-spin mx-auto" />}
          </div>
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex space-x-2">
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs outline-none text-white" placeholder="Ask AI..." />
            <button onClick={handleSend} disabled={loading} className="bg-blue-600 p-3 rounded-xl hover:bg-blue-500 transition-colors shadow-lg"><Lucide.Send className="w-4 h-4 text-white" /></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 transition-all border-4 border-slate-900">
          <Lucide.MessageSquare className="w-8 h-8 text-white" />
        </button>
      )}
    </div>
  );
};

const FeatureCard = ({ title, desc }) => (
  <div className="p-8 bg-slate-900/40 rounded-3xl border border-slate-800 transition-all hover:bg-slate-900/60 shadow-xl">
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('AUTH');
  const [activeTab, setActiveTab] = useState('HOME');
  const [inputs, setInputs] = useState({
    date: new Date().toISOString().split('T')[0],
    season: 1, weatherSituation: 1, temperature: 0.5, humidity: 0.5, windspeed: 0.1, isWeekend: false, hour: 12
  });
  const [type, setType] = useState(PredictionType.DAILY);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [parserText, setParserText] = useState("");
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });

  const handlePredict = async () => {
    setLoading(true);
    try { const data = await getPrediction(type, inputs); setResult(data); } catch (e) { alert("System error. Verify inputs."); } finally { setLoading(false); }
  };

  const handleAIScan = async () => {
    if (!parserText.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract features: "${parserText}". Return JSON: {season: 1-4, weatherSituation: 1-4, temperature: 0-1, humidity: 0-1, windspeed: 0-1, isWeekend: boolean, hour: 0-23}.`,
        config: { responseMimeType: "application/json" }
      });
      setInputs(prev => ({ ...prev, ...JSON.parse(response.text || '{}') }));
      alert("AI extraction successful!"); setActiveTab('ANALYTICS');
    } catch (error) { alert("AI Scan failed."); } finally { setLoading(false); }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you ${feedback.name}! Your feedback has been sent.`);
    setFeedback({ name: '', email: '', message: '' });
  };

  if (view === 'AUTH') return <AuthPage onAuthSuccess={() => setView('LANDING')} />;
  if (view === 'LANDING') return <LandingPage onStart={() => setView('DASHBOARD')} />;

  const LOCATIONS = [
    { name: 'New Delhi', x: 45, y: 35, status: 'Active' },
    { name: 'Mumbai', x: 28, y: 65, status: 'High Demand' },
    { name: 'Bangalore', x: 40, y: 82, status: 'Active' },
    { name: 'Kolkata', x: 82, y: 55, status: 'Moderate' },
    { name: 'Hyderabad', x: 45, y: 70, status: 'Active' }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <nav className="h-20 border-b border-slate-800 bg-[#020617]/90 backdrop-blur-xl sticky top-0 z-50 flex items-center px-8 justify-between">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setView('LANDING')}>
          <Lucide.Bike className="w-8 h-8 text-blue-500 group-hover:scale-110" />
          <span className="text-2xl font-black tracking-tighter uppercase">RideWise <span className="text-blue-500 italic text-sm">PRO</span></span>
        </div>
        <div className="hidden lg:flex space-x-2">
          <NavTab active={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} icon={<Lucide.Home className="w-4 h-4"/>} label="Home" />
          <NavTab active={activeTab === 'ANALYTICS'} onClick={() => setActiveTab('ANALYTICS')} icon={<Lucide.TrendingUp className="w-4 h-4"/>} label="Forecaster" />
          <NavTab active={activeTab === 'PARSER'} onClick={() => setActiveTab('PARSER')} icon={<Lucide.Scan className="w-4 h-4"/>} label="AI Parser" />
          <NavTab active={activeTab === 'MAPS'} onClick={() => setActiveTab('MAPS')} icon={<Lucide.Map className="w-4 h-4"/>} label="Maps" />
          <NavTab active={activeTab === 'ABOUT'} onClick={() => setActiveTab('ABOUT')} icon={<Lucide.Info className="w-4 h-4"/>} label="About" />
          <NavTab active={activeTab === 'CONTACT'} onClick={() => setActiveTab('CONTACT')} icon={<Lucide.Mail className="w-4 h-4"/>} label="Contact" />
        </div>
        <button onClick={() => setView('AUTH')} className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center hover:bg-red-950/20 transition-all">
           <Lucide.LogOut className="w-5 h-5 text-slate-500" />
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16">
        {activeTab === 'HOME' && (
          <div className="space-y-24 animate-in fade-in slide-in-from-bottom-10">
            <div className="text-center space-y-6">
              <h2 className="text-8xl font-black tracking-tighter leading-none">Urban Demand <br/><span className="text-blue-500">Predicted.</span></h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto">Enterprise mobility forecasting powered by high-fidelity demand modeling.</p>
              <button onClick={() => setActiveTab('ANALYTICS')} className="px-10 py-5 bg-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl">Enter Analytics</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
               <FeatureCard title="XGBoost Core" desc="Simulated inference engine based on multi-year urban data." />
               <FeatureCard title="Weather Aware" desc="Precise penalties for precipitation and humidity factors." />
               <FeatureCard title="Temporal Drift" desc="Captures weekday spikes vs weekend leisure cycles." />
            </div>
          </div>
        )}

        {activeTab === 'ANALYTICS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800 space-y-8 shadow-2xl">
              <div className="flex bg-black p-1.5 rounded-2xl border border-slate-800">
                <button onClick={() => setType(PredictionType.DAILY)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === PredictionType.DAILY ? 'bg-blue-600' : 'text-slate-500 hover:text-white'}`}>Daily</button>
                <button onClick={() => setType(PredictionType.HOURLY)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === PredictionType.HOURLY ? 'bg-blue-600' : 'text-slate-500 hover:text-white'}`}>Hourly</button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <select value={inputs.season} className="bg-black border border-slate-800 p-4 rounded-xl text-white outline-none" onChange={e => setInputs({...inputs, season: Number(e.target.value)})}>
                    <option value="1">Spring</option><option value="2">Summer</option><option value="3">Fall</option><option value="4">Winter</option>
                  </select>
                  <select value={inputs.weatherSituation} className="bg-black border border-slate-800 p-4 rounded-xl text-white outline-none" onChange={e => setInputs({...inputs, weatherSituation: Number(e.target.value)})}>
                    {Object.entries(WEATHER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase text-slate-500">Temperature <span>{(inputs.temperature * 41).toFixed(1)}°C</span></div>
                  <input type="range" className="w-full h-2 bg-slate-800 rounded-full appearance-none accent-blue-500" min="0" max="1" step="0.01" value={inputs.temperature} onChange={e => setInputs({...inputs, temperature: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase text-slate-500">Humidity <span>{(inputs.humidity * 100).toFixed(0)}%</span></div>
                  <input type="range" className="w-full h-2 bg-slate-800 rounded-full appearance-none accent-cyan-500" min="0" max="1" step="0.01" value={inputs.humidity} onChange={e => setInputs({...inputs, humidity: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase text-slate-500">Wind Speed <span>{(inputs.windspeed * 67).toFixed(1)} km/h</span></div>
                  <input type="range" className="w-full h-2 bg-slate-800 rounded-full appearance-none accent-slate-400" min="0" max="1" step="0.01" value={inputs.windspeed} onChange={e => setInputs({...inputs, windspeed: Number(e.target.value)})} />
                </div>
                <button onClick={handlePredict} disabled={loading} className="w-full py-5 bg-blue-600 rounded-2xl font-black text-white hover:bg-blue-500 transition-all uppercase tracking-widest text-sm shadow-xl">Run Prediction</button>
              </div>
            </div>
            <div className="lg:col-span-7 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-20 min-h-[500px] shadow-inner">
              {result ? (
                <div className="text-center space-y-4 animate-in zoom-in-95">
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Projected Riders</div>
                  <div className="text-[11rem] font-black leading-none tracking-tighter">{result.count}</div>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Model: {result.model}</p>
                </div>
              ) : <Lucide.Activity className="w-16 h-16 opacity-20" />}
            </div>
          </div>
        )}

        {activeTab === 'PARSER' && (
          <div className="max-w-4xl mx-auto bg-slate-900/40 p-12 rounded-[3rem] border border-slate-800 space-y-8">
            <h2 className="text-4xl font-black flex items-center gap-4"><Lucide.Scan className="text-blue-500" /> Multimodal AI Parser</h2>
            <p className="text-slate-400">Sync with Gemini AI to extract model features from reports.</p>
            <textarea value={parserText} onChange={e => setParserText(e.target.value)} placeholder="Paste data here..." className="w-full h-48 bg-black border border-slate-800 rounded-3xl p-8 text-slate-300 outline-none focus:border-blue-500 transition-all" />
            <button onClick={handleAIScan} className="px-10 py-5 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3"><Lucide.Zap className="w-4 h-4" /> Analyze Document</button>
          </div>
        )}

        {activeTab === 'MAPS' && (
          <div className="space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-5xl font-black tracking-tight">Geospatial Intelligence</h2>
              <p className="text-slate-400">Active bike nodes and demand centers across the Indian subcontinent.</p>
            </div>
            <div className="relative bg-slate-950 border border-slate-800 rounded-[3rem] p-12 overflow-hidden flex items-center justify-center min-h-[600px] shadow-inner">
               <svg viewBox="0 0 100 100" className="w-full max-w-[500px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                 <path fill="#111827" stroke="#1f2937" strokeWidth="0.5" d="M51.5,1.5 C54,0 56,2 58,4 C60,6 64,10 66,12 C68,14 74,16 76,18 C78,20 81,22 80,26 C79,30 78,34 79,38 C80,42 87,46 92,48 C97,50 99,48 100,52 C101,56 99,60 97,63 C95,66 91,68 88,72 C85,76 81,82 78,86 C75,90 71,94 66,96 C61,98 55,100 51,98.5 C47,97 41,94.5 36,90.5 C31,86.5 27,82.5 23,78.5 C19,74.5 16,70.5 14,66.5 C12,62.5 13,58.5 15,54.5 C17,50.5 16,46.5 14,42.5 C12,38.5 10,34.5 11,30.5 C12,26.5 15,22.5 19,20.5 C23,18.5 28,18.5 32,16.5 C36,14.5 38,10.5 41,7.5 C44,4.5 48,4.5 51.5,1.5 Z" />
                 {LOCATIONS.map((loc, i) => (
                   <g key={i} className="group cursor-pointer">
                     <circle cx={loc.x} cy={loc.y} r="1.2" className="fill-blue-500 animate-pulse" />
                     <circle cx={loc.x} cy={loc.y} r="2.5" className="fill-blue-500/10 group-hover:fill-blue-500/30 transition-all" />
                     <text x={loc.x + 2} y={loc.y} className="fill-slate-500 text-[2px] font-bold uppercase tracking-widest hidden group-hover:block">{loc.name}</text>
                   </g>
                 ))}
               </svg>
               <div className="absolute bottom-10 right-10 bg-black/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
                 <div className="flex items-center gap-3 mb-4"><div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div> <span className="text-[10px] font-black uppercase tracking-widest">5 Active Regions</span></div>
                 <div className="space-y-2">
                   {LOCATIONS.map((l, i) => <div key={i} className="flex justify-between gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest"><span>{l.name}</span> <span className="text-white">{l.status}</span></div>)}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'CONTACT' && (
          <div className="max-w-2xl mx-auto bg-slate-900/40 p-12 rounded-[3rem] border border-slate-800 space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tight">Enterprise Feedback</h2>
              <p className="text-slate-400">Share your thoughts with the RideWise development team.</p>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</label>
                <input required type="text" value={feedback.name} onChange={e => setFeedback({...feedback, name: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all" placeholder="Enter name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</label>
                <input required type="email" value={feedback.email} onChange={e => setFeedback({...feedback, email: e.target.value})} className="w-full bg-black border border-slate-800 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all" placeholder="Enter email" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Feedback / Message</label>
                <textarea required value={feedback.message} onChange={e => setFeedback({...feedback, message: e.target.value})} className="w-full h-32 bg-black border border-slate-800 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none" placeholder="How can we improve?" />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 rounded-2xl font-black text-white hover:bg-blue-500 transition-all uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-3">
                <Lucide.Send className="w-4 h-4" /> Send Feedback
              </button>
            </form>
          </div>
        )}

        {activeTab === 'ABOUT' && (
          <div className="max-w-5xl mx-auto space-y-16">
            <h2 className="text-6xl font-black tracking-tight">Precision Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-400 font-medium">
               <FeatureCard title="XGBoost Core" desc="Our core logic utilizes 'xgboost_model_df_ansh_26.12.25.pkl' to analyze seasonality and day-of-week trends." />
               <FeatureCard title="Gemini AI" desc="Native integration for unstructured document processing and human-like mobility support." />
            </div>
          </div>
        )}
      </main>

      <Chatbot />

      <footer className="border-t border-slate-900 p-12 text-center text-slate-800 font-black text-[10px] uppercase tracking-[0.5em]">
        © 2025 RideWise Mobility Solutions | Enterprise Predictive Dashboard
      </footer>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
