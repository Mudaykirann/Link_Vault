import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Key, Camera, ArrowLeft, Sun, Moon, FolderOpen } from 'lucide-react'
import { ThemedButton } from '../components/ui/ThemedButton'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'

const Profile = () => {
    const { theme, toggleTheme } = useTheme()
    const { user, updateProfile } = useAuth()
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })
    const [formData, setFormData] = useState({
        name: user?.name || user?.username || '',
        email: user?.email || '',
        username: user?.username || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || user.username || '',
                email: user.email || '',
                username: user.username || ''
            }))
        }
    }, [user])

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 300)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatusMessage({ type: '', text: '' })

        if (formData.newPassword) {
            if (formData.newPassword.length < 6) {
                setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters' })
                return
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setStatusMessage({ type: 'error', text: 'New passwords do not match' })
                return
            }
        }

        try {
            await updateProfile({
                username: formData.username,
                name: formData.name,
                newPassword: formData.newPassword || undefined
            })
            setStatusMessage({ type: 'success', text: 'Profile updated successfully!' })
            setIsEditing(false)
        } catch (error) {
            console.error('Error updating profile:', error)
            setStatusMessage({ type: 'error', text: error.message || 'Failed to update profile' })
        }
    }

    return (
        <>
            <AnimatePresence>
                {isLoading && <LoadingSpinner />}
            </AnimatePresence>

            <div className={`min-h-screen p-8 ${theme === 'light' ? 'bg-gray-50' : 'bg-slate-900'}`}>
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Dashboard
                        </button>
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

                    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-6`}>
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Profile Settings
                            </h1>
                            <ThemedButton
                                onClick={() => {
                                    setIsEditing(!isEditing)
                                    setStatusMessage({ type: '', text: '' })
                                }}
                                variant={isEditing ? "secondary" : "primary"}
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </ThemedButton>
                        </div>

                        {statusMessage.text && (
                            <div className={`mb-6 p-4 rounded-lg text-sm ${statusMessage.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                                : 'bg-red-500/10 border border-red-500/20 text-red-500'
                                }`}>
                                {statusMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                                        <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-500 text-white"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {user?.username || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Most Used Category</p>
                                    <div className="flex items-center gap-2">
                                        <FolderOpen className="w-4 h-4 text-blue-500" />
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {user?.mostUsedCategory || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-gray-900'
                                        : 'bg-slate-800 border-gray-600 text-white'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                        ? 'bg-white border-gray-300 text-gray-900'
                                        : 'bg-slate-800 border-gray-600 text-white'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled={true}
                                    className={`w-full px-4 py-2 rounded-lg border opacity-75 cursor-not-allowed ${theme === 'light'
                                        ? 'bg-gray-100 border-gray-300 text-gray-600'
                                        : 'bg-slate-700 border-gray-600 text-gray-300'
                                        }`}
                                />
                            </div>

                            {isEditing && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            New Password (optional)
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            placeholder="Leave blank to keep current password"
                                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                                ? 'bg-white border-gray-300 text-gray-900'
                                                : 'bg-slate-800 border-gray-600 text-white'
                                                }`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'light'
                                                ? 'bg-white border-gray-300 text-gray-900'
                                                : 'bg-slate-800 border-gray-600 text-white'
                                                }`}
                                        />
                                    </div>
                                </>
                            )}

                            {isEditing && (
                                <div className="flex justify-end">
                                    <ThemedButton type="submit" variant="primary">
                                        Save Changes
                                    </ThemedButton>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Profile
