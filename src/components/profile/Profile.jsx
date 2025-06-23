import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useUserProgress } from '../../context/UserProgressContext'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { FiUser, FiSave, FiAlertCircle, FiAward, FiChevronRight } from 'react-icons/fi'

const Profile = () => {
  const { user, updateUserProfile } = useAuth()
  const { selectedAvatar, motivationalTitle, points, currentStreak } = useUserProgress()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: 'moderate'
  })
  
  // Calculate BMI
  const bmi = formData.height && formData.weight 
    ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1) 
    : null
  
  // BMI categories
  const getBmiCategory = () => {
    if (!bmi) return null
    
    if (bmi < 18.5) return { label: 'Zayıf', color: 'text-blue-500' }
    if (bmi < 25) return { label: 'Normal', color: 'text-green-500' }
    if (bmi < 30) return { label: 'Fazla Kilolu', color: 'text-yellow-500' }
    return { label: 'Obez', color: 'text-red-500' }
  }
  
  const bmiCategory = getBmiCategory()
  
  // Load existing profile data
  useEffect(() => {
    if (user) {
      setLoading(true)
      
      // Kullanıcı verilerini form state'ine yükle
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        gender: user.gender || 'male',
        height: user.height || '',
        weight: user.weight || '',
        activityLevel: user.activityLevel || 'moderate'
      })
      
      setLoading(false)
    }
  }, [user])
  
  // Animation effect
  useEffect(() => {
    gsap.from('.profile-form', { 
      opacity: 0, 
      y: 20, 
      duration: 0.5,
      delay: 1, // After form is loaded 
      ease: 'power2.out' 
    })
    
    gsap.from('.avatar-badge-card', { 
      opacity: 0, 
      y: 20, 
      duration: 0.5,
      delay: 0.3,
      ease: 'power2.out' 
    })
  }, [])
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear messages when user makes changes
    if (success) setSuccess(false)
    if (error) setError('')
  }
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError('')
    
    try {
      // Validate data
      if (!formData.age || !formData.height || !formData.weight) {
        throw new Error('Lütfen tüm gerekli alanları doldurun')
      }
      
      // Kullanıcı bilgilerini güncelle
      if (user && user.id) {
        const userData = {
          id: user.id,
          name: formData.name,
          email: formData.email,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          activityLevel: formData.activityLevel
        }
        
        console.log('Profil güncelleme verileri:', userData)
        
        // AuthContext üzerinden kullanıcı bilgilerini güncelle
        const result = await updateUserProfile(userData)
        
        if (result.success) {
          // Show success message
          setSuccess(true)
          
          // Animate success message
          gsap.from('.success-message', { 
            opacity: 0, 
            y: -20, 
            duration: 0.5, 
            ease: 'back.out' 
          })
        } else {
          throw new Error(result.message || 'Profil güncellenemedi')
        }
      } else {
        throw new Error('Kullanıcı bilgisi bulunamadı')
      }
    } catch (err) {
      setError(err.message || 'Profil güncellenemedi')
      console.error('Profil güncelleme hatası:', err)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading && Object.values(formData).every(value => value === '')) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profil ve Vücut Ölçüleri
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kişisel bilgilerinizi ve vücut ölçülerinizi güncelleyin
        </p>
      </div>
      
      {success && (
        <div className="success-message mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md flex items-center">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Profiliniz başarıyla güncellendi!
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-center">
          <FiAlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Avatar ve Rozet Kartı */}
      <div className="mb-6 card avatar-badge-card">
        <Link to="/avatar" className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg p-2 transition-colors">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border-2 border-primary/30">
                <img
                  src={selectedAvatar.src}
                  alt={selectedAvatar.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {currentStreak > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                  {currentStreak}
                </div>
              )}
            </div>
            
            {/* Bilgiler */}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900 dark:text-white">{selectedAvatar.name} Avatar</h3>
                <span className="bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5 flex items-center">
                  <FiAward className="mr-1" size={12} />
                  {points} Puan
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {motivationalTitle.name} • Avatar ve badge ayarları
              </p>
            </div>
          </div>
          
          <FiChevronRight className="text-gray-400" />
        </Link>
      </div>
      
      <div className="card profile-form">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kişisel Bilgiler */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Kişisel Bilgiler
              </h2>
              
              <div>
                <label htmlFor="name" className="label">Ad Soyad</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Ad Soyad"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="label">E-posta</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  className="input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  readOnly
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  E-posta adresi değiştirilemez
                </p>
              </div>
              
              <div>
                <label htmlFor="age" className="label">Yaş</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  className="input"
                  placeholder="Yaşınız"
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="label">Cinsiyet</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Seçiniz</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
            </div>
            
            {/* Vücut Ölçüleri */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Vücut Ölçüleri
              </h2>
              
              <div>
                <label htmlFor="height" className="label">Boy (cm)</label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  min="50"
                  max="250"
                  value={formData.height}
                  onChange={handleChange}
                  className="input"
                  placeholder="Boy (cm)"
                />
              </div>
              
              <div>
                <label htmlFor="weight" className="label">Kilo (kg)</label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  min="1"
                  max="300"
                  value={formData.weight}
                  onChange={handleChange}
                  className="input"
                  placeholder="Kilo (kg)"
                />
              </div>
              
              <div>
                <label htmlFor="activityLevel" className="label">Aktivite Seviyesi</label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="sedentary">Hareketsiz (Ofis işi, az yürüyüş)</option>
                  <option value="light">Hafif (Haftada 1-2 egzersiz)</option>
                  <option value="moderate">Orta (Haftada 3-5 egzersiz)</option>
                  <option value="active">Aktif (Haftada 6-7 egzersiz)</option>
                  <option value="veryActive">Çok Aktif (Günde 2x egzersiz, fiziksel iş)</option>
                </select>
              </div>
              
              {/* BMI Bilgisi */}
              {bmi && bmiCategory && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 mt-2">
                  <div className="font-medium mb-1">Vücut Kitle İndeksi (BMI)</div>
                  <div className="flex items-center">
                    <div className={`text-2xl font-bold ${bmiCategory.color}`}>
                      {bmi}
                    </div>
                    <div className={`ml-2 ${bmiCategory.color}`}>
                      - {bmiCategory.label}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              type="submit"
              className="btn btn-primary w-full md:w-auto"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>Kaydediliyor...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <FiSave className="mr-2" />
                  <span>Profili Kaydet</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile 