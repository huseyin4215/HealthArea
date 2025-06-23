import { useState, useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { FiActivity, FiCalendar, FiTrendingUp, FiDroplet, FiSun, FiUser, FiAward } from 'react-icons/fi'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { getHealthData, getUserExercises } from '../api/userApi'

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [healthData, setHealthData] = useState(null)
  const [exerciseData, setExerciseData] = useState(null)
  const cardsRef = useRef([])
  
  // Sağlık ve egzersiz verilerini çeken ana fonksiyon
  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [health, exercises] = await Promise.all([
        getHealthData(),
        getUserExercises()
      ]);
      setHealthData(health);
      setExerciseData(exercises);
    } catch (error) {
      console.error("Dashboard data could not be fetched:", error);
    } finally {
      setLoading(false);
    }
  };

  // Component yüklendiğinde ve kullanıcı değiştiğinde veriyi çek.
  useEffect(() => {
    fetchData();
  }, [user?.id]); // Sadece kullanıcı ID'si değiştiğinde çalışır, user objesinin tamamı değiştiğinde değil.

  // 'dataUpdated' event'i ile veriyi yenileme.
  // Bu, HealthLog gibi yerlerden veri eklendiğinde tetiklenir.
  useEffect(() => {
    const handleDataUpdate = () => {
      fetchData();
    };
    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []); // Bağımlılık yok, sadece bir kez kurulur.
  
  // Animation effects
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    if (!loading) {
      // Animate cards - start with opacity 1
      gsap.fromTo(cardsRef.current, 
        { opacity: 1, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      )
      
      // Animate charts - start with opacity 1
      gsap.fromTo('.chart-container', 
        { opacity: 1, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, delay: 0.3, ease: 'power2.out' }
      )
    }
  }, [loading])
  
  // Processed data for charts and stats
  const processedData = useMemo(() => {
    if (!healthData || !exerciseData) return null;

    // Son 7 günün tarihlerini bul
    const today = new Date();
    const last7Dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    // Son 7 günün sağlık kayıtlarını grupla
    const last7Health = last7Dates.map(dateStr =>
      healthData.filter(d => d.date && new Date(d.date).toISOString().split('T')[0] === dateStr)
    );

    // Belirli bir tipin son 7 gündeki ortalamasını al
    const avgType = (type) => {
      const values = last7Health.flatMap(dayLogs =>
        dayLogs.filter(d => d.type === type).map(d => parseFloat(d.value) || 0)
      );
      return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '-';
    };

    // Son 7 gün için ortalamalar
    const averages = {
      caloriesConsumed: avgType('caloriesConsumed'),
      caloriesBurned: avgType('caloriesBurned'),
      sleepHours: avgType('sleepHours'),
      waterIntake: avgType('waterIntake'),
      weight: avgType('weight')
    };

    // Toplam yakılan kalori
    const totalCaloriesBurned = healthData.filter(d => d.type === 'caloriesBurned').reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
    // Toplam puan, kilo, boy ve BMI'yı sadece profil verisinden (user) al
    const latestWeight = user?.weight || null;
    const latestHeight = user?.height || null;
    const bmi = latestWeight && latestHeight ? (latestWeight / ((latestHeight / 100) ** 2)).toFixed(1) : null;

    // Egzersiz verileri
    const totalExerciseTime = exerciseData.reduce((acc, ex) => acc + ex.duration, 0);

    // Haftalık aktivite (egzersiz)
    const weeklyActivity = {
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      datasets: [{
        label: 'Aktivite (dakika)',
        data: Array(7).fill(0),
        backgroundColor: 'rgba(0, 128, 255, 0.2)',
        borderColor: 'rgba(0, 128, 255, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: 'start'
      }]
    };
    exerciseData.forEach(ex => {
      const dayOfWeek = new Date(ex.date).getDay();
      const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
      if (dayIndex >= 0 && dayIndex < 7) {
        weeklyActivity.datasets[0].data[dayIndex] += ex.duration;
      }
    });

    const stats = [
      { id: 'points', label: 'Toplam Puan', value: (user && typeof user.points === 'number') ? user.points : 'Profilinizi tamamlayın', icon: <FiAward className="h-6 w-6 text-yellow-500" />, color: 'yellow' },
      { id: 'streak', label: 'Seri', value: (user && typeof user.currentStreak === 'number') ? user.currentStreak + ' gün' : '0 gün', icon: <FiActivity className="h-6 w-6 text-green-500" />, color: 'green' },
      { id: 'exercise', label: 'Toplam Aktivite', value: `${totalExerciseTime} dk`, icon: <FiActivity className="h-6 w-6 text-blue-500" />, color: 'blue' },
      { id: 'weight', label: 'Güncel Kilo', value: latestWeight ? `${latestWeight} kg` : 'Profilde kilo yok', icon: <FiTrendingUp className="h-6 w-6 text-orange-500" />, color: 'orange' },
      { id: 'height', label: 'Boy', value: latestHeight ? `${latestHeight} cm` : 'Profilde boy yok', icon: <FiTrendingUp className="h-6 w-6 text-green-500" />, color: 'green' },
      { id: 'bmi', label: 'BMI', value: bmi || 'Profilde kilo/boy yok', icon: <FiUser className="h-6 w-6 text-purple-500" />, color: 'purple' },
      { id: 'caloriesBurned', label: 'Toplam Yakılan Kalori', value: totalCaloriesBurned ? `${totalCaloriesBurned} kcal` : 'N/A', icon: <FiSun className="h-6 w-6 text-pink-500" />, color: 'pink' },
      { id: 'water', label: 'Su Tüketimi', value: averages.waterIntake !== '-' ? `${averages.waterIntake} L` : 'N/A', icon: <FiDroplet className="h-6 w-6 text-cyan-500" />, color: 'cyan' }
    ];

    // --- CHART DATA ---
    // Son 7 gün için uyku kalitesi (Line)
    const sleepLabels = last7Dates.slice().reverse().map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('tr-TR', { weekday: 'short' });
    });
    const sleepData = last7Dates.slice().reverse().map(date => {
      const log = healthData.find(d => d.type === 'sleepHours' && d.date && new Date(d.date).toISOString().split('T')[0] === date);
      return log ? parseFloat(log.value) : null;
    });
    const sleepQualityChart = {
      labels: sleepLabels,
      datasets: [
        {
          label: 'Uyku Süresi (saat)',
          data: sleepData,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: 'start'
        }
      ]
    };

    // Son 7 gün için kalori dengesi (Bar)
    const calorieLabels = sleepLabels;
    const caloriesConsumed = last7Dates.slice().reverse().map(date => {
      const log = healthData.find(d => d.type === 'caloriesConsumed' && d.date && new Date(d.date).toISOString().split('T')[0] === date);
      return log ? parseFloat(log.value) : 0;
    });
    const caloriesBurned = last7Dates.slice().reverse().map(date => {
      const log = healthData.find(d => d.type === 'caloriesBurned' && d.date && new Date(d.date).toISOString().split('T')[0] === date);
      return log ? parseFloat(log.value) : 0;
    });
    const calorieBalanceChart = {
      labels: calorieLabels,
      datasets: [
        {
          label: 'Alınan Kalori',
          data: caloriesConsumed,
          backgroundColor: 'rgba(241, 126, 76, 0.6)',
          borderColor: 'rgba(241, 126, 76, 1)',
          borderWidth: 1
        },
        {
          label: 'Yakılan Kalori',
          data: caloriesBurned,
          backgroundColor: 'rgba(0, 128, 255, 0.6)',
          borderColor: 'rgba(0, 128, 255, 1)',
          borderWidth: 1
        }
      ]
    };

    // Son 7 gün için sağlık dağılımı (Doughnut)
    const typeCounts = {};
    last7Health.flat().forEach(d => {
      if (!typeCounts[d.type]) typeCounts[d.type] = 0;
      typeCounts[d.type]++;
    });
    const healthDistributionChart = {
      labels: Object.keys(typeCounts).map(type => {
        switch (type) {
          case 'caloriesConsumed': return 'Alınan Kalori';
          case 'caloriesBurned': return 'Yakılan Kalori';
          case 'sleepHours': return 'Uyku';
          case 'waterIntake': return 'Su';
          case 'weight': return 'Kilo';
          default: return type;
        }
      }),
      datasets: [
        {
          data: Object.values(typeCounts),
          backgroundColor: [
            'rgba(0, 128, 255, 0.7)',
            'rgba(241, 126, 76, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(255, 99, 132, 0.7)'
          ],
          borderColor: [
            'rgba(0, 128, 255, 1)',
            'rgba(241, 126, 76, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    return { weeklyActivity, stats, averages, sleepQualityChart, calorieBalanceChart, healthDistributionChart };
  }, [healthData, exerciseData, user]);
  
  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
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
  
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
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
  
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right'
      }
    },
    cutout: '65%'
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!processedData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Veriler yüklenemedi veya bulunamadı.</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Merhaba, {user?.name || 'Kullanıcı'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            İşte güncel sağlık durumunuz ve aktivite özetiniz
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">
            <FiCalendar className="inline mr-1" />
            {new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          <Link to="/profile" className="ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            <FiUser className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {processedData?.stats.map((stat, index) => (
          <div
            key={stat.id}
            ref={el => cardsRef.current[index] = el}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex items-center space-x-4 border-l-4 border-${stat.color}-500`}
          >
            <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/50`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Health Averages */}
      {processedData?.averages && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm">Son 7 Gün Ortalama</span>
            <span className="font-bold text-lg text-primary">{processedData.averages.caloriesConsumed}</span>
            <span className="text-xs text-gray-400">Alınan Kalori</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm">Son 7 Gün Ortalama</span>
            <span className="font-bold text-lg text-primary">{processedData.averages.caloriesBurned}</span>
            <span className="text-xs text-gray-400">Yakılan Kalori</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm">Son 7 Gün Ortalama</span>
            <span className="font-bold text-lg text-primary">{processedData.averages.sleepHours}</span>
            <span className="text-xs text-gray-400">Uyku (saat)</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm">Son 7 Gün Ortalama</span>
            <span className="font-bold text-lg text-primary">{processedData.averages.waterIntake}</span>
            <span className="text-xs text-gray-400">Su (L)</span>
          </div>
        </div>
      )}
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <h3 className="font-bold text-gray-900 dark:text-white">Haftalık Aktivite</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Son 7 gündeki toplam egzersiz süreniz.</p>
          {processedData?.weeklyActivity && <Line data={processedData.weeklyActivity} options={lineOptions} />}
          {(!exerciseData || exerciseData.length === 0) && (
            <div className="text-center text-gray-400 mt-4">Henüz egzersiz kaydınız yok.</div>
          )}
        </div>
        <div className="chart-container bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <h3 className="font-bold text-gray-900 dark:text-white">Kalori Dengesi</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Son 7 gün alınan/yakılan kalori.</p>
          {processedData?.calorieBalanceChart && <Bar data={processedData.calorieBalanceChart} options={barOptions} />}
        </div>
        <div className="chart-container bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <h3 className="font-bold text-gray-900 dark:text-white">Uyku Kalitesi</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Son 7 günün uyku süresi.</p>
          {processedData?.sleepQualityChart && <Line data={processedData.sleepQualityChart} options={lineOptions} />}
        </div>
        <div className="chart-container bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <h3 className="font-bold text-gray-900 dark:text-white">Sağlık Dağılımı</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Son 7 günün sağlık kayıtlarının dağılımı.</p>
          <div className="w-full max-w-xs mx-auto">
            {processedData?.healthDistributionChart && <Doughnut data={processedData.healthDistributionChart} options={doughnutOptions} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard