import React, { useState, useEffect, useRef } from 'react';
import { generateContentAction } from './app/actions';
import { AppMode, Flashcard, QuizItem, InfographicContent, MindmapLayout, FlashcardLayout, QuizLayout, SummaryLayout, InfographicLayout } from './types';
import MermaidRenderer from './components/MermaidRenderer';
import FlashcardViewer from './components/FlashcardViewer';
import QuizViewer from './components/QuizViewer';
import InfographicViewer from './components/InfographicViewer';
import Toast from './components/Toast';
import PricingModal from './components/PricingModal';
import AuthModal from './components/AuthModal';
import LimitModal from './components/LimitModal';
import LandingPage from './components/LandingPage';
import ExportModal from './components/ExportModal';
import OnboardingModal from './components/OnboardingModal';
import TemplatesModal from './components/TemplatesModal';
import { EmptyState, LoadingState } from './components/CanvasStates';
import BrandLogo from './components/BrandLogo';

// Icons (Refined, minimal stroke)
const Icons = {
  Mindmap: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C7 2 2.5 5 2.5 5M21.5 5C21.5 5 17 2 12 2"/><path d="M12 22C17 22 21.5 19 21.5 19M2.5 19C2.5 19 7 22 12 22"/><circle cx="12" cy="12" r="3"/><path d="M12 9V5"/><path d="M12 15v4"/><path d="M15 12h4"/><path d="M5 12h4"/></svg>,
  Flashcards: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 6V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/></svg>,
  Quiz: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Summary: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Infographic: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Copy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Sparkles: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>,
  Lock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Google: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.107-2.107 2.733-5.333 2.733-7.933 0-.52-.053-1.04-.133-1.48H12.48z"/></svg>,
  Bolt: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  FileText: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Save: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  More: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  Cross: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Layout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  Template: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  Structure: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  ChevronDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Refresh: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Video: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
};

const EXAMPLES = {
  PHOTOSYNTHESIS: `Photosynthesis converts sunlight into chemical energy. Light reactions produce ATP and NADPH. The Calvin cycle uses those to produce glucose. Most plants, algae, and cyanobacteria perform photosynthesis; such organisms are called photoautotrophs.`
};

// --- Empty State Templates ---

const STARTER_TEMPLATES = [
  {
    id: 'study',
    title: 'Study Notes',
    desc: 'Turn class notes or textbook content into clear, structured understanding.',
    placeholder: 'Paste your study notes or textbook paragraphs here. Focus on key concepts you want to remember.',
    icon: Icons.FileText
  },
  {
    id: 'youtube',
    title: 'YouTube Summary',
    desc: 'Summarize long videos into key ideas, takeaways, and visuals.',
    placeholder: 'Paste a YouTube video transcript or key points from a video.',
    icon: Icons.Video
  },
  {
    id: 'exam',
    title: 'Exam Revision',
    desc: 'Generate mindmaps, flashcards, and quizzes for fast revision.',
    placeholder: 'Paste exam syllabus topics, notes, or revision material.',
    icon: Icons.Quiz
  },
  {
    id: 'meeting',
    title: 'Meeting Notes',
    desc: 'Convert messy notes into clean summaries and action points.',
    placeholder: 'Paste meeting notes, discussion points, or rough bullet ideas.',
    icon: Icons.Users
  }
];

const MINDMAP_LAYOUTS: { id: MindmapLayout; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'flow', label: 'Flow' },
  { id: 'radial', label: 'Radial' },
  { id: 'chain', label: 'Chain' },
  { id: 'cluster', label: 'Vertical' }, 
];

const FLASHCARD_LAYOUTS: { id: FlashcardLayout; label: string }[] = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'qa', label: 'Q&A' },
  { id: 'keyword', label: 'Keyword' },
  { id: 'chunked', label: 'Chunked' },
  { id: 'scenario', label: 'Scenario' },
];

const QUIZ_LAYOUTS: { id: QuizLayout; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'mcq-heavy', label: 'MCQ Heavy' },
  { id: 'tf-speed', label: 'Speed T/F' },
  { id: 'scenario', label: 'Scenario' },
  { id: 'mixed', label: 'Mixed' },
];

const SUMMARY_LAYOUTS: { id: SummaryLayout; label: string }[] = [
  { id: 'executive', label: 'Executive' },
  { id: 'bullet', label: 'Bullet' },
  { id: 'story', label: 'Story' },
  { id: 'notes', label: 'Notes' },
  { id: 'infostructured', label: 'Structured' },
];

const INFOGRAPHIC_LAYOUTS: { id: InfographicLayout; label: string }[] = [
  { id: 'three_column', label: '3-Column' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'pillars', label: 'Pillars' },
  { id: 'flow', label: 'Flow' },
  { id: 'comparison', label: 'Comparison' },
];

export default function App() {
  // Safe initial state with defaults
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [mode, setMode] = useState<AppMode>(AppMode.MINDMAP);
  
  // Input State
  const [isInputMode, setIsInputMode] = useState<boolean>(false);
  const [activePlaceholder, setActivePlaceholder] = useState<string>("Paste your notes here to generate...");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // We use a generic layout state that can hold either type, but we cast it when calling service
  const [layout, setLayout] = useState<string>('classic');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'error' | 'success' } | null>(null);
  const [freeRuns, setFreeRuns] = useState<number>(3);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Modals state
  const [showPricing, setShowPricing] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [showLimit, setShowLimit] = useState<boolean>(false);
  const [showExport, setShowExport] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  
  // Mobile specific
  const [showMobileMore, setShowMobileMore] = useState<boolean>(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState<boolean>(false);
  const [showStickyBtn, setShowStickyBtn] = useState<boolean>(true);
  const lastScrollY = useRef<number>(0);

  // User Status (For Demo purposes, set to true to show premium export, toggleable via UI)
  const [isPro, setIsPro] = useState<boolean>(true);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    }
  }, []);

  // Update DOM when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Mobile Sticky Button Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide button when scrolling down more than 100px (reading content)
      // Show button when scrolling up (intent to act)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowStickyBtn(false);
      } else {
        setShowStickyBtn(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset layout when mode changes
  const handleModeChange = (newMode: AppMode) => {
      setMode(newMode);
      setOutput(null);
      setViewMode('visual');
      setError(null);
      
      // Set default layout based on mode
      if (newMode === AppMode.MINDMAP) setLayout('classic');
      else if (newMode === AppMode.FLASHCARDS) setLayout('qa');
      else if (newMode === AppMode.QUIZ) setLayout('classic');
      else if (newMode === AppMode.SUMMARY) setLayout('executive');
      else if (newMode === AppMode.INFOGRAPHIC) setLayout('three_column');
      else setLayout('classic'); // Default fallback
  };

  const handleTemplateSelect = (template: typeof STARTER_TEMPLATES[0]) => {
    setActivePlaceholder(template.placeholder);
    setIsInputMode(true);
    // Slight delay to ensure element is rendered before focus
    setTimeout(() => {
       textareaRef.current?.focus();
    }, 50);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const showToast = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToast({ msg, type });
  };

  const handleAuth = () => {
    setShowAuth(true);
  };

  const handleUpgrade = () => {
    setShowLimit(false);
    setShowPricing(true);
  }

  const handleStartApp = () => {
    setShowLanding(false);
    setShowOnboarding(true);
  };

  const handleTryExample = () => {
    setInputText(EXAMPLES.PHOTOSYNTHESIS);
    setIsInputMode(true);
    setShowLanding(false);
  };

  const handleSelectTemplate = (templateContent: string) => {
    setInputText(templateContent);
    setIsInputMode(true);
    setShowTemplates(false);
  };

  const handleGenerate = async () => {
    // Input validation
    if (!inputText || typeof inputText !== 'string' || !inputText.trim()) {
      showToast("Please enter some text first", "error");
      return;
    }

    if (freeRuns <= 0 && !isPro) {
      setShowLimit(true);
      return;
    }
    
    setLoading(true);
    setOutput(null);
    setError(null);

    // Scroll to output on mobile after short delay
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setTimeout(() => {
        const canvas = document.querySelector('.canvas-column');
        canvas?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    try {
      // Validate server action exists
      if (typeof generateContentAction !== 'function') {
        throw new Error("Content generation service is not available");
      }
      
      const result = await generateContentAction(mode, inputText, layout as any);
      
      // Validate result
      if (result === null || result === undefined) {
        throw new Error("No content was generated");
      }
      
      if (mode === AppMode.MINDMAP && (!result || typeof result !== 'string')) {
         throw new Error("Could not generate a valid graph.");
      }
      
      setOutput(result);
      setViewMode('visual');
      if (!isPro) {
        setFreeRuns(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      const msg = err instanceof Error ? err.message : String(err) || "Generation failed";
      setError(msg);
      showToast(msg, "error");
      // Set fallback output to prevent blank state
      setOutput(getFallbackOutput());
    } finally {
      setLoading(false);
    }
  };

  // Fallback output generator
  const getFallbackOutput = () => {
    switch (mode) {
      case AppMode.MINDMAP:
        return "graph TD\\nA[Fallback Content]\\nB[Please try again]\\nA --> B";
      case AppMode.FLASHCARDS:
        return [{ question: "What happened?", answer: "An error occurred during generation.", tag: "error" }];
      case AppMode.QUIZ:
        return [{
          type: "multiple-choice",
          question: "What went wrong?",
          options: ["A. API Error", "B. Network Issue", "C. Unknown Error", "D. All of the above"],
          correctAnswer: "D. All of the above",
          explanation: "An error occurred during content generation.",
          meta: { difficulty: "medium", style: layout }
        }];
      case AppMode.INFOGRAPHIC:
        return {
          title: "Error State",
          tagline: "Content generation failed",
          layout: layout,
          steps: [
            { title: "Error", description: "An error occurred", icon: "error", accent: "red" }
          ]
        };
      case AppMode.SUMMARY:
        return "## Error\\n\\nAn error occurred during content generation. Please try again.";
      default:
        return "Content generation failed. Please try again.";
    }
  };

  const handleCopy = () => {
    const content = typeof output === 'object' ? JSON.stringify(output, null, 2) : output;
    if (content) {
      navigator.clipboard.writeText(content);
      showToast("Output copied to clipboard", "success");
    }
  };

  const handleOpenExport = () => {
    if (!output) {
      showToast("Generate content first to export.", "error");
      return;
    }
    setShowExport(true);
  };

  const renderVisualOutput = () => {
    // Safety check for output
    if (!output) {
      return <div className="text-gray-400 italic p-8">No content to display</div>;
    }

    try {
      switch (mode) {
        case AppMode.MINDMAP:
          if (typeof output === 'string') {
            return <MermaidRenderer chart={output} theme={theme} />;
          }
          return <div className="text-red-400 p-4">Invalid mindmap data</div>;
          
        case AppMode.FLASHCARDS:
          if (Array.isArray(output)) {
            return <FlashcardViewer cards={output as Flashcard[]} layout={layout as FlashcardLayout} />;
          }
          return <div className="text-red-400 p-4">Invalid flashcard data</div>;
          
        case AppMode.QUIZ:
          if (Array.isArray(output)) {
            return <QuizViewer quizItems={output as QuizItem[]} layout={layout as QuizLayout} />;
          }
          return <div className="text-red-400 p-4">Invalid quiz data</div>;
          
        case AppMode.INFOGRAPHIC:
          if (typeof output === 'object' && output !== null) {
            return <InfographicViewer data={output as InfographicContent} activeLayout={layout} />;
          }
          return <div className="text-red-400 p-4">Invalid infographic data</div>;
          
        case AppMode.SUMMARY:
          if (typeof output === 'string') {
            return (
              <div className="prose dark:prose-invert max-w-none text-sm leading-7 text-gray-700 dark:text-gray-300 p-4 md:p-8">
                 <div className="whitespace-pre-wrap">{output}</div>
              </div>
            );
          }
          return <div className="text-red-400 p-4">Invalid summary data</div>;
          
        default:
          return <div className="text-gray-400 italic p-8">Visualization not supported.</div>;
      }
    } catch (error) {
      console.error("Error rendering visual output:", error);
      return <div className="text-red-400 p-4">Error rendering content</div>;
    }
  };

  // Helper to get active layout options
  const getLayoutOptions = () => {
    if (mode === AppMode.MINDMAP) return MINDMAP_LAYOUTS;
    if (mode === AppMode.FLASHCARDS) return FLASHCARD_LAYOUTS;
    if (mode === AppMode.QUIZ) return QUIZ_LAYOUTS;
    if (mode === AppMode.SUMMARY) return SUMMARY_LAYOUTS;
    if (mode === AppMode.INFOGRAPHIC) return INFOGRAPHIC_LAYOUTS;
    return [];
  };

  const currentLayoutLabel = getLayoutOptions().find(opt => opt.id === layout)?.label || 'Layout';
  // Show layout selector for all modes that support it
  const showLayoutSelector = true;

  // Determine if we should show templates (Empty state)
  const showStarterTemplates = !inputText && !isInputMode;

  // --- Render Landing Page or Main App ---

  if (showLanding) {
    return <LandingPage onStart={handleStartApp} onExample={handleTryExample} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="app-shell animate-in" onClick={() => setShowLayoutMenu(false)}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <LimitModal isOpen={showLimit} onClose={() => setShowLimit(false)} onUpgrade={handleUpgrade} />
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} mode={mode} content={output} isPro={isPro} />
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <TemplatesModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} mode={mode} onSelect={handleSelectTemplate} />

      {/* TOP NAVIGATION */}
      <nav className="top-nav">
        <div className="nav-left">
          <div className="logo-container" onClick={() => setShowLanding(true)}>
             <BrandLogo variant="full" size="sm" />
          </div>
        </div>

        <div className="nav-right">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
          </button>
          
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

          {/* Pro Toggle for Demo */}
          <div 
             className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer border select-none ${isPro ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}
             onClick={() => setIsPro(!isPro)}
             title="Toggle Pro Status for Demo"
          >
            {isPro ? 'PRO' : 'FREE'}
          </div>

          {!isPro && (
            <div className="runs-badge" onClick={() => setShowPricing(true)}>
              <Icons.Bolt />
              <span>{freeRuns} <span className="hidden sm:inline">Free runs left</span></span>
            </div>
          )}
          
          <button 
            className="btn-auth btn-google"
            onClick={handleAuth}
          >
            <Icons.Google />
            <span>Sign in</span>
          </button>
          <button 
            className="btn-auth btn-login" 
            onClick={handleAuth}
          >
            Login
          </button>
          <button 
            className="btn-auth btn-signup" 
            onClick={handleAuth}
          >
            Sign Up
          </button>
        </div>
      </nav>

      <div className="main-layout">
        {/* SIDEBAR (Desktop) */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Generate</div>
            {Object.values(AppMode).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`nav-item ${mode === m ? 'active' : ''}`}
              >
                {m === AppMode.MINDMAP && <Icons.Mindmap />}
                {m === AppMode.FLASHCARDS && <Icons.Flashcards />}
                {m === AppMode.QUIZ && <Icons.Quiz />}
                {m === AppMode.SUMMARY && <Icons.Summary />}
                {m === AppMode.INFOGRAPHIC && <Icons.Infographic />}
                <span className="capitalize">{m}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Pro Tools</div>
            <button className="nav-item nav-item-locked" onClick={handleOpenExport}>
               <Icons.FileText />
               <span className="flex-1 text-left">Export PDF</span>
               {!isPro && <Icons.Lock />}
            </button>
            <button className="nav-item nav-item-locked" onClick={() => setShowPricing(true)}>
               <Icons.Save />
               <span className="flex-1 text-left">Save Project</span>
               <Icons.Lock />
            </button>
            <button className="nav-item nav-item-locked" onClick={() => setShowPricing(true)}>
               <Icons.Users />
               <span className="flex-1 text-left">Team Share</span>
               <Icons.Lock />
            </button>
          </div>

          <div className="mt-auto px-4 pb-4">
             <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium text-center">
               Built by Cryptobulla
             </div>
          </div>
        </aside>

        {/* INPUT PANEL */}
        <section className="input-column">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className={`w-2 h-2 rounded-full ${mode === AppMode.MINDMAP || mode === AppMode.FLASHCARDS || mode === AppMode.QUIZ || mode === AppMode.SUMMARY || mode === AppMode.INFOGRAPHIC ? 'bg-indigo-500' : 'bg-gray-400'}`}></span>
                <span className="capitalize">{mode === AppMode.MINDMAP ? 'Mindmap' : (mode === AppMode.FLASHCARDS ? 'Flashcards' : (mode === AppMode.QUIZ ? 'Quiz' : (mode === AppMode.SUMMARY ? 'Summary' : (mode === AppMode.INFOGRAPHIC ? 'Infographic' : 'Source Content'))))}</span>
              </div>
              
              <div className="flex items-center gap-2">
                 
                 {/* Layout Selector */}
                 {showLayoutSelector && (
                   <div className="relative">
                     <button
                       onClick={(e) => { e.stopPropagation(); setShowLayoutMenu(!showLayoutMenu); }}
                       className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 font-medium transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                       title="Select Layout"
                     >
                       <Icons.Structure />
                       <span className="hidden sm:inline capitalize">{currentLayoutLabel}</span>
                       <Icons.ChevronDown />
                     </button>
                     
                     {showLayoutMenu && (
                       <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#202023] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 py-1 animate-in-fade">
                         {getLayoutOptions().map((opt) => (
                           <button
                             key={opt.id}
                             onClick={() => { setLayout(opt.id); setShowLayoutMenu(false); }}
                             className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2 ${layout === opt.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10' : 'text-gray-600 dark:text-gray-300'}`}
                           >
                             <div className={`w-1.5 h-1.5 rounded-full ${layout === opt.id ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                             {opt.label}
                           </button>
                         ))}
                       </div>
                     )}
                   </div>
                 )}

                 <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                 <button 
                  onClick={() => setShowTemplates(true)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-colors"
                >
                  <Icons.Template /> 
                  <span className="hidden sm:inline">Templates</span>
                </button>
              </div>
            </div>
            
            {showStarterTemplates ? (
              // --- Empty State: Starter Templates ---
              <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Start with a template</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Choose a starter to auto-focus your content.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {STARTER_TEMPLATES.map((tpl) => (
                     <button
                        key={tpl.id}
                        onClick={() => handleTemplateSelect(tpl)}
                        className="group flex flex-col items-start p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#202023] hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all text-left"
                     >
                       <div className="mb-3 p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                         <tpl.icon />
                       </div>
                       <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{tpl.title}</h4>
                       <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tpl.desc}</p>
                     </button>
                   ))}
                </div>
              </div>
            ) : (
              // --- Active State: Text Input ---
              <textarea
                ref={textareaRef}
                className="input-textarea animate-in-fade"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={activePlaceholder}
                spellCheck={false}
              />
            )}
            
            {/* Show Action Bar only when in Input Mode (or if text exists) */}
            {(!showStarterTemplates) && (
              <div className="action-bar animate-in-fade">
                <button 
                  className="btn-primary"
                  onClick={handleGenerate}
                  disabled={loading || !inputText.trim()}
                >
                  {loading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      {output ? <Icons.Refresh /> : <Icons.Sparkles />}
                      <span>{output ? `Regenerate ${mode}` : `Generate ${mode}`}</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-3 font-medium tracking-wide opacity-80">
                  Best results with concise input. Large content is auto-summarized.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* OUTPUT CANVAS */}
        <section className="canvas-column">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                <span>Canvas</span>
              </div>
              
              <div className="canvas-header-actions">
                {/* Status Indicator */}
                <div className="status-indicator">
                  <div className={`status-dot ${loading ? 'loading' : ''}`} />
                  <span>{loading ? 'Processing' : (output ? 'Ready' : 'Waiting')}</span>
                </div>

                {output && (
                  <>
                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="view-toggle">
                      <button 
                        className={`toggle-btn ${viewMode === 'visual' ? 'active' : ''}`} 
                        onClick={() => setViewMode('visual')}
                      >
                        Visual
                      </button>
                      <button 
                        className={`toggle-btn ${viewMode === 'raw' ? 'active' : ''}`} 
                        onClick={() => setViewMode('raw')}
                      >
                        Data
                      </button>
                    </div>
                    <button onClick={handleCopy} className="toggle-btn" title="Copy">
                      <Icons.Copy />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="canvas-content flex items-center justify-center">
              {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium z-10 shadow-sm animate-in">
                  {error}
                </div>
              )}
              
              {/* Logic for States: Loading -> Output -> Empty */}
              
              {loading && (
                <LoadingState mode={mode} />
              )}

              {!loading && !output && !error && (
                <EmptyState mode={mode} />
              )}

              {!loading && output && viewMode === 'visual' && (
                <div className="w-full h-full overflow-auto animate-in">
                   {renderVisualOutput()}
                </div>
              )}

              {!loading && output && viewMode === 'raw' && (
                <div className="w-full h-full overflow-auto animate-in">
                   <pre className="raw-code">{typeof output === 'string' ? output : JSON.stringify(output, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* MOBILE STICKY BUTTON (Only show if not in template selection mode) */}
      <div className={`mobile-sticky-btn-container ${!showStickyBtn || showStarterTemplates ? 'hidden-btn' : ''}`}>
        <button 
          className="mobile-sticky-btn"
          onClick={handleGenerate}
          disabled={loading || !inputText.trim()}
        >
          {loading ? (
             <>
               <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
               <span>Thinking...</span>
             </>
          ) : (
             <>
               {output ? <Icons.Refresh /> : <Icons.Sparkles />}
               <span>{output ? `Regenerate` : `Generate ${mode}`}</span>
             </>
          )}
        </button>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="bottom-nav">
        {[AppMode.MINDMAP, AppMode.FLASHCARDS, AppMode.QUIZ, AppMode.SUMMARY].map(m => (
          <button 
            key={m}
            className={`bottom-nav-item ${mode === m ? 'active' : ''}`}
            onClick={() => { handleModeChange(m); setShowMobileMore(false); }}
          >
            {m === AppMode.MINDMAP && <Icons.Mindmap />}
            {m === AppMode.FLASHCARDS && <Icons.Flashcards />}
            {m === AppMode.QUIZ && <Icons.Quiz />}
            {m === AppMode.SUMMARY && <Icons.Summary />}
            <span className="capitalize">{m}</span>
          </button>
        ))}
        <button 
          className={`bottom-nav-item ${showMobileMore ? 'active' : ''}`}
          onClick={() => setShowMobileMore(true)}
        >
          <Icons.More />
          <span>More</span>
        </button>
      </nav>

      {/* MOBILE DRAWER (MORE MENU) */}
      {showMobileMore && (
        <div className="mobile-drawer-overlay" onClick={() => setShowMobileMore(false)}>
          <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">More Tools</h3>
              <button onClick={() => setShowMobileMore(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                <Icons.Cross />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
               <button
                  onClick={() => { handleModeChange(AppMode.INFOGRAPHIC); setShowMobileMore(false); }}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 ${mode === AppMode.INFOGRAPHIC ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300' : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
               >
                  <Icons.Infographic />
                  <span className="font-medium text-sm">Infographic</span>
               </button>
               {/* Export Button for Mobile */}
               <button onClick={handleOpenExport} className="p-4 rounded-xl border bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
                  <Icons.FileText />
                  <span className="font-medium text-sm">Export</span>
               </button>
               <button onClick={() => setShowPricing(true)} className="p-4 rounded-xl border bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
                  <Icons.Save />
                  <span className="font-medium text-sm">Save</span>
               </button>
               <button onClick={() => setShowPricing(true)} className="p-4 rounded-xl border bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
                  <Icons.Users />
                  <span className="font-medium text-sm">Team</span>
               </button>
            </div>
            
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between" onClick={() => setShowPricing(true)}>
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg text-indigo-600 dark:text-indigo-300">
                     <Icons.Bolt />
                  </div>
                  <div className="text-left">
                     <p className="font-bold text-sm text-gray-900 dark:text-white">Upgrade to Pro</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">Unlock unlimited runs</p>
                  </div>
               </div>
               <button className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg">View</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}