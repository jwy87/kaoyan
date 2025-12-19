import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FloatingBubbles from './components/FloatingBubbles';
import WishCard from './components/WishCard';
import IntroCard from './components/IntroCard';
import Footer from './components/Footer';
import BackgroundMusic from './components/BackgroundMusic';
import AddBlessingModal from './components/AddBlessingModal';
import { AppState, UserInfo } from './types';
import { GraduationCap, Heart, Send } from 'lucide-react';
import { fetchBlessings, saveBlessing } from './services/blessingApi';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [customMessages, setCustomMessages] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localHighlightText, setLocalHighlightText] = useState<string | null>(null);
  const [localHighlightNonce, setLocalHighlightNonce] = useState(0);

  // Load blessings from database on mount
  useEffect(() => {
    const loadBlessings = async () => {
      const messages = await fetchBlessings();
      if (messages.length > 0) {
        setCustomMessages(messages);
      }
    };
    loadBlessings();
  }, []);

  const handleIntroComplete = (info: UserInfo) => {
    setUserInfo(info);
    setAppState(AppState.IDLE);
  };

  const handleBackToIntro = () => {
    setUserInfo(null);
    setAppState(AppState.INTRO);
  };

  const handleAddBlessing = async (text: string) => {
    // Optimistic update for immediate UI feedback
    setCustomMessages(prev => [...prev, text]);

    // Trigger a one-off highlighted bubble locally (does not affect other users)
    setLocalHighlightText(text);
    setLocalHighlightNonce((n) => n + 1);
    
    // Save to database
    await saveBlessing(text);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-indigo-50 to-pink-50 overflow-hidden flex flex-col items-center justify-center font-serif">
      
      <BackgroundMusic shouldPlay={appState !== AppState.INTRO} />

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-[64px] opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-[64px] opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-[64px] opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Bubbles Layer */}
      <FloatingBubbles
        userInfo={userInfo}
        customMessages={customMessages}
        localHighlightText={localHighlightText}
        localHighlightNonce={localHighlightNonce}
      />

      {/* Main Content */}
      <main className="z-10 w-full flex flex-col items-center justify-center p-4 min-h-[60vh]">
        
        {/* Header Section */}
        <div className={`text-center mb-10 transition-all duration-700 ${appState === AppState.SHOW_WISH ? 'opacity-40 blur-[1px]' : 'opacity-100'}`}>
          <div className="inline-flex items-center justify-center p-3 mb-4 bg-white/60 backdrop-blur-sm rounded-full shadow-sm ring-1 ring-slate-900/5">
             <GraduationCap className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 tracking-tight font-artistic mb-4 drop-shadow-sm">
            一研为定
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-light max-w-lg mx-auto leading-relaxed">
            星光不问赶路人，时光不负有心人。<br />
            {userInfo && !userInfo.isAnonymous
              ? `祝 ${userInfo.name} 成功上岸 ${userInfo.school}。` 
              : '祝所有考研学子，一战成硕。'}
          </p>
        </div>

        {/* Content Switcher */}
        <AnimatePresence mode="wait">
          {appState === AppState.INTRO ? (
            <IntroCard key="intro" onComplete={handleIntroComplete} />
          ) : (
            userInfo && (
              <WishCard
                key="wish"
                userInfo={userInfo}
                onStateChange={setAppState}
                onBackToIntro={handleBackToIntro}
              />
            )
          )}
        </AnimatePresence>

      </main>

      {/* Floating Action Button for Adding Blessings (Always Visible) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed bottom-10 right-8 z-40"
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center justify-center focus:outline-none"
          title="添加祝福"
        >
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
          
          {/* Button Body */}
          <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 border-2 border-white/20">
            <Heart className="w-7 h-7 fill-current animate-pulse" />
            
            {/* Ping Effect */}
            <span className="absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-20 animate-ping"></span>
          </div>

          {/* Tooltip Label */}
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/80 backdrop-blur-md text-indigo-900 text-sm font-semibold rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none ring-1 ring-white/50">
            传递好运
            <div className="absolute top-1/2 -right-1.5 -mt-1 w-2 h-2 bg-white/80 rotate-45"></div>
          </span>
        </button>
      </motion.div>

      <AddBlessingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddBlessing} 
      />

      <Footer />
    </div>
  );
};

export default App;