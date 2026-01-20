
import React, { useState } from 'react';
import { PredictionInputs, PredictionType, Season, WeatherSituation, PredictionResult } from './types';
import PredictionForm from './components/PredictionForm';
import ResultsPanel from './components/ResultsPanel';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import AboutSection from './components/AboutSection';
import MapSection from './components/MapSection';
import ContactSection from './components/ContactSection';
import Chatbot from './components/Chatbot';
import TextParser from './components/TextParser';
import DeveloperPortal from './components/DeveloperPortal';
import { getBikePrediction } from './services/geminiService';
import { 
  Bike, 
  Info, 
  Home as HomeIcon, 
  TrendingUp, 
  Mail, 
  Sun, 
  User,
  LogOut,
  Map as MapIcon,
  ShieldCheck,
  Cpu,
  FileText,
  Code2
} from 'lucide-react';

const INITIAL_INPUTS: PredictionInputs = {
  date: new Date().toISOString().split('T')[0],
  season: Season.SPRING,
  weatherSituation: WeatherSituation.CLEAR,
  temperature: 0.45,
  humidity: 0.5,
  windspeed: 0.2,
  isWeekend: false,
  hour: 12
};

type Tab = 'HOME' | 'PREDICT' | 'PARSER' | 'DEVELOPER' | 'ABOUT' | 'MAPS' | 'CONTACT';

const App: React.FC = () => {
  const [view, setView] = useState<'AUTH' | 'LANDING' | 'DASHBOARD'>('AUTH');
  const [activeTab, setActiveTab] = useState<Tab>('PREDICT');
  const [inputs, setInputs] = useState<PredictionInputs>(INITIAL_INPUTS);
  const [type, setType] = useState<PredictionType>(PredictionType.DAILY);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const prediction = await getBikePrediction(type, inputs);
      setResult(prediction);
    } catch (err) {
      console.error(err);
      setError('System encountered a processing error. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => setView('LANDING');
  const handleLogout = () => setView('AUTH');

  if (view === 'AUTH') {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (view === 'LANDING') {
    return <LandingPage onStart={() => setView('DASHBOARD')} />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'HOME':
        return (
          <div className="py-12 space-y-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Hero Section */}
            <div className="text-center space-y-10">
              <div className="space-y-4">
                <div className="inline-block p-4 bg-slate-900 border border-slate-800 rounded-3xl mb-4 shadow-2xl">
                  <Bike className="w-12 h-12 text-blue-500" />
                </div>
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none">
                  Welcome to <br/>
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">RideWise</span>
                </h1>
                <h2 className="text-2xl font-bold text-slate-300 tracking-tight">Intelligence for Urban Mobility</h2>
              </div>
              
              <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                Your comprehensive command center for bike-sharing operations. 
                Harness predictive analytics to stay ahead of the city's pulse.
              </p>

              <div className="pt-4 flex items-center justify-center space-x-6">
                <button 
                  onClick={() => setActiveTab('PREDICT')}
                  className="group inline-flex items-center space-x-3 bg-blue-600 text-white font-black py-4 px-10 rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="uppercase tracking-widest text-sm text-nowrap">Launch Analysis</span>
                </button>
                <div className="hidden sm:flex items-center space-x-2 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified Models</span>
                </div>
              </div>
            </div>

            {/* Core System Section (Featuring Black Royal Enfield) */}
            <div className="max-w-5xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-[3.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
                <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[3.5rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden">
                  
                  {/* Glowing background accent inside the card */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                  {/* Black Royal Enfield Bullet Image Visual */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-[6px] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500">
                      <img 
                        src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop" 
                        alt="Black Royal Enfield"
                        className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md px-6 py-2 rounded-full border border-slate-800 shadow-xl whitespace-nowrap">
                       <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">"Ride simple. Ride true."</span>
                    </div>
                  </div>

                  {/* System Core Info */}
                  <div className="flex-1 text-center md:text-left space-y-6 z-10">
                    <div className="space-y-3">
                      <div className="inline-block px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">
                        System Architecture
                      </div>
                      <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Urban Mobility Core</h3>
                      <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
                        Engineered for the road. The RideWise platform combines pure mechanical aesthetics with bleeding-edge predictive logic, ensuring your fleet distribution is as classic and reliable as a timeless machine.
                      </p>
                    </div>

                    <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <div className="flex items-center space-x-2 px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <Cpu className="w-4 h-4" />
                        <span>XGBoost Optimization</span>
                      </div>
                      <div className="flex items-center space-x-2 px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Enterprise Secure</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <PerformanceCard 
                title="Active Rides"
                value="12,482"
                trend="+12%"
                color="text-blue-500"
              />
              <PerformanceCard 
                title="Efficiency"
                value="94.2%"
                trend="Stable"
                color="text-emerald-500"
              />
              <PerformanceCard 
                title="Model Load"
                value="RW-5.0"
                trend="Optimized"
                color="text-purple-500"
              />
            </div>
          </div>
        );
      case 'PREDICT':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-blue-600 text-white w-7 h-7 rounded-lg inline-flex items-center justify-center font-black text-xs">01</span>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Configure Parameters</h2>
              </div>
              <PredictionForm 
                inputs={inputs}
                type={type}
                onChange={setInputs}
                onTypeChange={setType}
                onPredict={handlePredict}
                loading={loading}
              />
            </div>
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-emerald-600 text-white w-7 h-7 rounded-lg inline-flex items-center justify-center font-black text-xs">02</span>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Analysis Result</h2>
              </div>
              <ResultsPanel result={result} />
            </div>
          </div>
        );
      case 'PARSER':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-indigo-600 text-white w-7 h-7 rounded-lg inline-flex items-center justify-center font-black text-xs">01</span>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Data Ingestion</h2>
              </div>
              <TextParser 
                onParsed={setInputs}
                onPredict={handlePredict}
                loading={loading}
              />
            </div>
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center space-x-3 mb-2">
                <span className="bg-blue-600 text-white w-7 h-7 rounded-lg inline-flex items-center justify-center font-black text-xs">02</span>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Prediction Output</h2>
              </div>
              <ResultsPanel result={result} />
            </div>
          </div>
        );
      case 'DEVELOPER':
        return <DeveloperPortal />;
      case 'ABOUT':
        return <AboutSection />;
      case 'MAPS':
        return <MapSection />;
      case 'CONTACT':
        return <ContactSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      <nav className="bg-[#020617]/95 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-50 px-4">
        <div className="max-w-7xl mx-auto flex items-center h-20">
          <div className="flex items-center space-x-3 mr-12 shrink-0">
            <div className="relative group cursor-pointer" onClick={() => setView('LANDING')}>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-[#020617] p-2.5 rounded-full border border-slate-800">
                <Bike className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">RideWise</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1 flex-grow justify-center overflow-x-auto">
            <NavTab active={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} icon={<HomeIcon className="w-4 h-4" />} label="Home" />
            <NavTab active={activeTab === 'PREDICT'} onClick={() => setActiveTab('PREDICT')} icon={<TrendingUp className="w-4 h-4" />} label="Manual" />
            <NavTab active={activeTab === 'PARSER'} onClick={() => setActiveTab('PARSER')} icon={<FileText className="w-4 h-4" />} label="Parser" />
            <NavTab active={activeTab === 'DEVELOPER'} onClick={() => setActiveTab('DEVELOPER')} icon={<Code2 className="w-4 h-4" />} label="API" />
            <NavTab active={activeTab === 'ABOUT'} onClick={() => setActiveTab('ABOUT')} icon={<Info className="w-4 h-4" />} label="About" />
            <NavTab active={activeTab === 'MAPS'} onClick={() => setActiveTab('MAPS')} icon={<MapIcon className="w-4 h-4" />} label="Maps" />
            <NavTab active={activeTab === 'CONTACT'} onClick={() => setActiveTab('CONTACT')} icon={<Mail className="w-4 h-4" />} label="Contact" />
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="flex items-center space-x-2 pl-4 border-l border-slate-800">
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Sun className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 group cursor-pointer" onClick={handleLogout}>
                <div className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center group-hover:bg-red-950/30 group-hover:border-red-900/50 transition-all">
                  <User className="w-4 h-4 text-slate-400 group-hover:hidden" />
                  <LogOut className="w-4 h-4 text-red-500 hidden group-hover:block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 min-h-[60vh]">
        {error && (
          <div className="mb-12 p-5 bg-red-950/30 border border-red-900/50 text-red-200 rounded-2xl flex items-center space-x-3 backdrop-blur-sm">
            <Info className="w-5 h-5 text-red-500" />
            <p className="font-medium">{error}</p>
          </div>
        )}
        {renderTabContent()}
      </main>

      <Chatbot />

      <footer className="bg-[#020617] border-t border-slate-900 text-slate-500 py-16 px-6 mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          <div className="flex items-center space-x-3">
            <Bike className="w-6 h-6 text-blue-600" />
            <span className="text-white font-black tracking-tight text-xl">RideWise</span>
          </div>
          <div className="flex space-x-12 text-sm font-semibold uppercase tracking-widest">
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Architecture</a>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-700">
            © 2024 RideWise Mobility Solutions
          </p>
        </div>
      </footer>
    </div>
  );
};

const PerformanceCard = ({ title, value, trend, color }: { title: string, value: string, trend: string, color: string }) => (
  <div className="p-8 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[2.5rem] transition-all hover:bg-slate-900/60 hover:border-slate-700 group shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{title}</div>
      <div className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">{trend}</div>
    </div>
    <div className={`text-4xl font-black tracking-tight ${color}`}>{value}</div>
  </div>
);

interface NavTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavTab: React.FC<NavTabProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2.5 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all relative group shrink-0 ${
      active 
      ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400' 
      : 'text-slate-400 hover:text-white'
    }`}
  >
    <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'text-cyan-400' : 'text-slate-500'}`}>
      {icon}
    </div>
    <span className="tracking-tight">{label}</span>
    {active && (
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-cyan-500 rounded-full blur-[2px]"></div>
    )}
  </button>
);

export default App;
