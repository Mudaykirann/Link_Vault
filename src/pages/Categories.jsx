/* eslint-disable no-unused-vars */
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
            const response = await fetch(`${config.apiUrl}/links/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (response.ok) {
                setCategories(data.filter(category => category !== 'All'))
                // Fetch stats for each category
                await Promise.all(data.map(category => fetchCategoryStats(category)))
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCategoryStats = async (category) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${config.apiUrl}/links/category/${category}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (response.ok) {
                setCategoryStats(prev => ({
                    ...prev,
                    [category]: data.length
                }))
            }
        } catch (error) {
            console.error(`Error fetching stats for ${category}:`, error)
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
                            className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <FolderOpen className="w-6 h-6 text-blue-500" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {category}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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