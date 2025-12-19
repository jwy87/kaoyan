import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PenTool, RefreshCw, X } from 'lucide-react';
import { generateBlessing } from '../services/openaiService';
import { AppState, UserInfo } from '../types';
import { LOADING_MESSAGES } from '../constants';

interface WishCardProps {
  userInfo: UserInfo;
  onStateChange: (state: AppState) => void;
  onBackToIntro: () => void;
}

const WishCard: React.FC<WishCardProps> = ({ userInfo, onStateChange, onBackToIntro }) => {
  const [wish, setWish] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      let index = 0;
      setLoadingText(LOADING_MESSAGES[0]);
      interval = setInterval(() => {
        index = (index + 1) % LOADING_MESSAGES.length;
        setLoadingText(LOADING_MESSAGES[index]);
      }, 1500); // Change text every 1.5s
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    setLoading(true);
    onStateChange(AppState.GENERATING);
    try {
      const result = await generateBlessing(userInfo);
      setWish(result);
      setShowResult(true);
      onStateChange(AppState.SHOW_WISH);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    onStateChange(AppState.IDLE);
    setWish("");
  };

  const isAnonymous = userInfo.isAnonymous;

  return (
    <div className="relative z-10 w-full max-w-md px-4">
      {/* Main Action Button Area */}
      {!showResult && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/50 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2 font-artistic">
            {isAnonymous ? "这位同学，坚持到底" : `${userInfo.name}，坚持就是胜利`}
          </h2>
          <p className="text-gray-600 mb-8">
            {isAnonymous ? (
              <>愿你的努力配得上你的梦想<br/>点击下方，抽取一份上岸祝福。</>
            ) : (
              <>为了心中的 {userInfo.school}<br/>点击下方，抽取一份专属你的上岸祝福。</>
            )}
          </p>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white transition-all duration-300 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-90 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${loading ? 'w-full' : ''}`}
          >
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="loading"
                className="flex items-center justify-center min-w-[200px]"
              >
                <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loadingText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {loadingText}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                key="idle" 
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                {isAnonymous ? "抽取上岸祝福" : "抽取专属祝福"}
              </motion.div>
            )}
          </button>

          <button
            type="button"
            onClick={onBackToIntro}
            disabled={loading}
            className="w-full mt-3 text-sm text-slate-700 hover:text-indigo-800 transition-colors py-2 font-medium"
          >
            返回填写信息
          </button>
        </motion.div>
      )}

      {/* Result Card Overlay */}
      {showResult && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 border-indigo-100 text-center relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

          <button 
            onClick={closeResult}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-6 flex justify-center">
             <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
               <PenTool className="w-8 h-8" />
             </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-6 font-artistic">
            致 {isAnonymous ? "准研究生" : `准研究生 ${userInfo.name}`}：
          </h3>

          <div className="mb-8 relative">
            <span className="text-4xl absolute -top-4 -left-2 text-indigo-200 font-serif">"</span>
            <p className="text-2xl text-gray-800 leading-relaxed font-artistic px-6">
              {wish}
            </p>
            <span className="text-4xl absolute -bottom-8 -right-2 text-indigo-200 font-serif">"</span>
          </div>

          <div className="flex justify-center space-x-4">
             <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              再抽一张
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WishCard;