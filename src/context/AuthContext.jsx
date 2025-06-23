import { createContext, useState, useEffect, useContext } from 'react'
import { loginUser, registerUser, getUserByToken, updateUser as updateUserApi } from '../api/userApi'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if token exists and load user data
    const loadUser = async () => {
      setLoading(true);
      
      if (token) {
        try {
          // Token ile kullanıcı bilgilerini API'den al
          const userData = await getUserByToken(token);
          
          if (userData && userData.user) {
            console.log('Kullanıcı bilgileri yüklendi:', userData.user);
            
            // Kullanıcı bilgilerini state'e kaydet
            setUser({
              id: userData.user._id, // MongoDB'den gelen ID
              name: userData.user.name || '',
              email: userData.user.email || '',
              // Diğer kullanıcı bilgilerini ekle
              age: userData.user.age || '',
              height: userData.user.height || '',
              weight: userData.user.weight || '',
              gender: userData.user.gender || '',
              activityLevel: userData.user.activityLevel || 'moderate',
              currentStreak: userData.user.currentStreak || 0,
              lastActiveDate: userData.user.lastActiveDate || null,
              points: userData.user.points || 0
            });
          } else {
            console.error('Kullanıcı bilgileri formatı geçersiz');
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (err) {
          console.error('Kullanıcı bilgileri getirme hatası:', err);
          // Clear token if invalid
          localStorage.removeItem('token');
          setToken(null);
        }
      } else {
        // Token yoksa kullanıcı bilgilerini temizle
        setUser(null);
      }
      
      setLoading(false);
    };

    loadUser();
  }, [token])

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true)
      
      // API üzerinden giriş yap
      const response = await loginUser({ email, password })
      
      if (response && response.token) {
        console.log('Giriş başarılı:', response)
        
        // Token'i localStorage'a kaydet
        localStorage.setItem('token', response.token)
        setToken(response.token)
        
        // Kullanıcı bilgilerini state'e kaydet
        setUser({
          id: response.user._id, // MongoDB'den gelen ID
          name: response.user.name || '',
          email: response.user.email || '',
          // Diğer kullanıcı bilgilerini ekle
          age: response.user.age || '',
          height: response.user.height || '',
          weight: response.user.weight || '',
          gender: response.user.gender || '',
          activityLevel: response.user.activityLevel || 'moderate',
          currentStreak: response.user.currentStreak || 0,
          lastActiveDate: response.user.lastActiveDate || null,
          points: response.user.points || 0
        })
        
        setLoading(false)
        return true
      } else {
        console.error('Giriş yanıtı geçersiz format:', response)
        setLoading(false)
        return false
      }
    } catch (err) {
      console.error('Giriş hatası:', err)
      setLoading(false)
      return false
    }
  }

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true)
      
      // API üzerinden kayıt ol
      const response = await registerUser(userData)
      
      if (response && response.token) {
        console.log('Kayıt başarılı:', response)
        
        // Token'i localStorage'a kaydet
        localStorage.setItem('token', response.token)
        setToken(response.token)
        
        // Kullanıcı bilgilerini state'e kaydet
        setUser({
          id: response.user._id, // MongoDB'den gelen ID
          name: response.user.name || '',
          email: response.user.email || '',
          // Diğer kullanıcı bilgilerini ekle
          age: response.user.age || '',
          height: response.user.height || '',
          weight: response.user.weight || '',
          gender: response.user.gender || '',
          activityLevel: response.user.activityLevel || 'moderate',
          currentStreak: response.user.currentStreak || 0,
          lastActiveDate: response.user.lastActiveDate || null,
          points: response.user.points || 0
        })
        
        setLoading(false)
        return true
      } else {
        console.error('Kayıt yanıtı geçersiz format:', response)
        setLoading(false)
        return false
      }
    } catch (err) {
      console.error('Kayıt hatası:', err.message || err)
      setLoading(false)
      return false
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  // Kullanıcı profilini güncelleme
  const updateUser = async (userData) => {
    const result = await updateUserApi(userData)
    if (result.success && result.data) {
      setUser(prev => ({ ...prev, ...result.data }))
      return true
    } else {
      throw new Error(result.message || 'Profil güncellenemedi')
    }
  }

  // Kullanıcı verisini güncelle (ör. puan güncellendiğinde)
  const refreshUser = async () => {
    try {
      const userData = await getUserByToken();
      if (userData && userData.user) {
        setUser({
          id: userData.user._id,
          name: userData.user.name || '',
          email: userData.user.email || '',
          age: userData.user.age || '',
          height: userData.user.height || '',
          weight: userData.user.weight || '',
          gender: userData.user.gender || '',
          activityLevel: userData.user.activityLevel || 'moderate',
          currentStreak: userData.user.currentStreak || 0,
          lastActiveDate: userData.user.lastActiveDate || null,
          points: userData.user.points || 0
        });
      } else {
        logout();
      }
    } catch (err) {
      logout();
    }
  }

  // Context value
  const value = { 
    user, 
    token, 
    loading, 
    isAuthenticated: !!user,
    login, 
    register, 
    logout, 
    updateUserProfile: updateUser,
    refreshUser
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 