import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiLock } from 'react-icons/fi';
import { useUserProgress } from '../../context/UserProgressContext';

const Avatar = () => {
  const navigate = useNavigate();
  const {
    defaultAvatars,
    availableAvatars,
    selectedAvatar,
    changeAvatar,
    points,
    motivationalTitle
  } = useUserProgress();
  
  const [selectedAvatarId, setSelectedAvatarId] = useState(selectedAvatar.id);
  const [success, setSuccess] = useState(false);
  
  // Handle avatar selection
  const handleAvatarSelect = (avatarId) => {
    // Check if avatar is available
    if (availableAvatars.some(avatar => avatar.id === avatarId)) {
      setSelectedAvatarId(avatarId);
    }
  };
  
  // Handle save button click
  const handleSave = () => {
    const success = changeAvatar(selectedAvatarId);
    if (success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center text-primary hover:text-primary-dark transition-colors"
        >
          <FiArrowLeft className="mr-1" /> Profil'e Dön
        </button>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-primary">{points}</span> puan • {motivationalTitle.name}
        </div>
      </div>
      
      {/* Success message */}
      {success && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md flex items-center">
          <FiCheck className="h-5 w-5 mr-2" />
          Avatar başarıyla değiştirildi!
        </div>
      )}
      
      {/* Avatar selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Avatar Seçimi</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {defaultAvatars.map(avatar => {
            const isAvailable = availableAvatars.some(a => a.id === avatar.id);
            const isSelected = selectedAvatarId === avatar.id;
            
            return (
              <div 
                key={avatar.id}
                onClick={() => isAvailable && handleAvatarSelect(avatar.id)}
                className={`
                  relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all
                  ${isSelected ? 'border-primary shadow-md scale-105' : 'border-transparent'}
                  ${isAvailable ? 'opacity-100' : 'opacity-60'}
                `}
              >
                <img 
                  src={avatar.src} 
                  alt={avatar.name} 
                  className="w-full aspect-square object-cover"
                />
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="text-white text-xs font-medium">{avatar.name}</div>
                </div>
                
                {!isAvailable && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white">
                    <FiLock className="text-xl mb-1" />
                    <span className="text-xs font-medium">{avatar.requiredPoints} puan</span>
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                    <FiCheck size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={selectedAvatarId === selectedAvatar.id}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors
              ${selectedAvatarId !== selectedAvatar.id
                ? 'bg-primary text-white hover:bg-primary-dark' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
            `}
          >
            Kaydet
          </button>
        </div>
      </div>
      
      {/* Avatar information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Avatar Seviyeleri</h2>
        
        <div className="space-y-4">
          {defaultAvatars.map(avatar => (
            <div 
              key={avatar.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-750"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg overflow-hidden mr-3">
                  <img 
                    src={avatar.src} 
                    alt={avatar.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{avatar.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{avatar.requiredPoints} puan gerekli</div>
                </div>
              </div>
              
              {availableAvatars.some(a => a.id === avatar.id) ? (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                  Açık
                </span>
              ) : (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full flex items-center">
                  <FiLock className="mr-1" size={10} /> Kilitli
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Avatar; 