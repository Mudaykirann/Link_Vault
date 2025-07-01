/* eslint-disable no-unused-vars */
import { motion, useScroll, useInView, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from 'react';
import { ArrowRight, Bookmark, Search, Shield, Sparkles, FolderOpen, Moon, Brain, Link as LinkIcon, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ThemedButton } from '../components/ui/ThemedButton';
import { useAuth } from '../context/AuthContext';

const Section = ({ children, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            ref={ref}
            className={className}
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </section>
    );
};

// Simplify AnimatedBackground component
const AnimatedBackground = ({ theme }) => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Gradient Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={`absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl ${theme === 'light' ? 'bg-blue-200/30' : 'bg-yellow-500/10'
                    }`}
            />

            {/* Grid Pattern */}
            <div className={`absolute inset-0 ${theme === 'light'
                ? 'bg-[linear-gradient(to_right,#6b728014_1px,transparent_1px),linear-gradient(to_bottom,#6b728014_1px,transparent_1px)]'
                : 'bg-[linear-gradient(to_right,#facc1510_1px,transparent_1px),linear-gradient(to_bottom,#facc1510_1px,transparent_1px)]'
                } bg-[size:4rem_4rem]`} />

            {/* Floating Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        y: [0, -200, 0],
                        x: [0, i % 2 === 0 ? 100 : -100, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                    }}
                    transition={{
                        duration: 10 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 2
                    }}
                    className={`absolute w-3 h-3 rounded-full ${theme === 'light' ? 'bg-blue-400/30' : 'bg-yellow-400/20'
                        }`}
                    style={{
                        left: `${20 + i * 15}%`,
                        top: `${50 + i * 10}%`
                    }}
                />
            ))}
        </div>
    );
};

// Update the features grid section in the non-logged in content area:
const iconVariants = {
    hover: {
        scale: 1.1,
        rotate: 5,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 10
        }
    }
};

const Home = () => {
    const { user } = useAuth();
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen ${theme === 'light' ? 'bg-gray-50' : 'bg-slate-900'}`}>
            <AnimatedBackground theme={theme} />

            {user ? (
                // Logged in content
                <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                    <Section className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Welcome back, {user.name}!
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Manage your links and categories efficiently
                        </p>
                    </Section>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Section>
                            <motion.div
                                whileHover={{
                                    y: -5,
                                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                                }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut"
                                }}
                                className="h-[250px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <motion.div
                                        variants={iconVariants}
                                        whileHover="hover"
                                        className={`p-2 rounded-lg ${theme === 'light'
                                            ? 'bg-blue-50 text-blue-500'
                                            : 'bg-slate-700 text-yellow-400'
                                            }`}
                                    >
                                        <LinkIcon className="w-5 h-5" />
                                    </motion.div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Your Links
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow leading-relaxed">
                                    View and manage all your saved links in one place. Organize them with tags and search through your collection effortlessly.
                                </p>
                                <div className="mt-4">
                                    <Link to="/dashboard" className="w-full">
                                        <ThemedButton variant="primary" className="w-full flex items-center justify-center">
                                            View Links
                                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                        </ThemedButton>
                                    </Link>
                                </div>
                            </motion.div>
                        </Section>

                        <Section>
                            <motion.div
                                whileHover={{
                                    y: -5,
                                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                                }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut"
                                }}
                                className="h-[250px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <motion.div
                                        variants={iconVariants}
                                        whileHover="hover"
                                        className={`p-2 rounded-lg ${theme === 'light'
                                            ? 'bg-blue-50 text-blue-500'
                                            : 'bg-slate-700 text-yellow-400'
                                            }`}
                                    >
                                        <FolderOpen className="w-5 h-5" />
                                    </motion.div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Categories
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow leading-relaxed">
                                    Create and manage custom categories for your links. Keep your resources organized and easily accessible with a structured system.
                                </p>
                                <div className="mt-4">
                                    <Link to="/categories" className="w-full">
                                        <ThemedButton variant="primary" className="w-full flex items-center justify-center">
                                            View Categories
                                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                        </ThemedButton>
                                    </Link>
                                </div>
                            </motion.div>
                        </Section>

                        <Section>
                            <motion.div
                                whileHover={{
                                    y: -5,
                                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                                }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut"
                                }}
                                className="h-[250px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <motion.div
                                        variants={iconVariants}
                                        whileHover="hover"
                                        className={`p-2 rounded-lg ${theme === 'light'
                                            ? 'bg-blue-50 text-blue-500'
                                            : 'bg-slate-700 text-yellow-400'
                                            }`}
                                    >
                                        <User className="w-5 h-5" />
                                    </motion.div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Profile
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow leading-relaxed">
                                    Customize your profile settings and preferences. Manage your account security and personalize your LinkVault experience.
                                </p>
                                <div className="mt-4">
                                    <Link to="/profile" className="w-full">
                                        <ThemedButton variant="primary" className="w-full flex items-center justify-center">
                                            View Profile
                                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                        </ThemedButton>
                                    </Link>
                                </div>
                            </motion.div>
                        </Section>
                    </div>
                </div>
            ) : (
                // Not logged in content
                <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                    <Section className="text-center mb-12">
                        <h1 className={`text-4xl md:text-5xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'} mb-4`}>
                            Welcome to LinkVault
                        </h1>

                        <p className={`text-xl ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} mb-4`}>
                            ✨ Effortlessly Organize, Manage, and Discover Your Favorite Links.
                        </p>

                        <p className={`text-lg ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} mb-8 max-w-2xl mx-auto`}>
                            Tired of endless bookmarks and forgotten URLs? With <span className="font-semibold">LinkVault</span>,
                            securely store, categorize, and access your important links from anywhere. Whether it's for work,
                            study, or personal browsing — we've got you covered.
                        </p>

                        <div className="flex justify-center gap-4 mb-12">
                            <Link to="/signup">
                                <ThemedButton variant="primary" className="flex items-center gap-2">
                                    Get Started
                                    <ArrowRight className="w-4 h-4" />
                                </ThemedButton>
                            </Link>
                            <Link to="/login">
                                <ThemedButton variant="secondary">
                                    Login
                                </ThemedButton>
                            </Link>
                        </div>
                    </Section>

                    <Section>
                        <h2 className={`text-2xl md:text-3xl font-bold text-center ${theme === 'light' ? 'text-gray-900' : 'text-white'} mb-8`}>
                            🚀 Why Choose LinkVault?
                        </h2>
                    </Section>

                    {/* Features Grid - using your existing grid but with updated content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <Section key={index}>
                                <motion.div
                                    whileHover={{
                                        y: -5,
                                        boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                                    }}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.2,
                                        ease: "easeOut"
                                    }}
                                    className="h-[250px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 flex flex-col"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <motion.div
                                            variants={iconVariants}
                                            whileHover="hover"
                                            className={`p-2 rounded-lg ${theme === 'light'
                                                ? 'bg-blue-50 text-blue-500'
                                                : 'bg-slate-700 text-yellow-400'
                                                }`}
                                        >
                                            <feature.icon className="w-5 h-5" />
                                        </motion.div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {feature.title}
                                        </h2>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            </Section>
                        ))}
                    </div>

                    <Section className="text-center mt-16">
                        <div className={`p-8 rounded-xl border ${theme === 'light' ? 'bg-white/80 border-gray-100' : 'bg-slate-800/80 border-slate-700'}`}>
                            <h2 className={`text-2xl md:text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'} mb-4`}>
                                🎯 Your Links, Organized Your Way
                            </h2>
                            <p className={`text-lg ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} mb-6`}>
                                Start Managing Your Links Like a Pro!
                            </p>
                            <Link to="/signup">
                                <ThemedButton variant="primary" className="flex items-center gap-2 mx-auto">
                                    Join LinkVault Today
                                    <ArrowRight className="w-4 h-4" />
                                </ThemedButton>
                            </Link>
                        </div>
                    </Section>
                </div>
            )}
        </div>
    );
};

// Features data
const features = [
    {
        title: '📂 Organized Categories',
        description: 'Keep your links neatly arranged with customizable categories. Create, edit, and manage categories that suit your needs.',
        icon: () => <FolderOpen className="w-5 h-5" />
    },
    {
        title: '🔎 Smart Search',
        description: 'Find any link instantly with our powerful search system. Filter by tags, categories, or keywords for quick access.',
        icon: () => <Search className="w-5 h-5" />
    },
    {
        title: '🌙 Adaptive Theme',
        description: 'Enjoy a beautiful, adaptive UI that suits your preference. Switch seamlessly between light and dark modes.',
        icon: () => <Moon className="w-5 h-5" />
    },
    {
        title: '🛡️ Secure Access',
        description: 'Your data stays safe with industry-standard authentication. Access your links securely from anywhere.',
        icon: () => <Shield className="w-5 h-5" />
    },
    {
        title: '💡 AI Recommendations',
        description: 'Discover related resources based on your interests. Get smart suggestions that match your browsing patterns.',
        icon: () => <Brain className="w-5 h-5" />
    },
    {
        title: '✨ Easy Management',
        description: 'Simple and intuitive interface for effortless organization. Manage your links with drag-and-drop and quick actions.',
        icon: () => <Sparkles className="w-5 h-5" />
    }
];

export default Home; 