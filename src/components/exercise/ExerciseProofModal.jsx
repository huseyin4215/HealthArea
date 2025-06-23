import { useState, useRef } from 'react';
import { FiCamera, FiVideo, FiUpload, FiX, FiCheck, FiInfo, FiTrash2 } from 'react-icons/fi';
import { uploadExerciseProof } from '../../utils/exportUtils';

const ExerciseProofModal = ({ isOpen, onClose, onSubmit, exerciseId, exerciseName }) => {
  const [proofFile, setProofFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewType, setPreviewType] = useState(null); // 'image' veya 'video'
  const videoRef = useRef(null);
  
  if (!isOpen) return null;
  
  // Dosya yükleme işleyici
  const handleFileUpload = () => {
    setIsUploading(true);
    
    uploadExerciseProof(fileData => {
      setIsUploading(false);
      setProofFile(fileData);
      
      // Dosya türüne göre önizleme tipini belirle
      if (fileData.type.startsWith('image/')) {
        setPreviewType('image');
      } else if (fileData.type.startsWith('video/')) {
        setPreviewType('video');
      }
    });
  };
  
  // Önizlemeyi temizle
  const clearPreview = () => {
    // Video oynatıcıyı durdur
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    // Dosya URL'sini serbest bırak
    if (proofFile && proofFile.fileUrl) {
      URL.revokeObjectURL(proofFile.fileUrl);
    }
    
    setProofFile(null);
    setPreviewType(null);
  };
  
  // Formu gönder
  const handleSubmit = () => {
    if (!proofFile) {
      alert('Lütfen bir kanıt yükleyin.');
      return;
    }
    
    // Tamamlama kanıtını gönder
    onSubmit({
      exerciseId,
      proof: proofFile,
      timestamp: new Date().toISOString()
    });
    
    // Önizlemeyi temizle (modal yeniden açıldığında gösterilmemesi için)
    clearPreview();
    
    // Modalı kapat - explicit olarak çağırıldığından emin olalım
    setTimeout(() => {
      onClose();
    }, 100);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Modal Başlık */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiCamera className="mr-2" /> Egzersiz Tamamlama Kanıtı
          </h3>
          <button
            onClick={() => {
              clearPreview();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <FiX />
          </button>
        </div>
        
        {/* Modal İçeriği */}
        <div className="p-5 space-y-4">
          {/* Egzersiz bilgisi */}
          <div className="flex items-start bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
            <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">{exerciseName || 'Egzersiz'} Tamamlama Kanıtı</p>
              <p className="mt-1">Egzersizi tamamladığınızı göstermek için bir fotoğraf veya kısa video yükleyin.</p>
            </div>
          </div>
          
          {/* Dosya önizleme veya yükleme alanı */}
          {!proofFile ? (
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6">
              <div className="text-center">
                <div className="flex justify-center gap-4 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <FiCamera className="text-primary" size={20} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Fotoğraf</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <FiVideo className="text-primary" size={20} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Video</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Kabul edilen formatlar: JPG, PNG, MP4 (maks. 10MB)
                </p>
                
                <button
                  onClick={handleFileUpload}
                  disabled={isUploading}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors flex items-center justify-center mx-auto"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" /> Dosya Seç
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg overflow-hidden">
              {/* Önizleme */}
              <div className="relative">
                {previewType === 'image' && (
                  <img 
                    src={proofFile.fileUrl} 
                    alt="Egzersiz kanıtı" 
                    className="w-full h-60 object-contain"
                  />
                )}
                
                {previewType === 'video' && (
                  <video 
                    ref={videoRef}
                    src={proofFile.fileUrl} 
                    controls
                    className="w-full h-60"
                  />
                )}
                
                {/* Dosya kaldırma butonu */}
                <button
                  onClick={clearPreview}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Dosyayı kaldır"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
              
              {/* Dosya bilgileri */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm truncate flex-1">
                    <p className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {proofFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full px-2 py-1 flex items-center">
                    <FiCheck className="mr-1" size={12} /> Hazır
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Modal Alt Kısmı */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={() => {
              clearPreview();
              onClose();
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!proofFile || isUploading}
            className={`px-4 py-2 bg-primary text-white rounded-md transition-colors flex items-center ${
              !proofFile || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'
            }`}
          >
            <FiCheck className="mr-1" /> Tamamlandı Olarak İşaretle
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseProofModal; 