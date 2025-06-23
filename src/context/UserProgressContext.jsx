import { createContext, useState, useEffect, useContext } from 'react'
import { useAuth } from './AuthContext'
import { generateDefaultAvatars, generateDefaultFriends } from '../utils/avatarUtils'
import { getFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests, updateUserPoints, updateUser } from '../api/userApi'

// Motivasyonel ünvan listesi
const motivationalTitles = [
  { id: 'beginner', name: 'Sağlık Yolcusu', requiredPoints: 0 },
  { id: 'consistent', name: 'Düzenli Takipçi', requiredPoints: 150 },
  { id: 'dedicated', name: 'Kararlı Sporcu', requiredPoints: 400 },
  { id: 'pro', name: 'Sağlık Profesyoneli', requiredPoints: 800 },
  { id: 'master', name: 'Sağlık Ustası', requiredPoints: 1500 },
  { id: 'legend', name: 'Sağlık Efsanesi', requiredPoints: 3000 },
]

// Seri seviyeleri
const streakLevels = [
  { level: 'Başlangıç', requiredDays: 0, color: 'text-gray-500' },
  { level: 'Çaylak', requiredDays: 3, color: 'text-blue-500' },
  { level: 'İstikrarlı', requiredDays: 7, color: 'text-green-500' },
  { level: 'Kararlı', requiredDays: 14, color: 'text-yellow-500' },
  { level: 'Tutkulu', requiredDays: 30, color: 'text-orange-500' },
  { level: 'Şampiyon', requiredDays: 60, color: 'text-red-500' },
  { level: 'Efsane', requiredDays: 100, color: 'text-purple-500' },
]

const UserProgressContext = createContext(null)

export const useUserProgress = () => {
  const context = useContext(UserProgressContext)
  if (!context) {
    throw new Error('useUserProgress must be used within a UserProgressProvider')
  }
  return context
}

export const UserProgressProvider = ({ children }) => {
  const { user, isAuthenticated, refreshUser } = useAuth()
  
  // Default avatars from our utility
  const defaultAvatars = generateDefaultAvatars()
  
  // Default friends from our utility
  const defaultFriends = generateDefaultFriends()

  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatars[0])
  const [availableAvatars, setAvailableAvatars] = useState([defaultAvatars[0]])
  const [motivationalTitle, setMotivationalTitle] = useState(motivationalTitles[0])
  const [customNickname, setCustomNickname] = useState('')
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [weeklyChampion, setWeeklyChampion] = useState(null) // Haftanın şampiyonu
  const [level, setLevel] = useState('bronze')
  const [completedExercises, setCompletedExercises] = useState(0)
  const [healthLogs, setHealthLogs] = useState(0)
  
  // Kullanıcı giriş yaptığında ilerleme bilgilerini yükle
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProgress()
      // Haftanın şampiyonunu belirle
      determineWeeklyChampion()
      updateMotivationalTitle(user.points)
      updateAvailableAvatars(user.points)
    } else {
      // Kullanıcı çıkış yaptığında verileri sıfırla
      resetProgress()
    }
  }, [isAuthenticated, user])
  
  // Arkadaşları ve istekleri yükle
  useEffect(() => {
    if (isAuthenticated) {
      fetchFriends()
      fetchFriendRequests()
    } else {
      setFriends([])
      setFriendRequests([])
    }
  }, [isAuthenticated])

  const fetchFriends = async () => {
    try {
      const data = await getFriends()
      setFriends(data)
    } catch (err) {
      setFriends([])
    }
  }

  const fetchFriendRequests = async () => {
    try {
      const data = await getFriendRequests()
      setFriendRequests(data)
    } catch (err) {
      setFriendRequests([])
    }
  }

  // Arkadaşlık isteği gönder
  const handleSendFriendRequest = async (email) => {
    return await sendFriendRequest(email)
  }

  // Arkadaşlık isteğini kabul et
  const handleAcceptFriendRequest = async (requestId) => {
    await acceptFriendRequest(requestId)
    fetchFriends()
    fetchFriendRequests()
  }

  // Arkadaşlık isteğini reddet
  const handleRejectFriendRequest = async (requestId) => {
    await rejectFriendRequest(requestId)
    fetchFriendRequests()
  }
  
  // İlerleme bilgilerini kaydet
  const saveUserProgress = () => {
    if (!user || !user.id) {
      console.log('No user found or user has no ID, skipping progress saving');
      return;
    }
    
    try {
      // Sadece frontend'e özel verileri kaydet (puan, seri DEĞİL)
      const progressData = {
        selectedAvatarId: selectedAvatar?.id || 'default',
        customNickname,
      }
      
      localStorage.setItem(`userProgress_${user.id}`, JSON.stringify(progressData))
    } catch (error) {
      console.error('Failed to save user progress:', error)
    }
  }

  // Kullanıcı verilerini yükle
  const loadUserProgress = () => {
    try {
      // Check if user exists before trying to access its properties
      if (!user || !user.id) {
        console.log('No user found or user has no ID, skipping progress loading');
        return;
      }
      
      const savedData = localStorage.getItem(`userProgress_${user.id}`)
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        
        // Avatar yükle
        if (parsedData.selectedAvatarId) {
          const savedAvatar = defaultAvatars.find(a => a.id === parsedData.selectedAvatarId)
          if (savedAvatar) {
            setSelectedAvatar(savedAvatar)
          }
        }
        
        // Nickname yükle
        if (parsedData.customNickname) {
          setCustomNickname(parsedData.customNickname)
        }
        
        // Puan ve seri ile ilgili yerel yüklemeler kaldırıldı.
        // Bu veriler artık doğrudan AuthContext'teki user objesinden geliyor.
      }
    } catch (error) {
      console.error('Failed to load user progress:', error)
    } finally {
      if (user) {
        updateMotivationalTitle(user.points);
        updateAvailableAvatars(user.points);
      }
    }
  }
  
  // Kullanıcı çıkış yaptığında ilerlemeyi sıfırla
  const resetProgress = () => {
    setSelectedAvatar(defaultAvatars[0])
    setAvailableAvatars([defaultAvatars[0]])
    setMotivationalTitle(motivationalTitles[0])
    setCustomNickname('')
    // totalPoints, currentStreak gibi stateler user objesiyle birlikte sıfırlanır.
    setFriends([])
    setFriendRequests([])
  }

  // Puan ekle - SADECE BACKEND'E İSTEK ATAR VE VERİYİ YENİLER
  const addPoints = async (amount = 10) => {
    if (!user || !user.id || !isAuthenticated) {
      console.error('Cannot add points: user not authenticated or has no ID')
      return
    }
    
    try {
      await updateUserPoints(user.id, amount)
      // Puan ekledikten sonra en güncel kullanıcı verisini çek
      if (refreshUser) await refreshUser();
    } catch (error) {
      console.error('Puan eklenirken hata:', error)
    }
  }

  // Kullanılabilir avatarları güncelle
  const updateAvailableAvatars = (currentPoints) => {
    const newAvailableAvatars = defaultAvatars.filter(avatar => currentPoints >= avatar.requiredPoints)
    setAvailableAvatars(newAvailableAvatars)
  }
  
  // Motivasyonel ünvanı güncelle
  const updateMotivationalTitle = (currentPoints) => {
    const currentTitle = motivationalTitles
      .slice()
      .reverse()
      .find(t => currentPoints >= t.requiredPoints)
      
    if (currentTitle) {
      setMotivationalTitle(currentTitle)
    }
  }
  
  // Avatarı değiştir
  const changeAvatar = (avatarId) => {
    const avatar = defaultAvatars.find(a => a.id === avatarId)
    
    if (avatar && availableAvatars.some(a => a.id === avatarId)) {
      setSelectedAvatar(avatar)
      saveUserProgress()
      return true
    }
    
    return false
  }
  
  // Kullanıcı nickname değiştir
  const changeNickname = (nickname) => {
    setCustomNickname(nickname)
    saveUserProgress()
  }
  
  const getCurrentStreakLevel = () => {
    // Seri seviyesi artık doğrudan user objesinden gelen currentStreak'e göre hesaplanır
    if (!user || typeof user.currentStreak !== 'number') {
      return streakLevels[0];
    }
    
    const currentLevel = streakLevels
      .slice()
      .reverse()
      .find(s => user.currentStreak >= s.requiredDays)
      
    return currentLevel || streakLevels[0]
  }
  
  const getNextStreakLevel = () => {
    // Mevcut seviyeyi bul
    const currentLevel = getCurrentStreakLevel()
    const currentLevelIndex = streakLevels.findIndex(s => s.level === currentLevel.level)
    
    // Sonraki seviyeyi bul
    const nextLevel = streakLevels[currentLevelIndex + 1]
    
    return nextLevel ? `Sonraki: ${nextLevel.level} (${nextLevel.requiredDays} gün)` : 'En üst seviyedesin!'
  }
  
  // Haftanın şampiyonunu belirle
  const determineWeeklyChampion = () => {
    if (!user) return [];
    // Tüm kullanıcılar (kendisi ve arkadaşları)
    const allUsers = [
      {
        id: user?.id || 'currentUser',
        name: customNickname || user?.name || 'Kullanıcı',
        points: user?.points || 0,
        weeklyPoints: user?.weeklyPoints || 0,
        avatar: user?.avatarUrl || selectedAvatar?.src || 'https://placehold.co/100x100?text=Default',
        streak: user?.currentStreak || 0,
        isCurrentUser: true
      },
      ...friends
    ];
    // Haftalık puanlara göre sırala
    const sortedUsers = [...allUsers].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    // En yüksek puana sahip kullanıcı şampiyon
    const champion = sortedUsers.length > 0 && sortedUsers[0].weeklyPoints > 0 ? sortedUsers[0] : null;
    if (weeklyChampion?.id !== champion?.id) {
      setWeeklyChampion(champion);
    }
    return sortedUsers;
  }
  
  // Arkadaşların sıralamasını getir
  const getFriendsRanking = () => {
    // Kendi kullanıcı bilgilerini context'teki local state'ten değil, güncel user objesinden al
    const currentUser = user
      ? {
          id: user.id || user._id || 'currentUser',
          name: customNickname || user.name || 'Kullanıcı',
          points: user.points || 0,
          weeklyPoints: user.weeklyPoints || 0,
          avatar: user.avatarUrl || selectedAvatar?.src || 'https://placehold.co/100x100?text=Default',
          streak: user.currentStreak || 0,
          isCurrentUser: true,
        }
      : null;
    // Arkadaşlar sadece backend'den gelen friends array'inden alınır
    const backendFriends = friends.map(friend => ({
      id: friend._id || friend.id,
      name: friend.name || friend.email || 'Arkadaş',
      points: friend.points || 0,
      weeklyPoints: friend.weeklyPoints || 0,
      avatar: friend.avatarUrl || friend.avatar || 'https://placehold.co/100x100?text=Default',
      streak: friend.currentStreak || friend.streak || 0,
      isCurrentUser: false,
      email: friend.email
    }));
    const allUsers = currentUser ? [currentUser, ...backendFriends] : [...backendFriends];
    // Toplam puanlara göre sırala
    return [...allUsers].sort((a, b) => b.points - a.points);
  }
  
  const incrementCompletedExercises = () => {
    setCompletedExercises(prev => prev + 1)
  }
  
  const incrementHealthLogs = () => {
    setHealthLogs(prev => prev + 1)
  }
  
  const toggleTheme = () => {
    // Implementation of toggleTheme function
    saveUserProgress()
  }

  // Bu fonksiyon artık kullanılmıyor, backend'e taşındı.
  const updateStreakOnHealthLog = async () => {
    console.log("updateStreakOnHealthLog is deprecated and should not be called. Streak is managed by the backend.");
  };

  const value = {
    // Puan ve Seri bilgileri doğrudan user objesinden okunacak
    totalPoints: user?.points || 0,
    currentStreak: user?.currentStreak || 0,
    
    selectedAvatar,
    availableAvatars,
    motivationalTitle,
    customNickname,
    friends,
    friendRequests,
    weeklyChampion,
    streakLevels,
    defaultAvatars,
    motivationalTitles,
    addPoints,
    changeAvatar,
    changeNickname,
    getCurrentStreakLevel,
    getNextStreakLevel,
    getFriendsRanking,
    level,
    completedExercises,
    healthLogs,
    incrementCompletedExercises,
    incrementHealthLogs,
    toggleTheme,
    sendFriendRequest: handleSendFriendRequest,
    acceptFriendRequest: handleAcceptFriendRequest,
    rejectFriendRequest: handleRejectFriendRequest,
    fetchFriends,
    fetchFriendRequests,
    points: user?.points || 0,
    currentStreak: user?.currentStreak || 0
  }
  
  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  )
} 