/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, User, MessageSquare, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { ThemedButton } from '../components/ui/ThemedButton'

const ContactInfo = [
    {
        icon: () => <Mail className="w-6 h-6" />,
        title: 'Email',
        value: 'codemaddy18@gmail.com',
        link: 'mailto:codemaddy18@gmail.com'
    },
    {
        icon: () => <Phone className="w-6 h-6" />,
        title: 'Phone',
        value: '+91 63012 44145',
        link: 'tel:+916301244145'
    },
    {
        icon: () => <MapPin className="w-6 h-6" />,
        title: 'Address',
        value: 'Tadipatri, Andhra Pradesh, India',
        link: '#'
    }
]

const SocialLinks = [
    {
        icon: () => <Instagram className="w-6 h-6" />,
        name: 'Instagram',
        handle: '@LinkVault',
        link: '#',
        color: 'hover:text-pink-500'
    },
    {
        icon: () => <Twitter className="w-6 h-6" />,
        name: 'Twitter',
        handle: '@LinkVaultApp',
        link: '#',
        color: 'hover:text-blue-400'
    },
    {
        icon: () => <Facebook className="w-6 h-6" />,
        name: 'Facebook',
        handle: '/LinkVault',
        link: '#',
        color: 'hover:text-blue-600'
    }
]

const Contact = () => {
    const { theme } = useTheme()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(formData)
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className={`min-h-screen py-12 ${theme === 'light' ? 'bg-white' : 'bg-[#0f172a]'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        Get in Touch with LinkVault
                    </h1>
                    <p className={`text-xl max-w-3xl mx-auto ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                        We'd love to hear from you! Whether you have a question, feedback, or just want to say hello,
                        feel free to reach out. Our team is always here to help.
                    </p>
                </motion.div>

                {/* Contact Info Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
                >
                    {ContactInfo.map((info) => (
                        <a
                            key={info.title}
                            href={info.link}
                            className={`p-6 rounded-xl transition-all duration-300 ${theme === 'light'
                                ? 'bg-white shadow-lg hover:shadow-xl hover:bg-blue-50'
                                : 'bg-slate-800 hover:bg-slate-700'
                                }`}
                        >
                            <div className={`mb-4 ${theme === 'light' ? 'text-blue-600' : 'text-yellow-400'}`}>
                                <info.icon />
                            </div>
                            <h3 className={`text-xl font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                {info.title}
                            </h3>
                            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}>
                                {info.value}
                            </p>
                        </a>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Contact Form */}
                    <motion.form
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        onSubmit={handleSubmit}
                        className={`p-8 rounded-xl ${theme === 'light'
                            ? 'bg-white shadow-lg'
                            : 'bg-slate-800'}`}
                    >
                        <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            Send Us a Message
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label
                                    htmlFor="name"
                                    className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                        }`}
                                >
                                    Name
                                </label>
                                <div className="relative">
                                    <User className={`absolute left-3 top-3 w-5 h-5 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                                        }`} />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`pl-10 w-full p-3 rounded-lg border ${theme === 'light'
                                            ? 'border-gray-300 focus:border-blue-500 bg-white'
                                            : 'border-gray-600 focus:border-yellow-400 bg-slate-700'
                                            } outline-none transition-colors duration-200`}
                                        placeholder="Your name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                        }`}
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className={`absolute left-3 top-3 w-5 h-5 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                                        }`} />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`pl-10 w-full p-3 rounded-lg border ${theme === 'light'
                                            ? 'border-gray-300 focus:border-blue-500 bg-white'
                                            : 'border-gray-600 focus:border-yellow-400 bg-slate-700'
                                            } outline-none transition-colors duration-200`}
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="subject"
                                    className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                        }`}
                                >
                                    Subject
                                </label>
                                <div className="relative">
                                    <MessageSquare className={`absolute left-3 top-3 w-5 h-5 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                                        }`} />
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className={`pl-10 w-full p-3 rounded-lg border ${theme === 'light'
                                            ? 'border-gray-300 focus:border-blue-500 bg-white'
                                            : 'border-gray-600 focus:border-yellow-400 bg-slate-700'
                                            } outline-none transition-colors duration-200`}
                                        placeholder="Subject"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="message"
                                    className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                        }`}
                                >
                                    Message
                                </label>
                                <div className="relative">
                                    <MessageSquare className={`absolute left-3 top-3 w-5 h-5 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                                        }`} />
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        className={`pl-10 w-full p-3 rounded-lg border ${theme === 'light'
                                            ? 'border-gray-300 focus:border-blue-500 bg-white'
                                            : 'border-gray-600 focus:border-yellow-400 bg-slate-700'
                                            } outline-none transition-colors duration-200`}
                                        placeholder="Your message..."
                                    />
                                </div>
                            </div>

                            <ThemedButton
                                type="submit"
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send Message
                            </ThemedButton>
                        </div>
                    </motion.form>

                    {/* Social Links Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`p-8 rounded-xl ${theme === 'light'
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50'
                            : 'bg-gradient-to-br from-slate-800 to-slate-700'}`}
                    >
                        <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            Stay Connected
                        </h2>
                        <p className={`mb-8 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                            Follow us on social media and stay updated on new features, tips, and news.
                        </p>
                        <div className="space-y-6">
                            {SocialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.link}
                                    className={`flex items-center gap-4 transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                                        } ${social.color}`}
                                >
                                    <social.icon />
                                    <div>
                                        <p className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                            {social.name}
                                        </p>
                                        <p className="text-sm">{social.handle}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Contact 