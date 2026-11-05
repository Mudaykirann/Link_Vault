import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag as TagIcon, Plus } from 'lucide-react'

// Curated pastel/modern tag color palette based on tag name hash
const TAG_COLORS = [
    { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
    { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
    { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
]

export function getTagColor(tagName) {
    if (!tagName) return TAG_COLORS[0]
    let hash = 0
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % TAG_COLORS.length
    return TAG_COLORS[index]
}

export const TagInput = ({
    tags = [],
    onChange,
    suggestions = [],
    maxTags = 8,
    placeholder = "Add tags (press Enter or comma)..."
}) => {
    const [inputVal, setInputVal] = useState('')

    const addTag = (raw) => {
        if (!raw) return
        const clean = raw.trim().toLowerCase().replace(/^[#]+/, '').replace(/[^a-z0-9_-]/g, '')
        if (!clean) return
        if (tags.includes(clean)) {
            setInputVal('')
            return
        }
        if (tags.length >= maxTags) return

        onChange([...tags, clean])
        setInputVal('')
    }

    const removeTag = (indexToRemove) => {
        onChange(tags.filter((_, idx) => idx !== indexToRemove))
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag(inputVal)
        } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
            removeTag(tags.length - 1)
        }
    }

    // Filter suggestions not already selected
    const availableSuggestions = suggestions
        .map(s => (typeof s === 'string' ? s : s?.name))
        .filter(Boolean)
        .map(s => s.trim().toLowerCase())
        .filter(s => !tags.includes(s))
        .slice(0, 5)

    return (
        <div className="space-y-2">
            <div className="w-full min-h-[44px] p-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <TagIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-1 mr-0.5 flex-shrink-0" />
                
                {/* Active Tag Pills */}
                <AnimatePresence>
                    {tags.map((tag, idx) => {
                        const style = getTagColor(tag)
                        return (
                            <motion.span
                                key={tag}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
                            >
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(idx)}
                                    className="hover:opacity-75 focus:outline-none"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.span>
                        )
                    })}
                </AnimatePresence>

                {/* Input */}
                {tags.length < maxTags && (
                    <input
                        type="text"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                            if (inputVal.trim()) addTag(inputVal)
                        }}
                        placeholder={tags.length === 0 ? placeholder : 'Add another...'}
                        className="flex-1 min-w-[120px] bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none py-0.5"
                    />
                )}
            </div>

            {/* Quick Suggestions */}
            {availableSuggestions.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-500 dark:text-gray-400 pt-0.5">
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">Suggested:</span>
                    {availableSuggestions.map((sug) => (
                        <button
                            key={sug}
                            type="button"
                            onClick={() => addTag(sug)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
                        >
                            <Plus className="w-2.5 h-2.5 text-blue-500" />
                            #{sug}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TagInput
