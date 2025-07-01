/* eslint-disable no-unused-vars */
import LinkCard from '../components/LinkCard'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ExternalLink, Share2, Trash2, Loader2, ChevronDown, Plus, Edit2, Download } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { config } from '../config'
import { ThemedButton } from '../components/ui/ThemedButton'
import linksData from '../data/links.json'
import { ThemedModal } from '../components/ui/ThemedModal'
import { ConfirmModal } from '../components/ui/ConfirmModal'

const Links = () => {
    const { theme } = useTheme()
    const { user } = useAuth()
    const [links, setLinks] = useState([])
    const [filteredLinks, setFilteredLinks] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [isLoading, setIsLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newLink, setNewLink] = useState({
        title: '',
        description: '',
        url: '',
        category: ''
    })
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

    // Add page mount animation
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    useEffect(() => {
        fetchLinks()
        fetchCategories();
    }, [])

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
            } else {
                setError(data.message)
            }
        } catch (error) {
            console.error('Error fetching links:', error)
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

            if (response.ok) {
                const categoryList = ['All', ...(data || [])]
                setCategories(categoryList)

                if (data && data.length > 0) {
                    setNewLink(prev => ({
                        ...prev,
                        category: data[0]
                    }))
                }
            } else {
                console.error('Failed to fetch categories:', data.message)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    useEffect(() => {
        const filtered = links.filter(link => {
            const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                link.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory
            return matchesSearch && matchesCategory
        })
        setFilteredLinks(filtered)
    }, [searchTerm, selectedCategory, links])

    const handleShare = async (link) => {
        try {
            await navigator.share({
                title: link.title,
                text: link.description,
                url: link.url
            })
        } catch (error) {
            console.log('Error sharing:', error)
        }
    }

    const handleAddLink = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token'); // Get auth token
            const newLinkData = {
                title: newLink.title,
                description: newLink.description,
                url: newLink.url,
                category: newLink.category
            };

            const response = await fetch(`${config.apiUrl}/links`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newLinkData),
            });

            const result = await response.json();

            if (response.ok) {
                setLinks(prevLinks => [...prevLinks, result]); // Add new link to state
                setIsAddModalOpen(false);
                setNewLink({ title: '', description: '', url: '', category: linksData.categories[1] });
            } else {
                console.error("Failed to add link:", result.message);
            }
        } catch (error) {
            console.error("Error adding link:", error);
        }
    };


    const handleDelete = (linkId) => {
        setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId))
        setDeleteModal({ isOpen: false, linkId: null, linkTitle: '' })
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
            link: link
        });
    };

    const handleEditSubmit = async (editedLink) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update links array with edited link
            setLinks(prevLinks =>
                prevLinks.map(link =>
                    link.id === editedLink.id ? editedLink : link
                )
            );

            setEditModal({ isOpen: false, link: null });
        } catch (error) {
            console.error('Error updating link:', error);
        }
    };

    // Search and filter handlers
    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleCategorySelect = (category) => {
        setSelectedCategory(category)
        setIsFilterOpen(false)
    }

    const exportToCSV = () => {
        try {
            // Create CSV header
            const headers = ['Title', 'URL', 'Category', 'Description'];

            // Convert links to CSV format
            const csvContent = [
                headers.join(','), // Header row
                ...filteredLinks.map(link => [
                    `"${link.title.replace(/"/g, '""')}"`,
                    `"${link.url.replace(/"/g, '""')}"`,
                    `"${link.category.replace(/"/g, '""')}"`,
                    `"${link.description.replace(/"/g, '""')}"`
                ].join(','))
            ].join('\n');

            // Create blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            // Set download attributes
            link.setAttribute('href', url);
            link.setAttribute('download', `linkvault_links_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting links:', error);
            setError('Failed to export links');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
            }}
            className="min-h-[calc(100vh-4rem)] flex flex-col"
        >
            <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center mb-8">
                    <div>
                        <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`}>
                            My Links
                        </h1>
                        <p className={theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}>
                            Welcome back, {user?.name}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <ThemedButton
                            variant="secondary"
                            onClick={exportToCSV}
                            className="flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Export Links
                        </ThemedButton>
                        <ThemedButton
                            variant="primary"
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Link
                        </ThemedButton>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                        <input
                            type="text"
                            placeholder="Search links..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${theme === 'light'
                                ? 'bg-white border-gray-300 text-gray-900 focus:border-light-primary'
                                : 'bg-slate-800 border-gray-600 text-white focus:border-dark-accent'
                                }`}
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${theme === 'light'
                                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                : 'bg-slate-800 border-gray-600 text-gray-200 hover:bg-slate-700'
                                }`}
                        >
                            <Filter className="w-5 h-5" />
                            <span>{selectedCategory}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isFilterOpen && (
                            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border overflow-hidden ${theme === 'light'
                                ? 'bg-white border-gray-200'
                                : 'bg-slate-800 border-gray-700'
                                }`}>
                                <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => handleCategorySelect(category)}
                                            className={`w-full text-left px-4 py-2 hover:transition-colors ${theme === 'light'
                                                ? 'hover:bg-gray-50 text-gray-700'
                                                : 'hover:bg-slate-700 text-gray-200'
                                                } ${selectedCategory === category
                                                    ? theme === 'light'
                                                        ? 'bg-gray-100'
                                                        : 'bg-slate-700'
                                                    : ''
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

                {error ? (
                    <div className="text-red-500 text-center">
                        {error}
                    </div>
                ) : filteredLinks.length === 0 ? (
                    <div className={`text-center py-12 ${theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
                        <p className="text-lg">No links found</p>
                        <p className="mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredLinks.map((link) => (
                            <motion.div
                                key={link.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <LinkCard
                                    link={link}
                                    onShare={handleShare}
                                    onEdit={() => handleEdit(link)}
                                    onDelete={() => openDeleteModal(link)}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Add Link Modal */}
                <ThemedModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Add New Link"
                >
                    <form onSubmit={handleAddLink} className="space-y-4">
                        <div>
                            <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
                                Title
                            </label>
                            <input
                                type="text"
                                required
                                value={newLink.title}
                                onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                                className={`w-full px-4 py-2 rounded-lg border transition-colors
                                    ${theme === 'light'
                                        ? 'bg-white border-[#E5E7EB] text-[#1F2937]'
                                        : 'bg-[#1E293B] border-[#334155] text-[#F9FAFB]'
                                    }
                                    focus:outline-none focus:ring-0
                                    ${theme === 'light'
                                        ? 'focus:border-[#2563EB]'
                                        : 'focus:border-[#FACC15]'
                                    }
                                `}
                            />
                        </div>

                        {/* URL Input */}
                        <div>
                            <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
                                URL
                            </label>
                            <input
                                type="url"
                                required
                                value={newLink.url}
                                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                                className={`w-full px-4 py-2 rounded-lg border transition-colors
                                    ${theme === 'light'
                                        ? 'bg-white border-[#E5E7EB] text-[#1F2937]'
                                        : 'bg-[#1E293B] border-[#334155] text-[#F9FAFB]'
                                    }
                                    focus:outline-none focus:ring-0
                                    ${theme === 'light'
                                        ? 'focus:border-[#2563EB]'
                                        : 'focus:border-[#FACC15]'
                                    }
                                `}
                            />
                        </div>

                        {/* Category Select */}
                        <div>
                            <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
                                Category
                            </label>
                            <select
                                required
                                value={newLink.category}
                                onChange={(e) => setNewLink(prev => ({ ...prev, category: e.target.value }))}
                                className={`w-full px-4 py-2 rounded-lg border transition-colors
                                    ${theme === 'light'
                                        ? 'bg-white border-[#E5E7EB] text-[#1F2937]'
                                        : 'bg-[#1E293B] border-[#334155] text-[#F9FAFB]'
                                    }
                                    focus:outline-none focus:ring-0
                                    ${theme === 'light'
                                        ? 'focus:border-[#2563EB]'
                                        : 'focus:border-[#FACC15]'
                                    }
                                `}
                            >
                                <option value="">Select a category</option>
                                {categories.filter(cat => cat !== 'All').map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description Textarea */}
                        <div>
                            <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
                                Description
                            </label>
                            <textarea
                                required
                                value={newLink.description}
                                onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className={`w-full px-4 py-2 rounded-lg border transition-colors
                                    ${theme === 'light'
                                        ? 'bg-white border-[#E5E7EB] text-[#1F2937]'
                                        : 'bg-[#1E293B] border-[#334155] text-[#F9FAFB]'
                                    }
                                    focus:outline-none focus:ring-0
                                    ${theme === 'light'
                                        ? 'focus:border-[#2563EB]'
                                        : 'focus:border-[#FACC15]'
                                    }
                                `}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
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

                {/* Delete Confirmation Modal */}
                <ThemedModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, linkId: null, linkTitle: '' })}
                    title="Delete Link"
                >
                    <div className="space-y-4">
                        <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                            Are you sure you want to delete "{deleteModal.linkTitle}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <ThemedButton
                                variant="secondary"
                                onClick={() => setDeleteModal({ isOpen: false, linkId: null, linkTitle: '' })}
                            >
                                Cancel
                            </ThemedButton>
                            <ThemedButton
                                variant="primary"
                                onClick={() => handleDelete(deleteModal.linkId)}
                            >
                                Delete
                            </ThemedButton>
                        </div>
                    </div>
                </ThemedModal>

                {/* Edit Modal */}
                <ThemedModal
                    isOpen={editModal.isOpen}
                    onClose={() => setEditModal({ isOpen: false, link: null })}
                    title="Edit Link"
                >
                    {editModal.link && (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleEditSubmit(editModal.link);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className={`block mb-2 font-medium ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`}>
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editModal.link.title}
                                        onChange={(e) => setEditModal(prev => ({
                                            ...prev,
                                            link: { ...prev.link, title: e.target.value }
                                        }))}
                                        className={`w-full p-3 rounded-lg border transition-colors duration-200 ${theme === 'light'
                                            ? 'border-[#E5E7EB] focus:border-[#2563EB] bg-white text-[#1F2937]'
                                            : 'border-[#334155] focus:border-[#FACC15] bg-[#1E293B] text-[#F9FAFB]'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block mb-2 font-medium ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`}>
                                        Description
                                    </label>
                                    <textarea
                                        value={editModal.link.description}
                                        onChange={(e) => setEditModal(prev => ({
                                            ...prev,
                                            link: { ...prev.link, description: e.target.value }
                                        }))}
                                        rows={3}
                                        className={`w-full p-3 rounded-lg border transition-colors duration-200 ${theme === 'light'
                                            ? 'border-[#E5E7EB] focus:border-[#2563EB] bg-white text-[#1F2937]'
                                            : 'border-[#334155] focus:border-[#FACC15] bg-[#1E293B] text-[#F9FAFB]'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block mb-2 font-medium ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`}>
                                        URL
                                    </label>
                                    <input
                                        type="url"
                                        value={editModal.link.url}
                                        onChange={(e) => setEditModal(prev => ({
                                            ...prev,
                                            link: { ...prev.link, url: e.target.value }
                                        }))}
                                        className={`w-full p-3 rounded-lg border transition-colors duration-200 ${theme === 'light'
                                            ? 'border-[#E5E7EB] focus:border-[#2563EB] bg-white text-[#1F2937]'
                                            : 'border-[#334155] focus:border-[#FACC15] bg-[#1E293B] text-[#F9FAFB]'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block mb-2 font-medium ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`}>
                                        Category
                                    </label>
                                    <select
                                        value={editModal.link.category}
                                        onChange={(e) => setEditModal(prev => ({
                                            ...prev,
                                            link: { ...prev.link, category: e.target.value }
                                        }))}
                                        className={`w-full p-3 rounded-lg border transition-colors duration-200 ${theme === 'light'
                                            ? 'border-[#E5E7EB] focus:border-[#2563EB] bg-white text-[#1F2937]'
                                            : 'border-[#334155] focus:border-[#FACC15] bg-[#1E293B] text-[#F9FAFB]'
                                            }`}
                                    >
                                        {categories.filter(cat => cat !== 'All').map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-4 mt-6">
                                    <ThemedButton
                                        variant="secondary"
                                        onClick={() => setEditModal({ isOpen: false, link: null })}
                                    >
                                        Cancel
                                    </ThemedButton>
                                    <ThemedButton
                                        variant="primary"
                                        type="submit"
                                    >
                                        Save Changes
                                    </ThemedButton>
                                </div>
                            </div>
                        </form>
                    )}
                </ThemedModal>
            </div>
        </motion.div>
    )
}

export default Links 