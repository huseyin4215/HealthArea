import { useState, useEffect, useRef } from 'react'
import { FiCalendar, FiClock, FiPlus, FiPlusCircle, FiCheck, FiInfo, FiX, FiSave, FiAward, FiActivity } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useUserProgress } from '../../context/UserProgressContext'
import { getMedications, addMedication, updateMedication, deleteMedication } from '../../api/userApi'

const Medications = () => {
  const { user, refreshUser } = useAuth()
  const { addPoints } = useUserProgress()
  const [loading, setLoading] = useState(true)
  const [medications, setMedications] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'Günde 1 kez',
    time: '',
    remainingDays: 30,
    notes: '',
    isActive: true
  })
  const [error, setError] = useState('')
  const medicationsContainerRef = useRef(null)

  useEffect(() => {
    fetchMedications()
    // eslint-disable-next-line
  }, [])

  const fetchMedications = async () => {
    setLoading(true)
    try {
      const meds = await getMedications()
      setMedications(meds)
    } catch (err) {
      setError('İlaçlar yüklenemedi')
    }
    setLoading(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewMedication({ ...newMedication, [name]: value })
  }

  const handleAddMedication = () => {
    setShowAddForm(!showAddForm)
    if (!showAddForm) {
      setNewMedication({
        name: '',
        dosage: '',
        frequency: 'Günde 1 kez',
        time: '',
        remainingDays: 30,
        notes: '',
        isActive: true
      })
    }
  }

  const handleSaveMedication = async () => {
    if (!newMedication.name || !newMedication.dosage) {
      setError('Lütfen ilaç adı ve dozajını girin')
      return
    }
    try {
      const med = await addMedication(newMedication)
      setMedications([...medications, med])
      setShowAddForm(false)
      addPoints(5, 'Yeni ilaç eklediğin için')
      await refreshUser()
      window.dispatchEvent(new Event('dataUpdated'))
    } catch (err) {
      setError('İlaç eklenemedi')
    }
  }

  const handleTakeDose = async (medicationId) => {
    try {
      const med = medications.find(m => m._id === medicationId)
      const updated = await updateMedication(medicationId, { lastTaken: new Date().toISOString() })
      setMedications(medications.map(m => m._id === medicationId ? updated : m))
      addPoints(2, 'İlaç takibini yaptığın için')
      await refreshUser()
      window.dispatchEvent(new Event('dataUpdated'))
    } catch (err) {
      setError('İlaç güncellenemedi')
    }
  }

  const handleDeleteMedication = async (medicationId) => {
    if (!window.confirm('Bu ilacı silmek istediğinize emin misiniz?')) return
    try {
      await deleteMedication(medicationId)
      setMedications(medications.filter(m => m._id !== medicationId))
      addPoints(-1, 'İlaç sildin')
      await refreshUser()
      window.dispatchEvent(new Event('dataUpdated'))
    } catch (err) {
      setError('İlaç silinemedi')
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FiCalendar className="mr-2 text-primary" /> İlaç Takibi
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            İlaçlarınızı takip edin ve zamanında almanızı sağlayın
          </p>
        </div>
        <button
          onClick={handleAddMedication}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {showAddForm ? (
            <>
              <FiX className="mr-1" /> İptal
            </>
          ) : (
            <>
              <FiPlus className="mr-1" /> Yeni İlaç
            </>
          )}
        </button>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
      {/* Kullanıcı puan ve streak gösterimi */}
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5 flex items-center">
          <FiAward className="mr-1" size={10} />
          {(user && typeof user.points === 'number') ? user.points : 0} Puan
        </div>
        <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded-full px-2 py-0.5 flex items-center">
          <FiActivity className="mr-1" size={10} />
          Seri: {(user && typeof user.currentStreak === 'number') ? user.currentStreak : 0}
        </div>
      </div>
      {/* İlaç Ekleme Formu */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Yeni İlaç Ekle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İlaç Adı</label>
              <input
                type="text"
                name="name"
                value={newMedication.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                placeholder="Örn: Vitamin D3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dozaj</label>
              <input
                type="text"
                name="dosage"
                value={newMedication.dosage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                placeholder="Örn: 1000 IU"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sıklık</label>
              <select
                name="frequency"
                value={newMedication.frequency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="Günde 1 kez">Günde 1 kez</option>
                <option value="Günde 2 kez">Günde 2 kez</option>
                <option value="Günde 3 kez">Günde 3 kez</option>
                <option value="Haftada 1 kez">Haftada 1 kez</option>
                <option value="Haftada 2 kez">Haftada 2 kez</option>
                <option value="Gerektiğinde">Gerektiğinde</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zaman</label>
              <input
                type="text"
                name="time"
                value={newMedication.time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                placeholder="Örn: Sabah kahvaltıdan sonra"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kalan Gün Sayısı</label>
              <input
                type="number"
                name="remainingDays"
                value={newMedication.remainingDays}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                min="1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notlar</label>
              <textarea
                name="notes"
                value={newMedication.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                rows="2"
                placeholder="İlaç hakkında ek bilgiler..."
              ></textarea>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              onClick={handleSaveMedication}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <FiSave className="mr-1" /> Kaydet
            </button>
          </div>
        </div>
      )}
      {/* İlaç Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {medications.map(medication => (
          <div 
            key={medication._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{medication.name}</h3>
              <span className="text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">
                {medication.remainingDays} gün kaldı
              </span>
            </div>
            <div className="mt-2">
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Doz:</span> 
                {medication.dosage}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Sıklık:</span> 
                {medication.frequency}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-1">
                <FiClock className="mr-1 text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Zaman:</span> 
                {medication.time}
              </div>
              {medication.notes && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-start">
                  <FiInfo className="mr-1 text-primary mt-0.5 flex-shrink-0" />
                  <p>{medication.notes}</p>
                </div>
              )}
              {medication.lastTaken && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  Son alınma: {new Date(medication.lastTaken).toLocaleString('tr-TR')}
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleTakeDose(medication._id)}
                className="flex items-center px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
              >
                <FiCheck className="mr-1" /> Alındı İşaretle
              </button>
              <button
                onClick={() => handleDeleteMedication(medication._id)}
                className="ml-2 flex items-center px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors"
              >
                <FiX className="mr-1" /> Sil
              </button>
            </div>
          </div>
        ))}
        {/* Yeni İlaç Ekleme Kartı */}
        {!showAddForm && (
          <div 
            onClick={handleAddMedication}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors h-full min-h-[200px]"
          >
            <FiPlusCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">Yeni İlaç Ekle</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Medications
