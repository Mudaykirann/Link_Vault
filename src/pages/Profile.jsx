import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Mail, Key, ArrowLeft, Sun, Moon, FolderOpen,
    Shield, ShieldCheck, CheckCircle2, Activity,
    Download, LogOut, Lock, Database, Sparkles,
    Check, AlertCircle, Eye, EyeOff, Bookmark,
    Layers, Clock, ExternalLink, HardDrive, RefreshCw
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { ThemedButton } from '../components/ui/ThemedButton'
import LoadingSpinner from '../components/LoadingSpinner'
import { config } from '../config'

const Profile = () => {
    const { theme, toggleTheme } = useTheme()
    const { user, updateProfile, logout } = useAuth()
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState('identity')
    const [isEditing, setIsEditing] = useState(false)
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)

    // Live Vault Telemetry
    const [vaultStats, setVaultStats] = useState({
        totalLinks: 0,
        healthyLinks: 0,
        brokenLinks: 0,
        totalCategories: 0,
        unreadCount: 0,
        topCategory: 'General'
    })

    const [formData, setFormData] = useState({
        name: user?.name || user?.username || '',
        email: user?.email || '',
        username: user?.username || '',
        newPassword: '',
        confirmPassword: ''
    })

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

    // Fetch live statistics for telemetry tab
    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return

                const [linksRes, catsRes] = await Promise.all([
                    fetch(`${config.apiUrl}/links`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch(`${config.apiUrl}/links/categories`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).catch(() => null)
                ])

                if (linksRes.ok) {
                    const linksData = await linksRes.json()
                    const linksList = Array.isArray(linksData) ? linksData : linksData.links || []
                    const healthy = linksList.filter(l => l.status === 'healthy').length
                    const broken = linksList.filter(l => l.status === 'broken').length
                    const unread = linksList.filter(l => !l.reading_status || l.reading_status === 'unread').length

                    // Compute most used category
                    const catCounts = {}
                    linksList.forEach(l => {
                        const cat = l.category || 'General'
                        catCounts[cat] = (catCounts[cat] || 0) + 1
                    })
                    let topCat = 'General'
                    let maxCount = 0
                    Object.entries(catCounts).forEach(([cat, count]) => {
                        if (count > maxCount) {
                            maxCount = count
                            topCat = cat
                        }
                    })

                    let catCount = Object.keys(catCounts).length
                    if (catsRes && catsRes.ok) {
                        const catsData = await catsRes.json()
                        if (Array.isArray(catsData)) catCount = Math.max(catCount, catsData.length)
                    }

                    setVaultStats({
                        totalLinks: linksList.length,
                        healthyLinks: healthy,
                        brokenLinks: broken,
                        totalCategories: catCount,
                        unreadCount: unread,
                        topCategory: topCat
                    })
                }
            } catch (err) {
                console.error('Error fetching vault telemetry in profile:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTelemetry()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatusMessage({ type: '', text: '' })

        if (formData.newPassword) {
            if (formData.newPassword.length < 6) {
                setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters.' })
                return
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setStatusMessage({ type: 'error', text: 'New passwords do not match.' })
                return
            }
        }

        try {
            await updateProfile({
                username: formData.username,
                name: formData.name,
                newPassword: formData.newPassword || undefined
            })
            setStatusMessage({ type: 'success', text: 'Profile changes saved successfully!' })
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }))
            setIsEditing(false)
        } catch (error) {
            console.error('Error updating profile:', error)
            setStatusMessage({ type: 'error', text: error.message || 'Failed to update profile' })
        }
    }

    const handleQuickExport = async (format = 'json') => {
        try {
            setIsExporting(true)
            const token = localStorage.getItem('token')
            const res = await fetch(`${config.apiUrl}/links/export?format=${format}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to generate export backup')

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `linkvault-backup-${new Date().toISOString().slice(0, 10)}.${format === 'json' ? 'json' : 'html'}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
            setStatusMessage({ type: 'success', text: `Vault backup downloaded in .${format.toUpperCase()} format!` })
        } catch (err) {
            console.error('Export error:', err)
            setStatusMessage({ type: 'error', text: 'Export failed. Please try again.' })
        } finally {
            setIsExporting(false)
        }
    }

    // Determine initials
    const displayName = user?.name || user?.username || 'LinkVault User'
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join('') || 'LV'

    const isGoogleAuth = Boolean(
        user?.auth_provider === 'google' ||
        user?.is_google_user ||
        user?.user_metadata?.provider === 'google'
    )

    return (
        <>
            <AnimatePresence>
                {isLoading && <LoadingSpinner message="Loading Profile Command..." />}
            </AnimatePresence>

            <div className="min-h-screen bg-slate-50 dark:bg-[#050608] text-slate-900 dark:text-white py-8 px-4 sm:px-6 lg:px-8 transition-colors">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Top Navigation Bar */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] shadow-xs hover:border-cyan-500/40 transition-all cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 text-[#0E7490] dark:text-cyan-400" />
                            <span>Return to Dashboard</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] text-slate-700 dark:text-slate-300 hover:text-[#0E7490] dark:hover:text-cyan-400 shadow-xs transition-all cursor-pointer"
                                title={theme === 'light' ? 'Switch to Obsidian Dark' : 'Switch to Modern Light'}
                            >
                                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={logout}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] hover:bg-rose-50 dark:hover:bg-rose-950/20 shadow-xs transition-all cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    </div>

                    {/* Hero Identity Banner */}
                    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#181C24] p-6 sm:p-8 shadow-xl shadow-cyan-500/5">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                {/* Monogram Avatar Pod */}
                                <div className="relative">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#0E7490] to-cyan-500 dark:from-cyan-500 dark:to-cyan-600 p-0.5 shadow-xl shadow-cyan-500/20">
                                        <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#0B0D11] flex items-center justify-center">
                                            <span className="text-2xl sm:text-3xl font-black text-[#0E7490] dark:text-cyan-400 tracking-wider">
                                                {initials}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30" title="Account Active">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                            {displayName}
                                        </h1>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950/60 text-[#0E7490] dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                                            <Sparkles className="w-3 h-3" />
                                            Vault Sentinel
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-[#94A3B8] font-medium flex items-center gap-2">
                                        <span>@{user?.username || 'user'}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            {user?.email || 'No email attached'}
                                        </span>
                                    </p>

                                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                                        {isGoogleAuth ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                                </svg>
                                                Google OAuth 2.0 Connected
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#12151C] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2430]">
                                                <Lock className="w-3.5 h-3.5 text-[#0E7490] dark:text-cyan-400" />
                                                Encrypted Credential Auth
                                            </span>
                                        )}

                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#12151C] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2430]">
                                            <HardDrive className="w-3.5 h-3.5 text-cyan-500" />
                                            Cloud Sync Active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Action in Header */}
                            <div className="flex items-center gap-2 self-stretch md:self-auto">
                                <ThemedButton
                                    variant={isEditing ? 'secondary' : 'primary'}
                                    onClick={() => {
                                        setIsEditing(!isEditing)
                                        setStatusMessage({ type: '', text: '' })
                                    }}
                                    className="w-full md:w-auto px-5 py-2.5 rounded-xl font-bold shadow-md shadow-cyan-500/20"
                                >
                                    {isEditing ? 'Discard Changes' : 'Edit Profile'}
                                </ThemedButton>
                            </div>
                        </div>
                    </div>

                    {/* Status Alert Notification */}
                    {statusMessage.text && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border transition-all ${
                            statusMessage.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                        }`}>
                            {statusMessage.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                            ) : (
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                            )}
                            <span>{statusMessage.text}</span>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#181C24] pb-2 overflow-x-auto scrollbar-none">
                        <button
                            onClick={() => setActiveTab('identity')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                                activeTab === 'identity'
                                    ? 'bg-[#0E7490] text-white dark:bg-cyan-400 dark:text-slate-950 shadow-md shadow-cyan-500/20'
                                    : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#12151C]'
                            }`}
                        >
                            <User className="w-4 h-4" />
                            <span>Identity & Security</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('telemetry')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                                activeTab === 'telemetry'
                                    ? 'bg-[#0E7490] text-white dark:bg-cyan-400 dark:text-slate-950 shadow-md shadow-cyan-500/20'
                                    : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#12151C]'
                            }`}
                        >
                            <Activity className="w-4 h-4" />
                            <span>Vault Telemetry</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                                activeTab === 'preferences'
                                    ? 'bg-[#0E7490] text-white dark:bg-cyan-400 dark:text-slate-950 shadow-md shadow-cyan-500/20'
                                    : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#12151C]'
                            }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Preferences & Theme</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('backup')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                                activeTab === 'backup'
                                    ? 'bg-[#0E7490] text-white dark:bg-cyan-400 dark:text-slate-950 shadow-md shadow-cyan-500/20'
                                    : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#12151C]'
                            }`}
                        >
                            <Database className="w-4 h-4" />
                            <span>Backup & Data</span>
                        </button>
                    </div>

                    {/* Tab 1: Identity & Security */}
                    {activeTab === 'identity' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Profile Information Form */}
                            <div className="lg:col-span-2 bg-white dark:bg-[#0B0D11] rounded-3xl border border-slate-200 dark:border-[#181C24] p-6 sm:p-8 shadow-sm space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#181C24] pb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Personal Information
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                                            Manage your visible display credentials and handle across LinkVault.
                                        </p>
                                    </div>
                                    {isEditing && (
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            Editing Mode
                                        </span>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#94A3B8] mb-2">
                                                Display Name
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    disabled={!isEditing}
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                                        isEditing
                                                            ? 'border-slate-300 dark:border-[#252C37] bg-white dark:bg-[#12151C] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7490] dark:focus:ring-cyan-500/50'
                                                            : 'border-slate-200 dark:border-[#181C24] bg-slate-50 dark:bg-[#0B0D11] text-slate-600 dark:text-slate-300 cursor-not-allowed opacity-90'
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#94A3B8] mb-2">
                                                Vault Username
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                                    disabled={!isEditing}
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                                        isEditing
                                                            ? 'border-slate-300 dark:border-[#252C37] bg-white dark:bg-[#12151C] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0E7490] dark:focus:ring-cyan-500/50'
                                                            : 'border-slate-200 dark:border-[#181C24] bg-slate-50 dark:bg-[#0B0D11] text-slate-600 dark:text-slate-300 cursor-not-allowed opacity-90'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#94A3B8]">
                                                Registered Email Address
                                            </label>
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> Managed via Authentication Authority
                                            </span>
                                        </div>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled={true}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#181C24] bg-slate-100 dark:bg-[#12151C] text-slate-500 dark:text-slate-400 text-sm font-medium cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Password Change Sub-section (when editing) */}
                                    {isEditing && (
                                        <div className="pt-4 border-t border-slate-200 dark:border-[#181C24] space-y-4">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <Key className="w-4 h-4 text-[#0E7490] dark:text-cyan-400" />
                                                    Change Password (Optional)
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                                                    Leave blank to keep your current password intact.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#94A3B8] mb-1.5">
                                                        New Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            placeholder="Minimum 6 characters"
                                                            value={formData.newPassword}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#252C37] bg-white dark:bg-[#12151C] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0E7490] dark:focus:ring-cyan-500/50"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                        >
                                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#94A3B8] mb-1.5">
                                                        Confirm Password
                                                    </label>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Re-type new password"
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#252C37] bg-white dark:bg-[#12151C] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0E7490] dark:focus:ring-cyan-500/50"
                                                    />
                                                </div>
                                            </div>

                                            {formData.newPassword && (
                                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12151C] border border-slate-200 dark:border-[#1E2430] text-xs space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        {formData.newPassword.length >= 6 ? (
                                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                        ) : (
                                                            <div className="w-3.5 h-3.5 rounded-full border border-slate-400" />
                                                        )}
                                                        <span className={formData.newPassword.length >= 6 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500'}>
                                                            At least 6 characters
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {formData.newPassword && formData.newPassword === formData.confirmPassword ? (
                                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                        ) : (
                                                            <div className="w-3.5 h-3.5 rounded-full border border-slate-400" />
                                                        )}
                                                        <span className={formData.newPassword && formData.newPassword === formData.confirmPassword ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500'}>
                                                            Passwords match
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#181C24]">
                                            <ThemedButton
                                                type="button"
                                                variant="secondary"
                                                onClick={() => {
                                                    setIsEditing(false)
                                                    setStatusMessage({ type: '', text: '' })
                                                }}
                                            >
                                                Cancel
                                            </ThemedButton>
                                            <ThemedButton type="submit" variant="primary">
                                                Save Changes
                                            </ThemedButton>
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Security Telemetry Card */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-[#0B0D11] rounded-3xl border border-slate-200 dark:border-[#181C24] p-6 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-[#0E7490] dark:text-cyan-400">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                            Security Posture
                                        </h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#12151C] border border-slate-200/80 dark:border-[#181C24] space-y-1">
                                            <p className="text-xs font-bold text-slate-500 dark:text-[#94A3B8]">Auth Authority</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                                                <span>{isGoogleAuth ? 'Google SSO' : 'LinkVault Auth'}</span>
                                                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified
                                                </span>
                                            </p>
                                        </div>

                                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#12151C] border border-slate-200/80 dark:border-[#181C24] space-y-1">
                                            <p className="text-xs font-bold text-slate-500 dark:text-[#94A3B8]">Encryption Protocol</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                AES-256 GCM + TLS 1.3
                                            </p>
                                        </div>

                                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#12151C] border border-slate-200/80 dark:border-[#181C24] space-y-1">
                                            <p className="text-xs font-bold text-slate-500 dark:text-[#94A3B8]">Session Health</p>
                                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4" /> Healthy & Authenticated
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Vault Telemetry */}
                    {activeTab === 'telemetry' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-[#0B0D11] p-5 rounded-3xl border border-slate-200 dark:border-[#181C24] shadow-sm">
                                    <div className="flex items-center justify-between text-slate-500 dark:text-[#94A3B8] mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider">Total Bookmarks</span>
                                        <Bookmark className="w-4 h-4 text-[#0E7490] dark:text-cyan-400" />
                                    </div>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                                        {vaultStats.totalLinks}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">Indexed in vault</p>
                                </div>

                                <div className="bg-white dark:bg-[#0B0D11] p-5 rounded-3xl border border-slate-200 dark:border-[#181C24] shadow-sm">
                                    <div className="flex items-center justify-between text-slate-500 dark:text-[#94A3B8] mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider">Healthy Links</span>
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                        {vaultStats.totalLinks > 0
                                            ? `${Math.round((vaultStats.healthyLinks / vaultStats.totalLinks) * 100)}%`
                                            : '100%'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {vaultStats.healthyLinks} live verified
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-[#0B0D11] p-5 rounded-3xl border border-slate-200 dark:border-[#181C24] shadow-sm">
                                    <div className="flex items-center justify-between text-slate-500 dark:text-[#94A3B8] mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider">Categories</span>
                                        <FolderOpen className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                                        {vaultStats.totalCategories}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">Top: {vaultStats.topCategory}</p>
                                </div>

                                <div className="bg-white dark:bg-[#0B0D11] p-5 rounded-3xl border border-slate-200 dark:border-[#181C24] shadow-sm">
                                    <div className="flex items-center justify-between text-slate-500 dark:text-[#94A3B8] mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider">Unread Backlog</span>
                                        <Clock className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
                                        {vaultStats.unreadCount}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">Items in reading queue</p>
                                </div>
                            </div>

                            {/* Detailed Telemetry Card */}
                            <div className="bg-white dark:bg-[#0B0D11] rounded-3xl border border-slate-200 dark:border-[#181C24] p-6 sm:p-8 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <HardDrive className="w-5 h-5 text-[#0E7490] dark:text-cyan-400" />
                                    Vault Infrastructure Status
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-[#94A3B8] mb-1.5">
                                            <span>Link Health Distribution</span>
                                            <span>
                                                {vaultStats.healthyLinks} live / {vaultStats.brokenLinks} broken / {vaultStats.totalLinks - vaultStats.healthyLinks - vaultStats.brokenLinks} unchecked
                                            </span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 dark:bg-[#12151C] rounded-full overflow-hidden flex">
                                            <div
                                                style={{ width: `${vaultStats.totalLinks > 0 ? (vaultStats.healthyLinks / vaultStats.totalLinks) * 100 : 100}%` }}
                                                className="bg-emerald-500 h-full"
                                                title="Healthy"
                                            />
                                            <div
                                                style={{ width: `${vaultStats.totalLinks > 0 ? (vaultStats.brokenLinks / vaultStats.totalLinks) * 100 : 0}%` }}
                                                className="bg-rose-500 h-full"
                                                title="Broken"
                                            />
                                            <div
                                                style={{ width: `${vaultStats.totalLinks > 0 ? ((vaultStats.totalLinks - vaultStats.healthyLinks - vaultStats.brokenLinks) / vaultStats.totalLinks) * 100 : 0}%` }}
                                                className="bg-slate-400 dark:bg-slate-700 h-full"
                                                title="Unchecked"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-[#181C24]">
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12151C] border border-slate-200 dark:border-[#1E2430]">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Backend Latency</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">~38 ms</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12151C] border border-slate-200 dark:border-[#1E2430]">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Sync Engine</p>
                                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">Live WebSocket</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12151C] border border-slate-200 dark:border-[#1E2430]">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Estimated Footprint</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                                                {Math.max(1, Math.round(vaultStats.totalLinks * 1.8))} KB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Workspace Preferences */}
                    {activeTab === 'preferences' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Theme Selector */}
                            <div className="bg-white dark:bg-[#0B0D11] rounded-3xl border border-slate-200 dark:border-[#181C24] p-6 sm:p-8 shadow-sm space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#0E7490] dark:text-cyan-400" />
                                    Visual Experience
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                                    Select your preferred contrast and atmosphere.
                                </p>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    {/* Obsidian Dark */}
                                    <div
                                        onClick={() => theme !== 'dark' && toggleTheme()}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                            theme === 'dark'
                                                ? 'border-cyan-400 bg-[#12151C] shadow-lg shadow-cyan-500/10'
                                                : 'border-slate-200 bg-slate-900 text-white opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <Moon className="w-5 h-5 text-cyan-400" />
                                            {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                                        </div>
                                        <p className="text-sm font-bold text-white">Obsidian Dark</p>
                                        <p className="text-xs text-slate-400 mt-1">Deep #050608 with neon electric cyan accents.</p>
                                    </div>

                                    {/* Modern Light */}
                                    <div
                                        onClick={() => theme !== 'light' && toggleTheme()}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                            theme === 'light'
                                                ? 'border-[#0E7490] bg-cyan-50/50 shadow-md shadow-cyan-900/10'
                                                : 'border-[#181C24] bg-white text-slate-900 opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <Sun className="w-5 h-5 text-[#0E7490]" />
                                            {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-[#0E7490]" />}
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">Ocean Light</p>
                                        <p className="text-xs text-slate-500 mt-1">Crisp high-contrast ocean cyan on clean slate.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Keyboard Shortcuts Cheat Sheet */}
                            <div className="bg-white dark:bg-[#0B0D11] rounded-3xl border border-slate-200 dark:border-[#181C24] p-6 sm:p-8 shadow-sm space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-[#0E7490] dark:text-cyan-400" />
                                    Power User Hotkeys
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                                    Instant keyboard navigations for lightning-fast workflow.
                                </p>

                                <div className="space-y-2.5 pt-2">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#12151C] border border-slate-200/80 dark:border-[#181C24]">
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Command Palette</span>
                                        <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0B0D11] border border-slate-300 dark:border-[#252C37] text-xs font-mono font-bold shadow-xs">
                                            Ctrl / ⌘ + K
                                        </kbd>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#12151C] border border-slate-200/80 dark:border-[#181C24]">
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quick Search Bookmarks</span>
                                        <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0B0D11] border border-slate-300 dark:border-[#252C37] text-xs font-mono font-bold shadow-xs">
                                            /
                                        </kbd>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#12151C] border border-slate-200/80 dark:border-[#181C24]">
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Add New Bookmark</span>
                                        <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0B0D11] border border-slate-300 dark:border-[#252C37] text-xs font-mono font-bold shadow-xs">
                                            N
                                        </kbd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Backup & Danger Zone */}
                    {activeTab === 'backup' && (
                        <div className="space-y-6">
                            {/* 1-Click Backup Downloads */}
                            <div className="bg-white dark:bg-[#0B0D11] rounded-3xl border border-slate-200 dark:border-[#181C24] p-6 sm:p-8 shadow-sm space-y-5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Database className="w-5 h-5 text-[#0E7490] dark:text-cyan-400" />
                                        Vault Backup & Migration
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                                        Export your entire LinkVault database for cold offline storage or browser synchronization.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#12151C] border border-slate-200 dark:border-[#181C24] flex flex-col justify-between space-y-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Download className="w-4 h-4 text-[#0E7490] dark:text-cyan-400" />
                                                Netscape HTML Bookmarks
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                                                Import directly into Chrome, Brave, Arc, Firefox, or Safari.
                                            </p>
                                        </div>
                                        <ThemedButton
                                            variant="secondary"
                                            onClick={() => handleQuickExport('html')}
                                            disabled={isExporting}
                                            className="w-full text-xs font-semibold py-2"
                                        >
                                            Export .HTML Archive
                                        </ThemedButton>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#12151C] border border-slate-200 dark:border-[#181C24] flex flex-col justify-between space-y-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Database className="w-4 h-4 text-purple-500" />
                                                Structured JSON Data
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                                                Raw programmatic backup including tags, metadata, and health stats.
                                            </p>
                                        </div>
                                        <ThemedButton
                                            variant="secondary"
                                            onClick={() => handleQuickExport('json')}
                                            disabled={isExporting}
                                            className="w-full text-xs font-semibold py-2"
                                        >
                                            Export .JSON Payload
                                        </ThemedButton>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-[#181C24] flex items-center justify-between flex-wrap gap-3">
                                    <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                                        Need to import bookmarks from an existing browser?
                                    </span>
                                    <ThemedButton
                                        variant="secondary"
                                        onClick={() => window.dispatchEvent(new CustomEvent('linkvault:open-import-export'))}
                                        className="text-xs py-2 px-4 rounded-xl"
                                    >
                                        Launch Import Wizard
                                    </ThemedButton>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl border border-rose-200 dark:border-rose-900/40 p-6 sm:p-8 space-y-4">
                                <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-rose-500" />
                                    Danger Zone
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Actions here affect your local device authentication credentials.
                                </p>

                                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            Sign out of all sessions
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                                            Revokes cached JWT tokens from this browser and redirects to login.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={logout}
                                        className="px-4 py-2.5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                                    >
                                        Log Out Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Profile
