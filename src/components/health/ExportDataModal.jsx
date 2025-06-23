import { useState } from 'react';
import { FiDownload, FiX, FiFileText, FiActivity, FiFile, FiFilePlus } from 'react-icons/fi';
import { exportToExcel, exportToPDF, exportToWord } from '../../utils/exportUtils';

const ExportDataModal = ({ isOpen, onClose, healthData }) => {
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Dışa aktarma için verileri hazırla
  const prepareDataForExport = () => {
    return healthData.map(record => ({
      'Tarih': record.date,
      'Kilo': record.weight || '-',
      'Tansiyon': record.bloodPressure?.systolic && record.bloodPressure?.diastolic 
        ? `${record.bloodPressure.systolic}/${record.bloodPressure.diastolic}` 
        : '-',
      'KanŞekeri': record.bloodSugar || '-',
      'Nabız': record.heartRate || '-',
      'Uyku': record.sleepHours || '-',
      'RuhHali': getMoodText(record.mood) || '-',
      'AdımSayısı': record.stepCount || '-', // Adım sayısı eklendi
      'Notlar': record.notes || '-'
    }));
  };
  
  // Dışa aktar butonuna tıklandığında
  const handleExport = () => {
    if (healthData.length === 0) return;
    
    setExportLoading(true);
    const fileName = `saglik-verileri-${new Date().toISOString().slice(0, 10)}`;
    const preparedData = prepareDataForExport();
    
    // Tablo sütunları için
    const columns = [
      { header: 'Tarih', dataKey: 'Tarih' },
      { header: 'Kilo', dataKey: 'Kilo' },
      { header: 'Tansiyon', dataKey: 'Tansiyon' },
      { header: 'Kan Şekeri', dataKey: 'KanŞekeri' },
      { header: 'Nabız', dataKey: 'Nabız' },
      { header: 'Uyku', dataKey: 'Uyku' },
      { header: 'Ruh Hali', dataKey: 'RuhHali' },
      { header: 'Adım Sayısı', dataKey: 'AdımSayısı' }, // Adım sayısı sütunu
      { header: 'Notlar', dataKey: 'Notlar' }
    ];
    
    let exportResult = false;
    
    // Seçilen formata göre işlem yap
    switch (selectedFormat) {
      case 'excel':
        exportResult = exportToExcel(preparedData, fileName, 'Sağlık Kayıtları');
        break;
      case 'pdf':
        exportResult = exportToPDF(preparedData, fileName, 'Sağlık Verileri Raporu', columns);
        break;
      case 'word':
        exportResult = exportToWord(preparedData, fileName, 'Sağlık Verileri Raporu', columns);
        break;
      default:
        exportResult = false;
    }
    
    // İşlem sonucuna göre başarılı veya başarısız mesajı göster
    if (exportResult) {
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    }
    
    setExportLoading(false);
  };
  
  // Ruh hali metnini döndür
  const getMoodText = (mood) => {
    switch (mood) {
      case 'very_happy': return 'Çok iyi';
      case 'happy': return 'İyi';
      case 'neutral': return 'Normal';
      case 'sad': return 'Kötü';
      case 'very_sad': return 'Çok kötü';
      default: return 'Belirtilmemiş';
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-4 bg-primary text-white flex justify-between items-center">
          <h3 className="font-semibold text-lg flex items-center">
            <FiDownload className="mr-2" /> Sağlık Verilerini Dışa Aktar
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Sağlık verilerinizi dışa aktarmak için bir format seçin. Verileriniz, seçtiğiniz formatta bilgisayarınıza indirilecektir.
          </p>
          
          <div className="space-y-3 mb-6">
            <label className="inline-flex items-center">
              <input 
                type="radio"
                name="format"
                checked={selectedFormat === 'excel'}
                onChange={() => setSelectedFormat('excel')}
                className="form-radio text-primary h-5 w-5"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300 flex items-center">
                <FiFileText className="mr-2 text-green-600" /> Excel (.xlsx)
              </span>
            </label>
            
            <label className="inline-flex items-center">
              <input 
                type="radio"
                name="format"
                checked={selectedFormat === 'pdf'}
                onChange={() => setSelectedFormat('pdf')}
                className="form-radio text-primary h-5 w-5"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300 flex items-center">
                <FiFilePlus className="mr-2 text-red-600" /> PDF (.pdf)
              </span>
            </label>
            
            <label className="inline-flex items-center">
              <input 
                type="radio"
                name="format"
                checked={selectedFormat === 'word'}
                onChange={() => setSelectedFormat('word')}
                className="form-radio text-primary h-5 w-5"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300 flex items-center">
                <FiFile className="mr-2 text-blue-600" /> Word (.doc)
              </span>
            </label>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              İptal
            </button>
            
            <button
              onClick={handleExport}
              disabled={exportLoading || healthData.length === 0}
              className={`px-4 py-2 bg-primary text-white rounded-lg flex items-center transition-colors ${
                healthData.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'
              }`}
            >
              {exportLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Dışa Aktarılıyor...
                </>
              ) : (
                <>
                  <FiDownload className="mr-2" />
                  {selectedFormat === 'excel' ? 'Excel Olarak İndir' : 
                   selectedFormat === 'pdf' ? 'PDF Olarak İndir' : 
                   'Word Olarak İndir'}
                </>
              )}
            </button>
          </div>
          
          {exportSuccess && (
            <div className="mt-4 text-center text-green-600 dark:text-green-400 animate-pulse">
              Dosya başarıyla indirildi!
            </div>
          )}
          
          {healthData.length === 0 && (
            <div className="mt-4 text-center text-red-500 dark:text-red-400">
              Dışa aktarılacak veri bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportDataModal; 