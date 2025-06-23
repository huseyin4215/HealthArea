import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { FiPlus, FiCalendar, FiTrendingUp, FiSave, FiAlertCircle, FiAward, FiActivity } from 'react-icons/fi'
import { Bar, Line } from 'react-chartjs-2'
import { useAuth } from '../../context/AuthContext'
import { useUserProgress } from '../../context/UserProgressContext'
import '../../../src/utils/chartSetup' // Import Chart.js setup
import { getHealthData, addHealthData, updateHealthData } from '../../api/userApi'

// Utility: Aggregate health records by date
function aggregateHealthLogs(logs) {
  const byDate = {};
  logs.forEach(log => {
    // Normalize date to yyyy-mm-dd
    const dateKey = new Date(log.date).toISOString().split('T')[0];
    if (!byDate[dateKey]) {
      byDate[dateKey] = {
        date: dateKey,
        caloriesConsumed: null,
        caloriesBurned: null,
        sleepHours: null,
        sleepQuality: null,
        stressLevel: null,
        mood: null,
        waterIntake: null,
        notes: '',
        // Optionally: keep original log IDs for editing
      };
    }
    // Map type to field
    switch (log.type) {
      case 'caloriesConsumed':
        byDate[dateKey].caloriesConsumed = log.value;
        if (log.notes) byDate[dateKey].notes += log.notes + '\n';
        break;
      case 'caloriesBurned':
        byDate[dateKey].caloriesBurned = log.value;
        if (log.notes) byDate[dateKey].notes += log.notes + '\n';
        break;
      case 'sleepHours':
        byDate[dateKey].sleepHours = log.value;
        if (log.sleepQuality) byDate[dateKey].sleepQuality = log.sleepQuality;
        if (log.notes) byDate[dateKey].notes += log.notes + '\n';
        break;
      case 'waterIntake':
        byDate[dateKey].waterIntake = log.value;
        if (log.notes) byDate[dateKey].notes += log.notes + '\n';
        break;
      case 'mood':
        byDate[dateKey].mood = log.value;
        break;
      case 'stressLevel':
        byDate[dateKey].stressLevel = log.value;
        break;
      // Add more types as needed
      default:
        break;
    }
  });
  // Remove trailing newlines from notes
  Object.values(byDate).forEach(day => {
    if (day.notes) day.notes = day.notes.trim();
  });
  // Return sorted by date descending
  return Object.values(byDate).sort((a, b) => new Date(b.date) - new Date(a.date));
}

const HealthLog = () => {
  const { user, refreshUser } = useAuth()
  const { addPoints } = useUserProgress()
  const [loading, setLoading] = useState(true)
  const [healthLogs, setHealthLogs] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    caloriesConsumed: '',
    caloriesBurned: '',
    sleepHours: '',
    sleepQuality: 3,
    stressLevel: 3,
    mood: 3,
    waterIntake: '',
    notes: ''
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  // Refs for chart instances
  const calorieChartRef = useRef(null)
  const sleepChartRef = useRef(null)
  
  // Sadece dünü seçilebilir yap
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  // Load health log data
  useEffect(() => {
    const fetchHealthLogs = async () => {
      setLoading(true)
      try {
        const logs = await getHealthData();
        setHealthLogs(logs)
      } catch (err) {
        setHealthLogs([])
      }
      setLoading(false)
    }
    fetchHealthLogs()
    // Cleanup function to destroy charts when component unmounts
    return () => {
      if (calorieChartRef.current) calorieChartRef.current.destroy()
      if (sleepChartRef.current) sleepChartRef.current.destroy()
    }
  }, [])
  
  // Animation when component loads
  useEffect(() => {
    if (!loading) {
      gsap.from('.charts-container', {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      })
    }
  }, [loading])
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear messages
    if (success) setSuccess(false)
    if (error) setError('')
  }
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    // Zorunlu alan kontrolü
    if (
      !formData.caloriesConsumed ||
      !formData.caloriesBurned ||
      !formData.sleepHours ||
      !formData.sleepQuality ||
      !formData.stressLevel ||
      !formData.mood ||
      !formData.waterIntake
    ) {
      setError('Tüm alanları doldurmanız zorunludur.')
      return
    }
    if (formData.date !== yesterday) {
      setError('Sadece dünkü veriyi ekleyebilirsiniz.')
      return
    }
    // Sadece yeni kayıt eklerken duplicate kontrolü yap
    if (!formData.id) {
      const duplicateTypes = [];
      const entries = [
        { type: 'caloriesConsumed', value: Number(formData.caloriesConsumed), date: formData.date, notes: formData.notes },
        { type: 'caloriesBurned', value: Number(formData.caloriesBurned), date: formData.date, notes: formData.notes },
        { type: 'sleepHours', value: Number(formData.sleepHours), date: formData.date, sleepQuality: formData.sleepQuality, notes: formData.notes },
        { type: 'waterIntake', value: Number(formData.waterIntake), date: formData.date, notes: formData.notes },
        { type: 'mood', value: Number(formData.mood), date: formData.date },
        { type: 'stressLevel', value: Number(formData.stressLevel), date: formData.date }
      ];
      for (const entry of entries) {
        const exists = healthLogs.some(l => l.type === entry.type && new Date(l.date).toISOString().split('T')[0] === entry.date)
        if (exists) duplicateTypes.push(entry.type)
      }
      if (duplicateTypes.length > 0) {
        setError('Aynı gün ve tür için zaten kayıt mevcut: ' + duplicateTypes.map(t => {
          switch (t) {
            case 'caloriesConsumed': return 'Alınan Kalori';
            case 'caloriesBurned': return 'Yakılan Kalori';
            case 'sleepHours': return 'Uyku';
            case 'waterIntake': return 'Su';
            case 'mood': return 'Ruh Hali';
            case 'stressLevel': return 'Stres';
            default: return t;
          }
        }).join(', '))
        return
      }
    }
    try {
      if (formData.id) {
        // Güncelleme
        // Her alanı ayrı ayrı güncelle (her biri ayrı kayıt)
        const updateEntries = [
          { type: 'caloriesConsumed', value: Number(formData.caloriesConsumed), date: formData.date, notes: formData.notes, id: formData.caloriesConsumedId },
          { type: 'caloriesBurned', value: Number(formData.caloriesBurned), date: formData.date, notes: formData.notes, id: formData.caloriesBurnedId },
          { type: 'sleepHours', value: Number(formData.sleepHours), date: formData.date, sleepQuality: formData.sleepQuality, notes: formData.notes, id: formData.sleepHoursId },
          { type: 'waterIntake', value: Number(formData.waterIntake), date: formData.date, notes: formData.notes, id: formData.waterIntakeId },
          { type: 'mood', value: Number(formData.mood), date: formData.date, id: formData.moodId },
          { type: 'stressLevel', value: Number(formData.stressLevel), date: formData.date, id: formData.stressLevelId }
        ]
        for (const entry of updateEntries) {
          if (entry.id) {
            await updateHealthData(entry.id, entry)
          }
        }
        setSuccess(true)
        setShowForm(false)
        setFormData({
          date: yesterday,
          caloriesConsumed: '',
          caloriesBurned: '',
          sleepHours: '',
          sleepQuality: 3,
          stressLevel: 3,
          mood: 3,
          waterIntake: '',
          notes: ''
        })
        // Güncel verileri çek
        const logs = await getHealthData();
        setHealthLogs(logs)
        await refreshUser()
        // Sadece burada bir defa tetikle
        window.dispatchEvent(new Event('dataUpdated'))
        return
      }
      // Prepare health data entries for each field
      const entries = [
        { type: 'caloriesConsumed', value: Number(formData.caloriesConsumed), date: formData.date, notes: formData.notes },
        { type: 'caloriesBurned', value: Number(formData.caloriesBurned), date: formData.date, notes: formData.notes },
        { type: 'sleepHours', value: Number(formData.sleepHours), date: formData.date, sleepQuality: formData.sleepQuality, notes: formData.notes },
        { type: 'waterIntake', value: Number(formData.waterIntake), date: formData.date, notes: formData.notes },
        { type: 'mood', value: Number(formData.mood), date: formData.date },
        { type: 'stressLevel', value: Number(formData.stressLevel), date: formData.date }
      ]
      // Save all entries
      for (const entry of entries) {
        try {
          await addHealthData(entry);
        } catch (err) {
          if (err.message && err.message.includes('zaten bir kayıt mevcut')) {
            setError('Bu tür için bu gün zaten bir kayıt mevcut. Lütfen başka bir gün veya tür seçin.');
            return;
          } else {
            throw err;
          }
        }
      }
      // Her kayıt başarılı olduğunda puan ekle ve veriyi yenile
      // Not: Puan ve seri backend'de güncelleniyor. Biz sadece veriyi yeniliyoruz.
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }
      setSuccess(true)
      setShowForm(false)
      setFormData({
        date: yesterday,
        caloriesConsumed: '',
        caloriesBurned: '',
        sleepHours: '',
        sleepQuality: 3,
        stressLevel: 3,
        mood: 3,
        waterIntake: '',
        notes: ''
      })
      // Fetch updated logs
      const logs = await getHealthData();
      setHealthLogs(logs)

      // Emit a global event to notify other components (like Dashboard)
      window.dispatchEvent(new Event('dataUpdated'))
    } catch (err) {
      console.error('Sağlık verisi eklenirken hata:', err)
      setError(err.message || 'Bir hata oluştu.')
    }
  }
  
  // In component: use aggregated logs
  const mergedLogs = aggregateHealthLogs(healthLogs);
  const selectedLog = mergedLogs.find(log => log.date === selectedDate);
  
  // Chart data for calories
  const calorieData = {
    labels: mergedLogs.slice(0, 7).map(log => {
      const date = new Date(log.date)
      return date.toLocaleDateString('tr-TR', { weekday: 'short' })
    }).reverse(),
    datasets: [
      {
        label: 'Alınan Kalori',
        data: mergedLogs.slice(0, 7).map(log => log.caloriesConsumed).reverse(),
        backgroundColor: 'rgba(241, 126, 76, 0.6)',
        borderColor: 'rgba(241, 126, 76, 1)',
        borderWidth: 2,
      },
      {
        label: 'Yakılan Kalori',
        data: mergedLogs.slice(0, 7).map(log => log.caloriesBurned).reverse(),
        backgroundColor: 'rgba(0, 128, 255, 0.6)',
        borderColor: 'rgba(0, 128, 255, 1)',
        borderWidth: 2,
      }
    ]
  }
  
  // Chart data for sleep
  const sleepData = {
    labels: mergedLogs.slice(0, 7).map(log => {
      const date = new Date(log.date)
      return date.toLocaleDateString('tr-TR', { weekday: 'short' })
    }).reverse(),
    datasets: [
      {
        label: 'Uyku Süresi (saat)',
        data: mergedLogs.slice(0, 7).map(log => log.sleepHours).reverse(),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  }
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }
  
  const sleepChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false
      }
    }
  }
  
  // Handle starting a new log
  const handleAddNew = () => {
    setFormData({
      ...formData,
      date: new Date().toISOString().split('T')[0]
    })
    setShowForm(true)
  }
  
  // Handle editing a log
  const handleEditLog = () => {
    if (selectedLog) {
      // Seçilen günün tüm tiplerinin id'lerini bul
      const dayLogs = healthLogs.filter(l => new Date(l.date).toISOString().split('T')[0] === selectedLog.date)
      setFormData({
        ...selectedLog,
        caloriesConsumedId: dayLogs.find(l => l.type === 'caloriesConsumed')?._id || dayLogs.find(l => l.type === 'caloriesConsumed')?.id,
        caloriesBurnedId: dayLogs.find(l => l.type === 'caloriesBurned')?._id || dayLogs.find(l => l.type === 'caloriesBurned')?.id,
        sleepHoursId: dayLogs.find(l => l.type === 'sleepHours')?._id || dayLogs.find(l => l.type === 'sleepHours')?.id,
        waterIntakeId: dayLogs.find(l => l.type === 'waterIntake')?._id || dayLogs.find(l => l.type === 'waterIntake')?.id,
        moodId: dayLogs.find(l => l.type === 'mood')?._id || dayLogs.find(l => l.type === 'mood')?.id,
        stressLevelId: dayLogs.find(l => l.type === 'stressLevel')?._id || dayLogs.find(l => l.type === 'stressLevel')?.id,
        id: 'edit' // Sadece edit modunda olduğunu belirtmek için
      })
      setShowForm(true)
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Günlük Sağlık Kayıtları
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Günlük sağlık verilerinizi kaydedin ve takip edin
          </p>
        </div>
        
        <button
          onClick={handleAddNew}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-1" /> Yeni Kayıt
        </button>
      </div>
      
      {success && (
        <div className="success-message p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md flex items-center">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Sağlık kaydınız başarıyla kaydedildi!
        </div>
      )}
      
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
      
      {/* Form for adding/editing logs */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {formData.id ? 'Sağlık Kaydını Düzenle' : 'Yeni Sağlık Kaydı'}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md flex items-center">
              <FiAlertCircle className="mr-2" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label htmlFor="date" className="label">Tarih</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input pl-10"
                    {...(!formData.id ? { min: yesterday, max: yesterday } : {})}
                  />
                </div>
              </div>
              
              {/* Calories */}
              <div>
                <label htmlFor="caloriesConsumed" className="label">Alınan Kalori</label>
                <input
                  id="caloriesConsumed"
                  name="caloriesConsumed"
                  type="number"
                  value={formData.caloriesConsumed}
                  onChange={handleChange}
                  className="input"
                  placeholder="Örn: 2000"
                  min="0"
                  max="10000"
                />
              </div>
              
              <div>
                <label htmlFor="caloriesBurned" className="label">Yakılan Kalori</label>
                <input
                  id="caloriesBurned"
                  name="caloriesBurned"
                  type="number"
                  value={formData.caloriesBurned}
                  onChange={handleChange}
                  className="input"
                  placeholder="Örn: 1800"
                  min="0"
                  max="10000"
                />
              </div>
              
              {/* Sleep */}
              <div>
                <label htmlFor="sleepHours" className="label">Uyku Süresi (saat)</label>
                <input
                  id="sleepHours"
                  name="sleepHours"
                  type="number"
                  value={formData.sleepHours}
                  onChange={handleChange}
                  className="input"
                  placeholder="Örn: 7.5"
                  min="0"
                  max="24"
                  step="0.1"
                />
              </div>
              
              <div>
                <label htmlFor="sleepQuality" className="label">Uyku Kalitesi</label>
                <div className="flex items-center">
                  <input
                    id="sleepQuality"
                    name="sleepQuality"
                    type="range"
                    min="1"
                    max="5"
                    value={formData.sleepQuality}
                    onChange={handleChange}
                    className="w-full"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 min-w-[20px] text-center">
                    {formData.sleepQuality}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Kötü</span>
                  <span>Mükemmel</span>
                </div>
              </div>
              
              {/* Mood & Stress */}
              <div>
                <label htmlFor="mood" className="label">Ruh Hali</label>
                <div className="flex items-center">
                  <input
                    id="mood"
                    name="mood"
                    type="range"
                    min="1"
                    max="5"
                    value={formData.mood}
                    onChange={handleChange}
                    className="w-full"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 min-w-[20px] text-center">
                    {formData.mood}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Kötü</span>
                  <span>Harika</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="stressLevel" className="label">Stres Seviyesi</label>
                <div className="flex items-center">
                  <input
                    id="stressLevel"
                    name="stressLevel"
                    type="range"
                    min="1"
                    max="5"
                    value={formData.stressLevel}
                    onChange={handleChange}
                    className="w-full"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 min-w-[20px] text-center">
                    {formData.stressLevel}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Düşük</span>
                  <span>Yüksek</span>
                </div>
              </div>
              
              {/* Water */}
              <div>
                <label htmlFor="waterIntake" className="label">Su Tüketimi (litre)</label>
                <input
                  id="waterIntake"
                  name="waterIntake"
                  type="number"
                  value={formData.waterIntake}
                  onChange={handleChange}
                  className="input"
                  placeholder="Örn: 2.5"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
              
              {/* Notes */}
              <div className="md:col-span-2">
                <label htmlFor="notes" className="label">Notlar</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input min-h-[80px]"
                  placeholder="Bugün hakkında ek notlar..."
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn btn-primary flex items-center"
              >
                <FiSave className="mr-2" />
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Summary & Charts */}
      {!showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calorie Chart */}
          <div className="card charts-container">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FiTrendingUp className="mr-2" />
              Kalori Dengesi (Son 7 Gün)
            </h2>
            <Bar 
              data={calorieData} 
              options={chartOptions} 
              height={80} 
              ref={calorieChartRef}
              key="calorie-chart"
            />
          </div>
          
          {/* Sleep Chart */}
          <div className="card charts-container">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Uyku Süresi (Son 7 Gün)
            </h2>
            <Line 
              data={sleepData} 
              options={sleepChartOptions} 
              height={80} 
              ref={sleepChartRef}
              key="sleep-chart"
            />
          </div>
        </div>
      )}
      
      {/* Daily Log History */}
      {!showForm && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Günlük Kayıtlar
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Tarih</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Kalori +/-</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Uyku</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Ruh Hali</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Stres Seviyesi</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Su (L)</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {mergedLogs.map(log => (
                  <tr 
                    key={log.date} 
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      selectedDate === log.date ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => setSelectedDate(log.date)}
                  >
                    <td className="py-3 px-3 text-sm">
                      {new Date(log.date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">{log.caloriesConsumed - log.caloriesBurned}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({log.caloriesConsumed} / {log.caloriesBurned})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm">
                      <div className="flex items-center">
                        <span>{log.sleepHours} saat</span>
                        <div className="ml-2 flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span 
                              key={i}
                              className={`h-2 w-2 rounded-full mx-0.5 ${
                                i < log.sleepQuality 
                                  ? 'bg-purple-500' 
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span 
                            key={i}
                            className={`h-2 w-2 rounded-full mx-0.5 ${
                              i < log.mood 
                                ? 'bg-green-500' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span 
                            key={i}
                            className={`h-2 w-2 rounded-full mx-0.5 ${
                              i < log.stressLevel 
                                ? 'bg-orange-500' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {log.waterIntake || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDate(log.date)
                          handleEditLog()
                        }}
                        className="text-sm text-primary hover:text-primary-dark"
                      >
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Selected Day Details */}
          {selectedLog && !showForm && (
            <div className="mt-6 p-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                {new Date(selectedLog.date).toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} Detayları
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Kalori Dengesi</div>
                  <div className="text-xl font-medium text-gray-900 dark:text-white">
                    {selectedLog.caloriesConsumed - selectedLog.caloriesBurned}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Uyku</div>
                  <div className="text-xl font-medium text-gray-900 dark:text-white">
                    {selectedLog.sleepHours} saat
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Stres Seviyesi</div>
                  <div className="flex mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span 
                        key={i}
                        className={`h-3 w-3 rounded-full mr-1 ${
                          i < selectedLog.stressLevel 
                            ? 'bg-orange-500' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Su Tüketimi</div>
                  <div className="text-xl font-medium text-gray-900 dark:text-white">
                    {selectedLog.waterIntake || '-'} L
                  </div>
                </div>
              </div>
              
              {selectedLog.notes && (
                <div className="mt-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notlar</div>
                  <div className="text-gray-700 dark:text-gray-300 text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {selectedLog.notes}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleEditLog}
                  className="btn btn-primary btn-sm"
                >
                  Bu Günü Düzenle
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HealthLog 