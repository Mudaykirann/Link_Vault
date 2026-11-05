import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Layers, Trash2, CheckCircle2, AlertTriangle, ExternalLink, X, Loader2, Sparkles } from 'lucide-react'
import { ThemedModal } from './ui/ThemedModal'
import { ThemedButton } from './ui/ThemedButton'
import { config } from '../config'
import { useTheme } from '../context/ThemeContext'
import { getTagColor } from './ui/TagInput'

export const DuplicateCleanerModal = ({ isOpen, onClose, onDuplicatesMerged }) => {
    const { theme } = useTheme()
    const [isLoading, setIsLoading] = useState(true)
    const [isMerging, setIsMerging] = useState(false)
    const [duplicateData, setDuplicateData] = useState({ totalDuplicates: 0, groupCount: 0, groups: [] })
    const [statusMessage, setStatusMessage] = useState(null)

    useEffect(() => {
        if (isOpen) {
            fetchDuplicates()
        } else {
            setStatusMessage(null)
        }
    }, [isOpen])

    const fetchDuplicates = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/duplicates`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()
            if (response.ok) {
                setDuplicateData(data)
            }
        } catch (error) {
            console.error('Failed to fetch duplicates:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleMergeGroup = async (group) => {
        if (!group || !group.primaryLink || group.links.length < 2) return
        setIsMerging(true)
        setStatusMessage(null)

        const primaryId = group.primaryLink.id
        const duplicateIds = group.links.map(l => l.id).filter(id => id !== primaryId)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/merge-duplicates`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    primaryLinkId: primaryId,
                    duplicateLinkIds: duplicateIds
                })
            })
            const result = await response.json()
            if (response.ok) {
                setStatusMessage({
                    type: 'success',
                    message: `Merged ${duplicateIds.length} copies of "${group.primaryLink.title}" successfully!`
                })
                // Remove group locally from view
                setDuplicateData(prev => ({
                    ...prev,
                    totalDuplicates: Math.max(0, prev.totalDuplicates - duplicateIds.length),
                    groupCount: Math.max(0, prev.groupCount - 1),
                    groups: prev.groups.filter(g => g.normalizedUrl !== group.normalizedUrl)
                }))
                if (onDuplicatesMerged) {
                    onDuplicatesMerged(result.mergedLink, result.deletedIds)
                }
            } else {
                setStatusMessage({ type: 'error', message: result.error || 'Failed to merge duplicates' })
            }
        } catch (err) {
            console.error('Merge error:', err)
            setStatusMessage({ type: 'error', message: 'Network error while merging duplicates' })
        } finally {
            setIsMerging(false)
        }
    }

    const handleDeleteSingle = async (linkId, groupUrl) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/${linkId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                setDuplicateData(prev => {
                    const updatedGroups = prev.groups.map(g => {
                        if (g.normalizedUrl === groupUrl) {
                            const newLinks = g.links.filter(l => l.id !== linkId)
                            return {
                                ...g,
                                count: newLinks.length,
                                links: newLinks
                            }
                        }
                        return g
                    }).filter(g => g.count > 1)

                    return {
                        ...prev,
                        totalDuplicates: Math.max(0, prev.totalDuplicates - 1),
                        groupCount: updatedGroups.length,
                        groups: updatedGroups
                    }
                })
                if (onDuplicatesMerged) {
                    onDuplicatesMerged(null, [linkId])
                }
            }
        } catch (err) {
            console.error('Delete duplicate error:', err)
        }
    }

    return (
        <ThemedModal
            isOpen={isOpen}
            onClose={onClose}
            title="Duplicate Bookmark Cleaner"
        >
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                {/* Header Description */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pb-2 border-b dark:border-slate-700">
                    <span className="flex items-center gap-1.5">
                        <Copy className="w-4 h-4 text-blue-500" />
                        Detects identical URLs saved with different titles, categories, or tracking parameters.
                    </span>
                    {duplicateData.totalDuplicates > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-semibold text-[11px]">
                            {duplicateData.totalDuplicates} duplicates
                        </span>
                    )}
                </div>

                {/* Status Message */}
                {statusMessage && (
                    <div className={`p-3 rounded-lg text-xs flex items-center justify-between ${
                        statusMessage.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                            : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            {statusMessage.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            <span>{statusMessage.message}</span>
                        </div>
                        <button type="button" onClick={() => setStatusMessage(null)}>
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="text-xs">Analyzing your bookmark vault for duplicate URLs...</span>
                    </div>
                ) : duplicateData.groups.length === 0 ? (
                    /* Clean Zero State */
                    <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            Your Vault is Clean!
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                            No duplicate URLs found. LinkVault actively monitors new links to keep your collection organized and clutter-free.
                        </p>
                        <ThemedButton variant="secondary" onClick={onClose} className="mt-2 text-xs">
                            Close Window
                        </ThemedButton>
                    </div>
                ) : (
                    /* List of Duplicate Groups */
                    <div className="space-y-4">
                        {duplicateData.groups.map((group, idx) => (
                            <div
                                key={group.normalizedUrl || idx}
                                className="p-3.5 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-xs flex flex-col gap-3"
                            >
                                {/* Group Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                                                {group.count} Copies
                                            </span>
                                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate" title={group.primaryLink?.title}>
                                                {group.primaryLink?.title}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5" title={group.normalizedUrl}>
                                            {group.normalizedUrl}
                                        </p>
                                    </div>
                                    <ThemedButton
                                        variant="primary"
                                        disabled={isMerging}
                                        onClick={() => handleMergeGroup(group)}
                                        className="text-xs px-2.5 py-1.5 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
                                        title="Keep primary bookmark, combine all tags, and delete redundant copies"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                        <span>Merge Copies</span>
                                    </ThemedButton>
                                </div>

                                {/* Duplicate Instances */}
                                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-700/60">
                                    {group.links.map((link, lIdx) => (
                                        <div
                                            key={link.id}
                                            className={`p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                                                lIdx === 0
                                                    ? 'bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40'
                                                    : 'bg-gray-50 dark:bg-slate-700/40 border border-transparent'
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1 pr-2">
                                                <div className="flex items-center gap-2">
                                                    {lIdx === 0 ? (
                                                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-blue-600 text-white">
                                                            Primary
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300">
                                                            Copy #{lIdx + 1}
                                                        </span>
                                                    )}
                                                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                                        {link.title}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        • {link.category}
                                                    </span>
                                                </div>

                                                {/* Tags preview */}
                                                {Array.isArray(link.tags) && link.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {link.tags.map(t => {
                                                            const color = getTagColor(t)
                                                            return (
                                                                <span
                                                                    key={t}
                                                                    className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${color.bg} ${color.text} ${color.border}`}
                                                                >
                                                                    #{t}
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Open link in browser"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                                {lIdx > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSingle(link.id, group.normalizedUrl)}
                                                        className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                        title="Delete this copy"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ThemedModal>
    )
}

export default DuplicateCleanerModal
