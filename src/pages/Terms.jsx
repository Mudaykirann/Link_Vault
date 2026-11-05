import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { FileText, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Terms = () => {
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
                        <FileText className="w-8 h-8 text-blue-500" />
                        <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            Terms of Service
                        </h1>
                    </div>

                    <div className={`space-y-6 text-base leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                        <p>
                            By accessing or using LinkVault, you agree to be bound by these Terms of Service.
                        </p>
                        <h2 className={`text-xl font-semibold mt-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                            1. User Responsibilities
                        </h2>
                        <p>
                            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                        </p>
                        <h2 className={`text-xl font-semibold mt-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                            2. Acceptable Use
                        </h2>
                        <p>
                            You agree not to use LinkVault to store or disseminate malicious links, phishing scams, or content that violates any applicable local or international laws.
                        </p>
                        <h2 className={`text-xl font-semibold mt-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                            3. Service Availability
                        </h2>
                        <p>
                            We strive to maintain continuous uptime and reliable access to your links, but cannot guarantee uninterrupted service. We encourage users to use our built-in CSV export tool for regular backups.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Terms
