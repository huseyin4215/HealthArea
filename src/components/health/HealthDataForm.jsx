import { useState } from 'react';
import { addHealthData } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HealthDataForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'weight',
    value: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Kullanıcı ID'sini ekle
      const healthDataWithUser = {
        ...formData,
        userId: user._id
      };

      await addHealthData(healthDataWithUser);
      setMessage('Sağlık verisi başarıyla kaydedildi!');
      
      // Formu sıfırla
      setFormData({
        type: 'weight',
        value: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      // Kısa bir süre sonra sağlık verileri listesine yönlendir
      setTimeout(() => {
        navigate('/health-data');
      }, 2000);
    } catch (error) {
      setMessage(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Lütfen giriş yapın</div>;
  }

  return (
    <div className="health-data-form">
      <h2>Sağlık Verisi Ekle</h2>
      
      {message && <div className={message.includes('Hata') ? 'error-message' : 'success-message'}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Veri Tipi:</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="weight">Kilo</option>
            <option value="bloodPressure">Tansiyon</option>
            <option value="bloodSugar">Kan Şekeri</option>
            <option value="exercise">Egzersiz</option>
            <option value="sleep">Uyku</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="value">Değer:</label>
          <input
            type="text"
            id="value"
            name="value"
            value={formData.value}
            onChange={handleChange}
            required
            placeholder={
              formData.type === 'weight' ? 'Kilogram cinsinden' :
              formData.type === 'bloodPressure' ? 'mmHg cinsinden (örn: 120/80)' :
              formData.type === 'bloodSugar' ? 'mg/dL cinsinden' :
              formData.type === 'exercise' ? 'Dakika cinsinden' :
              'Saat cinsinden'
            }
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Tarih:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Notlar:</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Ek bilgiler..."
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
};

export default HealthDataForm;
