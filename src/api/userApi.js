// API servisi
// Backend sunucusunun çalıştığı port numarasını kullan
// Eğer backend sunucusu farklı bir portta çalışıyorsa, bu değeri güncelleyin
const API_URL = 'http://localhost:5000/api';



// Kimlik doğrulama (Auth) servisleri

// Kullanıcı kaydı
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Kayıt başarısız');
    }
    
    return response.json();
  } catch (error) {
    console.error('Kayıt hatası:', error);
    throw error;
  }
};

// Kullanıcı girişi
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Giriş başarısız');
    }
    
    return response.json();
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw error;
  }
};

// Kullanıcı servisleri

// Token ile kullanıcı bilgilerini getir
export const getUserByToken = async (token) => {
  // Eğer token parametresi yoksa localStorage'dan al
  if (!token) {
    token = localStorage.getItem('token');
  }
  if (!token) {
    throw new Error('Oturum bilgisi bulunamadı');
  }
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Kullanıcı bilgileri getirilemedi');
    }
    
    return response.json();
  } catch (error) {
    console.error('Kullanıcı bilgilerini getirme hatası:', error);
    throw error;
  }
};

// Token ile kullanıcı profil bilgilerini getir
export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Profil bilgileri getirilemedi');
    }
    
    return response.json();
  } catch (error) {
    console.error('Profil bilgileri getirme hatası:', error);
    throw error;
  }
};

// Tüm kullanıcıları getir
export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`);
    
    if (!response.ok) {
      throw new Error('Kullanıcılar getirilemedi');
    }
    
    return response.json();
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    throw error;
  }
};



// Kullanıcı profilini güncelle
export const updateUser = async (userData) => {
  try {
    const { id } = userData;
    console.log('Profil güncelleniyor:', userData);
    
    // Token'i localStorage'dan al
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token bulunamadı');
      return { success: false, message: 'Oturum bilgisi bulunamadı' };
    }
    
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Profil güncelleme yanıt hatası:', errorData);
      return { success: false, message: errorData.error || 'Kullanıcı güncellenemedi' };
    }
    
    const data = await response.json();
    console.log('Profil güncelleme başarılı:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return { success: false, message: error.message || 'Bir hata oluştu' };
  }
};

// Sağlık verileri servisleri

// Kullanıcının sağlık verilerini getir
export const getHealthData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Oturum bilgisi bulunamadı');
    }

    const response = await fetch(`${API_URL}/health-data`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Sağlık verileri getirilemedi');
    }
    
    return response.json();
  } catch (error) {
    console.error('Sağlık verilerini getirme hatası:', error);
    throw error;
  }
};

// Sağlık verisi ekle
export const addHealthData = async (healthData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Oturum bilgisi bulunamadı');
    }

    const response = await fetch(`${API_URL}/health-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(healthData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Sağlık verisi eklenemedi');
    }
    
    return response.json();
  } catch (error) {
    console.error('Sağlık verisi ekleme hatası:', error);
    throw error;
  }
};

// Egzersiz kayıtları servisleri

// Egzersiz kaydı ekle
export const addExercise = async (exerciseData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Oturum bilgisi bulunamadı');
    }

    const response = await fetch(`${API_URL}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(exerciseData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Egzersiz kaydı eklenemedi');
    }
    
    return response.json();
  } catch (error) {
    console.error('Egzersiz kaydı ekleme hatası:', error);
    throw error;
  }
};

// Kullanıcının egzersiz kayıtlarını getir
export const getUserExercises = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('getUserExercises: Token bulunamadı');
      throw new Error('Oturum bilgisi bulunamadı');
    }
    
    const response = await fetch(`${API_URL}/exercises`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Egzersiz kayıtları getirme yanıt hatası:', response.status, errorText);
      throw new Error('Egzersiz kayıtları getirilemedi');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Egzersiz kayıtlarını getirme hatası:', error);
    throw error;
  }
};

// Egzersiz kaydı sil
export const deleteExercise = async (id) => {
  try {
    const response = await fetch(`${API_URL}/exercises/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Egzersiz kaydı silinemedi');
    }
    
    return response.json();
  } catch (error) {
    console.error('Egzersiz kaydı silme hatası:', error);
    throw error;
  }
};

// Avatar güncelleme
export const updateAvatar = async (userId, avatarUrl) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/avatar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatarUrl }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Avatar güncellenemedi');
    }
    
    return response.json();
  } catch (error) {
    console.error('Avatar güncelleme hatası:', error);
    throw error;
  }
};

// Kullanıcının sağlık verilerini getir
export const getUserHealthData = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/health-data/${userId}`);
    
    if (!response.ok) {
      throw new Error('Sağlık verileri getirilemedi');
    }
    
    return response.json();
  } catch (error) {
    console.error('Sağlık verilerini getirme hatası:', error);
    throw error;
  }
};

// Belirli türdeki sağlık verilerini getir
export const getHealthDataByType = async (type, userId = null) => {
  try {
    let url = `${API_URL}/health-data/type/${type}`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Sağlık verileri getirilemedi');
    }
    
    return response.json();
  } catch (error) {
    console.error('Sağlık verilerini getirme hatası:', error);
    throw error;
  }
};

// Sağlık verisi sil
export const deleteHealthData = async (id) => {
  try {
    const response = await fetch(`${API_URL}/health-data/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Sağlık verisi silinemedi');
    }
    
    return response.json();
  } catch (error) {
    console.error('Sağlık verisi silme hatası:', error);
    throw error;
  }
};

// İlaç servisleri
export const getMedications = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Oturum bilgisi bulunamadı');
    const response = await fetch(`${API_URL}/medications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('İlaçlar getirilemedi');
    return response.json();
  } catch (error) {
    console.error('İlaçları getirme hatası:', error);
    throw error;
  }
};

export const addMedication = async (medicationData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Oturum bilgisi bulunamadı');
    const response = await fetch(`${API_URL}/medications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(medicationData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'İlaç eklenemedi');
    }
    return response.json();
  } catch (error) {
    console.error('İlaç ekleme hatası:', error);
    throw error;
  }
};

export const updateMedication = async (id, taken) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Oturum bilgisi bulunamadı');
    const response = await fetch(`${API_URL}/medications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ taken })
    });
    if (!response.ok) throw new Error('İlaç güncellenemedi');
    return response.json();
  } catch (error) {
    console.error('İlaç güncelleme hatası:', error);
    throw error;
  }
};

export const deleteMedication = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Oturum bilgisi bulunamadı');
    const response = await fetch(`${API_URL}/medications/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('İlaç silinemedi');
    return response.json();
  } catch (error) {
    console.error('İlaç silme hatası:', error);
    throw error;
  }
};

// Arkadaşlık isteklerini getir
export const getFriendRequests = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Oturum bilgisi bulunamadı');
    const response = await fetch(`${API_URL}/friends/requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Arkadaşlık istekleri getirilemedi');
    return response.json();
  } catch (error) {
    console.error('Arkadaşlık isteklerini getirme hatası:', error);
    throw error;
  }
};

// Arkadaşları getir
export const getFriends = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Oturum bilgisi bulunamadı');
    const response = await fetch(`${API_URL}/friends`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Arkadaşlar getirilemedi');
    return response.json();
  } catch (error) {
    console.error('Arkadaşları getirme hatası:', error);
    throw error;
  }
};

// Arkadaşlık isteği gönder
export const sendFriendRequest = async (friendEmail) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Oturum bilgisi bulunamadı');
    const response = await fetch(`${API_URL}/friends/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ friendEmail })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Arkadaşlık isteği gönderilemedi');
    }
    return response.json();
  } catch (error) {
    console.error('Arkadaşlık isteği gönderme hatası:', error);
    throw error;
  }
};

// Arkadaşlık isteğini kabul et
export const acceptFriendRequest = async (requestId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Oturum bilgisi bulunamadı');
    const response = await fetch(`${API_URL}/friends/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ requestId })
    });
    if (!response.ok) throw new Error('Arkadaşlık isteği kabul edilemedi');
    return response.json();
  } catch (error) {
    console.error('Arkadaşlık isteğini kabul etme hatası:', error);
    throw error;
  }
};

// Arkadaşlık isteğini reddet
export const rejectFriendRequest = async (requestId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Oturum bilgisi bulunamadı');
    const response = await fetch(`${API_URL}/friends/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ requestId })
    });
    if (!response.ok) throw new Error('Arkadaşlık isteği reddedilemedi');
    return response.json();
  } catch (error) {
    console.error('Arkadaşlık isteğini reddetme hatası:', error);
    throw error;
  }
};

// Sağlık verisi güncelle
export async function updateHealthData(id, data) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}/health-data/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Kayıt güncellenemedi')
  }
  return await res.json()
}

// Kullanıcıya puan ekle/güncelle
export const updateUserPoints = async (userId, amount) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Oturum bilgisi bulunamadı');
  const response = await fetch(`${API_URL}/users/${userId}/points`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Puan güncellenemedi');
  }
  return response.json();
}
