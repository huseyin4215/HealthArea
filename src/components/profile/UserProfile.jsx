import { useState, useEffect } from 'react';
import { getUsers, updateUser } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user, updateUserData } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updatedUser = await updateUser(user._id, userData);
      updateUserData(updatedUser);
      setMessage('Profil başarıyla güncellendi!');
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
    <div className="user-profile">
      <h2>Kullanıcı Profili</h2>
      
      {message && <div className={message.includes('Hata') ? 'error-message' : 'success-message'}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Ad Soyad:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">E-posta:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="age">Yaş:</label>
          <input
            type="number"
            id="age"
            name="age"
            value={userData.age}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="height">Boy (cm):</label>
          <input
            type="number"
            id="height"
            name="height"
            value={userData.height}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="weight">Kilo (kg):</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={userData.weight}
            onChange={handleChange}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
