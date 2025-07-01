/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion'
import { ExternalLink, Share2, Edit2, Trash2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const LinkCard = ({ link, onEdit, onDelete, onShare }) => {
    const { theme } = useTheme()

    return (
        <motion.div
            whileHover={{
                y: -4, boxShadow: theme === 'light'
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.18)'
            }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl border overflow-hidden ${theme === 'light'
                ? 'bg-white border-[#E5E7EB] hover:border-[#2563EB]'
                : 'bg-[#1E293B] border-[#334155] hover:border-[#FACC15]'
                }`}
        >
            <div className="p-6">
                {/* Header with Title and Category */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-xl font-semibold truncate flex-1 ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'
                        }`}>
                        {link.title}
                    </h3>
                    <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${theme === 'light'
                        ? 'bg-[#F3F4F6] text-[#4B5563]'
                        : 'bg-[#334155] text-[#9CA3AF]'
                        }`}>
                        {link.category}
                    </span>
                </div>

                {/* Description */}
                <p className={`text-sm line-clamp-2 mb-4 ${theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'
                    }`}>
                    {link.description}
                </p>

                {/* Footer with Actions */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                    {/* Visit Link Button */}
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'light'
                            ? 'text-[#2563EB] hover:text-[#1D4ED8]'
                            : 'text-[#FACC15] hover:text-[#EAB308]'
                            }`}
                    >
                        Visit Link
                        <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onShare?.(link)}
                            className={`p-2 rounded-full transition-colors ${theme === 'light'
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
                            className={`p-2 rounded-full transition-colors ${theme === 'light'
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
                            className={`p-2 rounded-full transition-colors ${theme === 'light'
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