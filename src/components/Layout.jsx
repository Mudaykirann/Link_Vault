/* eslint-disable no-unused-vars */
import { Outlet } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = () => {
    const { theme } = useTheme()

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Layout 