import { motion, useInView } from "framer-motion";
import { useRef } from 'react';
import { ArrowRight, Link as LinkIcon, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ThemedButton } from '../components/ui/ThemedButton';
import { useAuth } from '../context/AuthContext';

const Section = ({ children, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className={className}>
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

const AnimatedBackground = ({ theme }) => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
                className={`absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl ${theme === 'light' ? 'bg-blue-200/30' : 'bg-yellow-500/10'}`}
            />
            <div className={`absolute inset-0 ${theme === 'light'
                ? 'bg-[linear-gradient(to_right,#6b728014_1px,transparent_1px),linear-gradient(to_bottom,#6b728014_1px,transparent_1px)]'
                : 'bg-[linear-gradient(to_right,#facc1510_1px,transparent_1px),linear-gradient(to_bottom,#facc1510_1px,transparent_1px)]'
                } bg-[size:4rem_4rem]`} />
        </div>
    );
};

const iconVariants = {
    hover: {
        scale: 1.1,
        rotate: 5,
        transition: { type: "spring", stiffness: 300, damping: 10 }
    }
};

const Home = () => {
    const { user } = useAuth();
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen ${theme === 'light' ? 'bg-gray-50' : 'bg-slate-900'}`}>
            <AnimatedBackground theme={theme} />

            {user ? (
                <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                    <Section className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Welcome back, {user?.name || user?.username || user?.email?.split('@')[0]}!
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Manage your links and categories efficiently
                        </p>
                    </Section>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Section>
                            <motion.div
                                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                                className="h-[250px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <motion.div
                                        variants={iconVariants}
                                        whileHover="hover"
                                        className={`p-2 rounded-lg ${theme === 'light' ? 'bg-blue-50 text-blue-500' : 'bg-slate-700 text-yellow-400'}`}
                                    >
                                        <LinkIcon className="w-5 h-5" />
                                    </motion.div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Links</h2>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow leading-relaxed">
                                    View and manage all your saved links in one place. Organize them with tags and search through your collection effortlessly.
                                </p>
                                <div className="mt-4">
                                    <Link to="/dashboard" className="w-full">
                                        <ThemedButton variant="primary" className="w-full flex items-center justify-center">
                                            View Links
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </ThemedButton>
                                    </Link>
                                </div>
                            </motion.div>
                        </Section>

                        <Section>
                            <motion.div
                                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                                className="h-[250px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-5 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <motion.div
                                        variants={iconVariants}
                                        whileHover="hover"
                                        className={`p-2 rounded-lg ${theme === 'light' ? 'bg-blue-50 text-blue-500' : 'bg-slate-700 text-yellow-400'}`}
                                    >
                                        <FolderOpen className="w-5 h-5" />
                                    </motion.div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow leading-relaxed">
                                    Create and manage custom categories for your links. Keep your resources organized and easily accessible.
                                </p>
                                <div className="mt-4">
                                    <Link to="/categories" className="w-full">
                                        <ThemedButton variant="primary" className="w-full flex items-center justify-center">
                                            View Categories
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </ThemedButton>
                                    </Link>
                                </div>
                            </motion.div>
                        </Section>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 py-20 relative z-10 text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                        Save, Organize and Rediscover Your Links
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                        LinkVault provides a fast, minimalist, and private bookmark manager to keep your favourite corners of the web at your fingertips.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register">
                            <ThemedButton variant="primary" className="px-6 py-3 text-lg">
                                Get Started Free
                            </ThemedButton>
                        </Link>
                        <Link to="/login">
                            <ThemedButton variant="secondary" className="px-6 py-3 text-lg">
                                Sign In
                            </ThemedButton>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
