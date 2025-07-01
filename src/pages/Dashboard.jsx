/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import {
    Menu, X, Search, Filter, ChevronDown,
    LayoutDashboard, PlusCircle, FolderOpen,
    UserCircle, LogOut, Sun, Moon, ChevronRight, Share2, Plus
} from 'lucide-react'
import LinkCard from '../components/LinkCard'
import { ThemedButton } from '../components/ui/ThemedButton'
import { ThemedModal } from '../components/ui/ThemedModal'
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
    const [stats, setStats] = useState({
        totalLinks: 0,
        totalCategories: 0,
        recentlyAdded: 0,
        mostUsedCategory: ''
    })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newLink, setNewLink] = useState({
        title: '',
        description: '',
        url: '',
        category: ''
    })
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingLink, setEditingLink] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    // Fetch data
    useEffect(() => {
        fetchLinks()
        fetchCategories()
    }, [])

    // Update stats
    useEffect(() => {
        updateStats()
    }, [links, categories])

    // Filter links
    useEffect(() => {
        const filtered = links.filter(link => {
            const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                link.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory
            return matchesSearch && matchesCategory
        })
        setFilteredLinks(filtered)
    }, [searchTerm, selectedCategory, links])

    const updateStats = () => {
        const categoryCount = {}
        links.forEach(link => {
            categoryCount[link.category] = (categoryCount[link.category] || 0) + 1
        })

        const mostUsed = Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'

        // Calculate recently added links (within the last 7 days)
        const recentlyAdded = links.filter(link => {
            const linkDate = new Date(link.createdAt)
            const now = new Date()
            const diffTime = Math.abs(now - linkDate)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays <= 7
        }).length

        setStats({
            totalLinks: links.length,
            totalCategories: categories.length - 1, // Excluding 'All'
            recentlyAdded,
            mostUsedCategory: mostUsed
        })
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
            if (response.ok) {
                setLinks(data)
                setFilteredLinks(data)
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
            setCategories(data)
        } catch (error) {
            console.error('Failed to fetch categories:', error)
            // Handle error appropriately
        }
    }

    const handleLogout = () => {
        logout()
    }

    // Add Link handlers
    const handleAddLink = async (e) => {
        e.preventDefault();
        try {
            if (!categories.includes(newLink.category)) {
                throw new Error('Invalid category')
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${config.apiUrl}/links`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newLink),
            });

            const result = await response.json();

            if (response.ok) {
                setLinks(prevLinks => [...prevLinks, result]);
                setIsAddModalOpen(false);
                setNewLink({ title: '', description: '', url: '', category: '' });
            } else {
                throw new Error(result.message || 'Failed to add link')
            }
        } catch (error) {
            console.error("Error adding link:", error);
        }
    };

    // Edit handler
    const handleEdit = async (link) => {
        setEditingLink(link)
        setIsEditModalOpen(true)
    }

    // Update handler
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

            if (response.ok) {
                setLinks(prevLinks =>
                    prevLinks.map(l => l.id === editingLink.id ? editingLink : l)
                )
                setIsEditModalOpen(false)
                setEditingLink(null)
            }
        } catch (error) {
            console.error("Error updating link:", error)
        }
    }

    // Delete handler
    const handleDelete = async (link) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.apiUrl}/links/${link.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                setLinks(prevLinks => prevLinks.filter(l => l.id !== link.id));
            }
        } catch (error) {
            console.error("Error deleting link:", error);
        }
    };

    // Share handler
    const handleShare = (link) => {
        if (navigator.share) {
            navigator.share({
                title: link.title,
                text: link.description,
                url: link.url
            });
        } else {
            navigator.clipboard.writeText(link.url);
        }
    };

    const handleNavigation = async (id) => {
        setActiveTab(id)
        setIsLoading(true)

        try {
            switch (id) {
                case 'dashboard':
                    await navigate('/dashboard')
                    break
                case 'add-link':
                    setIsAddModalOpen(true)
                    break
                case 'categories':
                    await navigate('/categories')
                    break
                case 'profile':
                    await navigate('/profile')
                    break
                default:
                    break
            }
        } finally {
            // Short timeout to ensure smooth transition
            setTimeout(() => {
                setIsLoading(false)
            }, 500)
        }
    }

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
            id: 'add-link',
            label: 'Add Link',
            icon: PlusCircle,
        },
        { id: 'categories', label: 'Categories', icon: FolderOpen },
        { id: 'profile', label: 'Profile', icon: UserCircle },
    ]

    return (
        <>
            <AnimatePresence>
                {isLoading && <LoadingSpinner />}
            </AnimatePresence>

            <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
                {/* Sidebar */}
                <aside
                    className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static`}
                >
                    <div className="flex items-center justify-between h-16 px-4 border-b dark:border-slate-700 cursor-pointer">
                        <h1 onClick={() => navigate('/')} className="text-xl font-bold text-gray-800 dark:text-white">LinkVault</h1>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="p-4 space-y-2">
                        {sidebarItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item.id)}
                                className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${activeTab === item.id
                                    ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-white'
                                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
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
                    {/* Top Bar */}
                    <header className="flex items-center justify-between h-16 px-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden mr-4"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    Welcome back, {user?.name}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                                {theme === 'light' ? (
                                    <Moon className="w-5 h-5" />
                                ) : (
                                    <Sun className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto p-4">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Total Links', value: stats.totalLinks },
                                { label: 'Categories', value: stats.totalCategories },
                                { label: 'Recently Added', value: stats.recentlyAdded },
                                { label: 'Most Used Category', value: stats.mostUsedCategory }
                            ].map(stat => (
                                <div
                                    key={stat.label}
                                    className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm"
                                >
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {stat.label}
                                    </h3>
                                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search links..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-600"
                                />
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-600"
                                >
                                    <Filter className="w-5 h-5" />
                                    <span>{selectedCategory}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isFilterOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border bg-white dark:bg-slate-800 dark:border-slate-600">
                                        <div className="max-h-60 overflow-y-auto scrollbar-thin">
                                            {categories.map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() => {
                                                        setSelectedCategory(category)
                                                        setIsFilterOpen(false)
                                                    }}
                                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 ${selectedCategory === category ?
                                                        'bg-gray-100 dark:bg-slate-700' : ''
                                                        }`}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Links Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredLinks.map((link) => (
                                <motion.div
                                    key={link.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <LinkCard
                                        link={link}
                                        onEdit={() => handleEdit(link)}
                                        onDelete={() => handleDelete(link)}
                                        onShare={() => handleShare(link)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </main>

                    {/* Add Link Modal */}
                    <ThemedModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        title="Add New Link"
                    >
                        <form onSubmit={handleAddLink} className="space-y-4">
                            <div>
                                <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                    }`}>
                                    Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newLink.title}
                                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-gray-900'
                                        : 'bg-slate-800 border-gray-600 text-white'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                    }`}>
                                    URL
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={newLink.url}
                                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-gray-900'
                                        : 'bg-slate-800 border-gray-600 text-white'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                    }`}>
                                    Category
                                </label>
                                <select
                                    required
                                    value={newLink.category}
                                    onChange={(e) => setNewLink(prev => ({ ...prev, category: e.target.value }))}
                                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-gray-900'
                                        : 'bg-slate-800 border-gray-600 text-white'
                                        }`}
                                >
                                    <option value="">Select a category</option>
                                    {categories
                                        .filter(cat => cat !== 'All')
                                        .map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                    }`}>
                                    Description
                                </label>
                                <textarea
                                    required
                                    value={newLink.description}
                                    onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-gray-900'
                                        : 'bg-slate-800 border-gray-600 text-white'
                                        }`}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <ThemedButton
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    Cancel
                                </ThemedButton>
                                <ThemedButton type="submit" variant="primary">
                                    Add Link
                                </ThemedButton>
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
                        <form onSubmit={handleUpdateLink} className="space-y-4">
                            <div>
                                <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                    Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editingLink?.title || ''}
                                    onChange={(e) => setEditingLink(prev => ({ ...prev, title: e.target.value }))}
                                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-gray-900'
                                        : 'bg-slate-800 border-gray-600 text-white'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                    URL
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={editingLink?.url || ''}
                                    onChange={(e) => setEditingLink(prev => ({ ...prev, url: e.target.value }))}
                                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-gray-900'
                                        : 'bg-slate-800 border-gray-600 text-white'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                    Category
                                </label>
                                <select
                                    required
                                    value={editingLink?.category || ''}
                                    onChange={(e) => setEditingLink(prev => ({ ...prev, category: e.target.value }))}
                                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-gray-900'
                                        : 'bg-slate-800 border-gray-600 text-white'
                                        }`}
                                >
                                    {categories
                                        .filter(cat => cat !== 'All')
                                        .map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div>
                                <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                    Description
                                </label>
                                <textarea
                                    required
                                    value={editingLink?.description || ''}
                                    onChange={(e) => setEditingLink(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-gray-900'
                                        : 'bg-slate-800 border-gray-600 text-white'
                                        }`}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <ThemedButton
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setIsEditModalOpen(false)
                                        setEditingLink(null)
                                    }}
                                >
                                    Cancel
                                </ThemedButton>
                                <ThemedButton type="submit" variant="primary">
                                    Update Link
                                </ThemedButton>
                            </div>
                        </form>
                    </ThemedModal>
                </div>
            </div>
        </>
    )
}

export default Dashboard 