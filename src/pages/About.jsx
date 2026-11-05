/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Rocket, Users, Brain, Shield, Search, Moon, Lock, Layout } from 'lucide-react'

const About = () => {
    const { theme } = useTheme()

    const features = [
        {
            icon: () => <Layout className="w-6 h-6" />,
            title: 'Personalized Management',
            description: 'Easily categorize and organize your links with our intuitive interface.'
        },
        {
            icon: () => <Search className="w-6 h-6" />,
            title: 'Smart Search & Filters',
            description: 'Find what youre looking for in seconds with powerful search capabilities.'
        },
        {
            icon: () => <Brain className="w-6 h-6" />,
            title: 'AI-Powered',
            description: 'Get intelligent recommendations based on your interests and browsing patterns.'
        },
        {
            icon: () => <Moon className="w-6 h-6" />,
            title: 'Theme Options',
            description: 'Choose between light and dark modes for comfortable browsing.'
        },
        {
            icon: () => <Shield className="w-6 h-6" />,
            title: 'Secure Storage',
            description: 'Your links are protected with the latest security measures.'
        },
        {
            icon: () => <Users className="w-6 h-6" />,
            title: 'Built for Everyone',
            description: 'Perfect for students, professionals, and casual browsers alike.'
        }
    ]

    return (
        <div className={`min-h-screen py-12 ${theme === 'light' ? 'bg-white' : 'bg-[#0f172a]'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        About LinkVault
                    </h1>
                    <p className={`text-xl max-w-3xl mx-auto ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                        Welcome to LinkVault — your ultimate solution for managing and organizing your digital world.
                    </p>
                </motion.div>

                {/* Mission Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`mb-20 p-8 rounded-2xl ${theme === 'light'
                        ? 'bg-blue-50'
                        : 'bg-slate-800/50'}`}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <Rocket className={`w-8 h-8 ${theme === 'light' ? 'text-blue-600' : 'text-yellow-400'}`} />
                        <h2 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            Our Mission
                        </h2>
                    </div>
                    <p className={`text-lg mb-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                        At LinkVault, we believe that the internet is a treasure trove of information, but without the right tools,
                        it's easy to lose track of valuable resources. That's where we come in.
                    </p>
                    <ul className={`space-y-3 text-lg ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                        <li className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-blue-500' : 'bg-yellow-400'}`} />
                            Empower Users to store, manage, and access their links effortlessly
                        </li>
                        <li className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-blue-500' : 'bg-yellow-400'}`} />
                            Enhance Productivity by eliminating the clutter of unmanaged bookmarks
                        </li>
                        <li className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-blue-500' : 'bg-yellow-400'}`} />
                            Provide Smart Solutions with AI-powered recommendations
                        </li>
                    </ul>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-20"
                >
                    <h2 className={`text-3xl font-bold text-center mb-12 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        Why Choose LinkVault?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-6 rounded-xl transition-all duration-300 ${theme === 'light'
                                    ? 'bg-white shadow-lg hover:shadow-xl hover:bg-blue-50'
                                    : 'bg-slate-800 hover:bg-slate-700'
                                    }`}
                            >
                                <div className={`mb-4 ${theme === 'light' ? 'text-blue-600' : 'text-yellow-400'}`}>
                                    <feature.icon />
                                </div>
                                <h3 className={`text-xl font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                    {feature.title}
                                </h3>
                                <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}>
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Final CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`text-center max-w-3xl mx-auto p-8 rounded-2xl ${theme === 'light'
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50'
                        : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50'
                        }`}
                >
                    <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        Built for Everyone
                    </h2>
                    <p className={`text-lg mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                        Whether you're a student collecting research articles, a professional tracking resources,
                        or a casual browser saving your favorite blogs — LinkVault adapts to your needs.
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default About 