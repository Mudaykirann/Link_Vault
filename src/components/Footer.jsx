/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'

const Footer = () => {
    const { theme } = useTheme()

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`border-t ${theme === 'light'
                ? 'bg-white border-[#E5E7EB]'
                : 'bg-[#0f172a] border-[#1E293B]'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Copyright */}
                    <div className={theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}>
                        © {new Date().getFullYear()} LinkVault. All rights reserved.
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            to="/privacy"
                            className={`transition-colors duration-200 cursor-pointer ${theme === 'light'
                                ? 'text-[#4B5563] hover:text-[#2563EB]'
                                : 'text-[#9CA3AF] hover:text-[#FACC15]'
                                }`}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms"
                            className={`transition-colors duration-200 ${theme === 'light'
                                ? 'text-[#4B5563] hover:text-[#2563EB]'
                                : 'text-[#9CA3AF] hover:text-[#FACC15]'
                                }`}
                        >
                            Terms of Service
                        </Link>
                        <a
                            href="https://github.com/yourusername/linkvault"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-colors duration-200 cursor-pointer ${theme === 'light'
                                ? 'text-[#4B5563] hover:text-[#2563EB]'
                                : 'text-[#9CA3AF] hover:text-[#FACC15]'
                                }`}
                        >
                            <Github className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </motion.footer>
    )
}

export default Footer