import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { gsap } from 'gsap'
import { FiUser, FiLock, FiAlertCircle } from 'react-icons/fi'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    // Animasyon için elementi önce görünür yapalım
    const card = document.querySelector('.auth-card')
    if (card) {
      card.style.opacity = '1'
      card.style.visibility = 'visible'
    }

    // GSAP animasyonu
    gsap.fromTo('.auth-card',
      { y: -20, opacity: 1 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power1.out' }
    )
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error when user types
    if (error) setError('')
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Lütfen tüm alanları doldurun')
      return
    }
    
    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Geçerli bir e-posta adresi girin')
      return
    }
    
    // Şifre uzunluğunu kontrol et
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      console.log('Giriş deneniyor:', formData.email)
      // Önce giriş yapmayı dene
      const success = await login(formData.email, formData.password)
      
      if (success) {
        console.log('Giriş başarılı, yönlendiriliyor...')
        navigate('/dashboard')
      } else {
        // Giriş başarısız olduğunda, kullanıcıya şifresini yanlış girmiş olabileceğini veya kayıt olması gerektiğini bildir
        console.log('Giriş başarısız')
        setError('E-posta veya şifre hatalı. Hesabınız yoksa lütfen kayıt olun.')
        
        // Otomatik kayıt işlemini kaldırdık, çünkü bu karmaşık hatalara neden oluyordu
        // Kullanıcı kayıt sayfasına gitmek isterse aşağıdaki bağlantıyı kullanabilir
      }
    } catch (err) {
      console.error('Giriş hatası:', err)
      setError('Giriş işlemi sırasında bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="auth-card w-full max-w-md p-8 bg-white rounded-lg shadow-lg" style={{opacity: 1, visibility: 'visible'}}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Sağlık Takip Uygulaması
          </h1>
          <p className="text-gray-600 mt-2">
            Hesabınıza giriş yapın
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ornek@mail.com"
                required
                style={{backgroundColor: 'white', color: 'black'}} 
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
                style={{backgroundColor: 'white', color: 'black'}}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Giriş Yapılıyor...
              </span>
            ) : (
              'Giriş Yap'
            )}
          </button>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">
              Hesabınız yok mu?{' '}
            </span>
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Kaydolun
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login 