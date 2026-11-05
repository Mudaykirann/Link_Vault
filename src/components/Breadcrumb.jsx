import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'

const Breadcrumb = () => {
    const location = useLocation()
    const pathnames = location.pathname.split('/').filter(x => x)

    return (
        <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 px-4 sm:px-6 lg:px-8"
        >
            <ol className="flex items-center space-x-2 text-sm">
                <li>
                    <Link
                        to="/"
                        className="text-light-primary dark:text-dark-accent hover:opacity-80 transition-opacity"
                    >
                        <Home className="w-4 h-4" />
                    </Link>
                </li>
                {pathnames.map((name, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
                    const isLast = index === pathnames.length - 1

                    return (
                        <li key={name} className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <Link
                                to={routeTo}
                                className={`ml-2 capitalize ${isLast
                                        ? 'text-light-text dark:text-dark-text font-medium'
                                        : 'text-light-primary dark:text-dark-accent hover:opacity-80 transition-opacity'
                                    }`}
                            >
                                {name}
                            </Link>
                        </li>
                    )
                })}
            </ol>
        </motion.nav>
    )
}

export default Breadcrumb 