import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { UserInfo } from '../types';

interface IntroCardProps {
  onComplete: (info: UserInfo) => void;
}

const IntroCard: React.FC<IntroCardProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !school.trim()) return;
    
    setIsSubmitting(true);
    // Add a tiny delay for visual effect
    setTimeout(() => {
      onComplete({ name: name.trim(), school: school.trim(), isAnonymous: false });
    }, 400);
  };

  const handleSkip = () => {
    setIsSubmitting(true);
    setTimeout(() => {
        // Provide generic default values
      onComplete({ name: "同学", school: "理想院校", isAnonymous: true });
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/15 rounded-2xl shadow-2xl p-8 border border-white/30 text-center w-full max-w-md relative overflow-hidden"
    >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-300/80 via-purple-300/80 to-pink-300/80"></div>

        <div className="mb-6 flex justify-center">
             <div className="w-16 h-16 bg-white/40 rounded-full flex items-center justify-center text-indigo-700 shadow-sm ring-1 ring-white/50">
               <BookOpen className="w-8 h-8 opacity-90" />
             </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-artistic drop-shadow-sm">
            开启你的上岸之旅
        </h2>
        <p className="text-slate-700 mb-8 text-sm font-medium">
            输入信息生成专属祝福，或直接开启好运
        </p>

        <p className="text-xs text-slate-400 font-medium text-center -mt-6 mb-4">
          填写的信息仅用于本地展示与祝福生成
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 mb-1 ml-1 uppercase tracking-wider">你的名字 / 昵称</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：小明"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 focus:bg-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-500 text-slate-900 shadow-sm font-medium"
                    required
                />
            </div>
            
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-700 mb-1 ml-1 uppercase tracking-wider">目标院校</label>
                <input 
                    type="text" 
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="例如：北京大学"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 focus:bg-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-500 text-slate-900 shadow-sm font-medium"
                    required
                />
            </div>

            <button
                type="submit"
              disabled={!name.trim() || !school.trim() || isSubmitting}
                className="w-full mt-4 flex items-center justify-center px-8 py-3 text-lg font-medium text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-indigo-200/50 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
                {isSubmitting ? '开启中...' : '生成专属祝福'} 
                {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full mt-3 text-sm text-slate-700 hover:text-indigo-800 transition-colors py-2 font-medium"
            >
              跳过填写，直接获取祝福
            </button>
        </form>
    </motion.div>
  );
};

export default IntroCard;