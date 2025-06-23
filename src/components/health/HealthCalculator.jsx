import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { FiActivity, FiCalendar, FiUser, FiTarget, FiDroplet, FiInfo, FiAward } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

const HealthCalculator = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    bodyFat: '',
    muscleMass: '',
    activityLevel: 'moderate',
    goal: 'maintain'
  })
  
  const [results, setResults] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [isProfileDataLoaded, setIsProfileDataLoaded] = useState(false)
  const resultsRef = useRef(null)
  const formRef = useRef(null)
  
  // Profil verilerini yükle
  useEffect(() => {
    try {
      // Kullanıcı verilerini kontrol et
      if (user) {
        console.log('Kullanıcı profil verileri yükleniyor:', user);
        
        // Kullanıcı veritabanından gelen verileri kullan
        setFormData(prev => ({
          ...prev,
          gender: user.gender || prev.gender,
          age: user.age || prev.age,
          weight: user.weight || prev.weight,
          height: user.height || prev.height,
          activityLevel: user.activityLevel || prev.activityLevel
        }));
        
        setIsProfileDataLoaded(true);
      } else {
        // Kullanıcı verileri yoksa demo verileri yükle
        setFormData(prev => ({
          ...prev,
          gender: 'male',
          age: '35',
          weight: '70',
          height: '175',
          activityLevel: 'moderate'
        }))
        setIsProfileDataLoaded(true)
      }
    } catch (error) {
      console.error('Profil verileri yüklenemedi:', error)
      // Demo verileri yükle
      setFormData(prev => ({
        ...prev,
        gender: 'male',
        age: '35',
        weight: '70',
        height: '175',
        activityLevel: 'moderate'
      }))
      setIsProfileDataLoaded(true)
    }
  }, [user])
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // Calculate caloric needs based on inputs
  const calculateCalories = () => {
    // Convert inputs to numbers
    const weight = parseFloat(formData.weight)
    const height = parseFloat(formData.height)
    const age = parseInt(formData.age)
    const bodyFat = parseFloat(formData.bodyFat) || 0
    const muscleMass = parseFloat(formData.muscleMass) || 0
    
    // Base Metabolic Rate (BMR) using Mifflin-St Jeor Equation
    let bmr = 0
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }
    
    // Adjust BMR based on body composition if provided
    if (bodyFat > 0) {
      // Lean mass burns more calories, so adjust BMR
      const leanMass = weight * (1 - bodyFat / 100)
      // Adjust BMR: higher lean mass = higher BMR
      bmr *= (1 + (leanMass / weight - 0.7) * 0.15)
    }
    
    // Activity multiplier
    let activityMultiplier = 1.2 // Sedentary
    switch (formData.activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.2
        break
      case 'light':
        activityMultiplier = 1.375
        break
      case 'moderate':
        activityMultiplier = 1.55
        break
      case 'active':
        activityMultiplier = 1.725
        break
      case 'veryActive':
        activityMultiplier = 1.9
        break
      default:
        activityMultiplier = 1.2
    }
    
    // Total Daily Energy Expenditure (TDEE)
    let tdee = bmr * activityMultiplier
    
    // Adjust based on goal
    let goalCalories = tdee
    let protein = 0
    let carbs = 0
    let fats = 0
    
    switch (formData.goal) {
      case 'lose':
        goalCalories = tdee * 0.85 // 15% deficit
        break
      case 'maintain':
        goalCalories = tdee
        break
      case 'gain':
        goalCalories = tdee * 1.15 // 15% surplus
        break
      default:
        goalCalories = tdee
    }
    
    // Calculate macronutrient distribution
    if (formData.goal === 'lose') {
      // Higher protein for weight loss
      protein = weight * 2.2 // 2.2g per kg
      fats = weight * 0.8 // 0.8g per kg
      carbs = (goalCalories - (protein * 4 + fats * 9)) / 4
    } else if (formData.goal === 'gain') {
      // Higher carbs for weight gain
      protein = weight * 1.8 // 1.8g per kg
      fats = weight * 0.9 // 0.9g per kg
      carbs = (goalCalories - (protein * 4 + fats * 9)) / 4
    } else {
      // Balanced for maintenance
      protein = weight * 1.6 // 1.6g per kg
      fats = weight * 1 // 1g per kg
      carbs = (goalCalories - (protein * 4 + fats * 9)) / 4
    }
    
    // Return calculated results
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      goalCalories: Math.round(goalCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      idealWeight: Math.round((height - 100) - ((height - 150) / 4)), // Basic height-based ideal weight
      bmi: Math.round((weight / ((height / 100) ** 2)) * 10) / 10,
      bodyFatPercentage: bodyFat || '-',
      muscleMassPercentage: muscleMass || '-'
    }
  }
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    const calculatedResults = calculateCalories()
    setResults(calculatedResults)
    setShowResults(true)
    
    // Scroll to results with animation
    if (resultsRef.current) {
      setTimeout(() => {
        window.scrollTo({
          top: resultsRef.current.offsetTop - 100,
          behavior: 'smooth'
        })
      }, 200)
    }
    
    // For .results-card animation
    const resultsCard = document.querySelector('.results-card');
    if (resultsCard) {
      gsap.fromTo(resultsCard,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
    
    // For .result-item animation 
    const resultItems = document.querySelectorAll('.result-item');
    if (resultItems && resultItems.length > 0) {
      gsap.fromTo(resultItems,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, delay: 0.3, ease: 'power2.out' }
      );
    }
    
    // For .result-bar animation
    const resultBars = document.querySelectorAll('.result-bar');
    if (resultBars && resultBars.length > 0) {
      gsap.fromTo(resultBars,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, stagger: 0.1, delay: 0.5, ease: 'power2.out' }
      );
    }
  }
  
  // Animation when component loads
  useEffect(() => {
    // Basit bir giriş animasyonu
    gsap.fromTo('.calculator-card', 
      {
        opacity: 0,
        y: 20
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      }
    )
    
    // Form alanlarının sırayla görünmesi
    gsap.fromTo('.form-field', 
      {
        opacity: 0,
        y: 10
      },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.4,
        delay: 0.3,
        ease: 'power2.out'
      }
    )
    
    // Başlık animasyonu
    gsap.fromTo('.title-reveal', 
      {
        opacity: 0,
        x: -20
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power2.out'
      }
    )
    
    if (isProfileDataLoaded) {
      // Otomatik profil bilgisi animasyonu
      gsap.fromTo('.auto-profile-info', 
        {
          opacity: 0,
          y: 10
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.5,
          ease: 'power2.out'
        }
      )
    }
  }, [isProfileDataLoaded])
  
  // Determine BMI category
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Zayıf', color: 'text-blue-500' }
    if (bmi < 25) return { category: 'Normal', color: 'text-green-500' }
    if (bmi < 30) return { category: 'Fazla Kilolu', color: 'text-yellow-500' }
    if (bmi < 35) return { category: 'Obez (Sınıf I)', color: 'text-orange-500' }
    if (bmi < 40) return { category: 'Obez (Sınıf II)', color: 'text-orange-700' }
    return { category: 'Aşırı Obez (Sınıf III)', color: 'text-red-500' }
  }
  
  return (
    <div className="space-y-8">
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white title-reveal flex items-center">
          <FiActivity className="mr-2 text-primary" /> Sağlık Hesaplayıcı
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Boy, kilo ve vücut bileşiminize göre kişiselleştirilmiş sağlık verilerinizi hesaplayın
        </p>
      </div>
      
      {isProfileDataLoaded && (
        <div className="auto-profile-info bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="flex items-center text-blue-700 dark:text-blue-300 font-medium mb-1">
            <FiInfo className="mr-2" />
            Profil bilgileriniz otomatik olarak yüklendi
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Temel vücut bilgileriniz profilinizden alınmıştır ve değiştirilemez.
          </p>
        </div>
      )}
      
      {/* Calculator Form */}
      <div 
        ref={formRef} 
        className="calculator-card relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        {/* Decorative background elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full"></div>
        <div className="absolute -left-5 -bottom-5 w-24 h-24 bg-primary/5 rounded-full"></div>
        
        <h2 className="text-xl font-semibold mb-5 text-gray-800 dark:text-white">
          Vücut Ölçüleriniz
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Cinsiyet - Düzenlenemez */}
            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cinsiyet
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <FiUser className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-black dark:text-black font-medium">
                    {formData.gender === 'male' ? 'Erkek' : 'Kadın'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Yaş - Düzenlenemez */}
            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Yaş
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-black dark:text-black font-medium">{formData.age}</span>
                </div>
              </div>
            </div>
            
            {/* Boy - Düzenlenemez */}
            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Boy (cm)
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <FiActivity className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-black dark:text-black font-medium">{formData.height}</span>
                </div>
              </div>
            </div>
            
            {/* Kilo - Düzenlenemez */}
            <div className="form-field">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kilo (kg)
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <FiDroplet className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-black dark:text-black font-medium">{formData.weight}</span>
                </div>
              </div>
            </div>
            
            {/* Vücut Yağı */}
            <div className="form-field">
              <label htmlFor="bodyFat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vücut Yağı % (opsiyonel)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDroplet className="text-gray-400" />
                </div>
                <input
                  type="number"
                  id="bodyFat"
                  name="bodyFat"
                  value={formData.bodyFat}
                  onChange={handleChange}
                  placeholder="Vücut yağı oranınız"
                  min="5"
                  max="50"
                  step="0.1"
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            {/* Kas Kütlesi */}
            <div className="form-field">
              <label htmlFor="muscleMass" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kas Kütlesi % (opsiyonel)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiTarget className="text-gray-400" />
                </div>
                <input
                  type="number"
                  id="muscleMass"
                  name="muscleMass"
                  value={formData.muscleMass}
                  onChange={handleChange}
                  placeholder="Kas kütlesi oranınız"
                  min="20"
                  max="60"
                  step="0.1"
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring focus:ring-primary/20 focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="form-field space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Aktivite Seviyesi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className={`
                p-3 border rounded-lg flex items-center cursor-pointer transition-colors
                ${formData.activityLevel === 'sedentary' 
                  ? 'bg-primary/10 border-primary/30 text-primary dark:bg-primary/20 dark:border-primary/30' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'}
              `}>
                <input
                  type="radio"
                  name="activityLevel"
                  value="sedentary"
                  checked={formData.activityLevel === 'sedentary'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="ml-2 text-sm">Hareketsiz</span>
              </label>
              
              <label className={`
                p-3 border rounded-lg flex items-center cursor-pointer transition-colors
                ${formData.activityLevel === 'moderate' 
                  ? 'bg-primary/10 border-primary/30 text-primary dark:bg-primary/20 dark:border-primary/30' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'}
              `}>
                <input
                  type="radio"
                  name="activityLevel"
                  value="moderate"
                  checked={formData.activityLevel === 'moderate'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="ml-2 text-sm">Orta Aktif</span>
              </label>
              
              <label className={`
                p-3 border rounded-lg flex items-center cursor-pointer transition-colors
                ${formData.activityLevel === 'active' 
                  ? 'bg-primary/10 border-primary/30 text-primary dark:bg-primary/20 dark:border-primary/30' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'}
              `}>
                <input
                  type="radio"
                  name="activityLevel"
                  value="active"
                  checked={formData.activityLevel === 'active'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="ml-2 text-sm">Çok Aktif</span>
              </label>
            </div>
          </div>
          
          <div className="form-field space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hedefiniz
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className={`
                p-3 border rounded-lg flex items-center cursor-pointer transition-colors
                ${formData.goal === 'lose' 
                  ? 'bg-primary/10 border-primary/30 text-primary dark:bg-primary/20 dark:border-primary/30' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'}
              `}>
                <input
                  type="radio"
                  name="goal"
                  value="lose"
                  checked={formData.goal === 'lose'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="ml-2 text-sm">Kilo Vermek</span>
              </label>
              
              <label className={`
                p-3 border rounded-lg flex items-center cursor-pointer transition-colors
                ${formData.goal === 'maintain' 
                  ? 'bg-primary/10 border-primary/30 text-primary dark:bg-primary/20 dark:border-primary/30' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'}
              `}>
                <input
                  type="radio"
                  name="goal"
                  value="maintain"
                  checked={formData.goal === 'maintain'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="ml-2 text-sm">Kiloyu Korumak</span>
              </label>
              
              <label className={`
                p-3 border rounded-lg flex items-center cursor-pointer transition-colors
                ${formData.goal === 'gain' 
                  ? 'bg-primary/10 border-primary/30 text-primary dark:bg-primary/20 dark:border-primary/30' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'}
              `}>
                <input
                  type="radio"
                  name="goal"
                  value="gain"
                  checked={formData.goal === 'gain'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="ml-2 text-sm">Kilo Almak</span>
              </label>
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg shadow-md transition-all transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              Sonuçları Hesapla
            </button>
          </div>
        </form>
      </div>
      
      {/* Results Section */}
      {showResults && results && (
        <div ref={resultsRef} className="space-y-6">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Hesaplama Sonuçlarınız
          </h2>
          
          {/* Main Results */}
          <div className="results-card bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl shadow-lg p-6 border border-primary/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="result-item bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">Günlük Kalori İhtiyacı</div>
                <div className="flex justify-between items-baseline">
                  <div className="text-2xl font-bold text-black dark:text-white">{results.goalCalories}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">kcal</div>
                </div>
                <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                  <div className="result-bar h-full bg-primary rounded" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="result-item bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">Vücut Kitle İndeksi (BMI)</div>
                <div className="flex justify-between items-baseline">
                  <div className="text-2xl font-bold text-black dark:text-white">{results.bmi}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">kg/m²</div>
                </div>
                <div className="mt-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getBMICategory(results.bmi).color} bg-opacity-20`}>
                    {getBMICategory(results.bmi).category}
                  </span>
                </div>
              </div>
              
              <div className="result-item bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">İdeal Kilo</div>
                <div className="flex justify-between items-baseline">
                  <div className="text-2xl font-bold text-black dark:text-white">{results.idealWeight}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">kg</div>
                </div>
                <div className="mt-2 text-xs text-gray-500">Boyunuza göre ideal kilo</div>
              </div>
            </div>
          </div>
          
          {/* Detailed Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="results-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Makro Besin Değerleri
              </h3>
              
              <div className="space-y-4">
                <div className="result-item">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Protein</span>
                    <span className="font-medium text-black dark:text-white">{results.protein}g</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="result-bar h-full bg-blue-500 rounded-full" style={{ width: `${(results.protein * 4 / results.goalCalories) * 100}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round((results.protein * 4 / results.goalCalories) * 100)}% ({results.protein * 4} kcal)
                  </div>
                </div>
                
                <div className="result-item">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Karbonhidrat</span>
                    <span className="font-medium text-black dark:text-white">{results.carbs}g</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="result-bar h-full bg-green-500 rounded-full" style={{ width: `${(results.carbs * 4 / results.goalCalories) * 100}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round((results.carbs * 4 / results.goalCalories) * 100)}% ({results.carbs * 4} kcal)
                  </div>
                </div>
                
                <div className="result-item">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Yağ</span>
                    <span className="font-medium text-black dark:text-white">{results.fats}g</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="result-bar h-full bg-yellow-500 rounded-full" style={{ width: `${(results.fats * 9 / results.goalCalories) * 100}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round((results.fats * 9 / results.goalCalories) * 100)}% ({results.fats * 9} kcal)
                  </div>
                </div>
              </div>
            </div>
            
            <div className="results-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Ek Bilgiler
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="result-item p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Bazal Metabolizma Hızı</div>
                  <div className="text-xl font-semibold text-black dark:text-black mt-1">{results.bmr} kcal</div>
                </div>
                
                <div className="result-item p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Toplam Günlük Enerji</div>
                  <div className="text-xl font-semibold text-black dark:text-black mt-1">{results.tdee} kcal</div>
                </div>
                
                <div className="result-item p-3 bg-gray-50 dark:bg-gray-750 rounded-lg col-span-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Vücut Kompozisyonu</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Vücut Yağı</div>
                      <div className="font-medium text-black dark:text-black">
                        {results.bodyFatPercentage !== '-' ? `${results.bodyFatPercentage}%` : 'Girilmedi'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Kas Kütlesi</div>
                      <div className="font-medium text-black dark:text-black">
                        {results.muscleMassPercentage !== '-' ? `${results.muscleMassPercentage}%` : 'Girilmedi'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <FiInfo className="mr-2 text-primary" />
                  <span>Bu hesaplamalar yaklaşık değerlerdir. Profesyonel sağlık danışmanlarının tavsiyelerini dikkate alın.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HealthCalculator 