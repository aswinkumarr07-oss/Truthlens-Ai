
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AuthenticityScanner from './components/AuthenticityScanner';
import SimulationLab from './components/SimulationLab';
import Settings from './components/Settings';
import History from './components/History';
import PreViralAlerts from './components/PreViralAlerts';
import { User, UserRole, ForensicReport, SupportedLanguage } from './types';
import { ShieldAlert, ShieldCheck, Lock, Phone, Volume2, WifiOff, Globe, Loader2, CheckCircle, Activity, ChevronRight, Hash } from 'lucide-react';
import { analyzeMedia } from './services/geminiService';
import { translations } from './translations';

const loginTranslations = {
  en: {
    gateway: "Secure Forensic Gateway",
    credentials: "Analyst Credentials",
    dialect: "Terminal Secret (Dialect)",
    enter: "Enter Terminal",
    accessId: "Access ID",
    mobile: "Mobile Link",
    node: "Accessing Secure Node",
    verified: "Verified",
    handshake: "Handshake Success",
    link: "Establishing Encrypted Link...",
    tagline: "Secure Forensic Gateway",
  },
  ta: {
    gateway: "பாதுகாப்பான தடயவியல் நுழைவாயில்",
    credentials: "ஆய்வாளர் சான்றுகள்",
    dialect: "முனைய ரகசியம் (password)",
    enter: "முனையத்திற்குள் நுழையுங்கள்",
    accessId: "அணுகல் ஐடி",
    mobile: "மொபைல் இணைப்பு",
    node: "பாதுகாப்பான முனை அணுகல்",
    verified: "சரிபார்க்கப்பட்டது",
    handshake: "கைமுறை வெற்றி",
    link: "மறைக்குறியாக்கப்பட்ட இணைப்பை நிறுவுகிறது...",
    tagline: "பாதுகாப்பான தடயவியல் நுழைவாயில்",
  }
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<ForensicReport[]>(() => {
    const saved = localStorage.getItem('tl_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('analyst@truthlens.ai');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLanguage, setLoginLanguage] = useState<SupportedLanguage>('en');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authComplete, setAuthComplete] = useState(false);

  const lt = loginTranslations[loginLanguage];

  useEffect(() => {
    localStorage.setItem('tl_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerVoiceAlert = (text: string, lang: SupportedLanguage = 'en') => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = lang === 'ta' ? 'ta-IN' : 'en-US';
    utterance.lang = targetLang;
    
    const voices = window.speechSynthesis.getVoices();
    let voice;
    if (user?.preferredVoice) {
      voice = voices.find(v => v.name === user.preferredVoice);
    }
    
    if (!voice) {
      voice = voices.find(v => v.lang === targetLang) || voices.find(v => v.lang.startsWith(lang));
    }

    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  const startSecureAccess = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setAuthComplete(true);
      setTimeout(() => {
        handleAuthSuccess();
      }, 800);
    }, 1500);
  };

  const handleAuthSuccess = () => {
    const newUser: User = {
      id: 'TRL-9981',
      email: loginEmail,
      phone: loginPhone || '+91',
      name: loginLanguage === 'ta' ? 'மூத்த ஆய்வாளர்' : 'Senior Auditor',
      role: UserRole.ANALYST,
      language: loginLanguage,
      voiceEnabled: true,
      age: 32,
      gender: 'male',
      dob: '1992-03-21'
    };
    setUser(newUser);
    setIsAuthenticated(true);
    const welcomeMsg = loginLanguage === 'ta' ? "முனைய அணுகல் அனுமதிக்கப்பட்டது." : "Terminal access granted.";
    triggerVoiceAlert(welcomeMsg, loginLanguage);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    startSecureAccess();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setIsAuthenticating(false);
    setAuthComplete(false);
    setLoginPassword('');
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => id !== item.id));
  };

  const handleClearHistory = () => {
    if (confirm("Permanently clear all forensic logs?")) {
      setHistory([]);
    }
  };

  const handleSyncReport = async (id: string) => {
    const report = history.find(r => r.id === id);
    if (!report || !isOnline) return;

    try {
      const base64 = report.mediaUrl.split(',')[1];
      const mimeType = report.mediaUrl.split(';')[0].split(':')[1];
      
      const neuralResult = await analyzeMedia(
        base64, 
        mimeType, 
        report.mediaType, 
        user?.language || 'en'
      );

      setHistory(prev => prev.map(r => r.id === id ? { ...neuralResult, isOfflineResult: false, syncStatus: 'synced' } : r));
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-black font-inter">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-20 animate-slow-pan grayscale" 
            alt="Security Terminal Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700 relative z-10">
          <div className="text-center">
            <div className="bg-emerald-500/10 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-6">
              <ShieldAlert className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">TruthLens<span className="text-emerald-500">AI</span></h1>
            <p className="mt-2 text-emerald-500/60 font-bold uppercase text-[9px] tracking-[0.5em]">{lt.tagline}</p>
          </div>

          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl backdrop-blur-3xl bg-black/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                  <button 
                    onClick={() => setLoginLanguage('en')}
                    className={`px-3 py-1 rounded-full text-[8px] font-black transition-all ${loginLanguage === 'en' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLoginLanguage('ta')}
                    className={`px-3 py-1 rounded-full text-[8px] font-black transition-all ${loginLanguage === 'ta' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                  >
                    தமிழ்
                  </button>
               </div>
            </div>

            {isAuthenticating ? (
              <div className="py-12 flex flex-col items-center space-y-8 animate-in fade-in zoom-in">
                <div className="relative w-28 h-28 flex items-center justify-center">
                   <div className={`absolute inset-0 border-4 rounded-full border-white/5 transition-all duration-500 ${authComplete ? 'border-emerald-500 scale-110 shadow-[0_0_30px_#10b981]' : 'border-t-emerald-500 animate-spin'}`} />
                   {authComplete ? (
                     <CheckCircle className="w-16 h-16 text-emerald-500 animate-in zoom-in" />
                   ) : (
                     <Activity className="w-12 h-12 text-emerald-500/40 animate-pulse" />
                   )}
                </div>
                <div className="text-center">
                   <h3 className="text-xl font-black text-white uppercase tracking-widest">
                     {authComplete ? lt.verified : lt.node}
                   </h3>
                   <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-1 font-mono">
                     {authComplete ? lt.handshake : lt.link}
                   </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">{lt.credentials}</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/40 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="email" 
                        value={loginEmail} 
                        onChange={(e) => setLoginEmail(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono placeholder:text-gray-700" 
                        placeholder={lt.accessId} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">{lt.mobile}</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/40 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="tel" 
                        value={loginPhone} 
                        onChange={(e) => setLoginPhone(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono placeholder:text-gray-700" 
                        placeholder="+91 00000 00000" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-2 tracking-widest">{lt.dialect}</label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/40 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="password" 
                        value={loginPassword} 
                        onChange={(e) => setLoginPassword(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono placeholder:text-gray-700" 
                        placeholder="••••••••" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full group py-5 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white rounded-2xl font-black text-xs shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 uppercase tracking-[0.2em] mt-8">
                  <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{lt.enter}</span>
                </button>
              </form>
            )}
          </div>
          
          <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest flex items-center justify-center space-x-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>TruthLens Secure Link • Node v4.5 Pro</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout}>
      {activeTab === 'dashboard' && <Dashboard history={history} />}
      {activeTab === 'scan' && <AuthenticityScanner onSaveHistory={(r) => setHistory([r, ...history])} user={user} />}
      {activeTab === 'sim-lab' && <SimulationLab />}
      {activeTab === 'history' && (
        <History 
          items={history} 
          onDelete={handleDeleteHistory} 
          onClearAll={handleClearHistory} 
          onSyncReport={handleSyncReport}
          isOnline={isOnline}
        />
      )}
      {activeTab === 'pre-viral' && <PreViralAlerts />}
      {activeTab === 'settings' && <Settings user={user} onUpdateUser={(u) => setUser({...user!, ...u})} />}
      
      {!isOnline && (
        <div className="fixed bottom-6 right-6 bg-amber-500 text-black px-4 py-2 rounded-full font-bold text-xs uppercase flex items-center space-x-2 shadow-2xl z-50 animate-in slide-in-from-right duration-300">
          <WifiOff className="w-4 h-4" />
          <span>Offline Operation</span>
        </div>
      )}
    </Layout>
  );
};

export default App;
