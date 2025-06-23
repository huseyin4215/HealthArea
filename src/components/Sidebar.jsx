import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { FiX, FiHome, FiUser, FiActivity, FiPieChart, FiCalendar, FiAward, FiSliders, FiUsers } from 'react-icons/fi'
import { gsap } from 'gsap'
import { useAuth } from '../context/AuthContext'
import { useUserProgress } from '../context/UserProgressContext'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const sidebarRef = useRef(null)
  const userAvatarRef = useRef(null)
  const userInfoRef = useRef(null)
  const streakBadgeRef = useRef(null)
  const { user, refreshUser } = useAuth()
  const { 
    selectedAvatar, 
    customNickname, 
    motivationalTitle, 
    currentStreak,
    getCurrentStreakLevel,
    totalPoints,
    weeklyPoints
  } = useUserProgress()
  
  // Mevcut seri seviyesi
  const streakLevel = getCurrentStreakLevel()
  
  // Animation for sidebar
  useEffect(() => {
    const sidebar = sidebarRef.current
    
    if (isOpen && sidebar) {
      sidebar.style.display = 'flex'
      gsap.to(sidebar, { 
        x: 0, 
        duration: 0.3, 
        ease: 'power2.out'
      })
    } else if (sidebar) {
      gsap.to(sidebar, { 
        x: '-100%', 
        duration: 0.3, 
        ease: 'power2.in',
        onComplete: () => {
          if (window.innerWidth < 768) {
            sidebar.style.display = 'none'
          }
        }
      })
    }
  }, [isOpen])
  
  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(e.target) && 
        window.innerWidth < 768
      ) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsOpen])
  
  // User profile animation with refs instead of class selectors
  useEffect(() => {
    // Only animate elements if they exist
    const avatarElement = document.querySelector('.user-avatar')
    if (avatarElement) {
      gsap.fromTo(avatarElement, 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
      )
    }
    
    const userInfoElement = document.querySelector('.user-info')
    if (userInfoElement) {
      gsap.fromTo(userInfoElement, 
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.2, ease: 'power2.out' }
      )
    }
    
    const streakBadgeElement = document.querySelector('.streak-badge')
    if (streakBadgeElement) {
      gsap.fromTo(streakBadgeElement, 
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, delay: 0.4, ease: 'power2.out' }
      )
    }
  }, [])
  
  // Sidebar açıldığında kullanıcı verisini güncelle
  useEffect(() => {
    if (isOpen && typeof refreshUser === 'function') {
      refreshUser();
    }
  }, [isOpen]);
  
  const navItems = [
    { to: '/dashboard', icon: <FiHome />, label: 'Ana Sayfa' },
    { to: '/profile', icon: <FiUser />, label: 'Profil' },
    { to: '/exercises', icon: <FiActivity />, label: 'Egzersiz Kayıtları' },
    { to: '/exercise-recommendations', icon: <FiActivity />, label: 'Egzersiz Önerileri' },
    { to: '/medications', icon: <FiCalendar />, label: 'İlaç Takibi' },
    { to: '/health-log', icon: <FiPieChart />, label: 'Sağlık Kayıtları' },
    { to: '/health-calculator', icon: <FiSliders />, label: 'Hesaplayıcı' },
    { to: '/friends', icon: <FiUsers />, label: 'Arkadaşlar' },
    // Users link removed
  ]
  
  return (
    <aside
      ref={sidebarRef}
      className={`w-72 h-full bg-white dark:bg-gray-800 shadow-lg flex-col ${
        isOpen ? 'flex' : 'hidden md:flex'
      } fixed md:relative z-20`}
      style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
    >
      <div className="p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-primary dark:text-white">
          Sağlık Yolcusu
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors"
          aria-label="Menüyü kapat"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>
      
      {/* Kullanıcı Profili */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="user-avatar relative" ref={userAvatarRef}>
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 bg-gray-100 dark:bg-gray-700">
              <img 
                src={selectedAvatar?.src || "https://via.placeholder.com/150"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Seri rozeti */}
            {currentStreak > 0 && (
              <div className="streak-badge absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md" ref={streakBadgeRef}>
                {currentStreak}
              </div>
            )}
          </div>
          
          {/* Kullanıcı bilgileri */}
          <div className="user-info flex-1 overflow-hidden" ref={userInfoRef}>
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {customNickname || user?.name || 'Kullanıcı'}
            </div>
            <div className="flex items-center mt-0.5">
              <div className={`text-xs ${streakLevel.color} font-medium flex items-center`}>
                <FiAward className="mr-1 h-3 w-3" />
                {streakLevel.level}
              </div>
              <div className="mx-1 text-gray-400">•</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {motivationalTitle?.name || 'Sağlık Yolcusu'}
              </div>
            </div>
            
            {/* Puanlar */}
            <div className="flex items-center mt-2 space-x-2">
              <div className="bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5 flex items-center">
                <FiAward className="mr-1" size={10} />
                {(user && typeof user.points === 'number') ? user.points : 0} Puan
              </div>
              <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded-full px-2 py-0.5 flex items-center">
                <FiActivity className="mr-1" size={10} />
                Seri: {(user && typeof user.currentStreak === 'number') ? user.currentStreak : 0}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 font-medium'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Sağlık Takip Uygulaması v1.0
        </div>
      </div>
    </aside>
  )
}

export default Sidebar 