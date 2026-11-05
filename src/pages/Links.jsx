import LinkCard from '../components/LinkCard'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Loader2, ChevronDown, Plus, Download, Sparkles, CheckCircle2, Globe, Tag as TagIcon, X, Activity, ShieldCheck, AlertTriangle, Copy, Star, BookOpen, Clock, Folder, Upload } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { config } from '../config'
import { ThemedButton } from '../components/ui/ThemedButton'
import { ThemedModal } from '../components/ui/ThemedModal'
import { TagInput } from '../components/ui/TagInput'
import { DuplicateCleanerModal } from '../components/DuplicateCleanerModal'

const Links = () => {
    const { theme } = useTheme()
    const { user } = useAuth()
    const [links, setLinks] = useState([])
    const [filteredLinks, setFilteredLinks] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [availableCollections, setAvailableCollections] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newLink, setNewLink] = useState({
        title: '',
        description: '',
        url: '',
        category: '',
        collection: '',
        favicon_url: '',
        og_image_url: null,
        tags: []
    })
    const [selectedTag, setSelectedTag] = useState(null)
    const [availableTags, setAvailableTags] = useState([])
    const [healthFilter, setHealthFilter] = useState('all') // 'all' | 'healthy' | 'broken' | 'unchecked'
    const [viewFilter, setViewFilter] = useState('all') // 'all' | 'favorites' | 'read-later' | 'in-progress' | 'finished'
    const [isCheckingAllHealth, setIsCheckingAllHealth] = useState(false)
    const [healthBanner, setHealthBanner] = useState(null)
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false)
    const [duplicateWarning, setDuplicateWarning] = useState(null)
    const [isFetchingMetadata, setIsFetchingMetadata] = useState(false)
    const [metadataExtracted, setMetadataExtracted] = useState(false)
    const [categories, setCategories] = useState(['All'])
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        linkId: null,
        linkTitle: ''
    })
    const [editModal, setEditModal] = useState({
        isOpen: false,
        link: null
    })
    const [error, setError] = useState(null)
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    useEffect(() => {
        fetchLinks()
        fetchCategories()
        fetchTags()

        const handleOpenNew = () => setIsAddModalOpen(true)
        const handleRefresh = () => fetchLinks()
        const handleOpenDuplicates = () => setIsDuplicateModalOpen(true)

        window.addEventListener('linkvault:open-new-link', handleOpenNew)
        window.addEventListener('linkvault:refresh-links', handleRefresh)
        window.addEventListener('linkvault:open-duplicate-cleaner', handleOpenDuplicates)

        return () => {
            window.removeEventListener('linkvault:open-new-link', handleOpenNew)
            window.removeEventListener('linkvault:refresh-links', handleRefresh)
            window.removeEventListener('linkvault:open-duplicate-cleaner', handleOpenDuplicates)
        }
    }, [])

    const parseLinkData = (link) => {
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

        let status = link?.status || 'pending'
        let statusCode = link?.status_code || null
        let lastCheckedAt = link?.last_checked_at || null

        if (link?.description) {
            const healthMatch = link.description.match(/<!--HEALTH:(.*?)-->/)
            if (healthMatch && healthMatch[1]) {
                try {
                    const parsed = JSON.parse(healthMatch[1])
                    if (parsed.status) status = parsed.status
                    if (parsed.statusCode) statusCode = parsed.statusCode
                    if (parsed.lastCheckedAt) lastCheckedAt = parsed.lastCheckedAt
                } catch {}
            }
        }

        let isFavorite = false
        if (link?.is_favorite !== undefined && link?.is_favorite !== null) {
            isFavorite = Boolean(link.is_favorite)
        } else if (link?.description) {
            const favMatch = link.description.match(/<!--FAV:(.*?)-->/)
            if (favMatch && favMatch[1]) isFavorite = favMatch[1] === 'true'
        }

        let readingStatus = 'unread'
        if (link?.reading_status && typeof link.reading_status === 'string') {
            readingStatus = link.reading_status
        } else if (link?.description) {
            const readingMatch = link.description.match(/<!--READING:(.*?)-->/)
            if (readingMatch && readingMatch[1]) readingStatus = readingMatch[1]
        }

        let collection = link?.collection || null
        if (!collection && link?.description) {
            const colMatch = link.description.match(/<!--COLLECTION:(.*?)-->/)
            if (colMatch && colMatch[1]) collection = colMatch[1]
        }

        return {
            ...link,
            tags,
            status,
            status_code: statusCode,
            last_checked_at: lastCheckedAt,
            is_favorite: isFavorite,
            reading_status: readingStatus,
            collection: collection,
            description: (link?.description || '')
                .replace(/<!--TAGS:.*?-->/g, '')
                .replace(/<!--HEALTH:.*?-->/g, '')
                .replace(/<!--FAV:.*?-->/g, '')
                .replace(/<!--READING:.*?-->/g, '')
                .replace(/<!--COLLECTION:.*?-->/g, '')
                .replace(/<!--SUMMARY:.*?-->/g, '')
                .replace(/<!--READTIME:.*?-->/g, '')
                .trim()
        }
    }

    const fetchLinks = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()

            if (response.ok && Array.isArray(data)) {
                const parsed = data.map(parseLinkData)
                setLinks(parsed)
                setFilteredLinks(parsed)

                const collectionsSet = new Set()
                parsed.forEach(l => {
                    if (l.collection) collectionsSet.add(l.collection)
                })
                setAvailableCollections(Array.from(collectionsSet))
            } else {
                setError(data.message || 'Failed to fetch links')
            }
        } catch (err) {
            console.error('Error fetching links:', err)
            setError('Failed to fetch links')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()

            if (response.ok && Array.isArray(data)) {
                const categoryList = ['All', ...data.filter(c => c !== 'All')]
                setCategories(categoryList)

                if (data.length > 0) {
                    setNewLink(prev => ({
                        ...prev,
                        category: data[0]
                    }))
                }
            }
        } catch (err) {
            console.error('Error fetching categories:', err)
        }
    }

    const fetchTags = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/tags`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const data = await response.json()
                if (Array.isArray(data)) {
                    setAvailableTags(data)
                }
            }
        } catch (err) {
            console.error('Error fetching tags:', err)
        }
    }

    useEffect(() => {
        const filtered = links.filter(link => {
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch = !searchTerm ||
                link.title?.toLowerCase().includes(searchLower) ||
                link.description?.toLowerCase().includes(searchLower) ||
                (link.collection && link.collection.toLowerCase().includes(searchLower)) ||
                (Array.isArray(link.tags) && link.tags.some(t => t.toLowerCase().includes(searchLower)))
            const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory
            const matchesTag = !selectedTag || (Array.isArray(link.tags) && link.tags.includes(selectedTag))
            const matchesCollection = !selectedCollection || (link.collection && link.collection.toLowerCase() === selectedCollection.toLowerCase())
            const matchesHealth = healthFilter === 'all'
                ? true
                : healthFilter === 'broken'
                    ? link.status === 'broken'
                    : healthFilter === 'healthy'
                        ? link.status === 'healthy'
                        : (!link.status || link.status === 'pending')
            const matchesView = viewFilter === 'all'
                ? true
                : viewFilter === 'favorites'
                    ? Boolean(link.is_favorite)
                    : viewFilter === 'read-later'
                        ? (!link.reading_status || link.reading_status === 'unread')
                        : viewFilter === 'in-progress'
                            ? link.reading_status === 'reading'
                            : (link.reading_status === 'finished')
            return matchesSearch && matchesCategory && matchesTag && matchesCollection && matchesHealth && matchesView
        })
        setFilteredLinks(filtered)
    }, [searchTerm, selectedCategory, selectedTag, selectedCollection, healthFilter, viewFilter, links])

    const handleToggleFavorite = async (link) => {
        const nextFav = !link.is_favorite
        setLinks(prev => prev.map(l => l.id === link.id ? { ...l, is_favorite: nextFav } : l))
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/${link.id}/favorite`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_favorite: nextFav })
            })
            if (!response.ok) throw new Error('Failed to toggle favorite')
        } catch (err) {
            console.error('Error toggling favorite:', err)
            setLinks(prev => prev.map(l => l.id === link.id ? { ...l, is_favorite: link.is_favorite } : l))
        }
    }

    const handleChangeReadingStatus = async (link, newStatus) => {
        setLinks(prev => prev.map(l => l.id === link.id ? { ...l, reading_status: newStatus } : l))
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/${link.id}/reading-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reading_status: newStatus })
            })
            if (!response.ok) throw new Error('Failed to update reading status')
        } catch (err) {
            console.error('Error updating reading status:', err)
            setLinks(prev => prev.map(l => l.id === link.id ? { ...l, reading_status: link.reading_status } : l))
        }
    }

    const handleShare = async (link) => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: link.title,
                    text: link.description,
                    url: link.url
                })
            } else {
                navigator.clipboard.writeText(link.url)
            }
        } catch (err) {
            console.log('Error sharing:', err)
        }
    }

    const handleAutoFetchMetadata = async (targetUrl) => {
        const urlToFetch = targetUrl !== undefined ? targetUrl : newLink.url
        if (!urlToFetch || !urlToFetch.includes('.')) return

        setIsFetchingMetadata(true)
        setMetadataExtracted(false)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/preview?url=${encodeURIComponent(urlToFetch)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setNewLink(prev => {
                    const combinedTags = Array.from(new Set([
                        ...(prev.tags || []),
                        ...(Array.isArray(data.tags) ? data.tags : [])
                    ]))
                    return {
                        ...prev,
                        url: data.url || prev.url,
                        title: (prev.title && prev.title.trim()) ? prev.title : (data.title || ''),
                        description: (prev.description && prev.description.trim()) ? prev.description : (data.description || ''),
                        category: data.category && categories.includes(data.category) ? data.category : prev.category,
                        favicon_url: data.favicon_url || '',
                        og_image_url: data.og_image_url || null,
                        tags: combinedTags
                    }
                })
                setMetadataExtracted(true)
            }
        } catch (error) {
            console.warn('Metadata preview failed:', error)
        } finally {
            setIsFetchingMetadata(false)
        }
    }

    const handleCheckDuplicate = async (targetUrl) => {
        const urlToCheck = targetUrl !== undefined ? targetUrl : newLink.url
        if (!urlToCheck || !urlToCheck.includes('.')) {
            setDuplicateWarning(null)
            return
        }
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/check-duplicate?url=${encodeURIComponent(urlToCheck)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                if (data.isDuplicate && data.existingLink) {
                    setDuplicateWarning(data.existingLink)
                } else {
                    setDuplicateWarning(null)
                }
            }
        } catch {
            setDuplicateWarning(null)
        }
    }

    const handleDuplicatesMerged = (mergedLink, deletedIds) => {
        setLinks(prev => {
            let updated = prev.filter(l => !deletedIds.includes(l.id))
            if (mergedLink) {
                updated = updated.map(l => l.id === mergedLink.id ? mergedLink : l)
            }
            return updated
        })
        fetchTags()
    }

    const handleAddLink = async (e) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newLink),
            })

            const result = await response.json()

            if (response.ok) {
                setLinks(prevLinks => [result, ...prevLinks])
                setIsAddModalOpen(false)
                setNewLink({
                    title: '',
                    description: '',
                    url: '',
                    category: categories.find(c => c !== 'All') || 'Personal',
                    collection: '',
                    favicon_url: '',
                    og_image_url: null,
                    tags: []
                })
                setMetadataExtracted(false)
                fetchTags()
            } else {
                setError(result.error || result.message || 'Failed to add link')
            }
        } catch (err) {
            console.error("Error adding link:", err)
        }
    }

    const handleDelete = async (linkId) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/${linkId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            if (response.ok) {
                setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId))
                setDeleteModal({ isOpen: false, linkId: null, linkTitle: '' })
                fetchTags()
            } else {
                const err = await response.json()
                setError(err.error || 'Failed to delete link')
            }
        } catch (err) {
            console.error("Error deleting link:", err)
            setError('Failed to delete link')
        }
    }

    const openDeleteModal = (link) => {
        setDeleteModal({
            isOpen: true,
            linkId: link.id,
            linkTitle: link.title
        })
    }

    const handleEdit = (link) => {
        setEditModal({
            isOpen: true,
            link: {
                ...link,
                tags: Array.isArray(link.tags) ? [...link.tags] : []
            }
        })
    }

    const handleEditSubmit = async (editedLink) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/${editedLink.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: editedLink.title,
                    url: editedLink.url,
                    description: editedLink.description,
                    category: editedLink.category,
                    collection: editedLink.collection || null,
                    favicon_url: editedLink.favicon_url,
                    og_image_url: editedLink.og_image_url,
                    tags: editedLink.tags || []
                }),
            })

            const updated = await response.json()

            if (response.ok) {
                const parsedUpdated = parseLinkData(updated)
                setLinks(prevLinks =>
                    prevLinks.map(link =>
                        link.id === editedLink.id ? (parsedUpdated || editedLink) : link
                    )
                )
                setEditModal({ isOpen: false, link: null })
                fetchTags()
            } else {
                setError(updated.error || 'Failed to update link')
            }
        } catch (err) {
            console.error('Error updating link:', err)
            setError('Failed to update link')
        }
    }

    const handleCheckSingleHealth = async (link) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/${link.id}/check`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const updated = await response.json()
            if (response.ok && updated) {
                const parsed = parseLinkData(updated)
                setLinks(prev => prev.map(l => l.id === link.id ? { ...l, ...parsed } : l))
                return parsed
            }
        } catch (err) {
            console.error('Failed to check link health:', err)
        }
    }

    const handleCheckAllHealth = async () => {
        if (isCheckingAllHealth) return
        setIsCheckingAllHealth(true)
        setHealthBanner({ type: 'info', message: 'Scanning all saved links for 404s, timeouts and health status...' })
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/check-all`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()
            if (response.ok && Array.isArray(data.results)) {
                const resultsMap = new Map(data.results.map(r => [r.id, r]))
                setLinks(prev => prev.map(l => {
                    if (resultsMap.has(l.id)) {
                        const r = resultsMap.get(l.id)
                        return {
                            ...l,
                            status: r.status,
                            status_code: r.statusCode,
                            last_checked_at: r.lastCheckedAt,
                            latency_ms: r.latencyMs,
                            health_error: r.error
                        }
                    }
                    return l
                }))
                setHealthBanner({
                    type: data.broken > 0 ? 'warning' : 'success',
                    message: `Health scan complete: ${data.checked} links checked (${data.healthy} live, ${data.broken} broken).`
                })
            } else {
                setHealthBanner({ type: 'error', message: data.error || 'Failed to check links' })
            }
        } catch (err) {
            console.error('Batch health check error:', err)
            setHealthBanner({ type: 'error', message: 'Network error occurred while scanning links.' })
        } finally {
            setIsCheckingAllHealth(false)
        }
    }

    const exportToCSV = () => {
        try {
            const headers = ['Title', 'URL', 'Category', 'Tags', 'Status', 'StatusCode', 'Description']
            const csvContent = [
                headers.join(','),
                ...filteredLinks.map(link => [
                    `"${(link.title || '').replace(/"/g, '""')}"`,
                    `"${(link.url || '').replace(/"/g, '""')}"`,
                    `"${(link.category || '').replace(/"/g, '""')}"`,
                    `"${(Array.isArray(link.tags) ? link.tags.join(';') : '').replace(/"/g, '""')}"`,
                    `"${link.status || 'pending'}"`,
                    `"${link.status_code || ''}"`,
                    `"${(link.description || '').replace(/"/g, '""')}"`
                ].join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `linkvault_links_${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (err) {
            console.error('Error exporting links:', err)
            setError('Failed to export links')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        My Links
                    </h1>
                    <p className={`text-sm mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Welcome back, {user?.name || user?.username || user?.email?.split('@')[0]}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <ThemedButton
                        variant="secondary"
                        onClick={handleCheckAllHealth}
                        disabled={isCheckingAllHealth || links.length === 0}
                        className="flex items-center gap-2 whitespace-nowrap"
                        title="Run HTTP health check on all bookmarks"
                    >
                        <Activity className={`w-4 h-4 text-emerald-500 ${isCheckingAllHealth ? 'animate-spin' : ''}`} />
                        <span>{isCheckingAllHealth ? 'Checking...' : 'Check Health'}</span>
                    </ThemedButton>

                    <ThemedButton
                        variant="secondary"
                        onClick={() => setIsDuplicateModalOpen(true)}
                        className="flex items-center gap-2 whitespace-nowrap"
                        title="Scan and merge duplicate bookmarks in your vault"
                    >
                        <Copy className="w-4 h-4 text-amber-500" />
                        <span>Duplicates</span>
                    </ThemedButton>

                    <ThemedButton
                        variant="secondary"
                        onClick={() => window.dispatchEvent(new CustomEvent('linkvault:open-import-export'))}
                        className="flex items-center gap-2 whitespace-nowrap"
                        title="Import browser bookmarks or export vault backup"
                    >
                        <Upload className="w-4 h-4 text-purple-500" />
                        <span>Import / Export</span>
                    </ThemedButton>

                    <ThemedButton variant="secondary" onClick={exportToCSV} className="flex items-center gap-2 whitespace-nowrap">
                        <Download className="w-4 h-4" />
                        CSV Export
                    </ThemedButton>
                    <ThemedButton variant="primary" onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 whitespace-nowrap">
                        <Plus className="w-4 h-4" />
                        Add New Link
                    </ThemedButton>
                </div>
            </div>

            {/* Health Notification Banner */}
            {healthBanner && (
                <div className={`mb-6 p-3 rounded-xl flex items-center justify-between text-xs sm:text-sm border transition-all ${
                    healthBanner.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : healthBanner.type === 'warning'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                            : healthBanner.type === 'error'
                                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                }`}>
                    <div className="flex items-center gap-2">
                        <Activity className={`w-4 h-4 flex-shrink-0 ${healthBanner.type === 'info' ? 'animate-spin' : ''}`} />
                        <span>{healthBanner.message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setHealthBanner(null)}
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search links..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                    >
                        <Filter className="w-4 h-4" />
                        <span>{selectedCategory}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isFilterOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border dark:border-slate-700 bg-white dark:bg-slate-800 z-10 overflow-hidden">
                            <div className="max-h-60 overflow-y-auto">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            setSelectedCategory(cat)
                                            setIsFilterOpen(false)
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${selectedCategory === cat ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick View & Reading Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1 uppercase tracking-wider flex-shrink-0">
                    Views:
                </span>
                <button
                    type="button"
                    onClick={() => setViewFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                        viewFilter === 'all'
                            ? 'bg-blue-600 text-white dark:bg-yellow-400 dark:text-slate-900 font-semibold shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                    }`}
                >
                    All Links ({links.length})
                </button>
                <button
                    type="button"
                    onClick={() => setViewFilter('favorites')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                        viewFilter === 'favorites'
                            ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 hover:border-amber-400'
                    }`}
                >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Favorites ({links.filter(l => Boolean(l.is_favorite)).length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setViewFilter('read-later')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                        viewFilter === 'read-later'
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:border-blue-400'
                    }`}
                >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Later ({links.filter(l => !l.reading_status || l.reading_status === 'unread').length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setViewFilter('in-progress')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                        viewFilter === 'in-progress'
                            ? 'bg-amber-600 text-white font-semibold shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 hover:border-amber-400'
                    }`}
                >
                    <Clock className="w-3.5 h-3.5" />
                    <span>In Progress ({links.filter(l => l.reading_status === 'reading').length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setViewFilter('finished')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                        viewFilter === 'finished'
                            ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400'
                    }`}
                >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Finished ({links.filter(l => l.reading_status === 'finished').length})</span>
                </button>
                {viewFilter !== 'all' && (
                    <button
                        type="button"
                        onClick={() => setViewFilter('all')}
                        className="text-xs text-red-500 hover:underline flex items-center gap-0.5 ml-1 flex-shrink-0 cursor-pointer"
                    >
                        <X className="w-3 h-3" /> Reset View
                    </button>
                )}
            </div>

            {/* Collections / Folder Filter Bar */}
            {availableCollections.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1 uppercase tracking-wider flex-shrink-0">
                        <Folder className="w-3.5 h-3.5" /> Folders:
                    </span>
                    <button
                        type="button"
                        onClick={() => setSelectedCollection(null)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                            !selectedCollection
                                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                        }`}
                    >
                        All ({links.length})
                    </button>
                    {availableCollections.map(col => (
                        <button
                            key={col}
                            type="button"
                            onClick={() => setSelectedCollection(selectedCollection === col ? null : col)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                selectedCollection === col
                                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                                    : 'bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400 hover:border-indigo-400'
                            }`}
                        >
                            📁 {col} ({links.filter(l => l.collection?.toLowerCase() === col.toLowerCase()).length})
                        </button>
                    ))}
                    {selectedCollection && (
                        <button
                            type="button"
                            onClick={() => setSelectedCollection(null)}
                            className="text-xs text-red-500 hover:underline flex items-center gap-0.5 ml-1 flex-shrink-0 cursor-pointer"
                        >
                            <X className="w-3 h-3" /> Clear Folder
                        </button>
                    )}
                </div>
            )}

            {/* Health Status Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1 uppercase tracking-wider flex-shrink-0">
                    <Activity className="w-3.5 h-3.5" /> Health:
                </span>
                <button
                    type="button"
                    onClick={() => setHealthFilter('all')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 cursor-pointer ${
                        healthFilter === 'all'
                            ? 'bg-blue-600 text-white dark:bg-yellow-400 dark:text-slate-900 font-semibold'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                >
                    All ({links.length})
                </button>
                <button
                    type="button"
                    onClick={() => setHealthFilter('healthy')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                        healthFilter === 'healthy'
                            ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400'
                    }`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Live ({links.filter(l => l.status === 'healthy').length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setHealthFilter('broken')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                        healthFilter === 'broken'
                            ? 'bg-red-600 text-white shadow-sm font-semibold'
                            : links.filter(l => l.status === 'broken').length > 0
                                ? 'bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:border-red-500 font-medium'
                                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                    }`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>Broken ({links.filter(l => l.status === 'broken').length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setHealthFilter('unchecked')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                        healthFilter === 'unchecked'
                            ? 'bg-slate-700 text-white shadow-sm font-semibold'
                            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                    }`}
                >
                    <span>Unchecked ({links.filter(l => !l.status || l.status === 'pending').length})</span>
                </button>
                {healthFilter !== 'all' && (
                    <button
                        type="button"
                        onClick={() => setHealthFilter('all')}
                        className="text-xs text-red-500 hover:underline flex items-center gap-0.5 ml-1 flex-shrink-0 cursor-pointer"
                    >
                        <X className="w-3 h-3" /> Clear
                    </button>
                )}
            </div>

            {/* Tag Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1 uppercase tracking-wider flex-shrink-0">
                    <TagIcon className="w-3.5 h-3.5" /> Tags:
                </span>
                <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 cursor-pointer ${
                        !selectedTag
                            ? 'bg-blue-600 text-white dark:bg-yellow-400 dark:text-slate-900 font-semibold'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                >
                    All
                </button>
                {availableTags.length > 0 ? (
                    availableTags.map((tagObj) => {
                        const isSelected = selectedTag === tagObj.name
                        return (
                            <button
                                key={tagObj.name}
                                type="button"
                                onClick={() => setSelectedTag(isSelected ? null : tagObj.name)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                    isSelected
                                        ? 'bg-blue-600 text-white dark:bg-yellow-400 dark:text-slate-900 shadow-sm font-semibold'
                                        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-yellow-400'
                                }`}
                            >
                                <span>#{tagObj.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white dark:text-slate-900' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                                    {tagObj.count}
                                </span>
                            </button>
                        )
                    })
                ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic pl-1 flex items-center gap-1 flex-shrink-0">
                        No tags yet — click "+ Add tag" on any bookmark or use the Add Link modal!
                    </span>
                )}
                {selectedTag && (
                    <button
                        type="button"
                        onClick={() => setSelectedTag(null)}
                        className="text-xs text-red-500 hover:underline flex items-center gap-0.5 ml-1 flex-shrink-0 cursor-pointer"
                    >
                        <X className="w-3 h-3" /> Clear
                    </button>
                )}
            </div>

            {/* Links Grid */}
            {filteredLinks.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                    <p className="text-gray-500 dark:text-gray-400">
                        {healthFilter === 'broken'
                            ? '🎉 Great news! No broken links found.'
                            : viewFilter === 'favorites'
                                ? '⭐ No favorites yet! Click the star icon on any bookmark to pin it.'
                                : viewFilter === 'read-later'
                                    ? '📖 Your reading list is clear! Mark bookmarks as "Read Later" to track them.'
                                    : 'No links found matching your criteria.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLinks.map(link => (
                        <LinkCard
                            key={link.id}
                            link={link}
                            onShare={handleShare}
                            onEdit={() => handleEdit(link)}
                            onDelete={() => openDeleteModal(link)}
                            onTagClick={(tag) => setSelectedTag(prev => prev === tag ? null : tag)}
                            onCheckHealth={handleCheckSingleHealth}
                            onToggleFavorite={handleToggleFavorite}
                            onChangeReadingStatus={handleChangeReadingStatus}
                        />
                    ))}
                </div>
            )}

            {/* Add Link Modal */}
            <ThemedModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false)
                    setMetadataExtracted(false)
                    setDuplicateWarning(null)
                }}
                title="Add New Link"
            >
                <form onSubmit={handleAddLink} className="space-y-4">
                    {/* URL Input with Auto-Fetch */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Website URL
                            </label>
                            <button
                                type="button"
                                onClick={() => handleAutoFetchMetadata()}
                                disabled={isFetchingMetadata || !newLink.url}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-yellow-400 hover:underline disabled:opacity-50"
                            >
                                {isFetchingMetadata ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Fetching info...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Auto-Detect
                                    </>
                                )}
                            </button>
                        </div>
                        <input
                            type="url"
                            required
                            placeholder="https://example.com"
                            value={newLink.url}
                            onBlur={(e) => {
                                const val = e.target.value
                                if (val) {
                                    handleCheckDuplicate(val)
                                    if (!newLink.title) {
                                        handleAutoFetchMetadata(val)
                                    }
                                }
                            }}
                            onChange={(e) => {
                                const val = e.target.value
                                setNewLink(prev => ({ ...prev, url: val }))
                            }}
                            className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {metadataExtracted && (
                            <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Metadata extracted automatically!
                            </p>
                        )}
                        {duplicateWarning && (
                            <div className="mt-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between font-semibold">
                                    <span className="flex items-center gap-1.5">
                                        <Copy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                        Already in your vault!
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                                        Duplicate Detected
                                    </span>
                                </div>
                                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                                    Saved as <strong>"{duplicateWarning.title}"</strong> in <em>{duplicateWarning.category}</em>.
                                </p>
                                <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddModalOpen(false)
                                            setDuplicateWarning(null)
                                            handleEdit(duplicateWarning)
                                        }}
                                        className="px-2.5 py-1 rounded bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors cursor-pointer"
                                    >
                                        Edit Existing Link
                                    </button>
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400">
                                        Or save another copy below
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            placeholder="Page title"
                            value={newLink.title}
                            onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select
                            value={newLink.category}
                            onChange={(e) => setNewLink(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        >
                            {categories.filter(c => c !== 'All').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Collection / Folder */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Collection / Folder (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Work Projects, Research, Reading List"
                            value={newLink.collection || ''}
                            onChange={(e) => setNewLink(prev => ({ ...prev, collection: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Tags Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                        <TagInput
                            tags={newLink.tags || []}
                            onChange={(newTags) => setNewLink(prev => ({ ...prev, tags: newTags }))}
                            suggestions={availableTags}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                        <textarea
                            value={newLink.description}
                            placeholder="Short description or notes..."
                            onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Live Preview Card if metadata exists */}
                    {(newLink.title || newLink.url) && (
                        <div className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/50">
                            <span className="text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase block mb-2">
                                Card Preview
                            </span>
                            <div className="flex items-start gap-2.5">
                                <div className="w-6 h-6 rounded bg-white dark:bg-slate-700 flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-slate-600 overflow-hidden mt-0.5">
                                    {newLink.favicon_url ? (
                                        <img src={newLink.favicon_url} alt="" className="w-3.5 h-3.5 object-contain" />
                                    ) : (
                                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {newLink.title || newLink.url}
                                    </p>
                                    {newLink.description && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                            {newLink.description}
                                        </p>
                                    )}
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-yellow-400">
                                        {newLink.category || 'Personal'}
                                    </span>
                                </div>
                                {newLink.og_image_url && (
                                    <img
                                        src={newLink.og_image_url}
                                        alt=""
                                        className="w-14 h-14 rounded object-cover border border-gray-200 dark:border-slate-700 flex-shrink-0"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <ThemedButton variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</ThemedButton>
                        <ThemedButton type="submit" variant="primary">Add Link</ThemedButton>
                    </div>
                </form>
            </ThemedModal>

            {/* Edit Modal */}
            <ThemedModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, link: null })}
                title="Edit Link"
            >
                {editModal.link && (
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        handleEditSubmit(editModal.link)
                    }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input
                                type="text"
                                required
                                value={editModal.link.title}
                                onChange={(e) => setEditModal(prev => ({
                                    ...prev,
                                    link: { ...prev.link, title: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                            <input
                                type="url"
                                required
                                value={editModal.link.url}
                                onChange={(e) => setEditModal(prev => ({
                                    ...prev,
                                    link: { ...prev.link, url: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select
                                value={editModal.link.category}
                                onChange={(e) => setEditModal(prev => ({
                                    ...prev,
                                    link: { ...prev.link, category: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            >
                                {categories.filter(c => c !== 'All').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        {/* Collection / Folder */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Collection / Folder (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Work Projects, Research, Reading List"
                                value={editModal.link.collection || ''}
                                onChange={(e) => setEditModal(prev => ({
                                    ...prev,
                                    link: { ...prev.link, collection: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        {/* Tags Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                            <TagInput
                                tags={editModal.link.tags || []}
                                onChange={(newTags) => setEditModal(prev => ({
                                    ...prev,
                                    link: { ...prev.link, tags: newTags }
                                }))}
                                suggestions={availableTags}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                value={editModal.link.description || ''}
                                onChange={(e) => setEditModal(prev => ({
                                    ...prev,
                                    link: { ...prev.link, description: e.target.value }
                                }))}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <ThemedButton variant="secondary" onClick={() => setEditModal({ isOpen: false, link: null })}>Cancel</ThemedButton>
                            <ThemedButton type="submit" variant="primary">Save Changes</ThemedButton>
                        </div>
                    </form>
                )}
            </ThemedModal>

            {/* Delete Modal */}
            <ThemedModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, linkId: null, linkTitle: '' })}
                title="Delete Link"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete "{deleteModal.linkTitle}"? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <ThemedButton variant="secondary" onClick={() => setDeleteModal({ isOpen: false, linkId: null, linkTitle: '' })}>
                            Cancel
                        </ThemedButton>
                        <ThemedButton variant="primary" onClick={() => handleDelete(deleteModal.linkId)}>
                            Delete
                        </ThemedButton>
                    </div>
                </div>
            </ThemedModal>

            {/* Duplicate Cleaner Modal */}
            <DuplicateCleanerModal
                isOpen={isDuplicateModalOpen}
                onClose={() => setIsDuplicateModalOpen(false)}
                onDuplicatesMerged={handleDuplicatesMerged}
            />
        </div>
    )
}

export default Links
