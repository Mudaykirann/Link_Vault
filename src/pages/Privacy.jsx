import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Privacy = () => {
    const { theme } = useTheme()
    const navigate = useNavigate()

    return (
        <div className={`min-h-screen py-12 ${theme === 'light' ? 'bg-gray-50' : 'bg-[#0f172a]'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-8 rounded-2xl shadow-sm border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}`}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="w-8 h-8 text-blue-500" />
                        <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            Privacy Policy
                        </h1>
                    </div>

                    <div className={`space-y-6 text-base leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                        <p>
                            Welcome to LinkVault. We value your privacy and are committed to protecting your personal data and digital bookmarks.
                        </p>
                        <h2 className={`text-xl font-semibold mt-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                            1. Information We Collect
                        </h2>
                        <p>
                            We only collect essential account information such as your email address, username, and the bookmarks, categories, and tags you choose to save in LinkVault.
                        </p>
                        <h2 className={`text-xl font-semibold mt-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                            2. How We Use Your Data
                        </h2>
                        <p>
                            Your saved links are solely used to provide your personalized bookmarking service. We never sell your personal data or your saved browsing history to advertisers or third parties.
                        </p>
                        <h2 className={`text-xl font-semibold mt-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                            3. Data Security
                        </h2>
                        <p>
                            All user credentials and bookmark data are secured with enterprise-grade encryption and token-based authentication via Supabase.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Privacy
