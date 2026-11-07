import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { FolderOpen, ArrowLeft } from 'lucide-react'
import { config } from '../config'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'

const Categories = () => {
    const { theme } = useTheme()
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [categoryStats, setCategoryStats] = useState({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            const [catRes, linksRes] = await Promise.all([
                fetch(`${config.apiUrl}/links/categories`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${config.apiUrl}/links`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ])

            const catData = await catRes.json()
            const linksData = await linksRes.json()

            if (catRes.ok && Array.isArray(catData)) {
                setCategories(catData.filter(category => category !== 'All'))
            }

            if (linksRes.ok && Array.isArray(linksData)) {
                const counts = {}
                linksData.forEach(link => {
                    if (link.category) {
                        counts[link.category] = (counts[link.category] || 0) + 1
                    }
                })
                setCategoryStats(counts)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <AnimatePresence>
                {isLoading && <LoadingSpinner />}
            </AnimatePresence>

            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#0B0D11] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-[#181C24] hover:border-[#0E7490] dark:hover:border-cyan-500/50 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 text-[#0E7490] dark:text-cyan-400 flex items-center justify-center">
                                        <FolderOpen className="w-5 h-5 text-[#0E7490] dark:text-cyan-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {category}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#94A3B8] font-medium">
                                <span>{categoryStats[category] || 0} links</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Categories
