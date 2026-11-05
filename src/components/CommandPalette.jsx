/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Command, Plus, Trash2, ArrowRight, BarChart3,
    Bookmark, Folder, ShieldCheck, Sun, Moon, Download,
    Upload, User, ExternalLink, Sparkles, Tag, Layers, X
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { config } from '../config'

export const CommandPalette = ({ isOpen: controlledIsOpen, onClose: controlledOnClose }) => {
    const { theme, toggleTheme } = useTheme()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [isOpenInternal, setIsOpenInternal] = useState(false)
    const isControlled = controlledIsOpen !== undefined
    const isOpen = isControlled ? controlledIsOpen : isOpenInternal
    const closePalette = () => {
        if (isControlled && controlledOnClose) {
            controlledOnClose()
        } else {
            setIsOpenInternal(false)
        }
    }

    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [links, setLinks] = useState([])
    const [isLoadingLinks, setIsLoadingLinks] = useState(false)
    const inputRef = useRef(null)
    const listRef = useRef(null)

    // Global keyboard listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore hotkeys when typing in form inputs (unless it's Cmd+K)
            const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) ||
                document.activeElement?.isContentEditable

            // Cmd+K or Ctrl+K to toggle palette
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                if (isOpen) {
                    closePalette()
                } else {
                    if (isControlled && controlledOnClose) {
                        // Let controlled parent handle it if needed
                    } else {
                        setIsOpenInternal(true)
                    }
                }
                return
            }

            // Close on Escape
            if (e.key === 'Escape' && isOpen) {
                e.preventDefault()
                closePalette()
                return
            }

            // Quick single-key hotkeys when not in an input and palette is closed
            if (!isTyping && !isOpen) {
                if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                    e.preventDefault()
                    setIsOpenInternal(true)
                } else if (e.key === 't' || e.key === 'T') {
                    e.preventDefault()
                    toggleTheme()
                } else if (e.key === 'n' || e.key === 'N') {
                    e.preventDefault()
                    window.dispatchEvent(new CustomEvent('linkvault:open-new-link'))
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, isControlled, controlledOnClose, toggleTheme])

    // Fetch user links for search when palette opens
    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)

            if (user) {
                fetchLinks()
            }
        }
    }, [isOpen, user])

    const fetchLinks = async () => {
        setIsLoadingLinks(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${config.apiUrl}/links`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (res.ok) {
                const data = await res.json()
                setLinks(Array.isArray(data) ? data : [])
            }
        } catch (err) {
            console.error('Failed to load links for command palette:', err)
        } finally {
            setIsLoadingLinks(false)
        }
    }

    // Static Navigation & Actions
    const staticActions = [
        {
            id: 'action-new-link',
            type: 'action',
            title: 'Add New Bookmark',
            subtitle: 'Save a new URL with auto-metadata',
            icon: Plus,
            shortcut: 'N',
            action: () => {
                closePalette()
                window.dispatchEvent(new CustomEvent('linkvault:open-new-link'))
            }
        },
        {
            id: 'action-import-export',
            type: 'action',
            title: 'Import & Export Bookmarks',
            subtitle: 'Upload Chrome/Firefox HTML or download JSON backup',
            icon: Upload,
            shortcut: 'I',
            action: () => {
                closePalette()
                window.dispatchEvent(new CustomEvent('linkvault:open-import-export'))
            }
        },
        {
            id: 'action-duplicates',
            type: 'action',
            title: 'Scan & Clean Duplicates',
            subtitle: 'Merge duplicate URLs into clean bookmarks',
            icon: Layers,
            shortcut: 'D',
            action: () => {
                closePalette()
                window.dispatchEvent(new CustomEvent('linkvault:open-duplicate-cleaner'))
            }
        },
        {
            id: 'action-toggle-theme',
            type: 'action',
            title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
            subtitle: 'Toggle interface theme',
            icon: theme === 'dark' ? Sun : Moon,
            shortcut: 'T',
            action: () => {
                toggleTheme()
                closePalette()
            }
        },
        {
            id: 'nav-dashboard',
            type: 'navigation',
            title: 'Go to Dashboard',
            subtitle: 'Your primary link overview & quick filters',
            icon: Bookmark,
            shortcut: 'G D',
            action: () => {
                navigate('/dashboard')
                closePalette()
            }
        },
        {
            id: 'nav-links',
            type: 'navigation',
            title: 'Go to All Links',
            subtitle: 'Detailed grid, search, and health audit',
            icon: Folder,
            shortcut: 'G L',
            action: () => {
                navigate('/links')
                closePalette()
            }
        },
        {
            id: 'nav-analytics',
            type: 'navigation',
            title: 'Go to Analytics & Velocity',
            subtitle: 'Productivity trends, streaks, and platform rankings',
            icon: BarChart3,
            shortcut: 'G A',
            action: () => {
                navigate('/analytics')
                closePalette()
            }
        },
        {
            id: 'nav-profile',
            type: 'navigation',
            title: 'Go to Profile & Account',
            subtitle: 'Manage user settings and preferences',
            icon: User,
            shortcut: 'G P',
            action: () => {
                navigate('/profile')
                closePalette()
            }
        }
    ]

    // Filter items based on query
    const cleanQuery = query.trim().toLowerCase()

    const filteredActions = cleanQuery
        ? staticActions.filter(a =>
            a.title.toLowerCase().includes(cleanQuery) ||
            a.subtitle.toLowerCase().includes(cleanQuery)
        )
        : staticActions

    const filteredLinks = cleanQuery
        ? links.filter(l =>
            (l.title && l.title.toLowerCase().includes(cleanQuery)) ||
            (l.url && l.url.toLowerCase().includes(cleanQuery)) ||
            (l.category && l.category.toLowerCase().includes(cleanQuery)) ||
            (l.collection && l.collection.toLowerCase().includes(cleanQuery)) ||
            (Array.isArray(l.tags) && l.tags.some(t => t.toLowerCase().includes(cleanQuery)))
        ).slice(0, 8)
        : []

    // Combined items list for navigation
    const allItems = [
        ...filteredActions,
        ...filteredLinks.map(l => ({
            id: `link-${l.id}`,
            type: 'link',
            title: l.title || l.url,
            subtitle: l.url,
            category: l.category,
            collection: l.collection,
            tags: l.tags,
            favicon: l.favicon_url,
            action: () => {
                window.open(l.url, '_blank', 'noopener,noreferrer')
                closePalette()
            }
        }))
    ]

    // Handle list navigation keys
    const handleInputKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => (prev + 1) % Math.max(allItems.length, 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(allItems.length, 1))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (allItems[selectedIndex]) {
                allItems[selectedIndex].action()
            }
        }
    }

    // Auto-scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const activeEl = listRef.current.querySelector('[data-selected="true"]')
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' })
            }
        }
    }, [selectedIndex])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePalette}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                    />

                    {/* Spotlight Palette Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border ${theme === 'dark'
                            ? 'bg-slate-900/95 border-slate-700/80 text-white shadow-purple-900/20'
                            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-400/20'
                            } backdrop-blur-xl`}
                    >
                        {/* Search Input Bar */}
                        <div className={`flex items-center px-4 py-3.5 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
                            }`}>
                            <Search className={`w-5 h-5 mr-3 shrink-0 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                }`} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value)
                                    setSelectedIndex(0)
                                }}
                                onKeyDown={handleInputKeyDown}
                                placeholder="Search bookmarks, jump to page, or run actions... (e.g. 'new', 'dark')"
                                className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder-slate-400 font-medium"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-200 mr-2"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <div className="flex items-center space-x-1 shrink-0">
                                <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${theme === 'dark'
                                    ? 'bg-slate-800/80 border-slate-700 text-slate-400'
                                    : 'bg-slate-100 border-slate-300 text-slate-600'
                                    }`}>
                                    ESC
                                </span>
                            </div>
                        </div>

                        {/* Results Body */}
                        <div
                            ref={listRef}
                            className="max-h-[380px] overflow-y-auto p-2 divide-y divide-transparent scrollbar-thin scrollbar-thumb-rounded"
                        >
                            {allItems.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <p className="text-sm text-slate-400">No matching commands or bookmarks found for &quot;{query}&quot;</p>
                                    <p className="text-xs text-slate-500 mt-1">Try searching for a URL domain, tag, or action like &quot;import&quot;</p>
                                </div>
                            ) : (
                                <>
                                    {/* Actions & Navigation Section */}
                                    {filteredActions.length > 0 && (
                                        <div className="mb-2">
                                            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                                {query ? 'Commands & Navigation' : 'Quick Actions & Jump'}
                                            </div>
                                            {filteredActions.map((item) => {
                                                const globalIdx = allItems.findIndex(i => i.id === item.id)
                                                const isSelected = selectedIndex === globalIdx
                                                const Icon = item.icon
                                                return (
                                                    <div
                                                        key={item.id}
                                                        data-selected={isSelected}
                                                        onClick={item.action}
                                                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${isSelected
                                                            ? theme === 'dark'
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-purple-600 text-white shadow-sm'
                                                            : theme === 'dark'
                                                                ? 'hover:bg-slate-800/60 text-slate-200'
                                                                : 'hover:bg-slate-100 text-slate-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-3 min-w-0">
                                                            <div className={`p-1.5 rounded-lg shrink-0 ${isSelected
                                                                ? 'bg-white/20 text-white'
                                                                : theme === 'dark'
                                                                    ? 'bg-slate-800 text-purple-400'
                                                                    : 'bg-purple-50 text-purple-600'
                                                                }`}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-sm font-medium truncate">{item.title}</p>
                                                                <p className={`text-xs truncate ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                                                                    {item.subtitle}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {item.shortcut && (
                                                            <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-medium shrink-0 ml-2 ${isSelected
                                                                ? 'bg-white/20 text-white'
                                                                : theme === 'dark'
                                                                    ? 'bg-slate-800 text-slate-400'
                                                                    : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {item.shortcut}
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* Matching Bookmarks Section */}
                                    {filteredLinks.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-slate-700/40">
                                            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                                <span>Matching Bookmarks</span>
                                                <span className="text-[10px] lowercase text-slate-500 font-normal">Opens in new tab ↗</span>
                                            </div>
                                            {filteredLinks.map((item) => {
                                                const itemId = `link-${item.id}`
                                                const globalIdx = allItems.findIndex(i => i.id === itemId)
                                                const isSelected = selectedIndex === globalIdx
                                                return (
                                                    <div
                                                        key={itemId}
                                                        data-selected={isSelected}
                                                        onClick={() => {
                                                            window.open(item.url, '_blank', 'noopener,noreferrer')
                                                            closePalette()
                                                        }}
                                                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${isSelected
                                                            ? theme === 'dark'
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-purple-600 text-white shadow-sm'
                                                            : theme === 'dark'
                                                                ? 'hover:bg-slate-800/60 text-slate-200'
                                                                : 'hover:bg-slate-100 text-slate-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-3 min-w-0">
                                                            <div className="w-5 h-5 rounded shrink-0 flex items-center justify-center overflow-hidden bg-slate-800/40">
                                                                {item.favicon_url ? (
                                                                    <img
                                                                        src={item.favicon_url}
                                                                        alt=""
                                                                        className="w-4 h-4 object-contain"
                                                                        onError={(e) => { e.target.style.display = 'none' }}
                                                                    />
                                                                ) : (
                                                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div className="truncate">
                                                                <div className="flex items-center space-x-2">
                                                                    <p className="text-sm font-medium truncate">{item.title || item.url}</p>
                                                                    {item.collection && (
                                                                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${isSelected
                                                                            ? 'bg-white/20 text-white'
                                                                            : 'bg-indigo-500/10 text-indigo-400'
                                                                            }`}>
                                                                            📁 {item.collection}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className={`text-xs truncate ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                                                                    {item.url}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 shrink-0 ml-3">
                                                            {Array.isArray(item.tags) && item.tags.slice(0, 2).map(tag => (
                                                                <span
                                                                    key={tag}
                                                                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected
                                                                        ? 'bg-white/20 text-white'
                                                                        : 'bg-slate-700/60 text-slate-300'
                                                                        }`}
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                            <ExternalLink className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer Hints */}
                        <div className={`px-4 py-2.5 text-xs flex items-center justify-between border-t ${theme === 'dark' ? 'border-slate-800/80 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                            }`}>
                            <div className="flex items-center space-x-3">
                                <span className="flex items-center space-x-1">
                                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">↑↓</kbd>
                                    <span>Navigate</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">↵</kbd>
                                    <span>Select</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">Esc</kbd>
                                    <span>Close</span>
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-[11px]">
                                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                <span>LinkVault Pro</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default CommandPalette
