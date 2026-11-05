/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Share2, Edit2, Trash2, Globe, Plus, Activity, RefreshCw, XCircle, CheckCircle2, AlertTriangle, Star, BookOpen, Clock, Folder, Sparkles, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { getTagColor } from './ui/TagInput'
import { config } from '../config'

const LinkCard = ({ link, onEdit, onDelete, onShare, onTagClick, onCheckHealth, onToggleFavorite, onChangeReadingStatus }) => {
    const { theme } = useTheme()
    const [imageError, setImageError] = useState(false)
    const [faviconError, setFaviconError] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [showReadingMenu, setShowReadingMenu] = useState(false)
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
    const [summaryData, setSummaryData] = useState(link?.ai_summary || null)
    const [readingTime, setReadingTime] = useState(link?.reading_time || null)
    const [copiedSummary, setCopiedSummary] = useState(false)

    // Extract hostname safely
    let hostname = ''
    try {
        if (link?.url) {
            hostname = new URL(link.url).hostname.replace(/^www\./, '')
        }
    } catch {
        hostname = ''
    }

    const faviconUrl = link.favicon_url || (hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=128` : null)
    const showImage = Boolean(link.og_image_url && !imageError)

    // Safely parse tags from link.tags or link.description fallback
    let tags = []
    if (Array.isArray(link?.tags)) {
        tags = link.tags.filter(Boolean)
    } else if (typeof link?.tags === 'string' && link.tags.trim()) {
        try {
            const json = JSON.parse(link.tags)
            if (Array.isArray(json)) tags = json
        } catch {
            tags = link.tags.replace(/^[{\[\s"]+|[}\]\s"]+$/g, '').split(/[,;]+/).map(t => t.trim().replace(/^"|"$/g, '')).filter(Boolean)
        }
    }
    if (tags.length === 0 && link?.description) {
        const match = link.description.match(/<!--TAGS:(.*?)-->/)
        if (match && match[1]) {
            try {
                const parsed = JSON.parse(match[1])
                if (Array.isArray(parsed)) tags = parsed
            } catch {}
        }
    }

    // Clean description to remove any encoded comments
    const cleanDescription = (link?.description || '')
        .replace(/<!--TAGS:.*?-->/g, '')
        .replace(/<!--HEALTH:.*?-->/g, '')
        .replace(/<!--FAV:.*?-->/g, '')
        .replace(/<!--READING:.*?-->/g, '')
        .replace(/<!--COLLECTION:.*?-->/g, '')
        .replace(/<!--SUMMARY:.*?-->/g, '')
        .replace(/<!--READTIME:.*?-->/g, '')
        .trim()

    const handleFetchAiSummary = async (e) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        if (summaryData) {
            setIsSummaryExpanded(prev => !prev)
            return
        }

        setIsGeneratingSummary(true)
        setIsSummaryExpanded(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${config.apiUrl}/links/${link.id}/ai-summary`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (res.ok) {
                const data = await res.json()
                setSummaryData(data.ai_summary)
                setReadingTime(data.reading_time)
            }
        } catch (err) {
            console.error('Failed to generate AI summary:', err)
        } finally {
            setIsGeneratingSummary(false)
        }
    }

    const handleCheckHealth = async (e) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        if (isChecking) return
        setIsChecking(true)
        try {
            if (onCheckHealth) {
                await onCheckHealth(link)
            }
        } catch (err) {
            console.error('Failed to check health:', err)
        } finally {
            setIsChecking(false)
        }
    }

    const readingStatus = link?.reading_status || 'unread'

    const renderReadingStatusBadge = () => {
        const config = {
            unread: {
                label: 'Read Later',
                icon: BookOpen,
                className: 'bg-slate-100 text-slate-700 border-slate-200/90 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:border-blue-400'
            },
            reading: {
                label: 'Reading',
                icon: Clock,
                className: 'bg-amber-50 text-amber-700 border-amber-200/90 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/90 hover:border-amber-400'
            },
            finished: {
                label: 'Finished',
                icon: CheckCircle2,
                className: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/90 hover:border-emerald-400'
            }
        }[readingStatus] || {
            label: 'Read Later',
            icon: BookOpen,
            className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
        }

        const Icon = config.icon

        return (
            <div className="relative">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowReadingMenu(prev => !prev)
                    }}
                    title={`Reading status: ${config.label}. Click to change.`}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${config.className}`}
                >
                    <Icon className="w-3 h-3" />
                    <span>{config.label}</span>
                </button>

                {showReadingMenu && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-1 w-32 rounded-lg shadow-xl border bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 z-30 py-1 text-xs overflow-hidden"
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onChangeReadingStatus?.(link, 'unread')
                                setShowReadingMenu(false)
                            }}
                            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer ${readingStatus === 'unread' ? 'text-blue-600 font-semibold bg-blue-50/50 dark:bg-slate-700/50' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                            <span>Read Later</span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onChangeReadingStatus?.(link, 'reading')
                                setShowReadingMenu(false)
                            }}
                            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer ${readingStatus === 'reading' ? 'text-amber-600 font-semibold bg-amber-50/50 dark:bg-slate-700/50' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Reading</span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onChangeReadingStatus?.(link, 'finished')
                                setShowReadingMenu(false)
                            }}
                            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer ${readingStatus === 'finished' ? 'text-emerald-600 font-semibold bg-emerald-50/50 dark:bg-slate-700/50' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Finished</span>
                        </button>
                    </div>
                )}
            </div>
        )
    }

    const renderHealthBadge = () => {
        if (isChecking) {
            return (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                    title="Checking link health..."
                >
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                    <span>Checking</span>
                </span>
            )
        }

        const status = link?.status || 'pending'
        const code = link?.status_code
        const latency = link?.latency_ms

        if (status === 'healthy') {
            return (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/80 cursor-default"
                    title={`Live • ${code || 200} OK${latency ? ` • ${latency}ms` : ''}${link.last_checked_at ? ` • Checked: ${new Date(link.last_checked_at).toLocaleTimeString()}` : ''}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live</span>
                </span>
            )
        }

        if (status === 'broken') {
            return (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/80 cursor-default"
                    title={`Broken • ${code ? `HTTP ${code}` : (link.health_error || 'Unreachable')}${link.last_checked_at ? ` • Checked: ${new Date(link.last_checked_at).toLocaleTimeString()}` : ''}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>Broken</span>
                </span>
            )
        }

        if (status === 'warning') {
            return (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/80 cursor-default"
                    title={`Protected / Auth Required ${code ? `(${code})` : ''}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Warning</span>
                </span>
            )
        }

        // Default: Unchecked / pending
        return (
            <button
                type="button"
                onClick={handleCheckHealth}
                title="Click to check if this bookmark is still active"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-slate-600"
            >
                <Activity className="w-3 h-3" />
                <span>Check</span>
            </button>
        )
    }

    return (
        <motion.div
            whileHover={{
                y: -4,
                boxShadow: theme === 'light'
                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)'
                    : '0 10px 15px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
            }}
            transition={{ duration: 0.2 }}
            className={`group rounded-xl border overflow-hidden flex flex-col transition-colors ${theme === 'light'
                ? 'bg-white border-[#E5E7EB] hover:border-[#2563EB]'
                : 'bg-[#1E293B] border-[#334155] hover:border-[#FACC15]'
                }`}
        >
            {/* Optional OG Image Preview */}
            {showImage && (
                <div className="relative h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-900/60 border-b border-gray-100 dark:border-gray-800">
                    <img
                        src={link.og_image_url}
                        alt={link.title}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                    {hostname && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-xs font-medium bg-black/60 text-white backdrop-blur-sm">
                            {hostname}
                        </span>
                    )}

                    {/* Floating Favorite Star on Thumbnail */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onToggleFavorite?.(link)
                        }}
                        title={link?.is_favorite ? "Pinned Favorite (Click to unpin)" : "Pin to Favorites"}
                        className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                            link?.is_favorite
                                ? 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300/80 scale-105'
                                : 'bg-black/50 text-white/80 hover:text-amber-300 hover:bg-black/70'
                        }`}
                    >
                        <Star className={`w-3.5 h-3.5 ${link?.is_favorite ? 'fill-amber-950' : ''}`} />
                    </button>
                </div>
            )}

            <div className="p-5 flex-1 flex flex-col">
                {/* Header with Favicon, Title, Favorite, Reading Status, Health, and Category */}
                <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-700 shadow-xs">
                            {faviconUrl && !faviconError ? (
                                <img
                                    src={faviconUrl}
                                    alt=""
                                    onError={() => setFaviconError(true)}
                                    className="w-4 h-4 object-contain"
                                    loading="lazy"
                                />
                            ) : (
                                <Globe className="w-4 h-4 text-gray-400" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className={`text-base font-semibold truncate ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`} title={link.title}>
                                {link.title}
                            </h3>
                            {!showImage && hostname && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                    {hostname}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Star Favorite Button in Header */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onToggleFavorite?.(link)
                            }}
                            title={link?.is_favorite ? "Pinned Favorite (Click to unpin)" : "Pin to Favorites"}
                            className={`p-1 rounded-md transition-all cursor-pointer ${
                                link?.is_favorite
                                    ? 'text-amber-400 hover:text-amber-500 scale-110'
                                    : 'text-gray-300 dark:text-gray-600 hover:text-amber-400 hover:scale-110'
                            }`}
                        >
                            <Star className={`w-4 h-4 ${link?.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>

                        {/* Collection Folder Badge */}
                        {link.collection && (
                            <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 whitespace-nowrap"
                                title={`Collection: ${link.collection}`}
                            >
                                <Folder className="w-3 h-3" />
                                {link.collection}
                            </span>
                        )}

                        {renderReadingStatusBadge()}
                        {renderHealthBadge()}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${theme === 'light'
                            ? 'bg-[#F3F4F6] text-[#4B5563]'
                            : 'bg-[#334155] text-[#9CA3AF]'
                            }`}>
                            {link.category}
                        </span>
                    </div>
                </div>

                {/* Broken Link Action Banner */}
                {link.status === 'broken' && (
                    <div className="mb-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex flex-col gap-2 text-xs text-red-700 dark:text-red-300">
                        <div className="flex items-center justify-between gap-1.5">
                            <span className="flex items-center gap-1.5 font-medium truncate">
                                <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
                                <span className="truncate">{link.health_error || (link.status_code ? `HTTP ${link.status_code} Error` : 'Link is unreachable (404/Down)')}</span>
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 flex-shrink-0">
                                Broken
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-red-200/60 dark:border-red-900/40">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    onEdit?.(link)
                                }}
                                className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-[11px] font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer flex items-center gap-1"
                            >
                                <Edit2 className="w-3 h-3" /> Fix / Change URL
                            </button>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-1"
                            >
                                <ExternalLink className="w-3 h-3" /> Test in Browser
                            </a>
                            <button
                                type="button"
                                onClick={handleCheckHealth}
                                disabled={isChecking}
                                className="ml-auto text-[11px] font-medium underline text-red-600 dark:text-red-400 hover:text-red-800 cursor-pointer flex-shrink-0"
                            >
                                {isChecking ? 'Checking...' : 'Re-check'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Protected / Warning Banner */}
                {link.status === 'warning' && (
                    <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                        <span className="flex items-center gap-1.5 truncate">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                            <span className="truncate">{link.health_error || 'Protected / Requires browser login or human check'}</span>
                        </span>
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold underline hover:text-amber-900 dark:hover:text-amber-200 ml-2 flex-shrink-0"
                        >
                            Open Link
                        </a>
                    </div>
                )}

                {/* Description */}
                {cleanDescription ? (
                    <p className={`text-sm line-clamp-2 mb-3 flex-1 ${theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
                        {cleanDescription}
                    </p>
                ) : (
                    <div className="mb-3 flex-1"></div>
                )}

                {/* AI Summary Drawer */}
                <AnimatePresence>
                    {isSummaryExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-3 overflow-hidden"
                        >
                            <div className={`p-3 rounded-xl border text-xs relative ${theme === 'dark'
                                ? 'bg-gradient-to-br from-purple-950/30 to-indigo-950/30 border-purple-800/50 text-slate-200'
                                : 'bg-gradient-to-br from-purple-50/80 to-indigo-50/80 border-purple-200 text-slate-800'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-1.5 font-bold text-purple-600 dark:text-purple-400">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>AI Executive Summary</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {readingTime && (
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                                ⏱️ {readingTime} min read
                                            </span>
                                        )}
                                        {summaryData?.tldr && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    navigator.clipboard.writeText(`${summaryData.tldr}\n\nTakeaways:\n${summaryData.takeaways?.map(t => `- ${t}`).join('\n')}`)
                                                    setCopiedSummary(true)
                                                    setTimeout(() => setCopiedSummary(false), 2000)
                                                }}
                                                className="p-1 rounded text-slate-400 hover:text-purple-400 cursor-pointer"
                                                title="Copy summary"
                                            >
                                                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isGeneratingSummary ? (
                                    <div className="flex items-center space-x-2 py-3 text-purple-400">
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Synthesizing smart takeaways...</span>
                                    </div>
                                ) : summaryData ? (
                                    <div className="space-y-2">
                                        <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {summaryData.tldr}
                                        </p>
                                        {Array.isArray(summaryData.takeaways) && summaryData.takeaways.length > 0 && (
                                            <ul className="space-y-1 pt-1 border-t border-purple-500/20">
                                                {summaryData.takeaways.map((point, idx) => (
                                                    <li key={idx} className="flex items-start space-x-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                                                        <span className="text-purple-400 font-bold shrink-0">✦</span>
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 italic">No summary available yet.</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {tags.length > 0 ? (
                        tags.map((tag) => {
                            const color = getTagColor(tag)
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onTagClick?.(tag)
                                    }}
                                    title={`Filter by #${tag}`}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border transition-transform hover:scale-105 active:scale-95 cursor-pointer ${color.bg} ${color.text} ${color.border}`}
                                >
                                    #{tag}
                                </button>
                            )
                        })
                    ) : (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onEdit?.(link)
                            }}
                            className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-yellow-400 transition-colors cursor-pointer"
                        >
                            <Plus className="w-3 h-3" /> Add tag
                        </button>
                    )}
                </div>

                {/* Footer with Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
                    {/* Visit Link Button */}
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${theme === 'light'
                            ? 'text-[#2563EB] hover:text-[#1D4ED8]'
                            : 'text-[#FACC15] hover:text-[#EAB308]'
                            }`}
                    >
                        Visit Link
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                        {/* AI Summary Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleFetchAiSummary}
                            disabled={isGeneratingSummary}
                            title={isSummaryExpanded ? "Hide AI Summary" : "Generate / View AI Summary & Read Time"}
                            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                                isSummaryExpanded
                                    ? 'text-purple-400 bg-purple-50 dark:bg-purple-950/40 ring-1 ring-purple-400/50'
                                    : theme === 'light'
                                        ? 'hover:bg-[#F3F4F6] text-[#4B5563] hover:text-purple-600'
                                        : 'hover:bg-[#334155] text-[#9CA3AF] hover:text-purple-400'
                            }`}
                        >
                            <Sparkles className={`w-4 h-4 ${isGeneratingSummary ? 'animate-spin text-purple-500' : ''}`} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onToggleFavorite?.(link)
                            }}
                            title={link?.is_favorite ? "Remove from Favorites" : "Pin to Favorites"}
                            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                                link?.is_favorite
                                    ? 'text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                                    : theme === 'light'
                                        ? 'hover:bg-[#F3F4F6] text-[#4B5563] hover:text-amber-500'
                                        : 'hover:bg-[#334155] text-[#9CA3AF] hover:text-amber-400'
                            }`}
                        >
                            <Star className={`w-4 h-4 ${link?.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCheckHealth}
                            disabled={isChecking}
                            title={link.last_checked_at ? `Re-check Link Health (Last: ${new Date(link.last_checked_at).toLocaleTimeString()})` : "Check Link Health"}
                            className={`p-1.5 rounded-full transition-colors ${theme === 'light'
                                ? 'hover:bg-[#F3F4F6] text-[#4B5563] hover:text-emerald-600'
                                : 'hover:bg-[#334155] text-[#9CA3AF] hover:text-emerald-400'
                                }`}
                        >
                            <Activity className={`w-4 h-4 ${isChecking ? 'animate-spin text-blue-500' : ''}`} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onShare?.(link)}
                            title="Share Link"
                            className={`p-1.5 rounded-full transition-colors ${theme === 'light'
                                ? 'hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#2563EB]'
                                : 'hover:bg-[#334155] text-[#9CA3AF] hover:text-[#FACC15]'
                                }`}
                        >
                            <Share2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onEdit?.(link)}
                            title="Edit Link"
                            className={`p-1.5 rounded-full transition-colors ${theme === 'light'
                                ? 'hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#2563EB]'
                                : 'hover:bg-[#334155] text-[#9CA3AF] hover:text-[#FACC15]'
                                }`}
                        >
                            <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete?.(link)}
                            title="Delete Link"
                            className={`p-1.5 rounded-full transition-colors ${theme === 'light'
                                ? 'hover:bg-[#FEE2E2] text-[#4B5563] hover:text-red-500'
                                : 'hover:bg-red-900/30 text-[#9CA3AF] hover:text-red-400'
                                }`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default LinkCard 