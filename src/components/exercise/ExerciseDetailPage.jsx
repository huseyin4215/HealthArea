import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiActivity, FiTarget, FiArrowLeft, FiCheck, FiVideo, FiList, FiInfo } from 'react-icons/fi';
import { gsap } from 'gsap';

// Import sample exercise images (these would come from your existing assets)
import walkingImage from '../../assets/images/tempoluWalk.jpg';
import stretchingImage from '../../assets/images/hafifKosu.jpg';
import yogaImage from '../../assets/images/temelyoga.jpg';
import bodyweightImage from '../../assets/images/fitness.jpg';
import joggingImage from '../../assets/images/esneme.jpeg';

const ExerciseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  
  const descriptionRef = useRef(null);
  const videoRef = useRef(null);
  const instructionsRef = useRef(null);
  
  // Sample exercise data - in a real app this would come from an API
  const exercisesData = {
    '1': {
      id: 1,
      name: 'Tempolu Yürüyüş',
      description: 'Açık havada orta tempoda yürüyüş, kardiyovasküler sağlık için idealdir. Düzenli tempolu yürüyüş, kalp-damar sistemini güçlendirir, kolesterolü düşürür ve ruh halini iyileştirir. Günlük rutine kolayca eklenebilir bir aktivitedir.',
      duration: 30,
      intensity: 'Orta',
      category: 'Kardiyovasküler',
      benefits: ['Kalp sağlığı', 'Kilo kontrolü', 'Stres azaltma'],
      imageUrl: walkingImage,
      points: 15,
      videoUrl: 'https://www.youtube.com/embed/njeZ29umqVE',
      instructions: [
        'Sırtınızı dik tutun ve başınızı yukarıda tutun',
        'Omuzlarınızı geriye ve aşağıya doğru rahat bir şekilde yerleştirin',
        'Kollarınızı doğal bir şekilde sallayın',
        'Ayağınızın topuğundan parmaklarına doğru adımlar atın',
        'Normal nefes almaya devam edin',
        'Günde 30 dakika orta tempoda yürüyüş hedefleyin'
      ],
    },
    '2': {
      id: 2,
      name: 'Esneme Egzersizleri',
      description: 'Tüm vücut için hafif esneme hareketleri, kas esnekliğini artırır ve vücut dengesini iyileştirir. Sabah veya akşam rutini olarak ya da herhangi bir egzersiz öncesi ve sonrası yapılabilir.',
      duration: 15,
      intensity: 'Hafif',
      category: 'Esneklik',
      benefits: ['Esneklik artışı', 'Kas gerginliği azaltma', 'Yaralanma önleme'],
      imageUrl: stretchingImage,
      points: 10,
      videoUrl: 'https://www.youtube.com/embed/qULTwquOuT4',
      instructions: [
        'Her esnetmeyi 15-30 saniye tutun',
        'Nefes alıp vermeye devam edin, nefesi tutmayın',
        'Ani hareketlerden kaçının, yavaş ve kontrollü hareketler yapın',
        'Ağrı hissettiğinizde durun ve zorlamayın',
        'Esneme sırasında sıçramayın',
        'Tüm ana kas gruplarını esnetin'
      ],
    },
    '3': {
      id: 3,
      name: 'Temel Yoga',
      description: 'Başlangıç seviyesi yoga pozları, denge ve esneklik için idealdir. Yoga aynı zamanda zihinsel rahatlama sağlar, stresi azaltır ve vücut farkındalığını artırır. Herhangi bir zamanda, sessiz bir ortamda yapılabilir.',
      duration: 20,
      intensity: 'Orta',
      category: 'Yoga',
      benefits: ['Denge gelişimi', 'Esneklik', 'Zihinsel rahatlama'],
      imageUrl: yogaImage,
      points: 20,
      videoUrl: 'https://www.youtube.com/embed/v7AYKMP6rOE',
      instructions: [
        'Yoga için rahat, hareketlerinizi kısıtlamayan giysiler giyin',
        'Yoga matı kullanın veya yumuşak bir zemin üzerinde pratik yapın',
        'Nefes almaya odaklanın, derin ve düzenli nefes alın',
        'Acı hissettiğinizde pozdan çıkın',
        'Yavaş ve kontrollü hareketlerle pozlara girin ve çıkın',
        'Günlük 20 dakika pratik yapmayı hedefleyin'
      ],
    },
    '4': {
      id: 4,
      name: 'Vücut Ağırlığı Egzersizleri',
      description: 'Şınav, mekik, squat gibi vücut ağırlığı egzersizleri kas gücü ve dayanıklılık geliştirmek için etkilidir. Herhangi bir ekipman gerektirmez ve evde kolayca yapılabilir.',
      duration: 25,
      intensity: 'Yüksek',
      category: 'Güç',
      benefits: ['Kas kuvveti', 'Metabolizma artışı', 'Kemik yoğunluğu'],
      imageUrl: bodyweightImage,
      points: 25,
      videoUrl: 'https://www.youtube.com/embed/oAPCPjnU1wA',
      instructions: [
        'Her hareketi yapmadan önce doğru duruşunuzdan emin olun',
        'Hareketleri yavaş ve kontrollü bir şekilde yapın',
        'Nefes alıp vermeyi unutmayın',
        'İlk başta az tekrarla başlayın, zamanla artırın',
        'Haftada en az 3 kez antrenman yapmayı hedefleyin',
        'Vücudunuzun ihtiyaç duyduğu dinlenme günlerini ihmal etmeyin'
      ],
    },
    '5': {
      id: 5,
      name: 'Hafif Koşu',
      description: 'Düşük tempoda koşu veya jogging, kalp sağlığı için faydalıdır ve vücuttaki dayanıklılığı artırır. Açık havada veya koşu bandında yapılabilir.',
      duration: 20,
      intensity: 'Orta-Yüksek',
      category: 'Kardiyovasküler',
      benefits: ['Dayanıklılık artışı', 'Kalori yakımı', 'Kardiyovasküler sağlık'],
      imageUrl: joggingImage,
      points: 20,
      videoUrl: 'https://www.youtube.com/embed/5umbf4ps0GQ',
      instructions: [
        'İyi koşu ayakkabıları giyin',
        'Koşmadan önce 5 dakika yürüyerek ısının',
        'Dik duruşunuzu koruyun ve küçük adımlar atın',
        'Normal bir şekilde nefes alın, nefesinizi tutmayın',
        'Yavaş tempoda başlayın, kademeli olarak hızınızı artırın',
        'Koşu sonrası esneme yapmayı unutmayın'
      ],
    }
  };
  
  // Fetch exercise data
  useEffect(() => {
    const fetchExercise = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get exercise by ID
      const exerciseData = exercisesData[id];
      
      if (exerciseData) {
        setExercise(exerciseData);
      } else {
        // If exercise not found, redirect back
        navigate('/exercises');
      }
      
      setLoading(false);
    };
    
    fetchExercise();
  }, [id, navigate]);
  
  // Animation effects
  useEffect(() => {
    if (!loading && exercise) {
      // Header animation
      gsap.fromTo('.exercise-header', 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      
      // Image animation
      gsap.fromTo('.exercise-detail-image', 
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.7, delay: 0.2, ease: 'back.out(1.7)' }
      );
      
      // Content animations based on active tab
      const animateTabContent = () => {
        const tabRefs = {
          description: descriptionRef,
          video: videoRef,
          instructions: instructionsRef
        };
        
        Object.keys(tabRefs).forEach(tab => {
          if (tabRefs[tab].current) {
            gsap.fromTo(tabRefs[tab].current,
              { opacity: 0, y: 20, display: 'none' },
              { 
                opacity: tab === activeTab ? 1 : 0, 
                y: tab === activeTab ? 0 : 20, 
                display: tab === activeTab ? 'block' : 'none',
                duration: 0.5, 
                ease: 'power2.out' 
              }
            );
          }
        });
      };
      
      animateTabContent();
    }
  }, [loading, exercise, activeTab]);
  
  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!exercise) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-gray-600 dark:text-gray-400">Egzersiz bulunamadı.</div>
        <button 
          onClick={() => navigate('/exercises')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <FiArrowLeft className="inline mr-2" /> Egzersizlere Dön
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/exercises')}
        className="flex items-center text-primary hover:text-primary-dark transition-colors"
      >
        <FiArrowLeft className="mr-1" /> Egzersizlere Dön
      </button>
      
      {/* Exercise Header */}
      <div className="exercise-header flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <div className="w-40 h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md flex-shrink-0">
          <img 
            src={exercise.imageUrl} 
            alt={exercise.name} 
            className="exercise-detail-image w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{exercise.name}</h1>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FiClock className="mr-1" /> {exercise.duration} dakika
            </div>
            
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FiActivity className="mr-1" /> {exercise.intensity} yoğunluk
            </div>
            
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FiTarget className="mr-1" /> {exercise.category}
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
            {exercise.benefits?.map((benefit, index) => (
              <span 
                key={index}
                className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleTabChange('description')}
            className={`flex-1 py-3 px-4 flex items-center justify-center text-sm font-medium ${
              activeTab === 'description'
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
            }`}
          >
            <FiInfo className="mr-2" /> Açıklama
          </button>
          
          <button
            onClick={() => handleTabChange('video')}
            className={`flex-1 py-3 px-4 flex items-center justify-center text-sm font-medium ${
              activeTab === 'video'
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
            }`}
          >
            <FiVideo className="mr-2" /> Video
          </button>
          
          <button
            onClick={() => handleTabChange('instructions')}
            className={`flex-1 py-3 px-4 flex items-center justify-center text-sm font-medium ${
              activeTab === 'instructions'
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
            }`}
          >
            <FiList className="mr-2" /> Yönergeler
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {/* Description Tab */}
          <div 
            ref={descriptionRef} 
            className={`${activeTab === 'description' ? 'block' : 'hidden'}`}
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{exercise.description}</p>
          </div>
          
          {/* Video Tab */}
          <div 
            ref={videoRef} 
            className={`${activeTab === 'video' ? 'block' : 'hidden'}`}
          >
            <div className="rounded-lg overflow-hidden">
              <iframe 
                src={exercise.videoUrl} 
                title={`${exercise.name} Video`}
                className="w-full" 
                height="450"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
          
          {/* Instructions Tab */}
          <div 
            ref={instructionsRef} 
            className={`${activeTab === 'instructions' ? 'block' : 'hidden'}`}
          >
            <ul className="space-y-3">
              {exercise.instructions?.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl p-6 border border-primary/20">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Bu egzersizi programınıza ekleyin!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Düzenli egzersiz, genel sağlığınızı iyileştirir ve yaşam kalitenizi artırır.
          </p>
          <button
            onClick={() => navigate('/exercises')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FiCheck className="mr-2" /> Programımı Düzenle
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailPage; 