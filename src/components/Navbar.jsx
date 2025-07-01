/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, X, Link as LinkIcon } from 'lucide-react'
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
            className={`relative px-4 py-2 rounded-md text-base font-medium transition-all duration-200 block w-full md:w-auto
                ${isActive
                    ? `${theme === 'light'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-yellow-400 bg-gray-800'}`
                    : `${theme === 'light'
                        ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                        : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'}`
                }`}
        >
            {children}
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-md ${theme === 'light'
                        ? 'bg-blue-100/50'
                        : 'bg-gray-700/50'
                        }`}
                    transition={{ type: "spring", duration: 0.5 }}
                />
            )}
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

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`sticky top-0 z-50 backdrop-blur-lg border-b w-full transition-all duration-300
                ${theme === 'light'
                    ? 'bg-white/90 border-gray-200 shadow-sm'
                    : 'bg-gray-900/90 border-gray-700 shadow-md'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <Link to="/" className="flex items-center">
                        <LinkIcon className={`w-6 h-6 mr-2 ${theme === 'light' ? 'text-blue-600' : 'text-yellow-400'}`} />
                        <span className={`text-xl md:text-2xl font-bold transition-colors duration-200
                            ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            Link<span className={theme === 'light' ? 'text-blue-600' : 'text-yellow-400'}>Vault</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {user && (
                            <Link
                                to="/dashboard"
                                className={`transition-all duration-200 text-base hover:scale-105
                                ${theme === 'light'
                                        ? 'text-gray-600 hover:text-blue-600'
                                        : 'text-gray-300 hover:text-yellow-400'}`}
                            >
                                Dashboard
                            </Link>
                        )}
                        <Link
                            to="/about"
                            className={`transition-all duration-200 text-base hover:scale-105
                                ${theme === 'light'
                                    ? 'text-gray-600 hover:text-blue-600'
                                    : 'text-gray-300 hover:text-yellow-400'}`}
                        >
                            About
                        </Link>
                        <Link
                            to="/contact"
                            className={`transition-all duration-200 text-base hover:scale-105
                                ${theme === 'light'
                                    ? 'text-gray-600 hover:text-blue-600'
                                    : 'text-gray-300 hover:text-yellow-400'}`}
                        >
                            Contact
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to="/links"
                                    className={`transition-all duration-200 text-base hover:scale-105
                                        ${theme === 'light'
                                            ? 'text-gray-600 hover:text-blue-600'
                                            : 'text-gray-300 hover:text-yellow-400'}`}
                                >
                                    My Links
                                </Link>
                                <button
                                    onClick={logout}
                                    className={`transition-all duration-200 text-base hover:scale-105
                                        ${theme === 'light'
                                            ? 'text-gray-600 hover:text-blue-600'
                                            : 'text-gray-300 hover:text-yellow-400'}`}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className={`transition-all duration-200 text-base hover:scale-105
                                    ${theme === 'light'
                                        ? 'text-gray-600 hover:text-blue-600'
                                        : 'text-gray-300 hover:text-yellow-400'}`}
                            >
                                Login
                            </Link>
                        )}

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-all duration-200 hover:scale-105
                                ${theme === 'light'
                                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon className="w-5 h-5" />
                            ) : (
                                <Sun className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden space-x-4">
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-all duration-200
                                ${theme === 'light'
                                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon className="w-5 h-5" />
                            ) : (
                                <Sun className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            className={`p-2 rounded-lg transition-colors duration-200
                                ${theme === 'light'
                                    ? 'text-gray-600 hover:bg-gray-100'
                                    : 'text-gray-300 hover:bg-gray-800'}`}
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
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
                            className={`md:hidden overflow-hidden rounded-b-lg
                                ${theme === 'light'
                                    ? 'bg-white border-t border-gray-100'
                                    : 'bg-gray-900 border-t border-gray-800'}`}
                        >
                            <div className="px-2 pt-2 pb-3 space-y-2">
                                {user ? (
                                    <>
                                        <NavLink to="/links" onClick={() => setIsOpen(false)}>My Links</NavLink>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 rounded-md text-base font-medium 
                                                transition-all duration-200
                                                ${theme === 'light'
                                                    ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                                    : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'}`}
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <NavLink to="/login" onClick={() => setIsOpen(false)}>Login</NavLink>
                                )}
                                <NavLink to="/about" onClick={() => setIsOpen(false)}>About</NavLink>
                                <NavLink to="/contact" onClick={() => setIsOpen(false)}>Contact</NavLink>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    )
}

export default Navbar;