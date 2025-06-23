import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiUser, FiChevronRight, FiAlertCircle } from 'react-icons/fi'

const CompleteProfileForm = () => {
  const { user, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.age || !formData.gender || !formData.height || !formData.weight) {
      setError('Lütfen tüm alanları doldurun.')
      return
    }
    setLoading(true)
    try {
      await updateUserProfile({
        id: user.id,
        _id: user.id,
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight
      })
      navigate('/dashboard')
    } catch (err) {
      setError('Bilgiler kaydedilemedi. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <FiUser className="mr-2" /> Profil Bilgilerini Tamamla
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Devam etmek için aşağıdaki bilgileri doldurun.</p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Örn: 28"
              required
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
              required
            >
              <option value="">Seçiniz</option>
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
              <option value="other">Diğer</option>
            </select>
          </div>
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
              placeholder="Örn: 175"
              required
            />
          </div>
          <div>
            <label htmlFor="weight" className="label">Kilo (kg)</label>
            <input
              id="weight"
              name="weight"
              type="number"
              min="20"
              max="300"
              value={formData.weight}
              onChange={handleChange}
              className="input"
              placeholder="Örn: 70"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full btn btn-primary flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : (<><FiChevronRight className="mr-2" /> Devam Et</>)}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfileForm 