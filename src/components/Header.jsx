import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FiMenu, FiSun, FiMoon, FiUser, FiLogOut } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"
              onClick={toggleSidebar}
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">
              Sağlık Takip Uygulaması
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"
            >
              {darkMode ? (
                <FiSun className="h-5 w-5" />
              ) : (
                <FiMoon className="h-5 w-5" />
              )}
            </button>
            
            {/* User Menu */}
            <div className="relative">
              <div className="flex items-center">
                <Link to="/profile" className="flex items-center hover:text-primary">
                  <span className="hidden md:block mr-2 text-sm font-medium">
                    {user?.name || 'Kullanıcı'}
                  </span>
                  <FiUser className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 focus:outline-none"
              title="Çıkış Yap"
            >
              <FiLogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 