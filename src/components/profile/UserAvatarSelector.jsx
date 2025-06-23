import { useState, useEffect } from 'react'
import { useUserProgress } from '../../context/UserProgressContext'
import { FiAward, FiSave, FiLock, FiCheck, FiEdit2 } from 'react-icons/fi'
import { gsap } from 'gsap'

const UserAvatarSelector = () => {
  const { 
    points, 
    selectedAvatar, 
    availableAvatars, 
    motivationalTitle,
    customNickname,
    changeAvatar, 
    changeNickname,
    defaultAvatars,
    getNextAvatar
  } = useUserProgress()
  
  const [nickname, setNickname] = useState(customNickname || '')
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Bir sonraki avatar için gerekli puanlar
  const nextAvatar = getNextAvatar()
  
  // Animasyonlar
  useEffect(() => {
    gsap.fromTo('.avatar-card', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
    
    gsap.fromTo('.avatar-item', 
      { opacity: 0, scale: 0.8, y: 10 },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        stagger: 0.1, 
        delay: 0.3,
        duration: 0.4, 
        ease: 'back.out(1.5)' 
      }
    )
  }, [])
  
  // Avatar seçme işlemi
  const handleSelectAvatar = (avatarId) => {
    const isChanged = changeAvatar(avatarId)
    
    if (isChanged) {
      // Başarılı seçim animasyonu
      gsap.fromTo(`.avatar-item-${avatarId}`, 
        { scale: 1 },
        { 
          scale: 1.1, 
          duration: 0.3, 
          yoyo: true, 
          repeat: 1,
          ease: 'power2.inOut' 
        }
      )
    }
  }
  
  // Nickname kaydetme
  const handleSaveNickname = () => {
    if (nickname.trim()) {
      changeNickname(nickname.trim())
      setIsEditingNickname(false)
      
      // Başarı mesajı göster
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      // Başarı animasyonu
      gsap.fromTo('.success-message', 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
      )
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="avatar-card card">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Mevcut Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg">
                <img
                  src={selectedAvatar?.src || 'https://placehold.co/100x100?text=Default'}
                  alt={selectedAvatar?.name || 'Default'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                {selectedAvatar?.name?.charAt(0) || 'D'}
              </div>
            </div>
          </div>
          
          {/* Kullanıcı Bilgileri */}
          <div className="flex-1 text-center md:text-left">
            <div className="space-y-3">
              {/* Nickname */}
              <div>
                {isEditingNickname ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Motivasyonel takma adınız"
                      maxLength={20}
                      className="form-input rounded-md shadow-sm text-lg font-bold text-gray-900 dark:text-white px-3 py-2 w-full md:w-64"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveNickname}
                      className="btn-primary rounded-md p-2 flex items-center justify-center"
                    >
                      <FiSave className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 justify-center md:justify-start">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {customNickname || 'Sağlık Takipçisi'}
                    </h2>
                    <button
                      onClick={() => setIsEditingNickname(true)}
                      className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {success && (
                  <div className="success-message text-sm text-green-600 dark:text-green-400 mt-1">
                    Takma adınız kaydedildi!
                  </div>
                )}
              </div>
              
              {/* Motivasyonel Ünvan */}
              <div className="inline-flex items-center bg-primary/10 dark:bg-primary/20 rounded-full px-3 py-1 text-sm text-primary">
                <FiAward className="mr-1" />
                {motivationalTitle?.name || 'Başlangıç'}
              </div>
              
              {/* Puan */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Toplam {points} puan kazandınız
                {nextAvatar && (
                  <span className="ml-2">
                    ({nextAvatar.requiredPoints - points} puan daha <span className="text-primary">{nextAvatar.name}</span> seviyesine)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Avatar Seçimi */}
      <div className="avatar-card card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Avatar Seçimi
        </h3>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {defaultAvatars.map((avatar) => {
            const isAvailable = availableAvatars.some(a => a.id === avatar.id)
            const isSelected = selectedAvatar?.id === avatar.id
            
            return (
              <div 
                key={avatar.id} 
                className={`avatar-item avatar-item-${avatar.id} relative cursor-pointer transition-all duration-300 transform ${
                  isSelected ? 'scale-110 z-10' : ''
                }`}
                onClick={() => isAvailable && handleSelectAvatar(avatar.id)}
              >
                <div className={`
                  rounded-lg overflow-hidden border-2 transition-all duration-300
                  ${isSelected 
                    ? 'border-primary shadow-lg' 
                    : isAvailable 
                      ? 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow' 
                      : 'border-gray-200 dark:border-gray-700 opacity-50'
                  }
                `}>
                  <div className="relative">
                    <img 
                      src={avatar.src} 
                      alt={avatar.name}
                      className="w-full h-20 object-cover"
                    />
                    
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-white flex flex-col items-center">
                          <FiLock className="h-5 w-5" />
                          <span className="text-xs mt-1">{avatar.requiredPoints}p</span>
                        </div>
                      </div>
                    )}
                    
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                        <FiCheck className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  
                  <div className="px-2 py-1 text-center text-xs font-medium truncate">
                    {avatar.name}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Egzersiz programınızı düzenli tamamlayarak ve sağlık kayıtlarınızı tutarak daha fazla puan kazanabilir, yeni avatarları açabilirsiniz.
        </p>
      </div>
    </div>
  )
}

export default UserAvatarSelector 