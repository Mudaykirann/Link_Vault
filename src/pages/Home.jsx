import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    ArrowRight,
    Search,
    ShieldCheck,
    Sparkles,
    ExternalLink,
    RefreshCw,
    CheckCircle2,
    BarChart3,
    Layers,
    Trash2,
    Command,
    Zap,
    Bookmark,
    Eye,
    Globe,
    Compass,
    Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ThemedButton } from '../components/ui/ThemedButton';
import { useAuth } from '../context/AuthContext';

// Sample Deck Links with Rich Preview Information
const DECK_CARDS = [
    {
        id: 'figma',
        title: 'Figma — Interface Design & Prototypes',
        domain: 'figma.com',
        category: 'Design',
        tag: '#UI/UX',
        tagColor: 'bg-cyan-50 dark:bg-cyan-950/40 text-[#0E7490] dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/30',
        accentColor: '#00F0FF',
        clicks: 342,
        health: '99.9% Healthy',
        badge: 'Design System',
        icon: '🎨',
        ogGradient: 'from-slate-900 to-[#0A0D14]',
        desc: 'Industry standard for modern product design, atomic component systems, and vector prototypes.'
    },
    {
        id: 'linear',
        title: 'Linear — Issue Tracking Built for Speed',
        domain: 'linear.app',
        category: 'Productivity',
        tag: '#Workflow',
        tagColor: 'bg-cyan-50 dark:bg-cyan-950/40 text-[#0E7490] dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30',
        accentColor: '#06B6D4',
        clicks: 289,
        health: '100% Active',
        badge: 'Sprint Tool',
        icon: '⚡',
        ogGradient: 'from-slate-900 to-[#07090D]',
        desc: 'Streamline software projects, sprints, cycles, and bug tracking with instant keyboard shortcuts.'
    },
    {
        id: 'supabase',
        title: 'Supabase — The Open Source Firebase',
        domain: 'supabase.com',
        category: 'Dev & AI',
        tag: '#Postgres',
        tagColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30',
        accentColor: '#10B981',
        clicks: 412,
        health: '99.8% Healthy',
        badge: 'Cloud DB',
        icon: '⚡',
        ogGradient: 'from-slate-900 to-[#0A1017]',
        desc: 'PostgreSQL database with authentication, Row Level Security, instant REST APIs, and Realtime sync.'
    },
    {
        id: 'notion',
        title: 'Notion — Connected Docs & Knowledge',
        domain: 'notion.so',
        category: 'Productivity',
        tag: '#Knowledge',
        tagColor: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600',
        accentColor: '#FFFFFF',
        clicks: 198,
        health: '100% Active',
        badge: 'Second Brain',
        icon: '📝',
        ogGradient: 'from-slate-900 to-[#0A0C10]',
        desc: 'All-in-one workspace for notes, engineering roadmaps, team wikis, and knowledge curation.'
    },
    {
        id: 'tailwind',
        title: 'Tailwind CSS — Utility-First Styling',
        domain: 'tailwindcss.com',
        category: 'Design',
        tag: '#Frontend',
        tagColor: 'bg-cyan-50 dark:bg-cyan-950/40 text-[#0E7490] dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/30',
        accentColor: '#22D3EE',
        clicks: 521,
        health: '100% Active',
        badge: 'Styling',
        icon: '🌊',
        ogGradient: 'from-slate-900 to-[#080B10]',
        desc: 'A utility-first CSS framework for composing sleek, bespoke user interfaces directly in markup.'
    },
    {
        id: 'github',
        title: 'GitHub — Where the World Builds Code',
        domain: 'github.com',
        category: 'Dev & AI',
        tag: '#GitOps',
        tagColor: 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-500/30',
        accentColor: '#00F0FF',
        clicks: 674,
        health: '99.9% Healthy',
        badge: 'Repository',
        icon: '🐙',
        ogGradient: 'from-slate-900 to-[#090C12]',
        desc: 'Collaborative development platform powering millions of developers, pull requests, and CI/CD pipelines.'
    }
];

const Home = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [hoveredCardId, setHoveredCardId] = useState(null);

    // Interactive Bento Cleaner state
    const [isCleaned, setIsCleaned] = useState(false);
    const [cleaningInProgress, setCleaningInProgress] = useState(false);

    // Interactive Radar simulation state
    const [radarPings, setRadarPings] = useState(3);
    const [isScanning, setIsScanning] = useState(false);

    // Parallax mouse tilt for 3D card deck
    const containerRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 120, damping: 20 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 120, damping: 20 });
    const deckRotateY = useTransform(smoothMouseX, [-300, 300], [-7, 7]);
    const deckRotateX = useTransform(smoothMouseY, [-300, 300], [7, -7]);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    // Filter deck cards based on search and category
    const filteredCards = DECK_CARDS.filter((card) => {
        const matchesCat = selectedCategory === 'All' || card.category === selectedCategory;
        const matchesQuery = !searchQuery ||
            card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.tag.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
    });

    const triggerDuplicateCleanup = () => {
        if (isCleaned) return;
        setCleaningInProgress(true);
        setTimeout(() => {
            setCleaningInProgress(false);
            setIsCleaned(true);
        }, 850);
    };

    const triggerRadarScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setRadarPings(prev => (prev >= 6 ? 3 : prev + 1));
            setIsScanning(false);
        }, 1100);
    };

    return (
        <div className={`min-h-screen relative overflow-x-hidden ${theme === 'light' ? 'bg-[#F8FAFC]' : 'bg-[#050608]'}`}>
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[550px] rounded-full blur-[170px] ${
                    theme === 'light' ? 'bg-cyan-100/60 opacity-40' : 'bg-cyan-900/25 opacity-30'
                }`} />
                <div className={`absolute top-[40%] -right-40 w-[600px] h-[600px] rounded-full blur-[190px] ${
                    theme === 'light' ? 'bg-slate-200/50 opacity-40' : 'bg-teal-950/30 opacity-20'
                }`} />
                {/* Tech Dot Grid Pattern */}
                <div className={`absolute inset-0 bg-[radial-gradient(#80808014_1px,transparent_1px)] bg-[size:32px_32px]`} />
            </div>

            {/* Authenticated Hub View */}
            {user ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-3xl glass-card relative overflow-hidden mb-10"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950/50 text-[#0E7490] dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/20 mb-3">
                                    <Sparkles className="w-3.5 h-3.5 text-[#0E7490] dark:text-cyan-400" />
                                    Vault Synchronized & Realtime Active
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#090D16] dark:text-white">
                                    Welcome back, {user?.name || user?.username || user?.email?.split('@')[0]}
                                </h1>
                                <p className="mt-2 text-slate-600 dark:text-[#94A3B8] text-sm md:text-base">
                                    Your personal web repository is active. Press <kbd className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-[#12151C] text-xs font-mono font-bold text-[#0E7490] dark:text-cyan-400 border border-slate-300 dark:border-[#181C24]">⌘K</kbd> anywhere to search your links.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <ThemedButton
                                    variant="secondary"
                                    onClick={() => window.dispatchEvent(new CustomEvent('linkvault:open-command-palette'))}
                                    className="px-4 py-2.5 rounded-xl text-sm"
                                >
                                    <Search className="w-4 h-4 mr-2 text-[#0E7490] dark:text-cyan-400" />
                                    Spotlight (⌘K)
                                </ThemedButton>
                                <ThemedButton
                                    variant="primary"
                                    onClick={() => navigate('/dashboard')}
                                    className="px-5 py-2.5 rounded-xl text-sm"
                                >
                                    Open Dashboard
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </ThemedButton>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div onClick={() => navigate('/dashboard')} className="p-6 rounded-2xl glass-card cursor-pointer group hover:-translate-y-1 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 text-[#0E7490] dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Bookmark className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-[#090D16] dark:text-white mb-1 flex items-center justify-between">
                                Full Vault
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#0E7490] dark:text-cyan-400" />
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-[#94A3B8]">All bookmarks with tags, reading lists, and collections.</p>
                        </div>

                        <div onClick={() => navigate('/links')} className="p-6 rounded-2xl glass-card cursor-pointer group hover:-translate-y-1 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-500/10 text-teal-800 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Compass className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-[#090D16] dark:text-white mb-1 flex items-center justify-between">
                                Link Explorer
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-teal-700 dark:text-teal-400" />
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-[#94A3B8]">Inspect link telemetry, click analytics, and domain groups.</p>
                        </div>

                        <div onClick={() => navigate('/analytics')} className="p-6 rounded-2xl glass-card cursor-pointer group hover:-translate-y-1 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-[#090D16] dark:text-white mb-1 flex items-center justify-between">
                                Analytics
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-emerald-700 dark:text-emerald-400" />
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-[#94A3B8]">Reading velocity, category share, and link rot health trends.</p>
                        </div>

                        <div onClick={() => window.dispatchEvent(new CustomEvent('linkvault:open-duplicate-cleaner'))} className="p-6 rounded-2xl glass-card cursor-pointer group hover:-translate-y-1 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 text-[#0E7490] dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <RefreshCw className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-[#090D16] dark:text-white mb-1 flex items-center justify-between">
                                Duplicate Cleaner
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#0E7490] dark:text-cyan-400" />
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-[#94A3B8]">Scan for duplicate query params and keep your library clean.</p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Unauthenticated Obsidian & High-Contrast Canvas */
                <div className="relative z-10">
                    {/* Hero Header */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-cyan-100/90 dark:bg-cyan-500/10 text-[#0E7490] dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/20 backdrop-blur-md mb-6"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-[#0E7490] dark:bg-cyan-400 animate-pulse" />
                            LinkVault 2.0 • Intelligent Web Knowledge Repository
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#090D16] dark:text-white max-w-4xl mx-auto leading-[1.08]"
                        >
                            Your second brain{' '}
                            <span className="text-[#0E7490] dark:text-transparent dark:bg-gradient-to-r dark:from-cyan-400 dark:via-teal-300 dark:to-emerald-400 dark:bg-clip-text">
                                for the web.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mt-5 text-base sm:text-xl text-slate-700 dark:text-[#94A3B8] font-medium max-w-2xl mx-auto"
                        >
                            Collect, inspect, and rediscover every essential link. Built with real-time broken link telemetry, instant Spotlight search, and zero bloat.
                        </motion.p>

                        {/* Interactive Spotlight Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-8 max-w-xl mx-auto"
                        >
                            <div className="p-1.5 rounded-2xl glass-card shadow-lg flex items-center gap-2">
                                <div className="pl-3 text-[#0E7490] dark:text-cyan-400">
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Filter cards: 'Figma', 'Supabase', or by tag..."
                                    className="w-full bg-transparent text-sm text-[#090D16] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium outline-none py-2"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2 cursor-pointer font-semibold"
                                    >
                                        Clear
                                    </button>
                                )}
                                <div className="pr-2 hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#0E7490] dark:text-cyan-400 bg-slate-100 dark:bg-[#12151C] px-2.5 py-1 rounded-lg border border-slate-300 dark:border-[#181C24] font-bold">
                                    <Command className="w-3 h-3 text-[#0E7490] dark:text-cyan-400" />
                                    <span>K</span>
                                </div>
                            </div>

                            {/* Category Filter Pills (High Contrast) */}
                            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                                {['All', 'Design', 'Productivity', 'Dev & AI'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                            selectedCategory === cat
                                                ? 'bg-[#0E7490] dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md scale-105'
                                                : 'bg-white dark:bg-[#0B0D11] text-slate-700 dark:text-[#94A3B8] border border-slate-300 dark:border-[#181C24] hover:border-[#0E7490] dark:hover:border-cyan-500/50'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* 3D FANNED-OUT SMART CARD DECK */}
                    <div
                        ref={containerRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 perspective-1000 relative"
                        style={{ perspective: 1200 }}
                    >
                        {/* 3D Tilting Deck Wrapper */}
                        <motion.div
                            style={{
                                rotateY: deckRotateY,
                                rotateX: deckRotateX,
                                transformStyle: 'preserve-3d'
                            }}
                            className="relative min-h-[360px] sm:min-h-[440px] flex items-center justify-center"
                        >
                            {/* Empty state */}
                            {filteredCards.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 rounded-3xl glass-card text-center max-w-md"
                                >
                                    <p className="text-slate-600 dark:text-[#94A3B8] text-sm font-medium">
                                        No cards match "{searchQuery}". Try searching "Figma", "Supabase", or select "All".
                                    </p>
                                    <ThemedButton
                                        variant="secondary"
                                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                        className="mt-4 px-4 py-2 text-xs"
                                    >
                                        Reset Filters
                                    </ThemedButton>
                                </motion.div>
                            ) : (
                                /* The Interactive Fanned Cards */
                                <div className="relative w-full max-w-5xl h-[380px] sm:h-[440px] flex items-center justify-center">
                                    <AnimatePresence>
                                        {filteredCards.map((card, idx) => {
                                            const total = filteredCards.length;
                                            const centerIdx = (total - 1) / 2;
                                            const offset = idx - centerIdx;
                                            const isHovered = hoveredCardId === card.id;

                                            // Fanning calculations
                                            const baseRotate = offset * 5;
                                            const translateX = offset * (total > 4 ? 110 : 150);
                                            const translateY = Math.abs(offset) * 14;
                                            const zIndex = isHovered ? 50 : 20 - Math.abs(offset);

                                            return (
                                                <motion.div
                                                    key={card.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8, y: 40 }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: isHovered ? 1.08 : 1,
                                                        x: isHovered ? translateX : translateX,
                                                        y: isHovered ? translateY - 40 : translateY,
                                                        rotateZ: isHovered ? 0 : baseRotate,
                                                        zIndex: zIndex
                                                    }}
                                                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 260,
                                                        damping: 22
                                                    }}
                                                    onMouseEnter={() => setHoveredCardId(card.id)}
                                                    onMouseLeave={() => setHoveredCardId(null)}
                                                    className="absolute w-[240px] sm:w-[270px] md:w-[290px] cursor-pointer"
                                                    style={{ transformStyle: 'preserve-3d' }}
                                                >
                                                    <div className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden select-none ${
                                                        isHovered
                                                            ? 'border-[#0E7490] dark:border-cyan-400 shadow-2xl shadow-cyan-500/20 ring-2 ring-cyan-500/20'
                                                            : 'border-slate-300 dark:border-[#181C24] shadow-lg'
                                                    } ${theme === 'light' ? 'bg-white' : 'bg-[#0B0D11]'}`}>
                                                        {/* Top Card Banner in Obsidian Contrast */}
                                                        <div className={`h-28 -mx-5 -mt-5 mb-4 p-4 rounded-t-3xl bg-gradient-to-br ${card.ogGradient} flex flex-col justify-between relative overflow-hidden text-white border-b border-white/10`}>
                                                            <div className="flex items-center justify-between relative z-10">
                                                                <span className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center text-base border border-white/20 shadow-sm">
                                                                    {card.icon}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-emerald-400 border border-emerald-400/30 backdrop-blur-md">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                                    {card.health}
                                                                </span>
                                                            </div>
                                                            <div className="relative z-10 flex items-center justify-between">
                                                                <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1">
                                                                    <Globe className="w-3 h-3 text-cyan-400" />
                                                                    {card.domain}
                                                                </span>
                                                                <span className="text-[10px] font-semibold text-white/80 bg-white/15 px-2 py-0.5 rounded-md">
                                                                    {card.badge}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Card Content */}
                                                        <div>
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${card.tagColor}`}>
                                                                    {card.tag}
                                                                </span>
                                                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                                    • {card.category}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-sm font-bold text-[#090D16] dark:text-white line-clamp-1">
                                                                {card.title}
                                                            </h4>
                                                            <p className="mt-1.5 text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                                                                {card.desc}
                                                            </p>
                                                        </div>

                                                        {/* Card Bottom Telemetry */}
                                                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#181C24] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                                            <span className="flex items-center gap-1 font-bold text-[#0E7490] dark:text-cyan-400">
                                                                <Eye className="w-3.5 h-3.5" />
                                                                {card.clicks} opens
                                                            </span>
                                                            <span className="flex items-center gap-1 hover:text-[#0E7490] dark:hover:text-cyan-400 transition-colors">
                                                                Inspect <ExternalLink className="w-3 h-3" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>

                        {/* Deck Hint */}
                        <div className="text-center mt-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 font-medium">
                                <Sparkles className="w-3.5 h-3.5 text-[#0E7490] dark:text-cyan-400 animate-pulse" />
                                Hover cards to elevate • Filter in real time using the search console above
                            </p>
                        </div>
                    </div>

                    {/* DYNAMIC INTERACTIVE BENTO OS CANVAS */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-300 dark:border-[#181C24]">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-500/10 text-[#0E7490] dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/20 mb-3">
                                <Zap className="w-3.5 h-3.5 text-[#0E7490] dark:text-cyan-400" />
                                LinkVault Telemetry & Cockpit
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black text-[#090D16] dark:text-white tracking-tight">
                                Autonomous tools running in your vault
                            </h2>
                            <p className="mt-4 text-slate-600 dark:text-[#94A3B8] text-sm sm:text-base font-medium">
                                Experience how LinkVault detects broken links, strips tracking parameters, and categorizes links automatically.
                            </p>
                        </div>

                        {/* Bento Modular Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* BENTO TILE 1: Link Health Radar Scanner (Always High Contrast) */}
                            <div className="md:col-span-7 p-7 rounded-3xl glass-card flex flex-col justify-between relative overflow-hidden">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 text-[#0E7490] dark:text-cyan-400 flex items-center justify-center font-bold">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-[#090D16] dark:text-white">
                                                    Link Health Radar Scanner
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Continuous background rot detection</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={triggerRadarScan}
                                            disabled={isScanning}
                                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-100 dark:bg-cyan-500/10 text-[#0E7490] dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/25 hover:bg-cyan-200 dark:hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                                            {isScanning ? 'Scanning...' : 'Ping Vault'}
                                        </button>
                                    </div>

                                    {/* Visual Sonar Radar Graphics: Rich Obsidian Background in both modes for high-contrast radar viewing */}
                                    <div className="relative h-44 sm:h-52 my-4 rounded-2xl bg-[#090C12] border border-cyan-500/30 overflow-hidden flex items-center justify-center shadow-inner">
                                        {/* Radar Concentric Rings */}
                                        <div className="absolute w-64 h-64 rounded-full border border-cyan-500/20" />
                                        <div className="absolute w-44 h-44 rounded-full border border-cyan-500/30" />
                                        <div className="absolute w-24 h-24 rounded-full border border-cyan-500/40" />
                                        <div className="absolute w-full h-[1px] bg-cyan-500/20" />
                                        <div className="absolute h-full w-[1px] bg-cyan-500/20" />

                                        {/* Sweeping Sonar Beam in Electric Cyan */}
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                                            className="absolute w-64 h-64 rounded-full pointer-events-none origin-center"
                                            style={{
                                                background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.45) 0deg, transparent 60deg, transparent 360deg)'
                                            }}
                                        />

                                        {/* Radar Blips */}
                                        {Array.from({ length: radarPings }).map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    scale: [1, 1.4, 1],
                                                    opacity: [0.7, 1, 0.7]
                                                }}
                                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                                                className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80"
                                                style={{
                                                    top: `${30 + (i * 18) % 45}%`,
                                                    left: `${25 + (i * 24) % 55}%`
                                                }}
                                            />
                                        ))}

                                        {/* Radar Center HUD */}
                                        <div className="relative z-10 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/40 text-xs font-mono text-cyan-400 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                            <span>3,105 Vault Links • 99.8% Healthy</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-[#181C24] text-center">
                                    <div>
                                        <p className="text-[11px] text-slate-500 font-semibold">Total Monitored</p>
                                        <p className="text-base font-bold text-[#090D16] dark:text-white">3,105</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-500 font-semibold">Dead Detected</p>
                                        <p className="text-base font-bold text-[#0E7490] dark:text-cyan-400">0 Dead URLs</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-500 font-semibold">Check Mode</p>
                                        <p className="text-base font-bold text-teal-700 dark:text-teal-400">Realtime</p>
                                    </div>
                                </div>
                            </div>

                            {/* BENTO TILE 2: Automated Duplicate Cleaner (Span 5) */}
                            <div className="md:col-span-5 p-7 rounded-3xl glass-card flex flex-col justify-between relative overflow-hidden">
                                <div>
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-500/10 text-teal-800 dark:text-teal-400 flex items-center justify-center font-bold">
                                            <RefreshCw className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-[#090D16] dark:text-white">
                                                Duplicate URL Cleaner
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Strip UTM clutter & merge copies</p>
                                        </div>
                                    </div>

                                    {/* Interactive Before vs After Demo */}
                                    <div className="my-4 space-y-2.5">
                                        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#07090D] border border-slate-300 dark:border-[#181C24] text-xs font-mono">
                                            <div className="flex items-center justify-between text-slate-500 mb-1 text-[10px]">
                                                <span>Original Bookmark</span>
                                                <span className="text-rose-600 dark:text-rose-400 font-bold">Messy UTM Query</span>
                                            </div>
                                            <p className="truncate text-slate-800 dark:text-slate-300 font-medium">
                                                https://dribbble.com/shots/189<span className="text-rose-600 dark:text-rose-400 font-semibold">?utm_source=fb&ref=129</span>
                                            </p>
                                        </div>

                                        <AnimatePresence>
                                            {!isCleaned ? (
                                                <motion.div
                                                    initial={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0, scale: 0.9 }}
                                                    className="p-3 rounded-2xl bg-amber-50 dark:bg-cyan-950/20 border border-amber-300 dark:border-cyan-500/30 text-xs font-mono"
                                                >
                                                    <div className="flex items-center justify-between text-amber-700 dark:text-cyan-400 mb-1 text-[10px]">
                                                        <span>Duplicate Detected</span>
                                                        <span>Copy #2</span>
                                                    </div>
                                                    <p className="truncate text-amber-800 dark:text-cyan-300 font-medium">
                                                        https://dribbble.com/shots/189?fbclid=IwAR28...
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-xs font-mono"
                                                >
                                                    <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 mb-1 text-[10px]">
                                                        <span className="flex items-center gap-1 font-bold">
                                                            <Check className="w-3 h-3" /> Cleaned & Deduplicated
                                                        </span>
                                                        <span>1 Canonical URL</span>
                                                    </div>
                                                    <p className="truncate text-emerald-700 dark:text-emerald-400 font-bold">
                                                        https://dribbble.com/shots/189
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-[#181C24]">
                                    <button
                                        onClick={triggerDuplicateCleanup}
                                        disabled={isCleaned || cleaningInProgress}
                                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                            isCleaned
                                                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 cursor-default'
                                                : 'bg-[#0E7490] hover:bg-[#155E75] dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 shadow-md'
                                        }`}
                                    >
                                        {cleaningInProgress ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                Pruning 1 Duplicate...
                                            </>
                                        ) : isCleaned ? (
                                            <>
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                Vault Clean & Canonical
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Simulate Auto-Cleanup
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* BENTO TILE 3: Reading Velocity & Telemetry (Span 4) */}
                            <div className="md:col-span-4 p-6 rounded-3xl glass-card flex flex-col justify-between">
                                <div>
                                    <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 text-[#0E7490] dark:text-cyan-400 flex items-center justify-center mb-3">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-sm font-bold text-[#090D16] dark:text-white">
                                        Reading Velocity Telemetry
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1 font-medium">
                                        Track knowledge consumption rates and most-opened resource clusters.
                                    </p>
                                    <div className="mt-4 flex items-end gap-2 h-20 pt-2">
                                        {[40, 65, 30, 85, 95, 75, 100].map((h, i) => (
                                            <div key={i} className="flex-1 bg-slate-200 dark:bg-cyan-500/10 rounded-t-lg transition-all relative group flex items-end">
                                                <div
                                                    className="w-full bg-[#0E7490] dark:bg-gradient-to-t dark:from-teal-500 dark:to-cyan-400 rounded-t-lg"
                                                    style={{ height: `${h}%` }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#181C24] flex items-center justify-between text-xs font-semibold">
                                    <span className="text-slate-500">+34% this month</span>
                                    <span className="font-bold text-[#0E7490] dark:text-cyan-400">14.5k Opens</span>
                                </div>
                            </div>

                            {/* BENTO TILE 4: 1-Click Universal Browser Import (Span 4) */}
                            <div className="md:col-span-4 p-6 rounded-3xl glass-card flex flex-col justify-between">
                                <div>
                                    <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-500/10 text-teal-800 dark:text-teal-400 flex items-center justify-center mb-3">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-sm font-bold text-[#090D16] dark:text-white">
                                        Universal Netscape Import
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1 font-medium">
                                        Drag and drop bookmarks from Chrome, Arc, Safari, or Firefox with zero vendor lock-in.
                                    </p>
                                    <div className="mt-4 p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#181C24] text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                                        <span>Drop bookmarks.html file</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#181C24] flex items-center justify-between text-xs font-semibold">
                                    <span className="text-slate-500">Zero data lock-in</span>
                                    <span className="font-bold text-teal-800 dark:text-teal-400">HTML Standard</span>
                                </div>
                            </div>

                            {/* BENTO TILE 5: End-to-End Encryption & Security (Span 4) */}
                            <div className="md:col-span-4 p-6 rounded-3xl glass-card flex flex-col justify-between">
                                <div>
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-3">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-sm font-bold text-[#090D16] dark:text-white">
                                        PostgreSQL Vault Security
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1 font-medium">
                                        Row Level Security (RLS) guarantees only you have decrypt access to your private bookmarks.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#181C24] flex items-center justify-between text-xs font-semibold">
                                    <span className="text-slate-500">RLS Policy Active</span>
                                    <span className="font-bold text-emerald-800 dark:text-emerald-400">Bank-Grade</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA Banner */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                        <div className="p-10 sm:p-14 rounded-3xl relative overflow-hidden bg-gradient-to-br from-[#0B1017] via-[#050608] to-black text-white text-center shadow-2xl border border-cyan-500/30">
                            <div className="relative z-10 max-w-2xl mx-auto">
                                <h3 className="text-3xl sm:text-5xl font-black tracking-tight">
                                    Ready for a modern bookmark experience?
                                </h3>
                                <p className="mt-4 text-[#94A3B8] text-sm sm:text-base">
                                    Join developers, designers, and researchers managing their links with LinkVault.
                                </p>
                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link to="/register" className="w-full sm:w-auto">
                                        <button className="w-full sm:w-auto px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all cursor-pointer">
                                            Create Free Vault
                                        </button>
                                    </Link>
                                    <Link to="/login" className="w-full sm:w-auto">
                                        <button className="w-full sm:w-auto px-8 py-3.5 bg-[#12151C] hover:bg-[#181C24] text-white border border-[#252C37] hover:border-cyan-500/40 font-semibold rounded-xl transition-all cursor-pointer">
                                            Sign In
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
