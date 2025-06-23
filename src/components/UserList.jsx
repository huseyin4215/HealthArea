import React, { useState, useEffect } from 'react';
import { getUsers, registerUser } from '../api/userApi';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', age: '' });

  // Kullanıcı verilerini yükle
  useEffect(() => {
    fetchUsers();
  }, []);

  // Kullanıcı verilerini getir
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Kullanıcı verileri yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Form değişikliklerini işle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  // Yeni kullanıcı ekle
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      const userToAdd = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        age: newUser.age ? parseInt(newUser.age, 10) : null
      };
      
      await registerUser(userToAdd);
      setNewUser({ name: '', email: '', password: '', age: '' });
      fetchUsers(); // Listeyi yenile
      setError(null);
    } catch (err) {
      setError('Kullanıcı eklenirken bir hata oluştu: ' + err.message);
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;

  return (
    <div className="user-list-container">
      <h2>Kullanıcı Listesi</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleAddUser} className="user-form">
        <div className="form-group">
          <label htmlFor="name">Ad Soyad:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newUser.name}
            onChange={handleInputChange}
            placeholder="Ad Soyad"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">E-posta:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={newUser.email}
            onChange={handleInputChange}
            placeholder="E-posta adresi"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Şifre:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={newUser.password}
            onChange={handleInputChange}
            placeholder="Şifre"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="age">Yaş:</label>
          <input
            type="number"
            id="age"
            name="age"
            value={newUser.age}
            onChange={handleInputChange}
            placeholder="Yaş"
          />
        </div>
        
        <button type="submit">Kullanıcı Ekle</button>
      </form>
      
      {users.length === 0 ? (
        <p>Henüz kullanıcı bulunmuyor.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ad Soyad</th>
              <th>E-posta</th>
              <th>Yaş</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id || user.id}>
                <td>{user._id || user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserList;
