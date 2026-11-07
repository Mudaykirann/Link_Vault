/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, X, Link as LinkIcon, Search, Upload, User, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const NavLink = ({ to, children, onClick }) => {
    const location = useLocation()
    const isActive = location.pathname === to
    const { theme } = useTheme()

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`relative px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 block w-full md:w-auto
                ${isActive
                    ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200/50 dark:border-cyan-800/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100/70 dark:hover:bg-[#14181F]'
                }`}
        >
            {children}
        </Link>
    )
}

const Navbar = () => {
    const { theme, toggleTheme } = useTheme()
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [_isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const userInitial = user?.name?.[0] || user?.username?.[0] || user?.email?.[0] || 'U'

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`sticky top-0 z-50 backdrop-blur-xl border-b w-full transition-all duration-300
                ${theme === 'light'
                    ? 'bg-[#F7F8F9]/85 border-slate-200/80 shadow-sm'
                    : 'bg-[#08090A]/85 border-[#1B2028] shadow-md'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                            <LinkIcon className="w-5 h-5 text-slate-950" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Link<span className="text-cyan-500">Vault</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
                        {user && (
                            <NavLink to="/dashboard">Dashboard</NavLink>
                        )}
                        <NavLink to="/about">About</NavLink>
                        <NavLink to="/contact">Contact</NavLink>

                        {user && (
                            <>
                                <NavLink to="/links">My Links</NavLink>
                                <NavLink to="/analytics">Analytics</NavLink>
                            </>
                        )}

                        {/* Quick Command Palette Button */}
                        {user && (
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('linkvault:open-command-palette'))}
                                title="Open Spotlight Command Palette (Ctrl+K or Cmd+K)"
                                className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ml-2 ${
                                    theme === 'light'
                                        ? 'bg-slate-100/90 border-slate-200 text-slate-700 hover:border-cyan-400 hover:bg-cyan-50/50 hover:text-cyan-700'
                                        : 'bg-[#0F1216] border-[#1B2028] text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300'
                                }`}
                            >
                                <Search className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Spotlight</span>
                                <kbd className="px-1.5 py-0.5 rounded bg-black/20 dark:bg-black/40 text-[10px] font-mono text-cyan-400 border border-cyan-500/30">⌘K</kbd>
                            </button>
                        )}

                        {/* Import/Export Trigger Button */}
                        {user && (
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('linkvault:open-import-export'))}
                                title="Import & Export Bookmarks"
                                className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                    theme === 'light'
                                        ? 'bg-cyan-50/80 border-cyan-200 text-cyan-800 hover:bg-cyan-100'
                                        : 'bg-cyan-950/40 border-cyan-800 text-cyan-300 hover:bg-cyan-900/50'
                                }`}
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Import / Export</span>
                            </button>
                        )}

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ml-1 ${
                                theme === 'light'
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    : 'bg-[#14181F] hover:bg-[#1B2028] text-slate-300'
                            }`}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon className="w-4 h-4" />
                            ) : (
                                <Sun className="w-4 h-4 text-cyan-400" />
                            )}
                        </button>

                        {/* User Profile or Login CTA */}
                        {user ? (
                            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-[#1B2028]">
                                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#14181F] border border-slate-200/80 dark:border-[#1B2028]">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name || 'User'} className="w-6 h-6 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 flex items-center justify-center text-xs font-bold uppercase">
                                            {userInitial}
                                        </div>
                                    )}
                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                                        {user.name || user.username || user.email?.split('@')[0]}
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    title="Sign out"
                                    className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 pl-2">
                                <Link
                                    to="/login"
                                    className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-400 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-1.5 rounded-xl text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/25 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden space-x-2">
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-xl transition-all duration-200 ${
                                theme === 'light'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-[#14181F] text-slate-300'
                            }`}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon className="w-4 h-4" />
                            ) : (
                                <Sun className="w-4 h-4 text-cyan-400" />
                            )}
                        </button>
                        <button
                            className={`p-2 rounded-xl transition-colors duration-200 ${
                                theme === 'light'
                                    ? 'text-slate-700 hover:bg-slate-100'
                                    : 'text-slate-300 hover:bg-[#14181F]'
                            }`}
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`md:hidden overflow-hidden rounded-2xl mb-4 border ${
                                theme === 'light'
                                    ? 'bg-white border-slate-200 shadow-xl'
                                    : 'bg-[#0F1216] border-[#1B2028] shadow-xl'
                            }`}
                        >
                            <div className="px-4 py-4 space-y-2">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 p-2 mb-2 rounded-xl bg-slate-50 dark:bg-[#14181F] border border-slate-200 dark:border-[#1B2028]">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 flex items-center justify-center text-sm font-bold uppercase">
                                                {userInitial}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {user.name || user.username || user.email?.split('@')[0]}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <NavLink to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</NavLink>
                                        <NavLink to="/links" onClick={() => setIsOpen(false)}>My Links</NavLink>
                                        <NavLink to="/analytics" onClick={() => setIsOpen(false)}>Analytics</NavLink>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-2 pt-2">
                                        <NavLink to="/login" onClick={() => setIsOpen(false)}>Sign In</NavLink>
                                        <NavLink to="/register" onClick={() => setIsOpen(false)}>Create Account</NavLink>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 dark:border-[#1B2028] pt-2">
                                    <NavLink to="/about" onClick={() => setIsOpen(false)}>About LinkVault</NavLink>
                                    <NavLink to="/contact" onClick={() => setIsOpen(false)}>Contact & Support</NavLink>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    )
}

export default Navbar;