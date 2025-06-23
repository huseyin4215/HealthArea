import { useState, useEffect } from 'react';
import { getUserExercises, deleteExercise } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlusCircle, FiAward, FiClock } from 'react-icons/fi';

const ExerciseList = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExercises();
    // Listen for exercise-specific update events
    const handleExerciseDataUpdate = () => fetchExercises();
    window.addEventListener('exerciseDataUpdated', handleExerciseDataUpdate);
    return () => window.removeEventListener('exerciseDataUpdated', handleExerciseDataUpdate);
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await getUserExercises();
      setExercises(data);
      setError('');
    } catch (err) {
      setError('Egzersiz kayıtları yüklenirken bir hata oluştu');
      console.error('Egzersiz yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu egzersiz kaydını silmek istediğinize emin misiniz?')) {
      try {
        await deleteExercise(id);
        setExercises(prevExercises => prevExercises.filter(exercise => exercise._id !== id));
        // Sadece egzersiz güncellemesi için event tetikle
        window.dispatchEvent(new Event('exerciseDataUpdated'));
      } catch (err) {
        setError('Egzersiz kaydı silinirken bir hata oluştu');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  // Egzersizleri tarihe göre grupla
  const groupByDate = (exercises) => {
    return exercises.reduce((acc, ex) => {
      const date = new Date(ex.date).toLocaleDateString('tr-TR');
      if (!acc[date]) acc[date] = [];
      acc[date].push(ex);
      return acc;
    }, {});
  };

  const groupedExercises = groupByDate(exercises);

  if (loading) {
    return <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (error) {
    return <div className="error-message text-red-600 dark:text-red-400 text-center py-4">{error}</div>;
  }

  return (
    <div className="exercise-list max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Egzersiz Kayıtlarım</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Tüm egzersiz geçmişinizi burada görüntüleyin.</p>
        </div>
        <Link to="/exercise-recommendations" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition font-medium shadow">
          <FiPlusCircle className="text-lg" /> Egzersiz Ekle
        </Link>
      </div>
      {exercises.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>Henüz egzersiz kaydı bulunmuyor.</p>
          <Link to="/exercise-recommendations" className="text-primary hover:underline mt-2 inline-block">
            Egzersiz önerilerine göz atın
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedExercises).map(([date, dayExercises]) => (
            <div key={date}>
              <h3 className="text-lg font-bold text-primary mb-3 border-b border-primary/20 pb-1">{date}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dayExercises.map(exercise => (
                  <div key={exercise._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col gap-2 hover:shadow-2xl transition group border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">{formatDate(exercise.date)}</span>
                      <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
                        <FiAward className="text-yellow-500" /> {exercise.points || 0} puan
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition">{exercise.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
                      <FiClock className="text-blue-500" /> {exercise.duration} dk
                    </div>
                    {exercise.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{exercise.description}</p>}
                    {exercise.benefits && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.isArray(exercise.benefits)
                          ? exercise.benefits.map((b, i) => (
                              <span key={i} className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-200 px-2 py-0.5 rounded text-xs">{b}</span>
                            ))
                          : <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-200 px-2 py-0.5 rounded text-xs">{exercise.benefits}</span>
                        }
                      </div>
                    )}
                    {exercise.notes && <div className="mt-2 text-xs text-gray-400 italic">Not: {exercise.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {exercises.length > 0 && (
        <div className="exercise-summary mt-8 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <FiAward className="text-2xl text-yellow-500" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Toplam Egzersiz: {exercises.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">Toplam Süre: {exercises.reduce((total, ex) => total + Number(ex.duration), 0)} dakika</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-primary text-lg">Toplam Puan: {exercises.reduce((total, ex) => total + (Number(ex.points) || 0), 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseList;

