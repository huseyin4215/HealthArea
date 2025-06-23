import { useState, useEffect } from 'react';
import { getUserHealthData, deleteHealthData, updateHealthData } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

const HealthDataList = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ value: '', notes: '' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHealthData();
    }
  }, [user]);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const data = await getUserHealthData(user._id);
      setHealthData(data);
      setError('');
    } catch (err) {
      setError('Sağlık verileri yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu sağlık verisini silmek istediğinize emin misiniz?')) {
      try {
        await deleteHealthData(id);
        // Veriyi silindikten sonra listeyi güncelle
        setHealthData(prevData => prevData.filter(item => item._id !== id));
      } catch (err) {
        setError('Sağlık verisi silinirken bir hata oluştu');
        console.error(err);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditForm({ value: item.value, notes: item.notes || '' });
    setEditError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      await updateHealthData(editingItem._id, { ...editingItem, value: editForm.value, notes: editForm.notes });
      await fetchHealthData();
      setEditingItem(null);
    } catch (err) {
      setEditError('Güncelleme sırasında hata oluştu');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredData = filterType 
    ? healthData.filter(item => item.type === filterType)
    : healthData;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="health-data-list">
      <h2>Sağlık Verilerim</h2>
      
      <div className="filter-controls">
        <label htmlFor="filter">Veri Tipine Göre Filtrele:</label>
        <select 
          id="filter" 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Tümü</option>
          <option value="weight">Kilo</option>
          <option value="bloodPressure">Tansiyon</option>
          <option value="bloodSugar">Kan Şekeri</option>
          <option value="exercise">Egzersiz</option>
          <option value="sleep">Uyku</option>
        </select>
      </div>

      {filteredData.length === 0 ? (
        <p>Kayıtlı sağlık verisi bulunamadı.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Tip</th>
              <th>Değer</th>
              <th>Notlar</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item._id}>
                <td>{formatDate(item.date)}</td>
                <td>
                  {item.type === 'weight' && 'Kilo'}
                  {item.type === 'bloodPressure' && 'Tansiyon'}
                  {item.type === 'bloodSugar' && 'Kan Şekeri'}
                  {item.type === 'exercise' && 'Egzersiz'}
                  {item.type === 'sleep' && 'Uyku'}
                </td>
                <td>
                  {item.type === 'weight' && `${item.value} kg`}
                  {item.type === 'bloodPressure' && `${item.value} mmHg`}
                  {item.type === 'bloodSugar' && `${item.value} mg/dL`}
                  {item.type === 'exercise' && `${item.value} dakika`}
                  {item.type === 'sleep' && `${item.value} saat`}
                </td>
                <td>{item.notes}</td>
                <td>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(item._id)}
                  >
                    Sil
                  </button>
                  <button 
                    className="edit-btn ml-2" 
                    onClick={() => handleEdit(item)}
                  >
                    Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingItem && (
        <div className="edit-modal">
          <form onSubmit={handleEditSubmit} className="edit-form">
            <h3>Düzenle</h3>
            <div>
              <label>Değer:</label>
              <input
                name="value"
                type="number"
                value={editForm.value}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label>Notlar:</label>
              <input
                name="notes"
                type="text"
                value={editForm.notes}
                onChange={handleEditChange}
              />
            </div>
            {editError && <div className="error-message">{editError}</div>}
            <button type="submit" disabled={editLoading}>
              {editLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button type="button" onClick={() => setEditingItem(null)}>
              İptal
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HealthDataList;
