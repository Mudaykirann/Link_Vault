import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import {
    Menu, X, Search, Filter, ChevronDown,
    LayoutDashboard, PlusCircle, FolderOpen,
    UserCircle, LogOut, Sun, Moon, ChevronRight, Share2, Plus,
    Sparkles, Loader2, CheckCircle2, Globe, Tag as TagIcon,
    Activity, ShieldCheck, AlertTriangle, Copy, BarChart3, Star, BookOpen, Clock, Folder, Upload
} from 'lucide-react'
import LinkCard from '../components/LinkCard'
import { ThemedButton } from '../components/ui/ThemedButton'
import { ThemedModal } from '../components/ui/ThemedModal'
import { TagInput } from '../components/ui/TagInput'
import { DuplicateCleanerModal } from '../components/DuplicateCleanerModal'
import { config } from '../config'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
    const { theme, toggleTheme } = useTheme()
    const { user, logout } = useAuth()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [links, setLinks] = useState([])
    const [filteredLinks, setFilteredLinks] = useState([])
    const [categories, setCategories] = useState(['All'])
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [availableCollections, setAvailableCollections] = useState([])
    const [stats, setStats] = useState({
        totalLinks: 0,
        totalCategories: 0,
        recentlyAdded: 0,
        mostUsedCategory: '',
        brokenCount: 0,
        healthyCount: 0,
        favoritesCount: 0,
        unreadCount: 0,
        readingCount: 0,
        finishedCount: 0
    })
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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingLink, setEditingLink] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

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

    useEffect(() => {
        updateStats()
    }, [links, categories])

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

    const updateStats = () => {
        const categoryCount = {}
        links.forEach(link => {
            if (link.category) {
                categoryCount[link.category] = (categoryCount[link.category] || 0) + 1
            }
        })

        const mostUsed = Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'

        const recentlyAdded = links.filter(link => {
            const rawDate = link.created_at || link.createdAt
            if (!rawDate) return false
            const linkDate = new Date(rawDate)
            const now = new Date()
            const diffTime = Math.abs(now - linkDate)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays <= 7
        }).length

        const availableCategories = categories.filter(c => c !== 'All')
        const brokenCount = links.filter(l => l.status === 'broken').length
        const healthyCount = links.filter(l => l.status === 'healthy').length
        const favoritesCount = links.filter(l => Boolean(l.is_favorite)).length
        const unreadCount = links.filter(l => !l.reading_status || l.reading_status === 'unread').length
        const readingCount = links.filter(l => l.reading_status === 'reading').length
        const finishedCount = links.filter(l => l.reading_status === 'finished').length

        setStats({
            totalLinks: links.length,
            totalCategories: availableCategories.length,
            recentlyAdded,
            mostUsedCategory: mostUsed,
            brokenCount,
            healthyCount,
            favoritesCount,
            unreadCount,
            readingCount,
            finishedCount
        })
    }

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
            }
        } catch (error) {
            console.error('Error fetching links:', error)
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

            if (!response.ok) {
                throw new Error('Failed to fetch categories')
            }

            const data = await response.json()
            if (Array.isArray(data)) {
                setCategories(['All', ...data.filter(c => c !== 'All')])
                if (data.length > 0 && !newLink.category) {
                    setNewLink(prev => ({ ...prev, category: data[0] }))
                }
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error)
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
        } catch (error) {
            console.error('Failed to fetch tags:', error)
        }
    }

    const handleLogout = () => {
        logout()
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
                    favicon_url: '',
                    og_image_url: null,
                    tags: []
                })
                setMetadataExtracted(false)
                fetchTags()
            } else {
                throw new Error(result.error || result.message || 'Failed to add link')
            }
        } catch (error) {
            console.error("Error adding link:", error)
        }
    }

    const handleEdit = (link) => {
        setEditingLink({
            ...link,
            tags: Array.isArray(link.tags) ? [...link.tags] : []
        })
        setIsEditModalOpen(true)
    }

    const handleUpdateLink = async (e) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/${editingLink.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editingLink),
            })

            const updated = await response.json()

            if (response.ok) {
                const parsedUpdated = parseLinkData(updated)
                setLinks(prevLinks =>
                    prevLinks.map(l => l.id === editingLink.id ? (parsedUpdated || editingLink) : l)
                )
                setIsEditModalOpen(false)
                setEditingLink(null)
                fetchTags()
            }
        } catch (error) {
            console.error("Error updating link:", error)
        }
    }

    const handleDelete = async (link) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/${link.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            if (response.ok) {
                setLinks(prevLinks => prevLinks.filter(l => l.id !== link.id))
                fetchTags()
            }
        } catch (error) {
            console.error("Error deleting link:", error)
        }
    }

    const handleShare = (link) => {
        if (navigator.share) {
            navigator.share({
                title: link.title,
                text: link.description,
                url: link.url
            })
        } else {
            navigator.clipboard.writeText(link.url)
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
        setHealthBanner({ type: 'info', message: 'Scanning all saved bookmarks for 404s, timeouts and health status...' })
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
                    message: `Health Scan Complete: ${data.checked} links checked (${data.healthy} live, ${data.broken} broken).`
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

    const handleNavigation = async (id) => {
        setActiveTab(id)
        setIsLoading(true)

        try {
            switch (id) {
                case 'dashboard':
                    navigate('/dashboard')
                    break
                case 'analytics':
                    navigate('/analytics')
                    break
                case 'add-link':
                    setIsAddModalOpen(true)
                    break
                case 'categories':
                    navigate('/categories')
                    break
                case 'profile':
                    navigate('/profile')
                    break
                default:
                    break
            }
        } finally {
            setTimeout(() => {
                setIsLoading(false)
            }, 300)
        }
    }

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'add-link', label: 'Add Link', icon: PlusCircle },
        { id: 'categories', label: 'Categories', icon: FolderOpen },
        { id: 'profile', label: 'Profile', icon: UserCircle },
    ]

    return (
        <>
            <AnimatePresence>
                {isLoading && <LoadingSpinner />}
            </AnimatePresence>

            <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#050608]">
                {/* Sidebar */}
                <aside
                    className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0B0D11] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static border-r border-slate-200 dark:border-[#181C24]`}
                >
                    <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-[#181C24] cursor-pointer">
                        <h1 onClick={() => navigate('/')} className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Link<span className="text-cyan-500">Vault</span>
                        </h1>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="p-4 space-y-1.5">
                        {sidebarItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item.id)}
                                className={`flex items-center w-full px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === item.id
                                    ? 'bg-cyan-50 dark:bg-cyan-950/40 text-[#0E7490] dark:text-cyan-400 font-bold border border-cyan-200 dark:border-cyan-800/40'
                                    : 'hover:bg-slate-100 dark:hover:bg-[#12151C] text-slate-700 dark:text-[#94A3B8] hover:text-[#0E7490] dark:hover:text-cyan-400'
                                    }`}
                            >
                                <item.icon className="w-4 h-4 mr-3" />
                                <span>{item.label}</span>
                            </button>
                        ))}

                        <button
                            onClick={() => {
                                handleLogout()
                                navigate('/login')
                            }}
                            className="flex items-center w-full px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            <span>Logout</span>
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-[#0B0D11] border-b border-slate-200 dark:border-[#181C24]">
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden mr-4 p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Welcome back, {user?.name || user?.username || user?.email?.split('@')[0]}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#12151C] transition-colors"
                            >
                                {theme === 'light' ? (
                                    <Moon className="w-5 h-5 text-slate-600" />
                                ) : (
                                    <Sun className="w-5 h-5 text-cyan-400" />
                                )}
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] dark:bg-[#050608]">
                        {/* Stats Cards in Obsidian Glass */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                            <div className="bg-white dark:bg-[#0B0D11] p-4 rounded-2xl border border-slate-200 dark:border-[#181C24] shadow-sm">
                                <p className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Total Links</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalLinks}</p>
                            </div>
                            <div className="bg-white dark:bg-[#0B0D11] p-4 rounded-2xl border border-slate-200 dark:border-[#181C24] shadow-sm">
                                <p className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Categories</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalCategories}</p>
                            </div>
                            <div className="bg-white dark:bg-[#0B0D11] p-4 rounded-2xl border border-slate-200 dark:border-[#181C24] shadow-sm">
                                <p className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Recently Added (7d)</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.recentlyAdded}</p>
                            </div>
                            <div className="bg-white dark:bg-[#0B0D11] p-4 rounded-2xl border border-slate-200 dark:border-[#181C24] shadow-sm">
                                <p className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Top Category</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">{stats.mostUsedCategory || 'General'}</p>
                            </div>
                            <div
                                onClick={() => stats.brokenCount > 0 ? setHealthFilter(prev => prev === 'broken' ? 'all' : 'broken') : null}
                                className={`bg-white dark:bg-[#0B0D11] p-4 rounded-2xl border border-slate-200 dark:border-[#181C24] shadow-sm transition-all ${
                                    stats.brokenCount > 0 ? 'cursor-pointer hover:border-red-400 ring-1 ring-red-100 dark:ring-red-900/30' : ''
                                }`}
                                title={stats.brokenCount > 0 ? "Click to view broken links" : "Link health status"}
                            >
                                <p className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] flex items-center justify-between">
                                    <span>Link Health</span>
                                    <Activity className={`w-3.5 h-3.5 ${stats.brokenCount > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
                                </p>
                                <p className="text-2xl font-black mt-1">
                                    {stats.brokenCount > 0 ? (
                                        <span className="text-rose-600 dark:text-rose-400 text-xl font-bold flex items-center gap-1.5">
                                            {stats.brokenCount} Broken ⚠️
                                        </span>
                                    ) : stats.totalLinks > 0 ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 text-xl font-bold flex items-center gap-1.5">
                                            {stats.healthyCount > 0 ? `${Math.round((stats.healthyCount / stats.totalLinks) * 100)}% Live` : 'Healthy'}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 text-xl font-bold">100%</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Health Notification Banner */}
                        {healthBanner && (
                            <div className={`mb-5 p-3 rounded-xl flex items-center justify-between text-xs sm:text-sm border transition-all ${
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

                        {/* Search & Action Toolbar */}
                        <div className="space-y-3 mb-6">
                            {/* Primary Row: Search + Category + Add Link */}
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search bookmarks by title, URL, tag, or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-[#181C24] bg-white dark:bg-[#0B0D11] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0E7490] dark:focus:ring-cyan-500/50 text-sm shadow-xs transition-all"
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                                    {/* Category Selector Dropdown */}
                                    <div className="relative flex-1 sm:flex-none">
                                        <button
                                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                                            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#181C24] bg-white dark:bg-[#0B0D11] text-slate-700 dark:text-slate-200 hover:border-[#0E7490] dark:hover:border-cyan-500/50 text-sm font-semibold shadow-xs transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <Filter className="w-4 h-4 text-slate-400" />
                                                <span className="truncate max-w-[120px]">{selectedCategory}</span>
                                            </div>
                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isFilterOpen && (
                                            <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl border border-slate-200 dark:border-[#181C24] bg-white dark:bg-[#0B0D11] z-30 overflow-hidden py-1">
                                                <div className="max-h-60 overflow-y-auto">
                                                    {categories.map(cat => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => {
                                                                setSelectedCategory(cat)
                                                                setIsFilterOpen(false)
                                                            }}
                                                            className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
                                                                selectedCategory === cat
                                                                    ? 'bg-cyan-50 dark:bg-cyan-950/40 text-[#0E7490] dark:text-cyan-400 font-bold'
                                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#12151C]'
                                                            }`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Primary CTA */}
                                    <ThemedButton
                                        variant="primary"
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-cyan-500/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Link</span>
                                    </ThemedButton>
                                </div>
                            </div>

                            {/* Secondary Utility Row: Check Health, Duplicates, Import/Export */}
                            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200/60 dark:border-[#181C24]/60">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Check Health Button */}
                                    <ThemedButton
                                        variant="secondary"
                                        onClick={handleCheckAllHealth}
                                        disabled={isCheckingAllHealth || links.length === 0}
                                        className="flex items-center gap-2 whitespace-nowrap text-xs py-2 px-3.5 rounded-xl font-semibold"
                                        title="Run HTTP health check on all bookmarks"
                                    >
                                        <Activity className={`w-3.5 h-3.5 text-emerald-500 ${isCheckingAllHealth ? 'animate-spin' : ''}`} />
                                        <span>{isCheckingAllHealth ? 'Scanning Vault...' : 'Check Health'}</span>
                                        {stats.brokenCount > 0 && !isCheckingAllHealth && (
                                            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 dark:text-rose-400">
                                                {stats.brokenCount}
                                            </span>
                                        )}
                                    </ThemedButton>

                                    {/* Scan Duplicates Button */}
                                    <ThemedButton
                                        variant="secondary"
                                        onClick={() => setIsDuplicateModalOpen(true)}
                                        className="flex items-center gap-2 whitespace-nowrap text-xs py-2 px-3.5 rounded-xl font-semibold"
                                        title="Scan and merge duplicate bookmarks in your vault"
                                    >
                                        <Copy className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Duplicates</span>
                                    </ThemedButton>

                                    {/* Import / Export Button */}
                                    <ThemedButton
                                        variant="secondary"
                                        onClick={() => window.dispatchEvent(new CustomEvent('linkvault:open-import-export'))}
                                        className="flex items-center gap-2 whitespace-nowrap text-xs py-2 px-3.5 rounded-xl font-semibold"
                                        title="Import from browser or export backups"
                                    >
                                        <Upload className="w-3.5 h-3.5 text-cyan-500" />
                                        <span>Import / Export</span>
                                    </ThemedButton>
                                </div>

                                <div className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium hidden sm:block">
                                    {filteredLinks.length} of {links.length} bookmarks
                                </div>
                            </div>
                        </div>

                        {/* Quick View & Reading Status Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase tracking-wider flex-shrink-0">
                                Views:
                            </span>
                            <button
                                type="button"
                                onClick={() => setViewFilter('all')}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                    viewFilter === 'all'
                                        ? 'bg-[#0E7490] text-white dark:bg-cyan-400 dark:text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                                        : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-slate-700 dark:text-[#94A3B8] hover:border-cyan-500/40'
                                }`}
                            >
                                All Links ({links.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewFilter('favorites')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                    viewFilter === 'favorites'
                                        ? 'bg-amber-400 text-amber-950 font-bold shadow-md shadow-amber-400/20'
                                        : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-amber-600 dark:text-amber-400 hover:border-amber-400'
                                }`}
                            >
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>Favorites ({links.filter(l => Boolean(l.is_favorite)).length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewFilter('read-later')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                    viewFilter === 'read-later'
                                        ? 'bg-[#0E7490] text-white dark:bg-cyan-400 dark:text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                                        : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-[#0E7490] dark:text-cyan-400 hover:border-cyan-400'
                                }`}
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Read Later ({links.filter(l => !l.reading_status || l.reading_status === 'unread').length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewFilter('in-progress')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                    viewFilter === 'in-progress'
                                        ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                                        : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-amber-600 dark:text-amber-400 hover:border-amber-400'
                                }`}
                            >
                                <Clock className="w-3.5 h-3.5" />
                                <span>In Progress ({links.filter(l => l.reading_status === 'reading').length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewFilter('finished')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                    viewFilter === 'finished'
                                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                                        : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-emerald-600 dark:text-emerald-400 hover:border-emerald-400'
                                }`}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Finished ({links.filter(l => l.reading_status === 'finished').length})</span>
                            </button>
                            {viewFilter !== 'all' && (
                                <button
                                    type="button"
                                    onClick={() => setViewFilter('all')}
                                    className="text-xs text-rose-500 hover:underline flex items-center gap-0.5 ml-1 flex-shrink-0 cursor-pointer font-medium"
                                >
                                    <X className="w-3 h-3" /> Reset View
                                </button>
                            )}
                        </div>

                        {/* Collections / Folder Filter Bar */}
                        {availableCollections.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase tracking-wider flex-shrink-0">
                                    <Folder className="w-3.5 h-3.5" /> Folders:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCollection(null)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                        !selectedCollection
                                            ? 'bg-[#0E7490] text-white dark:bg-cyan-400 dark:text-slate-950 font-bold shadow-xs'
                                            : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-slate-700 dark:text-[#94A3B8] hover:border-cyan-500/40'
                                    }`}
                                >
                                    All ({links.length})
                                </button>
                                {availableCollections.map(col => (
                                    <button
                                        key={col}
                                        type="button"
                                        onClick={() => setSelectedCollection(selectedCollection === col ? null : col)}
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                            selectedCollection === col
                                                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                                                : 'bg-white dark:bg-[#0B0D11] border border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400 hover:border-indigo-400'
                                        }`}
                                    >
                                        📁 {col} ({links.filter(l => l.collection?.toLowerCase() === col.toLowerCase()).length})
                                    </button>
                                ))}
                                {selectedCollection && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCollection(null)}
                                        className="text-xs text-rose-500 hover:underline flex items-center gap-0.5 ml-1 flex-shrink-0 cursor-pointer font-medium"
                                    >
                                        <X className="w-3 h-3" /> Clear Folder
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Health Status Filter Bar */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase tracking-wider flex-shrink-0">
                                <Activity className="w-3.5 h-3.5" /> Health:
                            </span>
                            <button
                                type="button"
                                onClick={() => setHealthFilter('all')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 cursor-pointer ${
                                    healthFilter === 'all'
                                        ? 'bg-[#0E7490] text-white dark:bg-cyan-400 dark:text-slate-950 font-bold shadow-xs'
                                        : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-slate-600 dark:text-[#94A3B8] hover:border-cyan-500/40'
                                }`}
                            >
                                All ({links.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setHealthFilter('healthy')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                    healthFilter === 'healthy'
                                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                                        : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-emerald-600 dark:text-emerald-400 hover:border-emerald-400'
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
                                        ? 'bg-rose-600 text-white shadow-sm font-bold'
                                        : links.filter(l => l.status === 'broken').length > 0
                                            ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:border-rose-500 font-bold'
                                            : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-slate-600 dark:text-[#94A3B8] hover:border-rose-400'
                                }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                <span>Broken ({links.filter(l => l.status === 'broken').length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setHealthFilter('unchecked')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                    healthFilter === 'unchecked'
                                        ? 'bg-slate-700 text-white shadow-sm font-bold'
                                        : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-slate-600 dark:text-[#94A3B8] hover:border-slate-400'
                                }`}
                            >
                                <span>Unchecked ({links.filter(l => !l.status || l.status === 'pending').length})</span>
                            </button>
                            {healthFilter !== 'all' && (
                                <button
                                    type="button"
                                    onClick={() => setHealthFilter('all')}
                                    className="text-xs text-rose-500 hover:underline flex items-center gap-0.5 ml-1 flex-shrink-0 cursor-pointer font-medium"
                                >
                                    <X className="w-3 h-3" /> Clear
                                </button>
                            )}
                        </div>

                        {/* Tag Filter Bar */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase tracking-wider flex-shrink-0">
                                <TagIcon className="w-3.5 h-3.5" /> Tags:
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedTag(null)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 cursor-pointer ${
                                    !selectedTag
                                        ? 'bg-[#0E7490] text-white dark:bg-cyan-400 dark:text-slate-950 font-bold shadow-xs'
                                        : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-slate-600 dark:text-[#94A3B8] hover:border-cyan-500/40'
                                }`}
                            >
                                All
                            </button>
                            {availableTags.length > 0 ? (
                                availableTags.map(tagObj => {
                                    const isSelected = selectedTag === tagObj.name
                                    return (
                                        <button
                                            key={tagObj.name}
                                            type="button"
                                            onClick={() => setSelectedTag(isSelected ? null : tagObj.name)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#0E7490] text-white dark:bg-cyan-400 dark:text-slate-950 shadow-sm font-bold'
                                                    : 'bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-slate-700 dark:text-[#94A3B8] hover:border-cyan-500/40'
                                            }`}
                                        >
                                            <span>#{tagObj.name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-black/15 dark:bg-black/20 text-white dark:text-slate-950 font-bold' : 'bg-slate-100 dark:bg-[#12151C] text-slate-500 dark:text-[#94A3B8]'}`}>
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
                            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {healthFilter === 'broken'
                                        ? '🎉 Great news! No broken links found.'
                                        : viewFilter === 'favorites'
                                            ? '⭐ No favorites yet! Click the star icon on any bookmark to pin it.'
                                            : viewFilter === 'read-later'
                                                ? '📖 Your reading list is clear! Mark bookmarks as "Read Later" to track them.'
                                                : 'No links found. Add your first bookmark!'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredLinks.map(link => (
                                    <LinkCard
                                        key={link.id}
                                        link={link}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onShare={handleShare}
                                        onTagClick={(tag) => setSelectedTag(prev => prev === tag ? null : tag)}
                                        onCheckHealth={handleCheckSingleHealth}
                                        onToggleFavorite={handleToggleFavorite}
                                        onChangeReadingStatus={handleChangeReadingStatus}
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

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
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7490] dark:text-cyan-400 hover:underline disabled:opacity-50 cursor-pointer"
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
                                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/40 text-[#0E7490] dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50">
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

            {/* Edit Link Modal */}
            <ThemedModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditingLink(null)
                }}
                title="Edit Link"
            >
                {editingLink && (
                    <form onSubmit={handleUpdateLink} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input
                                type="text"
                                required
                                value={editingLink.title}
                                onChange={(e) => setEditingLink(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                            <input
                                type="url"
                                required
                                value={editingLink.url}
                                onChange={(e) => setEditingLink(prev => ({ ...prev, url: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select
                                value={editingLink.category}
                                onChange={(e) => setEditingLink(prev => ({ ...prev, category: e.target.value }))}
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
                                value={editingLink.collection || ''}
                                onChange={(e) => setEditingLink(prev => ({ ...prev, collection: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        {/* Tags Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                            <TagInput
                                tags={editingLink.tags || []}
                                onChange={(newTags) => setEditingLink(prev => ({ ...prev, tags: newTags }))}
                                suggestions={availableTags}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                value={editingLink.description || ''}
                                onChange={(e) => setEditingLink(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <ThemedButton variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</ThemedButton>
                            <ThemedButton type="submit" variant="primary">Save Changes</ThemedButton>
                        </div>
                    </form>
                )}
            </ThemedModal>

            {/* Duplicate Cleaner Modal */}
            <DuplicateCleanerModal
                isOpen={isDuplicateModalOpen}
                onClose={() => setIsDuplicateModalOpen(false)}
                onDuplicatesMerged={handleDuplicatesMerged}
            />
        </>
    )
}

export default Dashboard
