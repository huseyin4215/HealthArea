import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { gsap } from 'gsap'
import { FiUser, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  })

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Set initial visibility
    const card = document.querySelector('.auth-card')
    if (card) {
      card.style.opacity = '1'
      card.style.visibility = 'visible'
    }
    
    // Animate the form with opacity 1
    gsap.fromTo('.auth-card',
      { y: -30, opacity: 1 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
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
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.password || !formData.password2) {
      setError('Lütfen tüm alanları doldurun')
      return
    }
    
    if (formData.password !== formData.password2) {
      setError('Şifreler eşleşmiyor')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }
      
      const success = await register(userData)
      if (success) {
        navigate('/complete-profile')
      } else {
        setError('Kayıt sırasında bir hata oluştu')
      }
    } catch (err) {
      setError('Kayıt işlemi sırasında bir hata oluştu')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="auth-card w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg" style={{opacity: 1, visibility: 'visible'}}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sağlık Takip Uygulaması
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Yeni bir hesap oluşturun
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="label">
              Ad Soyad
            </label>
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
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="label">
              E-posta
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input pl-10"
                placeholder="ornek@mail.com"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="label">
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
                className="input pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="password2" className="label">
              Şifre Tekrarı
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="password2"
                name="password2"
                type="password"
                value={formData.password2}
                onChange={handleChange}
                className="input pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full btn btn-primary ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
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
                Kayıt Yapılıyor...
              </span>
            ) : (
              'Kayıt Ol'
            )}
          </button>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Zaten hesabınız var mı?{' '}
            </span>
            <Link
              to="/login"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Giriş Yapın
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register 