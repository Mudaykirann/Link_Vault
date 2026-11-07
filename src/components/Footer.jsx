/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'
import { Github, Link as LinkIcon } from 'lucide-react'

const Footer = () => {
    const { theme } = useTheme()

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`border-t transition-colors ${theme === 'light'
                ? 'bg-white border-slate-200'
                : 'bg-[#050608] border-[#181C24]'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Brand & Copyright */}
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-[#8A94A6]">
                        <span>© {new Date().getFullYear()} LinkVault. All rights reserved.</span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6 text-sm font-semibold">
                        <Link
                            to="/privacy"
                            className={`transition-colors duration-200 cursor-pointer ${theme === 'light'
                                ? 'text-slate-600 hover:text-[#0E7490]'
                                : 'text-[#8A94A6] hover:text-cyan-400'
                                }`}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms"
                            className={`transition-colors duration-200 cursor-pointer ${theme === 'light'
                                ? 'text-slate-600 hover:text-[#0E7490]'
                                : 'text-[#8A94A6] hover:text-cyan-400'
                                }`}
                        >
                            Terms of Service
                        </Link>
                        <a
                            href="https://github.com/Mudaykirann/Link_Vault"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-colors duration-200 cursor-pointer ${theme === 'light'
                                ? 'text-slate-600 hover:text-[#0E7490]'
                                : 'text-[#8A94A6] hover:text-cyan-400'
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