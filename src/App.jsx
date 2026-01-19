import { useState, useEffect, useCallback, useRef } from 'react';

// Sample texts for quick start
const SAMPLE_TEXTS = [
  {
    title: "The Art of Focus",
    text: "In our modern world filled with constant distractions, the ability to focus has become a superpower. Speed reading is not just about consuming words faster. It is about training your brain to process information more efficiently. When you practice regularly, you will notice improvements not only in reading speed but also in comprehension and retention. The key is to start slow, build confidence, and gradually increase your pace. Remember that speed without understanding is meaningless. Your goal should be to find the perfect balance between velocity and comprehension."
  },
  {
    title: "The Power of Habit",
    text: "Every habit starts with a psychological pattern called a habit loop. First there is a cue, a trigger that tells your brain to go into automatic mode. Then there is the routine, which can be physical, mental, or emotional. Finally there is the reward, which helps your brain figure out if this particular loop is worth remembering for the future. Over time, this loop becomes more and more automatic. The cue and reward become intertwined until a powerful sense of anticipation and craving emerges. Understanding this loop is the key to changing any habit in your life."
  },
  {
    title: "Digital Minimalism",
    text: "We have become increasingly dependent on our devices without fully considering the costs. Digital minimalism is a philosophy that helps you question what digital communication tools and behaviors add the most value to your life. It is motivated by the belief that intentionally and aggressively clearing away low-value digital noise, and optimizing your use of the tools that really matter, can significantly improve your life. This does not mean abandoning technology. Instead, it means using technology with greater intention and purpose."
  }
];

const SPEED_PRESETS = [
  { label: "Slow", wpm: 150 },
  { label: "Normal", wpm: 250 },
  { label: "Fast", wpm: 400 },
  { label: "Pro", wpm: 600 }
];

const calculateORP = (word) => {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return Math.floor(len * 0.25);
};

const WordWithORP = ({ word }) => {
  if (!word) return null;

  let letterStartIndex = 0;
  while (letterStartIndex < word.length && !/[a-zA-Z]/.test(word[letterStartIndex])) {
    letterStartIndex++;
  }

  const letters = word.slice(letterStartIndex).replace(/[^a-zA-Z]/g, '');
  const orpInLetters = calculateORP(letters);

  let letterCount = 0;
  let orpIndex = letterStartIndex;
  for (let i = letterStartIndex; i < word.length; i++) {
    if (/[a-zA-Z]/.test(word[i])) {
      if (letterCount === orpInLetters) {
        orpIndex = i;
        break;
      }
      letterCount++;
    }
  }

  const before = word.slice(0, orpIndex);
  const orp = word[orpIndex] || '';
  const after = word.slice(orpIndex + 1);

  return (
    <span className="orp-word">
      <span className="orp-before">{before}</span>
      <span className="orp-letter">{orp}</span>
      <span className="orp-after">{after}</span>
    </span>
  );
};

export default function App() {
  const [inputText, setInputText] = useState('');
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(250);
  const [showInput, setShowInput] = useState(true);
  const [viewMode, setViewMode] = useState('auto');
  const [showORPInfo, setShowORPInfo] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const timerRef = useRef(null);
  const [isActuallyMobile, setIsActuallyMobile] = useState(false);

  useEffect(() => {
    // Set viewport meta tag
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

    const checkMobile = () => {
      setIsActuallyMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isPhoneMode = viewMode === 'phone' || (viewMode === 'auto' && isActuallyMobile);
  const interval = (60 / wpm) * 1000;
  const currentWord = words[currentIndex] || '';
  const progress = words.length > 0 ? (currentIndex / (words.length - 1)) * 100 : 0;
  const wordCount = words.length;

  // Calculate time in seconds
  const totalTimeSeconds = wordCount > 0 ? Math.ceil((wordCount / wpm) * 60) : 0;
  const elapsedTimeSeconds = wordCount > 0 ? Math.floor((currentIndex / wpm) * 60) : 0;

  // Format time as M:SS or MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadText = useCallback((text) => {
    const parsed = text.split(/\s+/).filter(word => word.trim().length > 0);
    setWords(parsed);
    setCurrentIndex(0);
    setIsPlaying(false);
    setShowInput(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (isPlaying && words.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, interval, words.length]);

  const togglePlayPause = useCallback(() => {
    if (currentIndex >= words.length - 1 && !isPlaying) setCurrentIndex(0);
    setIsPlaying(prev => !prev);
  }, [currentIndex, words.length, isPlaying]);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const skipForward = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 5, words.length - 1));
  }, [words.length]);

  const skipBackward = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 5, 0));
  }, []);

  const handleSpeedChange = useCallback((newWpm) => {
    setWpm(Math.max(100, Math.min(1000, newWpm)));
  }, []);

  const loadNewText = () => {
    setShowInput(true);
    setInputText('');
    setWords([]);
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const loadSample = (sample) => setInputText(sample.text);

  useEffect(() => {
    if (isPhoneMode) return;

    const handleKeyDown = (e) => {
      if (showInput) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          skipBackward();
          break;
        case 'ArrowRight':
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleSpeedChange(wpm + 25);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleSpeedChange(wpm - 25);
          break;
        case 'KeyR':
          restart();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInput, wpm, isPhoneMode, togglePlayPause, skipBackward, skipForward, handleSpeedChange, restart]);

  const theme = darkMode ? {
    bg: '#0f0f0f',
    surface: '#1a1a1a',
    surfaceAlt: '#252525',
    border: '#333',
    text: '#e5e5e5',
    textSecondary: '#777',
    accent: '#ff6b4a',
    accentBg: '#2d1f1f',
    highlight: '#ff6b4a',
  } : {
    bg: '#FFF1E5',
    surface: '#FFF8F2',
    surfaceAlt: '#FFE4C9',
    border: '#E6D5C3',
    text: '#33302E',
    textSecondary: '#8B7355',
    accent: '#D4563C',
    accentBg: '#FFE4C9',
    highlight: '#D4563C',
  };

  return (
    <div className={`app ${isPhoneMode ? 'phone-mode' : 'desktop-mode'} ${darkMode ? 'dark' : 'light'}`}>
      <style>{`
        :root {
          --bg: ${theme.bg};
          --surface: ${theme.surface};
          --surface-alt: ${theme.surfaceAlt};
          --border: ${theme.border};
          --text: ${theme.text};
          --text-secondary: ${theme.textSecondary};
          --accent: ${theme.accent};
          --accent-bg: ${theme.accentBg};
          --highlight: ${theme.highlight};
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          height: 100%;
        }

        body {
          min-height: 100%;
          background: var(--bg);
          margin: 0;
        }

        #root {
          min-height: 100vh;
        }

        .app {
          min-height: 100vh;
          width: 100%;
          background: var(--bg);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: var(--text);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ===== HEADER ===== */
        .header {
          width: 100%;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
        }

        .header-inner {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .header-left {
          min-width: 80px;
        }

        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .header-center h1 {
          font-size: 1.125rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 80px;
          justify-content: flex-end;
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--accent);
          font-size: 0.875rem;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .back-btn:hover {
          background: var(--surface-alt);
        }

        .icon-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.125rem;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background: var(--surface-alt);
          color: var(--text);
        }

        .view-toggle {
          display: flex;
          gap: 2px;
          background: var(--border);
          padding: 3px;
          border-radius: 8px;
        }

        .view-btn {
          padding: 6px 8px;
          font-size: 0.625rem;
          font-weight: 600;
          background: transparent;
          color: var(--text-secondary);
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .view-btn.active {
          background: var(--surface);
          color: var(--text);
        }

        /* ===== MAIN WRAPPER ===== */
        .main-wrapper {
          width: 100%;
          max-width: 1200px;
          min-height: calc(100vh - 61px);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 24px;
        }

        .main-container {
          width: 100%;
          max-width: 680px;
          display: flex;
          flex-direction: column;
        }

        /* ===== INPUT VIEW ===== */
        .input-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 40px 0 60px;
        }

        .phone-mode .input-view {
          padding: 24px 0 40px;
        }

        .input-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .phone-mode .input-header {
          margin-bottom: 24px;
        }

        .input-title {
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .phone-mode .input-title {
          font-size: 1.5rem;
        }

        .input-subtitle {
          color: var(--text-secondary);
          font-size: 0.9375rem;
        }

        .textarea {
          width: 100%;
          height: 180px;
          padding: 16px;
          font-size: 1rem;
          font-family: inherit;
          color: var(--text);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }

        .textarea:focus {
          border-color: var(--accent);
        }

        .textarea::placeholder {
          color: var(--text-secondary);
        }

        .word-count {
          text-align: right;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin-top: 8px;
        }

        .input-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .btn {
          padding: 14px 24px;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          flex: 1;
          background: var(--accent);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          filter: brightness(1.1);
        }

        .btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover {
          background: var(--surface-alt);
        }

        /* ===== SAMPLES ===== */
        .samples-section {
          margin-top: 40px;
        }

        .phone-mode .samples-section {
          margin-top: 32px;
        }

        .samples-title {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .samples-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .desktop-mode .samples-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .sample-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .sample-card:hover {
          background: var(--surface-alt);
          border-color: var(--accent);
        }

        .sample-card h4 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .sample-card p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* ===== ORP INFO ===== */
        .orp-info-toggle {
          margin-top: 32px;
          text-align: center;
        }

        .orp-toggle-btn {
          background: none;
          border: none;
          color: var(--accent);
          font-size: 0.8125rem;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .orp-toggle-btn:hover {
          background: var(--surface-alt);
        }

        .orp-info-box {
          margin-top: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          text-align: left;
        }

        .orp-info-box h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--accent);
        }

        .orp-info-box p {
          font-size: 0.8125rem;
          color: var(--text);
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .orp-demo {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 16px 0;
          padding: 16px;
          background: var(--bg);
          border-radius: 8px;
        }

        .orp-demo-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'SF Mono', 'Consolas', monospace;
        }

        .orp-demo-label {
          font-size: 0.6875rem;
          color: var(--text-secondary);
          min-width: 60px;
        }

        .orp-demo-word {
          font-size: 1rem;
          letter-spacing: 0.5px;
        }

        /* ===== READING VIEW ===== */
        .reading-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .reading-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .phone-mode .reading-area {
          padding: 24px 16px;
        }

        /* ORP Styling */
        .orp-word {
          display: inline;
        }

        .orp-before {
          color: var(--text);
          font-weight: 600;
        }

        .orp-letter {
          color: var(--highlight);
          font-weight: 700;
        }

        .orp-after {
          color: var(--text-secondary);
          font-weight: 400;
        }

        .word-display {
          position: relative;
          text-align: center;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .orp-guide {
          position: absolute;
          top: -8px;
          bottom: -8px;
          left: 50%;
          width: 2px;
          background: linear-gradient(to bottom, transparent, var(--accent), transparent);
          opacity: 0.4;
          transform: translateX(-50%);
        }

        .word-container {
          padding: 28px 56px;
          background: var(--accent-bg);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 280px;
          min-height: 100px;
        }

        /* Desktop: Fixed size word container to prevent shifting */
        .desktop-mode .word-container {
          width: 420px;
          min-height: 120px;
        }

        .phone-mode .word-container {
          padding: 24px 40px;
          min-width: 200px;
          min-height: 80px;
        }

        .current-word {
          font-size: 3rem;
          font-weight: 600;
          text-align: center;
          white-space: nowrap;
        }

        .phone-mode .current-word {
          font-size: 2rem;
        }

        .reading-stats {
          display: flex;
          gap: 16px;
          margin-top: 20px;
          color: var(--text-secondary);
          font-size: 0.8125rem;
        }

        .swipe-hint {
          display: none;
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 12px;
        }

        .phone-mode .swipe-hint {
          display: block;
        }

        /* ===== PROGRESS ===== */
        .progress-section {
          padding: 0 24px;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .progress-container {
          width: 100%;
          max-width: 420px;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          transition: width 0.1s ease-out;
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          font-size: 0.625rem;
          color: var(--text-secondary);
        }

        /* ===== CONTROLS ===== */
        .controls-section {
          background: var(--surface);
          border-top: 1px solid var(--border);
          padding: 24px;
          width: 100%;
        }

        .controls-inner {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        .phone-mode .controls-section {
          padding: 20px 16px 32px;
        }

        .playback-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          margin-bottom: 20px;
        }

        .control-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--accent);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }

        .control-btn:active {
          transform: scale(0.95);
        }

        .control-btn svg {
          display: block;
        }

        .skip-btn {
          width: 52px;
          height: 52px;
          background: var(--surface-alt);
          border-radius: 50%;
          color: var(--accent);
        }

        .skip-btn:hover {
          background: var(--border);
        }

        .play-btn {
          width: 72px;
          height: 72px;
          background: var(--accent);
          border-radius: 50%;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .phone-mode .skip-btn {
          width: 56px;
          height: 56px;
        }

        .phone-mode .play-btn {
          width: 80px;
          height: 80px;
        }

        .phone-mode .play-btn svg {
          width: 32px;
          height: 32px;
        }

        .play-btn:hover {
          filter: brightness(1.1);
        }

        .speed-controls {
          width: 100%;
        }

        .speed-slider-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .speed-label {
          font-size: 0.5625rem;
          color: var(--text-secondary);
          min-width: 24px;
          text-align: center;
        }

        .speed-slider {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          outline: none;
        }

        .speed-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: var(--accent);
          border-radius: 50%;
          cursor: pointer;
        }

        .speed-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: var(--accent);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        .wpm-display {
          text-align: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 12px;
          font-variant-numeric: tabular-nums;
        }

        .speed-presets {
          display: flex;
          justify-content: center;
          gap: 6px;
        }

        .preset-btn {
          padding: 8px 14px;
          font-size: 0.6875rem;
          font-weight: 600;
          background: var(--bg);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }

        .preset-btn:hover {
          background: var(--surface-alt);
        }

        .preset-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .phone-mode .preset-btn {
          flex: 1;
          text-align: center;
          padding: 10px 8px;
        }

        .footer-actions {
          display: flex;
          justify-content: center;
          margin-top: 14px;
        }

        .link-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.6875rem;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .link-btn:hover {
          background: var(--surface-alt);
          color: var(--text);
        }

        .keyboard-hints {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .phone-mode .keyboard-hints {
          display: none;
        }

        .hint {
          font-size: 0.5625rem;
          color: var(--text-secondary);
        }

        .hint kbd {
          background: var(--border);
          padding: 2px 4px;
          border-radius: 3px;
          font-family: inherit;
          font-size: 0.5rem;
          margin-right: 2px;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 600px) {
          .view-toggle {
            display: none;
          }

          .header-inner {
            padding: 12px 16px;
          }

          .header-center h1 {
            font-size: 1rem;
          }

          .main-wrapper {
            padding: 0 16px;
          }
        }

        @media (min-width: 900px) {
          .main-container {
            max-width: 720px;
          }
        }

        @media (min-width: 1400px) {
          .main-container {
            max-width: 800px;
          }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            {!showInput && (
              <button className="back-btn" onClick={loadNewText}>
                ← Back
              </button>
            )}
          </div>

          <div className="header-center">
            <h1>Speed Reader</h1>
          </div>

          <div className="header-right">
            <div className="view-toggle">
              {['auto', 'desktop', 'phone'].map(mode => (
                <button
                  key={mode}
                  className={`view-btn ${viewMode === mode ? 'active' : ''}`}
                  onClick={() => setViewMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              className="icon-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? '☀' : '☾'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-wrapper">
        <div className="main-container">
          {showInput ? (
            <div className="input-view">
              <div className="input-header">
                <h2 className="input-title">Paste your text</h2>
                <p className="input-subtitle">Speed read with ORP technology</p>
              </div>

              <textarea
                className="textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type your text here..."
              />

              {inputText.trim() && (
                <p className="word-count">
                  {inputText.trim().split(/\s+/).filter(w => w).length} words
                </p>
              )}

              <div className="input-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => loadText(inputText)}
                  disabled={!inputText.trim()}
                >
                  Start Reading
                </button>
                {inputText && (
                  <button className="btn btn-secondary" onClick={() => setInputText('')}>
                    Clear
                  </button>
                )}
              </div>

              <div className="samples-section">
                <h3 className="samples-title">Or try a sample</h3>
                <div className="samples-grid">
                  {SAMPLE_TEXTS.map((sample, index) => (
                    <div
                      key={index}
                      className="sample-card"
                      onClick={() => loadSample(sample)}
                    >
                      <h4>{sample.title}</h4>
                      <p>{sample.text.split(' ').slice(0, 6).join(' ')}...</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="orp-info-toggle">
                <button
                  className="orp-toggle-btn"
                  onClick={() => setShowORPInfo(!showORPInfo)}
                >
                  {showORPInfo ? 'Hide' : 'What is'} ORP? {showORPInfo ? '↑' : '↓'}
                </button>

                {showORPInfo && (
                  <div className="orp-info-box">
                    <h4>Optimal Recognition Point</h4>
                    <p>
                      The ORP is the ideal fixation point in a word — typically 20-35% from the left — where your eye should focus for fastest recognition.
                    </p>

                    <div className="orp-demo">
                      <div className="orp-demo-row">
                        <span className="orp-demo-label">Normal:</span>
                        <span className="orp-demo-word">presentation</span>
                      </div>
                      <div className="orp-demo-row">
                        <span className="orp-demo-label">With ORP:</span>
                        <span className="orp-demo-word">
                          <span style={{fontWeight: 600, color: 'var(--text)'}}>pr</span>
                          <span style={{color: 'var(--accent)', fontWeight: 700}}>e</span>
                          <span style={{color: 'var(--text-secondary)'}}>sentation</span>
                        </span>
                      </div>
                    </div>

                    <p style={{marginBottom: 0}}>
                      Research shows this can speed up word recognition by up to 13%.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="reading-view">
              <div className="reading-area" onClick={togglePlayPause}>
                <div className="word-display">
                  <div className="orp-guide"></div>
                  <div className="word-container">
                    <div className="current-word">
                      <WordWithORP word={currentWord} />
                    </div>
                  </div>
                </div>

                <div className="reading-stats">
                  <span>{currentIndex + 1} / {wordCount}</span>
                  <span>•</span>
                  <span>{wpm} WPM</span>
                </div>

                <p className="swipe-hint">Tap to pause/play</p>
              </div>

              <div className="progress-section">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="progress-text">
                    <span>{formatTime(elapsedTimeSeconds)} / {formatTime(totalTimeSeconds)}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>

              <div className="controls-section">
                <div className="controls-inner">
                  <div className="playback-controls">
                    <button
                      className="control-btn skip-btn"
                      onClick={(e) => { e.stopPropagation(); skipBackward(); }}
                      aria-label="Skip backward"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/>
                      </svg>
                    </button>
                    <button
                      className="control-btn play-btn"
                      onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      className="control-btn skip-btn"
                      onClick={(e) => { e.stopPropagation(); skipForward(); }}
                      aria-label="Skip forward"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2V6z"/>
                      </svg>
                    </button>
                  </div>

                  <div className="speed-controls">
                    <div className="speed-slider-row">
                      <span className="speed-label">100</span>
                      <input
                        type="range"
                        className="speed-slider"
                        min="100"
                        max="1000"
                        step="25"
                        value={wpm}
                        onChange={(e) => handleSpeedChange(Number(e.target.value))}
                      />
                      <span className="speed-label">1000</span>
                    </div>

                    <div className="wpm-display">{wpm} WPM</div>

                    <div className="speed-presets">
                      {SPEED_PRESETS.map((preset) => (
                        <button
                          key={preset.wpm}
                          className={`preset-btn ${wpm === preset.wpm ? 'active' : ''}`}
                          onClick={() => handleSpeedChange(preset.wpm)}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="footer-actions">
                    <button className="link-btn" onClick={restart}>
                      ↺ Restart
                    </button>
                  </div>

                  <div className="keyboard-hints">
                    <span className="hint"><kbd>Space</kbd> Play/Pause</span>
                    <span className="hint"><kbd>←</kbd><kbd>→</kbd> Skip</span>
                    <span className="hint"><kbd>↑</kbd><kbd>↓</kbd> Speed</span>
                    <span className="hint"><kbd>R</kbd> Restart</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
