import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { FiActivity, FiClock, FiTarget, FiCalendar, FiCheck, FiPlus, FiAward, FiCamera, FiInfo } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useUserProgress } from '../../context/UserProgressContext'
import ExerciseProofModal from './ExerciseProofModal'
import { addExercise } from '../../api/userApi'

// Import local image assets



import walkingImage from '../../assets/images/tempoluWalk.jpg';
import stretchingImage from '../../assets/images/hafifKosu.jpg';
import yogaImage from '../../assets/images/temelyoga.jpg';
import bodyweightImage from '../../assets/images/fitness.jpg';
import joggingImage from '../../assets/images/esneme.jpeg';
const ExerciseRecommendations = () => {
  const { user, refreshUser } = useAuth()
  const { addPoints, points, currentStreak } = useUserProgress()
  const [loading, setLoading] = useState(true)
  const [exercises, setExercises] = useState([])
  const [selectedExercises, setSelectedExercises] = useState([])
  const [showReward, setShowReward] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [showProofModal, setShowProofModal] = useState(false)
  const [selectedExerciseForProof, setSelectedExerciseForProof] = useState(null)
  const cardRefs = useRef([])
  const benefitsRefs = useRef([])
  const rewardRef = useRef(null)
  
  // Fetch exercise recommendations based on user profile
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchExercises = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Sample exercise recommendations
      // In a real app, these would be generated based on user profile data
      const recommendedExercises = [
        {
          id: 1,
          name: 'Tempolu Yürüyüş',
          description: 'Açık havada orta tempoda yürüyüş, kardiyovasküler sağlık için idealdir.',
          duration: 30,
          intensity: 'Orta',
          category: 'Kardiyovasküler',
          benefits: ['Kalp sağlığı', 'Kilo kontrolü', 'Stres azaltma'],
          imageUrl: walkingImage,
          points: 15
        },
        {
          id: 2,
          name: 'Esneme Egzersizleri',
          description: 'Tüm vücut için hafif esneme hareketleri, kas esnekliğini artırır.',
          duration: 15,
          intensity: 'Hafif',
          category: 'Esneklik',
          benefits: ['Esneklik artışı', 'Kas gerginliği azaltma', 'Yaralanma önleme'],
          imageUrl: stretchingImage,
          points: 10
        },
        {
          id: 3,
          name: 'Temel Yoga',
          description: 'Başlangıç seviyesi yoga pozları, denge ve esneklik için idealdir.',
          duration: 20,
          intensity: 'Orta',
          category: 'Yoga',
          benefits: ['Denge gelişimi', 'Esneklik', 'Zihinsel rahatlama'],
          imageUrl: yogaImage,
          points: 20
        },
        {
          id: 4,
          name: 'Vücut Ağırlığı Egzersizleri',
          description: 'Şınav, mekik, squat gibi vücut ağırlığı egzersizleri.',
          duration: 25,
          intensity: 'Yüksek',
          category: 'Güç',
          benefits: ['Kas kuvveti', 'Metabolizma artışı', 'Kemik yoğunluğu'],
          imageUrl: bodyweightImage,
          points: 25
        },
        {
          id: 5,
          name: 'Hafif Koşu',
          description: 'Düşük tempoda koşu veya jogging, kalp sağlığı için faydalıdır.',
          duration: 20,
          intensity: 'Orta-Yüksek',
          category: 'Kardiyovasküler',
          benefits: ['Dayanıklılık artışı', 'Kalori yakımı', 'Kardiyovasküler sağlık'],
          imageUrl: joggingImage,
          points: 20
        }
      ]
      
      setExercises(recommendedExercises)
      setLoading(false)
    }
    
    fetchExercises()
  }, [])
  
  // Handle adding exercise to selected list
  const handleAddExercise = (exercise) => {
    if (!selectedExercises.some(e => e.id === exercise.id)) {
      const updatedSelected = [...selectedExercises, { 
        ...exercise, 
        scheduledDate: new Date().toISOString().split('T')[0],
        completed: false
      }];
      
      setSelectedExercises(updatedSelected);
      
      // Create a more dynamic animation for adding exercise
      const exerciseItem = document.querySelector(`.exercise-item-${exercise.id}`);
      if (exerciseItem) {
        gsap.fromTo(exerciseItem, 
        { 
          opacity: 0, 
          scale: 0.8, 
          y: 20,
          x: -30
        },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          x: 0,
          duration: 0.5, 
          ease: 'elastic.out(1, 0.5)'
        }
        );
      }
      
      // Pulse animation on the add button
      const buttonElement = document.querySelector(`.add-button-${exercise.id}`);
      if (buttonElement) {
        gsap.to(buttonElement, {
          backgroundColor: '#10B981', // Success green color
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1
        });
      }
    }
  }
  
  // Handle toggling exercise completion
  const handleToggleComplete = (id) => {
    // Egzersiz için kanıt isteme
    const exercise = selectedExercises.find(exercise => exercise.id === id);
    if (exercise && !exercise.completed) {
      setSelectedExerciseForProof(exercise);
      setShowProofModal(true);
      return;
    }
    
    // Eğer zaten tamamlanmışsa, tamamlama durumunu kaldır
    const updatedExercises = selectedExercises.map(exercise => {
      if (exercise.id === id) {
        return { ...exercise, completed: false };
      }
      return exercise;
    });
    
    setSelectedExercises(updatedExercises);
  }
  
  // Kanıt gönderildikten sonra egzersizi tamamlama işlemi
  const handleProofSubmit = async (proofData) => {
    let completedExercise = null;
    const updatedExercises = selectedExercises.map(exercise => {
      if (exercise.id === proofData.exerciseId) {
        const newCompletedState = true;
        if (newCompletedState && !exercise.completed) {
          completedExercise = exercise;
        }
        return { 
          ...exercise, 
          completed: newCompletedState,
          proofTimestamp: proofData.timestamp,
          proofType: proofData.proof.type
        };
      }
      return exercise;
    });
    setSelectedExercises(updatedExercises);
    setShowProofModal(false);

    // Eğer egzersiz tamamlandıysa puan ekle ve veritabanına kaydet
    if (completedExercise) {
      // Puanı öneridekiyle eşleştir, eksikse 10 ata
      const exercisePoints = typeof completedExercise.points === 'number' ? completedExercise.points : 10;
      setEarnedPoints(exercisePoints);
      setShowReward(true);

      // Egzersizi veritabanına kaydet
      const exerciseRecord = {
        name: completedExercise.name,
        duration: completedExercise.duration,
        points: exercisePoints, // Burada önerideki puan zorunlu olarak kaydediliyor
        description: completedExercise.description,
        benefits: completedExercise.benefits,
        date: new Date().toISOString(),
        notes: '',
        type: completedExercise.category || '',
        completed: true
      };
      try {
        await addExercise(exerciseRecord);
        if (typeof refreshUser === 'function') await refreshUser();
      } catch (err) {
        console.error('Egzersiz kaydı eklenemedi:', err);
      }
    }
  };
  
  // Filter exercises by category
  const getExercisesByCategory = (category) => {
    return exercises.filter(exercise => exercise.category === category)
  }
  
  // Animation when component loads
  useEffect(() => {
    if (!loading) {
      // Initial staggered animation for exercise cards
      const exerciseCards = document.querySelectorAll('.exercise-card');
      if (exerciseCards.length > 0) {
        gsap.fromTo(exerciseCards, 
        { 
          opacity: 0, 
          y: 50,
          rotationX: 5
        },
        { 
          opacity: 1, 
          y: 0, 
          rotationX: 0,
          stagger: 0.12, 
          duration: 0.7, 
          ease: 'power3.out',
          clearProps: 'all' // Clear props after animation for better performance
        }
        );
      }
      
      // Animate exercise images with a slight delay
      const exerciseImages = document.querySelectorAll('.exercise-image');
      if (exerciseImages.length > 0) {
        gsap.fromTo(exerciseImages, 
        { scale: 1.2, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          stagger: 0.1, 
          delay: 0.3, 
          duration: 0.8, 
          ease: 'power2.out' 
        }
        );
      }
      
      // Animate benefit tags with a bouncy effect
      const benefitTags = document.querySelectorAll('.benefit-tag');
      if (benefitTags.length > 0) {
        gsap.fromTo(benefitTags, 
        { opacity: 0, scale: 0, y: 10 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          stagger: 0.03, 
          delay: 0.5, 
          duration: 0.5, 
          ease: 'back.out(2)'
        }
        );
      }
    }
  }, [loading])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 relative">
      {/* Ödül Mesajı */}
      {showReward && (
        <div 
          ref={rewardRef}
          className="reward-message fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-white px-5 py-3 rounded-lg shadow-lg flex items-center"
          style={{ opacity: 0 }}
        >
          <FiAward className="mr-2 h-5 w-5" />
          <span className="font-medium">Tebrikler! +{earnedPoints} puan kazandınız</span>
        </div>
      )}
      
      <div className="fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Egzersiz Önerileri
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Sağlık profilinize özel egzersiz önerileri
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Puan kazanmak için egzersiz yapın veya günlük sağlık kaydı ekleyin.<br/>
              <b>Seri devamı için her gün sağlık kaydı eklemelisiniz.</b>
            </p>
          </div>
          
          {/* Kullanıcı İlerleme Kartı */}
          <div className="bg-gradient-to-r from-blue-500/20 to-primary/10 dark:from-blue-500/30 dark:to-primary/20 px-4 py-3 rounded-lg flex items-center space-x-4">
            {/* Seri */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Seri</div>
              <div className="text-2xl font-bold text-primary">{user?.currentStreak || 0}</div>
              <div className="text-xs text-gray-500">gün</div>
            </div>
            
            <div className="h-10 border-l border-gray-300 dark:border-gray-600"></div>
            
            {/* Puanlar */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Puanlar</div>
              <div className="text-2xl font-bold text-primary">{user?.points || 0}</div>
              <div className="text-xs text-gray-500">toplam</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected Exercises */}
      <div className="card slide-up">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <FiCalendar className="mr-2" />
          Programınız
        </h2>
        
        {selectedExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiActivity className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
            <p>Henüz program oluşturulmadı.</p>
            <p className="text-sm mt-1">Aşağıdaki önerilerden egzersiz ekleyin.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedExercises.map((exercise) => (
              <div 
                key={exercise.id} 
                className={`exercise-item-${exercise.id} flex items-center p-3 rounded-md border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
                  exercise.completed ? 'bg-green-50 dark:bg-green-900/10' : 'bg-white dark:bg-gray-800'
                }`}
              >
                <button
                  onClick={() => handleToggleComplete(exercise.id)}
                  className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    exercise.completed 
                      ? 'border-green-500 bg-green-500' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }`}
                >
                  {exercise.completed && (
                    <FiCheck className={`h-4 w-4 text-white check-${exercise.id}`} />
                  )}
                </button>
                
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium text-${exercise.id} transition-all duration-300 ${
                    exercise.completed 
                      ? 'text-gray-500 dark:text-gray-400 line-through' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {exercise.name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <FiClock className="mr-1" />
                    <span>{exercise.duration} dakika</span>
                    <span className="mx-2">•</span>
                    <span>{exercise.intensity}</span>
                    <span className="mx-2">•</span>
                    <span className="text-primary flex items-center">
                      <FiAward className="mr-1 h-3 w-3" /> 
                      {exercise.points || 10} puan
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(exercise.scheduledDate).toLocaleDateString('tr-TR', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Exercise Recommendations */}
      <div className="space-y-6">
        {/* Cardiovascular Exercises */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Kardiyovasküler Egzersizler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getExercisesByCategory('Kardiyovasküler').map((exercise, index) => (
              <div
                key={exercise.id}
                className="exercise-card card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
                ref={el => cardRefs.current[exercise.id] = el}
              >
                <div className="relative h-32 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                  <Link to={`/exercises/${exercise.id}`}>
                    <img
                      src={exercise.imageUrl}
                      alt={exercise.name}
                      className="exercise-image w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  
                  {/* Points badge */}
                  <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs font-bold rounded-full px-2 py-1 flex items-center">
                    <FiAward className="mr-1" /> 
                    {exercise.points || 10} puan
                  </div>
                </div>
                
                <div className="p-4">
                  <Link to={`/exercises/${exercise.id}`} className="block hover:text-primary transition-colors">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {exercise.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2">
                    <FiClock className="mr-1" />
                    <span>{exercise.duration} dakika</span>
                    <span className="mx-2">•</span>
                    <span>{exercise.intensity}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {exercise.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {exercise.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="benefit-tag text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                        ref={el => {
                          if (!benefitsRefs.current[exercise.id]) {
                            benefitsRefs.current[exercise.id] = [];
                          }
                          benefitsRefs.current[exercise.id][index] = el;
                        }}
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      to={`/exercises/${exercise.id}`}
                      className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex-1"
                    >
                      <FiInfo className="mr-1" /> Detaylar
                    </Link>
                    
                    <button
                      onClick={() => handleAddExercise(exercise)}
                      className={`add-button-${exercise.id} flex items-center justify-center px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex-1 ${
                        selectedExercises.some(e => e.id === exercise.id) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                      disabled={selectedExercises.some(e => e.id === exercise.id)}
                    >
                      {selectedExercises.some(e => e.id === exercise.id) ? (
                        <>
                          <FiCheck className="mr-1" /> Eklendi
                        </>
                      ) : (
                        <>
                          <FiPlus className="mr-1" /> Ekle
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Other Exercise Categories */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Güç ve Esneklik Egzersizleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises
              .filter(exercise => exercise.category !== 'Kardiyovasküler')
              .map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="exercise-card card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
                  ref={el => cardRefs.current[exercise.id] = el}
                >
                  <div className="relative h-32 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                    <Link to={`/exercises/${exercise.id}`}>
                      <img
                        src={exercise.imageUrl}
                        alt={exercise.name}
                        className="exercise-image w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    
                    {/* Points badge */}
                    <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs font-bold rounded-full px-2 py-1 flex items-center">
                      <FiAward className="mr-1" /> 
                      {exercise.points || 10} puan
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <Link to={`/exercises/${exercise.id}`} className="block hover:text-primary transition-colors">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {exercise.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2">
                      <FiClock className="mr-1" />
                      <span>{exercise.duration} dakika</span>
                      <span className="mx-2">•</span>
                      <span>{exercise.intensity}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {exercise.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {exercise.benefits.map((benefit, index) => (
                        <span
                          key={index}
                          className="benefit-tag text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                          ref={el => {
                            if (!benefitsRefs.current[exercise.id]) {
                              benefitsRefs.current[exercise.id] = [];
                            }
                            benefitsRefs.current[exercise.id][index] = el;
                          }}
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        to={`/exercises/${exercise.id}`}
                        className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex-1"
                      >
                        <FiInfo className="mr-1" /> Detaylar
                      </Link>
                      
                      <button
                        onClick={() => handleAddExercise(exercise)}
                        className={`add-button-${exercise.id} flex items-center justify-center px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex-1 ${
                          selectedExercises.some(e => e.id === exercise.id) 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                        disabled={selectedExercises.some(e => e.id === exercise.id)}
                      >
                        {selectedExercises.some(e => e.id === exercise.id) ? (
                          <>
                            <FiCheck className="mr-1" /> Eklendi
                          </>
                        ) : (
                          <>
                            <FiPlus className="mr-1" /> Ekle
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      
      {/* Exercise Proof Modal */}
      <ExerciseProofModal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        onSubmit={handleProofSubmit}
        exerciseId={selectedExerciseForProof?.id}
        exerciseName={selectedExerciseForProof?.name}
      />
    </div>
  )
}

export default ExerciseRecommendations 