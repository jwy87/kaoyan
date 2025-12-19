import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BubbleMessage, UserInfo } from '../types';
import { INITIAL_MESSAGES, PERSONALIZED_TEMPLATES, BUBBLE_COLORS } from '../constants';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

interface FloatingBubblesProps {
  userInfo: UserInfo | null;
  customMessages: string[];
  localHighlightText?: string | null;
  localHighlightNonce?: number;
}

const FloatingBubbles: React.FC<FloatingBubblesProps> = ({ userInfo, customMessages, localHighlightText, localHighlightNonce }) => {
  const [bubbles, setBubbles] = useState<BubbleMessage[]>([]);
  const recentTextsRef = useRef<string[]>([]);

  const getUniqueCustomCount = () => {
    const unique = new Set(
      customMessages
        .map((t) => t.trim())
        .filter(Boolean)
    );
    return unique.size;
  };

  const computeMix = (uniqueCustomCount: number, canPersonalize: boolean) => {
    // Targets are "overall" (among the 3 sources):
    // - if uniqueCustomCount < 10:   DB ~10%, personalized ~45%, built-in ~45%
    // - if 10 <= uniqueCustomCount < 30: each ~33%
    // - if uniqueCustomCount >= 30: DB ~50%, personalized ~25%, built-in ~25%
    // When there's no personalized (anonymous), we interpret targets as DB share only.

    if (uniqueCustomCount <= 0) {
      return {
        personalizedProbability: canPersonalize ? 0.25 : 0,
        dbProbabilityOverall: 0,
      };
    }

    if (!canPersonalize) {
      const dbProbabilityOverall = uniqueCustomCount < 10 ? 0.10 : uniqueCustomCount < 30 ? 0.33 : 0.50;
      return { personalizedProbability: 0, dbProbabilityOverall };
    }

    if (uniqueCustomCount < 10) {
      return { personalizedProbability: 0.45, dbProbabilityOverall: 0.10 };
    }
    if (uniqueCustomCount < 30) {
      return { personalizedProbability: 1 / 3, dbProbabilityOverall: 1 / 3 };
    }
    return { personalizedProbability: 0.25, dbProbabilityOverall: 0.50 };
  };

  const rememberText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const maxRecent = 8;
    const next = [...recentTextsRef.current, trimmed];
    recentTextsRef.current = next.slice(Math.max(0, next.length - maxRecent));
  };

  const pickNonRepeating = (pool: string[]) => {
    if (pool.length === 0) return '';

    const recentSet = new Set(recentTextsRef.current);
    const candidates = pool.filter((t) => !recentSet.has(t.trim()));
    const source = candidates.length > 0 ? candidates : pool;
    return source[Math.floor(Math.random() * source.length)] ?? '';
  };

  const createBubble = useCallback((overrides?: Partial<BubbleMessage>): BubbleMessage => {
    const id = Math.random().toString(36).substr(2, 9);
    const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

    // If caller provides explicit text (e.g. local highlight), respect it.
    let text = overrides?.text ?? '';

    if (!text) {
      // Chance to generate a personalized message if user info exists and is not anonymous.
      // Note: This competes with DB blessings; keep it low if you want DB bubbles to dominate.
      const canPersonalize = userInfo && !userInfo.isAnonymous;
      // Piecewise mix based on how many unique DB blessings we have.
      const uniqueCustomCount = getUniqueCustomCount();
      const { personalizedProbability, dbProbabilityOverall } = computeMix(uniqueCustomCount, Boolean(canPersonalize));
      if (canPersonalize && Math.random() < personalizedProbability) {
        const template = PERSONALIZED_TEMPLATES[Math.floor(Math.random() * PERSONALIZED_TEMPLATES.length)];
        text = template.replace("{name}", userInfo.name).replace("{school}", userInfo.school);
      } else {
        // Stable ratio between DB blessings and built-in blessings (independent of array sizes)
        const hasCustom = customMessages.length > 0;
        // Convert overall DB target into the probability inside the non-personalized branch.
        // DB_overall = (1 - personalizedProbability) * DB_inside
        const dbInside = (1 - personalizedProbability) > 0
          ? dbProbabilityOverall / (1 - personalizedProbability)
          : 0;
        const useCustom = hasCustom && Math.random() < dbInside;
        const pool = useCustom ? customMessages : INITIAL_MESSAGES;
        text = pickNonRepeating(pool);
      }
    }

    rememberText(text);

    return {
      id,
      text,
      x: Math.random() * 90 + 5, // 5% to 95% width
      size: 0.7 + Math.random() * 0.5, // 0.7x to 1.2x scale
      delay: 0,
      duration: 12 + Math.random() * 10, // Slower float: 12s to 22s
      color,
      ...overrides,
    };
  }, [userInfo, customMessages]);

  const generateInitialXPositions = useCallback((count: number) => {
    // Evenly distribute across the screen with small jitter, to reduce overlaps on first paint.
    const minX = 5;
    const maxX = 95;
    const span = maxX - minX;
    const step = count > 1 ? span / (count - 1) : span;
    const jitter = 2.5;

    return Array.from({ length: count }).map((_, index) => {
      const base = minX + index * step;
      const offset = (Math.random() * 2 - 1) * jitter;
      return clamp(base + offset, minX, maxX);
    });
  }, []);

  // Initial population
  useEffect(() => {
    const count = 12;
    const xs = generateInitialXPositions(count);
    const initialBubbles = Array.from({ length: count }).map((_, index) => {
      // Stagger the start to avoid many bubbles spawning at exactly the same time.
      return createBubble({
        x: xs[index],
        delay: index * 0.22,
      });
    });
    setBubbles(initialBubbles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Spawn a one-off, emphasized bubble locally after user adds a blessing.
  useEffect(() => {
    if (!localHighlightText || !localHighlightNonce) return;

    const highlightBubble = createBubble({
      text: localHighlightText,
      highlight: true,
      // Slightly center-biased so it reads as “yours” (style-only highlight; no size change).
      x: Math.random() * 20 + 40, // 40% to 60%
      duration: 14,
    });

    setBubbles((prev) => {
      const cleaned = prev.length > 20 ? prev.slice(1) : prev;
      return [...cleaned, highlightBubble];
    });
  }, [localHighlightText, localHighlightNonce, createBubble]);

  // Continuous spawner
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => {
        const newBubble = createBubble();
        // Keep max 20 bubbles
        const cleaned = prev.length > 20 ? prev.slice(1) : prev;
        return [...cleaned, newBubble];
      });
    }, 1800); // Add new bubble every 1.8s

    return () => clearInterval(interval);
  }, [createBubble]);

  const removeBubble = (id: string) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ y: "110vh", opacity: 0, x: `${bubble.x}vw` }}
            animate={{ 
              y: "-15vh", 
              // Keep visible through most of the travel; only fade near the top edge.
              opacity: [0, 0.9, 0.9, 0], 
            }}
            transition={{ 
              duration: bubble.duration, 
              ease: "linear",
              delay: bubble.delay,
              times: [0, 0.08, 0.92, 1],
            }}
            onAnimationComplete={() => removeBubble(bubble.id)}
            className={`absolute px-5 py-3 rounded-full border backdrop-blur-[2px] bg-opacity-70 flex items-center justify-center text-sm font-medium whitespace-nowrap ${bubble.color} ${bubble.highlight ? 'z-10 bg-opacity-90 border-2 border-white/80 shadow-lg ring-4 ring-indigo-300/70 outline outline-2 outline-white/50' : 'shadow-sm'}`}
            style={{ 
              scale: bubble.size,
              fontFamily: '"Zcool XiaoWei", serif'
            }}
          >
            {bubble.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FloatingBubbles;