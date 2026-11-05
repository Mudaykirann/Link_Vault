/* eslint-disable no-unused-vars */
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload, Download, FileText, Code, CheckCircle2,
    AlertCircle, Loader2, Sparkles, X, Globe, Layers,
    Check, ArrowRight, ShieldCheck, Database
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { config } from '../config'

export const ImportExportModal = ({ isOpen, onClose, onImportSuccess }) => {
    const { theme } = useTheme()
    const [activeTab, setActiveTab] = useState('import') // 'import' | 'export'

    // Import state
    const [file, setFile] = useState(null)
    const [parsedLinks, setParsedLinks] = useState([])
    const [parseError, setParseError] = useState(null)
    const [skipDuplicates, setSkipDuplicates] = useState(true)
    const [isImporting, setIsImporting] = useState(false)
    const [importResult, setImportResult] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    // Export state
    const [isExporting, setIsExporting] = useState(false)

    if (!isOpen) return null

    // Parse Netscape Bookmark HTML or JSON
    const handleFileSelected = (selectedFile) => {
        if (!selectedFile) return
        setFile(selectedFile)
        setParseError(null)
        setImportResult(null)

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target.result
            try {
                if (selectedFile.name.endsWith('.json')) {
                    // Parse JSON
                    const parsed = JSON.parse(content)
                    const rawLinks = Array.isArray(parsed) ? parsed : (parsed.links || [])
                    if (rawLinks.length === 0) {
                        setParseError('The JSON file does not contain any links array.')
                        return
                    }
                    const formatted = rawLinks.map(l => ({
                        url: l.url,
                        title: l.title || l.url,
                        description: l.description || '',
                        category: l.category || 'Tools',
                        collection: l.collection || null,
                        tags: Array.isArray(l.tags) ? l.tags : [],
                        is_favorite: Boolean(l.is_favorite),
                        reading_status: l.reading_status || 'unread'
                    })).filter(l => l.url)
                    setParsedLinks(formatted)
                } else {
                    // Parse Netscape Bookmark HTML
                    const linksList = []
                    let currentFolder = 'Tools'

                    // Match folders: <H3 ...>FolderName</H3> and links: <A HREF="..." ...>Title</A>
                    const regex = /<H3[^>]*>(?<folder>[^<]+)<\/H3>|<A\s+(?:[^>]*?\s+)?HREF="(?<url>[^"]+)"(?:\s+[^>]*?TAGS="(?<tags>[^"]*)")?[^>]*>(?<title>[^<]*)<\/A>/gi
                    let match

                    while ((match = regex.exec(content)) !== null) {
                        if (match.groups.folder) {
                            currentFolder = match.groups.folder.trim().slice(0, 50)
                        } else if (match.groups.url) {
                            const url = match.groups.url.trim()
                            if (url.startsWith('http://') || url.startsWith('https://')) {
                                const rawTitle = match.groups.title ? match.groups.title.trim() : ''
                                const tags = match.groups.tags
                                    ? match.groups.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
                                    : []

                                linksList.push({
                                    url,
                                    title: rawTitle || url,
                                    category: 'Tools',
                                    collection: currentFolder !== 'Bookmarks' && currentFolder !== 'Bookmarks bar' ? currentFolder : null,
                                    tags: tags,
                                    is_favorite: false,
                                    reading_status: 'unread'
                                })
                            }
                        }
                    }

                    if (linksList.length === 0) {
                        setParseError('No valid web bookmarks found in this HTML file. Please verify it is a browser bookmarks export.')
                        return
                    }

                    setParsedLinks(linksList)
                }
            } catch (err) {
                console.error('File parse error:', err)
                setParseError(`Failed to parse file: ${err.message}`)
            }
        }
        reader.readAsText(selectedFile)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelected(e.dataTransfer.files[0])
        }
    }

    // Submit batch import
    const handleExecuteImport = async () => {
        if (parsedLinks.length === 0) return
        setIsImporting(true)
        setImportResult(null)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/batch-import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    links: parsedLinks,
                    skipDuplicates
                })
            })

            const result = await response.json()
            if (response.ok) {
                setImportResult({
                    type: 'success',
                    message: result.message || `Successfully imported ${result.importedCount} bookmarks!`
                })
                if (onImportSuccess) {
                    onImportSuccess()
                }
            } else {
                setImportResult({
                    type: 'error',
                    message: result.error || 'Failed to complete batch import.'
                })
            }
        } catch (err) {
            console.error('Batch import network error:', err)
            setImportResult({
                type: 'error',
                message: 'Network error occurred during import. Check backend connection.'
            })
        } finally {
            setIsImporting(false)
        }
    }

    // Trigger file download from backend
    const handleExport = async (format) => {
        setIsExporting(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${config.apiUrl}/links/export?format=${format}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!res.ok) throw new Error('Export failed')

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const ext = format === 'html' ? 'html' : format === 'csv' ? 'csv' : 'json'
            a.download = `linkvault-export-${new Date().toISOString().split('T')[0]}.${ext}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            console.error('Export download error:', err)
            alert('Failed to download export file. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className={`relative w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden ${theme === 'dark'
                    ? 'bg-slate-900 border-slate-700/80 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                    }`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                    <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Import & Export Bookmarks</h3>
                            <p className="text-xs text-slate-400">Chrome, Safari, Firefox HTML & full JSON backups</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex border-b px-6 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
                    }`}>
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${activeTab === 'import'
                            ? 'border-purple-600 text-purple-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <Upload className="w-4 h-4" />
                        <span>Import Bookmarks</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('export')}
                        className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${activeTab === 'export'
                            ? 'border-purple-600 text-purple-400'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Vault</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6">
                    {activeTab === 'import' ? (
                        <div className="space-y-4">
                            {/* Drag & Drop File Zone */}
                            {!file ? (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragActive
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : theme === 'dark'
                                            ? 'border-slate-700 hover:border-purple-500/60 hover:bg-slate-800/40'
                                            : 'border-slate-300 hover:border-purple-500/60 hover:bg-slate-50'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".html,.htm,.json"
                                        className="hidden"
                                        onChange={(e) => handleFileSelected(e.target.files[0])}
                                    />
                                    <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-400 flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-semibold mb-1">Click to browse or drag & drop bookmark file</p>
                                    <p className="text-xs text-slate-400">Supports Netscape HTML (Chrome, Firefox, Safari) & LinkVault JSON</p>
                                </div>
                            ) : (
                                /* Selected File Preview */
                                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                                    }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2.5">
                                            <FileText className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <p className="text-sm font-semibold truncate max-w-[280px]">{file.name}</p>
                                                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setFile(null)
                                                setParsedLinks([])
                                                setParseError(null)
                                                setImportResult(null)
                                            }}
                                            className="text-xs text-slate-400 hover:text-red-400 font-medium"
                                        >
                                            Change file
                                        </button>
                                    </div>

                                    {parseError && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{parseError}</span>
                                        </div>
                                    )}

                                    {parsedLinks.length > 0 && (
                                        <div className="space-y-3 mt-3 pt-3 border-t border-slate-700/40">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-400">Detected valid bookmarks:</span>
                                                <span className="font-bold text-purple-400 font-mono text-sm">{parsedLinks.length} links</span>
                                            </div>

                                            {/* Duplicate Skip Toggle */}
                                            <label className="flex items-center space-x-2.5 cursor-pointer pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={skipDuplicates}
                                                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                                                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-600 bg-slate-800"
                                                />
                                                <span className="text-xs font-medium text-slate-300">
                                                    Skip URLs that already exist in your LinkVault
                                                </span>
                                            </label>

                                            {/* Sample preview items */}
                                            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                                                {parsedLinks.slice(0, 3).map((l, i) => (
                                                    <div key={i} className="text-[11px] p-2 rounded bg-black/20 truncate text-slate-400">
                                                        <span className="font-semibold text-slate-200 mr-2">{l.title}</span>
                                                        <span className="opacity-70">{l.url}</span>
                                                    </div>
                                                ))}
                                                {parsedLinks.length > 3 && (
                                                    <p className="text-[10px] text-center text-slate-500 italic">
                                                        + {parsedLinks.length - 3} more bookmarks ready to save
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Status Result Banner */}
                            {importResult && (
                                <div className={`p-3.5 rounded-xl border flex items-center space-x-3 text-xs ${importResult.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                                    }`}>
                                    {importResult.type === 'success' ? (
                                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                                    )}
                                    <span>{importResult.message}</span>
                                </div>
                            )}

                            {/* Execute Import Action Button */}
                            {parsedLinks.length > 0 && !importResult && (
                                <button
                                    onClick={handleExecuteImport}
                                    disabled={isImporting}
                                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all"
                                >
                                    {isImporting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Importing Bookmarks...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>Import {parsedLinks.length} Bookmarks to Vault</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Export Tab Content */
                        <div className="space-y-4">
                            <p className="text-xs text-slate-400">
                                Download a complete copy of your saved bookmarks, organized folders, tags, favorites, and metadata.
                            </p>

                            <div className="grid grid-cols-1 gap-3">
                                {/* Option 1: Browser HTML */}
                                <div
                                    onClick={() => handleExport('html')}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${theme === 'dark'
                                        ? 'bg-slate-800/60 border-slate-700 hover:border-purple-500/70 hover:bg-slate-800'
                                        : 'bg-slate-50 border-slate-200 hover:border-purple-500/70 hover:bg-purple-50/50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Browser Bookmarks (.html)</p>
                                            <p className="text-xs text-slate-400">Directly importable into Chrome, Safari, Firefox, Edge, Brave</p>
                                        </div>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
                                </div>

                                {/* Option 2: JSON Backup */}
                                <div
                                    onClick={() => handleExport('json')}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${theme === 'dark'
                                        ? 'bg-slate-800/60 border-slate-700 hover:border-indigo-500/70 hover:bg-slate-800'
                                        : 'bg-slate-50 border-slate-200 hover:border-indigo-500/70 hover:bg-indigo-50/50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                                            <Code className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Full Vault JSON Backup (.json)</p>
                                            <p className="text-xs text-slate-400">Complete raw schema with tags, status, favorites, summaries</p>
                                        </div>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                                </div>

                                {/* Option 3: CSV Spreadsheet */}
                                <div
                                    onClick={() => handleExport('csv')}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${theme === 'dark'
                                        ? 'bg-slate-800/60 border-slate-700 hover:border-emerald-500/70 hover:bg-slate-800'
                                        : 'bg-slate-50 border-slate-200 hover:border-emerald-500/70 hover:bg-emerald-50/50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Spreadsheet Table (.csv)</p>
                                            <p className="text-xs text-slate-400">Easy to open in Excel, Google Sheets, or Notion databases</p>
                                        </div>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

export default ImportExportModal
