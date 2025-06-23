import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { FiPlusCircle, FiX, FiCheck, FiClock, FiCalendar, FiAlertCircle, FiTrash2, FiEdit2 } from 'react-icons/fi'
import { getMedications, addMedication, updateMedication, deleteMedication } from '../../api/userApi'

const MedicationTracker = () => {
  const [medications, setMedications] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    dosage: '',
    frequency: 'daily',
    time: '08:00',
    notes: ''
  })
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  
  const formRef = useRef(null)
  const addBtnRef = useRef(null)
  
  // Load medications from backend
  useEffect(() => {
    fetchMedications()
  }, [])
  
  const fetchMedications = async () => {
    setLoading(true)
    try {
      const meds = await getMedications()
      setMedications(meds)
    } catch (err) {
      setMedications([])
      setError('İlaçlar yüklenirken bir hata oluştu')
    }
    setLoading(false)
  }
  
  // Animation for loading medications
  useEffect(() => {
    if (!loading) {
      gsap.from('.medication-card', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.4,
        ease: 'power2.out'
      })
    }
  }, [loading])
  
  // Animation for add/edit form
  useEffect(() => {
    if (showAddForm) {
      gsap.fromTo(
        formRef.current,
        { 
          height: 0, 
          opacity: 0 
        },
        { 
          height: 'auto', 
          opacity: 1, 
          duration: 0.3, 
          ease: 'power2.inOut' 
        }
      )
    }
  }, [showAddForm])
  
  // Handle toggle form
  const toggleAddForm = () => {
    if (showAddForm) {
      // Reset form when closing
      resetForm()
    } else {
      // Animation for hiding the add button
      gsap.to(addBtnRef.current, {
        y: 10,
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          setShowAddForm(true)
          gsap.to(addBtnRef.current, { y: 0, opacity: 1, delay: 0.3, duration: 0 })
        }
      })
    }
  }
  
  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      dosage: '',
      frequency: 'daily',
      time: '08:00',
      notes: ''
    })
    setIsEditing(false)
    setShowAddForm(false)
    setError('')
  }
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user types
    if (error) setError('')
  }
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.dosage) {
      setError('Lütfen ilaç adı ve dozajını girin')
      return
    }
    try {
      if (isEditing) {
        await updateMedication(formData.id, formData)
      } else {
        await addMedication(formData)
      }
      await fetchMedications()
      window.dispatchEvent(new Event('dataUpdated'))
      resetForm()
    } catch (err) {
      setError('İlaç kaydedilemedi')
    }
  }
  
  // Edit medication
  const handleEdit = (medication) => {
    setFormData(medication)
    setIsEditing(true)
    setShowAddForm(true)
    setTimeout(() => {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }
  
  // Delete medication
  const handleDelete = async (id) => {
    try {
      await deleteMedication(id)
      await fetchMedications()
      window.dispatchEvent(new Event('dataUpdated'))
    } catch (err) {
      setError('İlaç silinemedi')
    }
  }
  
  // Toggle medication status for today
  const handleToggleToday = (id) => {
    const today = new Date().toISOString().split('T')[0]
    
    setMedications(medications.map(med => {
      if (med.id === id) {
        // Check if there's an entry for today
        const todayStatus = med.status.find(s => s.date === today)
        
        if (todayStatus) {
          // Toggle existing entry
          return {
            ...med,
            status: med.status.map(s => 
              s.date === today ? { ...s, taken: !s.taken } : s
            )
          }
        } else {
          // Add new entry for today
          return {
            ...med,
            status: [...med.status, { date: today, taken: true }]
          }
        }
      }
      return med
    }))
  }
  
  // Get status for today
  const getTodayStatus = (medication) => {
    const today = new Date().toISOString().split('T')[0]
    const todayStatus = medication.status.find(s => s.date === today)
    return todayStatus ? todayStatus.taken : false
  }
  
  // Get adherence percentage
  const getAdherence = (medication) => {
    if (!medication.status || medication.status.length === 0) return 0
    
    const takenCount = medication.status.filter(s => s.taken).length
    return Math.round((takenCount / medication.status.length) * 100)
  }
  
  // Format time string
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    return `${hours}:${minutes}`
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            İlaç Takibi
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            İlaç kullanım programınızı takip edin
          </p>
        </div>
        
        <button
          ref={addBtnRef}
          onClick={toggleAddForm}
          className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'} flex items-center`}
        >
          {showAddForm ? (
            <>
              <FiX className="mr-1" /> İptal
            </>
          ) : (
            <>
              <FiPlusCircle className="mr-1" /> İlaç Ekle
            </>
          )}
        </button>
      </div>
      
      {/* Add/Edit Medication Form */}
      <div 
        ref={formRef}
        className={`card overflow-hidden ${showAddForm ? 'block' : 'hidden'}`}
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {isEditing ? 'İlaç Düzenle' : 'Yeni İlaç Ekle'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="label">İlaç Adı</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="İlaç adı"
              />
            </div>
            
            <div>
              <label htmlFor="dosage" className="label">Dozaj</label>
              <input
                id="dosage"
                name="dosage"
                type="text"
                value={formData.dosage}
                onChange={handleChange}
                className="input"
                placeholder="Örn: 500 mg, 1 tablet"
              />
            </div>
            
            <div>
              <label htmlFor="frequency" className="label">Kullanım Sıklığı</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="input"
              >
                <option value="daily">Günlük</option>
                <option value="twice_daily">Günde 2 kez</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
                <option value="as_needed">Gerektiğinde</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="time" className="label">Alınma Saati</label>
              <input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                className="input"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="notes" className="label">Notlar</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input min-h-[80px]"
                placeholder="Ek bilgiler (yemekle alınmalı, vb.)"
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditing ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Medications List */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <FiCalendar className="mr-2" />
          İlaç Programınız
        </h2>
        
        {medications.length === 0 ? (
          <div className="card text-center py-8 text-gray-500 dark:text-gray-400">
            <FiClock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>İlaç programınızda henüz ilaç bulunmuyor.</p>
            <p className="text-sm mt-1">Takip etmek istediğiniz ilaçları ekleyin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map(medication => (
              <div 
                key={medication.id} 
                className={`medication-card medication-card-${medication.id} card p-4 transition-all`}
              >
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <button
                        onClick={() => handleToggleToday(medication.id)}
                        className={`flex-shrink-0 h-6 w-6 mt-1 rounded-full border-2 flex items-center justify-center ${
                          getTodayStatus(medication)
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {getTodayStatus(medication) && (
                          <FiCheck className="h-4 w-4 text-white" />
                        )}
                      </button>
                      
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {medication.name}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {medication.dosage}
                          <span className="mx-2">•</span>
                          {medication.frequency === 'daily' && 'Günlük'}
                          {medication.frequency === 'twice_daily' && 'Günde 2 kez'}
                          {medication.frequency === 'weekly' && 'Haftalık'}
                          {medication.frequency === 'monthly' && 'Aylık'}
                          {medication.frequency === 'as_needed' && 'Gerektiğinde'}
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            <FiClock className="mr-1" />
                            {formatTime(medication.time)}
                          </span>
                        </div>
                        
                        {medication.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {medication.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex mt-3 sm:mt-0 items-center">
                    {/* Adherence Rate */}
                    <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-sm mr-4">
                      <span className="font-medium text-primary dark:text-primary-light">
                        {getAdherence(medication)}%
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-xs ml-1">
                        uyum
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(medication)}
                        className="p-2 text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light"
                        title="Düzenle"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(medication.id)}
                        className="p-2 text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400"
                        title="Sil"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Calendar View (simplified) */}
                <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Son 5 gün:</span>
                    <div className="flex space-x-1">
                      {medication.status.slice(-5).map((status, index) => (
                        <div 
                          key={index}
                          title={status.date}
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                            status.taken 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {status.taken ? (
                            <FiCheck className="h-3 w-3" />
                          ) : (
                            <FiX className="h-3 w-3" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicationTracker 