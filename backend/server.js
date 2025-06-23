// Express.js ve MongoDB modülleri
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const crypto = require('crypto');

// Express uygulamamızı oluştur
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB bağlantı bilgileri
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = "healthTrackingDB";

// MongoDB'ye bağlanma fonksiyonu
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("MongoDB'ye başarıyla bağlandı!");
    
    // Veritabanını oluştur (yoksa)
    const db = client.db(dbName);
    
    // Koleksiyonları oluştur (yoksa)
    await db.createCollection('users');
    await db.createCollection('healthData');
    await db.createCollection('exercises');
    await db.createCollection('medications');
    
    console.log(`${dbName} veritabanı ve koleksiyonlar oluşturuldu/kontrol edildi`);
    
    return db;
  } catch (error) {
    console.error("MongoDB bağlantı hatası:", error);
    return null;
  }
}

// Şifre hashleme fonksiyonu
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Middleware to get user from token
const getUserFromToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Yetkilendirme hatası: Token bulunamadı' });
        }

        const db = await connectToMongoDB();
        if (!db) {
            return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
        }

        const usersCollection = db.collection('users');
        
        let matchedUser = null;
        const users = await usersCollection.find({}).toArray();
        for (const u of users) {
            const userToken = crypto.createHash('sha256').update(u._id.toString()).digest('hex');
            if (token === userToken) {
                matchedUser = u;
                break;
            }
        }

        if (!matchedUser) {
            return res.status(401).json({ error: 'Geçersiz token. Lütfen tekrar giriş yapın.' });
        }

        req.user = matchedUser;
        next();
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

// Kullanıcı kayıt endpoint'i
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, age, height, weight, gender, activityLevel } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tüm zorunlu alanları doldurun' });
    }
    
    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    
    const usersCollection = db.collection('users');
    
    // E-posta kontrolü
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
    }
    
    // Şifreyi hashle
    const hashedPassword = hashPassword(password);
    
    // Kullanıcıyı kaydet
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      age: age || null,
      height: height || null,
      weight: weight || null,
      gender: gender || 'male',
      activityLevel: activityLevel || 'moderate',
      points: 0, // Başlangıç puanı
      avatarUrl: null,
      createdAt: new Date(),
      role: 'user',
      friends: [], // Arkadaş listesi
      friendRequests: [], // Arkadaşlık istekleri
      medications: [], // İlaçlar
      currentStreak: 0, // Günlük seri
      lastActiveDate: null // Son aktif olunan gün
    });
    
    if (!result.acknowledged) {
      return res.status(500).json({ error: 'Kullanıcı kaydedilemedi' });
    }
    
    // Kullanıcı ID'si ile token oluştur - tutarlı doğrulama için
    const token = crypto.createHash('sha256').update(result.insertedId.toString()).digest('hex');
    
    // Yeni oluşturulan kullanıcıyı getir (password olmadan)
    const newUser = await usersCollection.findOne(
      { _id: result.insertedId },
      { projection: { password: 0 } }
    );
    
    // Kullanıcı ID'sini string'e çevir
    const userResponse = {
      ...newUser,
      _id: newUser._id.toString(),
      currentStreak: newUser.currentStreak || 0,
      lastActiveDate: newUser.lastActiveDate || null
    };
    
    res.status(201).json({
      message: 'Kullanıcı başarıyla kaydedildi',
      token: token,
      user: userResponse
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı streak ve lastActiveDate güncelleme fonksiyonu
async function updateUserStreakAndActivity(userId) {
  const db = await connectToMongoDB();
  if (!db) return;
  const usersCollection = db.collection('users');
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  let newStreak = user.currentStreak || 0;

  if (lastActive) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (lastActive.getTime() < yesterday.getTime()) {
      // If the last active day is before yesterday, reset streak to 1
      newStreak = 1;
    } else if (lastActive.getTime() === yesterday.getTime()) {
      // If the last active day was yesterday, increment streak
      newStreak += 1;
    }
    // If last active was today, do nothing.
  } else {
    // If there's no last active date, start the streak
    newStreak = 1;
  }

  await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { currentStreak: newStreak, lastActiveDate: today } }
  );
  
  console.log(`User ${userId} streak updated to ${newStreak}`);
}

// Giriş endpoint'i
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre gerekli' });
    }
    
    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    
    const usersCollection = db.collection('users');
    
    // Kullanıcıyı bul
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }
    
    // Şifreyi kontrol et
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }
    
    // Kullanıcı ID'si ile token oluştur - tutarlı doğrulama için
    const token = crypto.createHash('sha256').update(user._id.toString()).digest('hex');
    
    // Hassas bilgileri kaldır
    const { password: _, ...userWithoutPassword } = user;
    
    // Kullanıcı ID'sini string'e çevir
    const userResponse = {
      ...userWithoutPassword,
      _id: userWithoutPassword._id.toString(),
      currentStreak: userWithoutPassword.currentStreak || 0,
      lastActiveDate: userWithoutPassword.lastActiveDate || null
    };
    
    res.json({
      message: 'Giriş başarılı',
      token: token,
      user: userResponse
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Token ile kullanıcı bilgilerini getirme endpoint'i
app.get('/api/auth/me', getUserFromToken, async (req, res) => {
  try {
    // getUserFromToken middleware'i kullanıcıyı req.user'a ekler
    const { password, ...userWithoutPassword } = req.user;
    
    const userResponse = {
      ...userWithoutPassword,
      _id: userWithoutPassword._id.toString(),
      currentStreak: userWithoutPassword.currentStreak || 0,
      lastActiveDate: userWithoutPassword.lastActiveDate || null
    };
    
    res.json({
      user: userResponse
    });
  } catch (error) {
    console.error('Kullanıcı bilgileri getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Arkadaşlık isteği gönder
app.post('/api/friends/request', getUserFromToken, async (req, res) => {
  try {
    const { friendEmail } = req.body;
    const sender = req.user;

    if (!friendEmail) {
      return res.status(400).json({ error: 'Arkadaş e-posta adresi gerekli' });
    }
    
    const db = await connectToMongoDB();
    if (!db) {
        return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    const usersCollection = db.collection('users');

    // İstek gönderilecek kullanıcıyı bul
    const receiver = await usersCollection.findOne({ email: friendEmail });
    if (!receiver) {
      return res.status(404).json({ error: 'Arkadaş olarak eklemek istediğiniz kullanıcı bulunamadı' });
    }
    
    // Kendisine istek göndermeye çalışıyor mu?
    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).json({ error: 'Kendinize arkadaşlık isteği gönderemezsiniz' });
    }
    
    // Zaten arkadaş mı?
    if (receiver.friends && receiver.friends.some(id => id.toString() === sender._id.toString())) {
      return res.status(400).json({ error: 'Bu kullanıcı zaten arkadaşınız' });
    }
    
    // Zaten istek gönderilmiş mi?
    if (receiver.friendRequests && receiver.friendRequests.some(req => req.from.toString() === sender._id.toString())) {
      return res.status(400).json({ error: 'Bu kullanıcıya zaten bir arkadaşlık isteği gönderdiniz' });
    }
    
    // Arkadaşlık isteği oluştur
    const friendRequest = {
      from: sender._id,
      fromName: sender.name,
      fromEmail: sender.email,
      fromAvatar: sender.avatarUrl || null,
      date: new Date()
    };
    
    // Alıcının friendRequests dizisine isteği ekle
    await usersCollection.updateOne(
      { _id: receiver._id },
      { $push: { friendRequests: friendRequest } }
    );
    
    res.status(200).json({ message: 'Arkadaşlık isteği başarıyla gönderildi' });
  } catch (error) {
    console.error('Arkadaşlık isteği gönderme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Arkadaşlık isteklerini getir
app.get('/api/friends/requests', getUserFromToken, async (req, res) => {
  try {
    res.status(200).json(req.user.friendRequests || []);
  } catch (error) {
    console.error('Arkadaşlık isteklerini getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Arkadaşlık isteğini kabul et
app.post('/api/friends/accept', getUserFromToken, async (req, res) => {
  try {
    const { requestId } = req.body; // requestId, isteği gönderenin ID'sidir
    const user = req.user;

    if (!requestId) {
      return res.status(400).json({ error: 'İstek ID gerekli' });
    }
    
    const db = await connectToMongoDB();
    if (!db) {
        return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    const usersCollection = db.collection('users');

    // İsteği bul
    const request = user.friendRequests?.find(req => req.from.toString() === requestId);
    if (!request) {
      return res.status(404).json({ error: 'Arkadaşlık isteği bulunamadı' });
    }
    
    // İstek gönderen kullanıcıyı bul
    const sender = await usersCollection.findOne({ _id: new ObjectId(requestId) });
    if (!sender) {
      return res.status(404).json({ error: 'İstek gönderen kullanıcı bulunamadı' });
    }
    
    // Her iki kullanıcının arkadaş listesine ekle
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $push: { friends: sender._id },
        $pull: { friendRequests: { from: new ObjectId(requestId) } }
      }
    );
    
    await usersCollection.updateOne(
      { _id: sender._id },
      { $push: { friends: user._id } }
    );
    
    res.status(200).json({ message: 'Arkadaşlık isteği kabul edildi' });
  } catch (error) {
    console.error('Arkadaşlık isteği kabul hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Arkadaşlık isteğini reddet
app.post('/api/friends/reject', getUserFromToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    const user = req.user;

    if (!requestId) {
      return res.status(400).json({ error: 'İstek ID gerekli' });
    }
    
    const db = await connectToMongoDB();
    if (!db) {
        return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    const usersCollection = db.collection('users');
    
    // İsteği sil
    await usersCollection.updateOne(
      { _id: user._id },
      { $pull: { friendRequests: { from: new ObjectId(requestId) } } }
    );
    
    res.status(200).json({ message: 'Arkadaşlık isteği reddedildi' });
  } catch (error) {
    console.error('Arkadaşlık isteği reddetme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Arkadaş listesini getir
app.get('/api/friends', getUserFromToken, async (req, res) => {
  try {
    const user = req.user;
    
    const db = await connectToMongoDB();
    if (!db) {
        return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    const usersCollection = db.collection('users');

    // Arkadaş listesi boşsa boş dizi döndür
    if (!user.friends || user.friends.length === 0) {
      return res.status(200).json([]);
    }
    
    // Arkadaşların detaylı bilgilerini getir
    const friendIds = user.friends.map(id => new ObjectId(id));
    const friends = await usersCollection.find(
      { _id: { $in: friendIds } },
      { projection: { password: 0 } }
    ).toArray();
    
    // ID'leri string'e çevir
    const friendsResponse = friends.map(friend => ({
      ...friend,
      _id: friend._id.toString()
    }));
    
    res.status(200).json(friendsResponse);
  } catch (error) {
    console.error('Arkadaş listesi getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı profil güncelleme endpoint'i
app.put('/api/users/:id', getUserFromToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Sadece kendi profilini güncelleyebilmesini sağla
    if (req.user._id.toString() !== id) {
        return res.status(403).json({ error: 'Bu işlemi yapmaya yetkiniz yok' });
    }

    const { name, email, age, height, weight, gender, activityLevel } = req.body;
    
    if (!name && !email && !age && !height && !weight && !gender && !activityLevel) {
      return res.status(400).json({ 
        error: 'Güncellenecek en az bir alan gerekli',
        success: false 
      });
    }
    
    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ 
        error: 'Veritabanı bağlantı hatası',
        success: false 
      });
    }
    
    const usersCollection = db.collection('users');
    
    // Güncellenecek alanları hazırla
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (age !== undefined) updateFields.age = parseInt(age);
    if (height !== undefined) updateFields.height = parseFloat(height);
    if (weight !== undefined) updateFields.weight = parseFloat(weight);
    if (gender) updateFields.gender = gender;
    if (activityLevel) updateFields.activityLevel = activityLevel;
    
    // Kullanıcıyı güncelle
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Güncellenmiş kullanıcıyı getir
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );
    
    // Kullanıcı ID'sini string'e çevir
    const userResponse = {
      ...updatedUser,
      _id: updatedUser._id.toString(),
      currentStreak: updatedUser.currentStreak || 0,
      lastActiveDate: updatedUser.lastActiveDate || null
    };
    
    res.json({
      message: 'Kullanıcı profili güncellendi',
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({ error: 'Kullanıcı güncellenirken bir hata oluştu' });
  }
});

// Kullanıcının avatarını güncelle
app.put('/api/users/:id/avatar', getUserFromToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { avatarUrl } = req.body;

    if (req.user._id.toString() !== id) {
        return res.status(403).json({ error: 'Bu işlemi yapmaya yetkiniz yok' });
    }
    
    if (!avatarUrl) {
      return res.status(400).json({ error: 'Avatar URL gerekli' });
    }
    
    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    
    const usersCollection = db.collection('users');
    
    // Avatar URL'sini güncelle
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { avatarUrl } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    res.json({
      message: 'Avatar güncellendi',
      avatarUrl
    });
  } catch (error) {
    console.error('Avatar güncelleme hatası:', error);
    res.status(500).json({ error: 'Avatar güncellenirken bir hata oluştu' });
  }
});

// Yeni egzersiz kaydı ekle
app.post('/api/exercises', getUserFromToken, async (req, res) => {
  try {
    const { name, type, duration, date, notes, points: reqPoints } = req.body;
    const userId = req.user._id;
    const points = typeof reqPoints === 'number' ? reqPoints : 10; // Frontend'den gelen puan varsa onu kullan

    if ( !name || !type || !duration) {
      return res.status(400).json({ error: 'Tüm zorunlu alanları doldurun' });
    }
    
    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    
    const exercisesCollection = db.collection('exercises');
    const usersCollection = db.collection('users');
    
    const result = await exercisesCollection.insertOne({
      userId: new ObjectId(userId),
      name,
      type,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      points,
      createdAt: new Date()
    });
    
    if (!result.acknowledged) {
      return res.status(500).json({ error: 'Egzersiz kaydı eklenemedi' });
    }

    // Puan ekle
    await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $inc: { points: points } }
    );
    
    res.status(201).json({
      message: 'Egzersiz kaydı eklendi',
      exerciseId: result.insertedId
    });
  } catch (error) {
    console.error('Egzersiz ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcının egzersiz kayıtlarını getir
app.get('/api/exercises', getUserFromToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    
    const exercisesCollection = db.collection('exercises');
    
    const exercises = await exercisesCollection.find({
      userId: new ObjectId(userId)
    }).sort({ date: -1 }).toArray();
    
    res.json(exercises);
  } catch (error) {
    console.error('Egzersiz kayıtlarını getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Egzersiz kaydını sil
app.delete('/api/exercises/:id', getUserFromToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    
    const exercisesCollection = db.collection('exercises');
    
    // Egzersiz kaydını sil
    const result = await exercisesCollection.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Egzersiz kaydı bulunamadı veya bu kaydı silme yetkiniz yok' });
    }
    
    res.json({ message: 'Egzersiz kaydı silindi' });
  } catch (error) {
    console.error('Egzersiz silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcıları getir
app.get('/api/users', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
    
    res.json(users);
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sağlık verisi ekle
app.post('/api/health-data', getUserFromToken, async (req, res) => {
  try {
    const { type, value, date } = req.body;
    const userId = req.user._id;

    if (!type || !value) {
      return res.status(400).json({ error: 'Tip ve değer alanları zorunludur' });
    }

    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }

    const healthDataCollection = db.collection('healthData');
    const usersCollection = db.collection('users');
    
    const result = await healthDataCollection.insertOne({
      userId: new ObjectId(userId),
      type,
      value,
      date: date ? new Date(date) : new Date(),
      createdAt: new Date()
    });

    // Kullanıcıya 5 puan ekle
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { points: 5 } }
    );
    
    // Sağlık verisi eklendiğinde seriyi güncelle
    await updateUserStreakAndActivity(userId.toString());

    res.status(201).json({ 
      message: 'Sağlık verisi başarıyla eklendi', 
      data: result.ops?.[0] || { _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Sağlık verisi ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcının sağlık verilerini getir
app.get('/api/health-data', getUserFromToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    
    const healthDataCollection = db.collection('healthData');
    
    const healthData = await healthDataCollection.find({
      userId: new ObjectId(userId)
    }).sort({ date: -1 }).toArray();
    
    res.json(healthData);
  } catch (error) {
    console.error('Sağlık verilerini getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sağlık verisi sil
app.delete('/api/health-data/:id', getUserFromToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    
    const healthDataCollection = db.collection('healthData');
    
    const result = await healthDataCollection.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Sağlık verisi bulunamadı veya bu kaydı silme yetkiniz yok' });
    }
    
    res.json({ message: 'Sağlık verisi silindi' });
  } catch (error) {
    console.error('Sağlık verisi silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sağlık verisi güncelle
app.put('/api/health-data/:id', getUserFromToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { type, value, date, notes, sleepQuality, mood, stressLevel } = req.body;

    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    const healthDataCollection = db.collection('healthData');

    // Sadece kendi kaydını güncelleyebilsin
    const existing = await healthDataCollection.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    if (!existing) {
      return res.status(404).json({ error: 'Kayıt bulunamadı veya yetkiniz yok' });
    }

    // Güncellenecek alanları hazırla
    const updateFields = {};
    if (type) updateFields.type = type;
    if (value !== undefined) updateFields.value = value;
    if (date) updateFields.date = new Date(date);
    if (notes !== undefined) updateFields.notes = notes;
    if (sleepQuality !== undefined) updateFields.sleepQuality = sleepQuality;
    if (mood !== undefined) updateFields.mood = mood;
    if (stressLevel !== undefined) updateFields.stressLevel = stressLevel;

    const result = await healthDataCollection.updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }

    const updated = await healthDataCollection.findOne({ _id: new ObjectId(id) });
    res.json({ message: 'Kayıt güncellendi', healthData: updated });
  } catch (error) {
    console.error('Sağlık verisi güncelleme hatası:', error);
    res.status(500).json({ error: 'Kayıt güncellenirken bir hata oluştu' });
  }
});

// İlaçları getir
app.get('/api/medications', getUserFromToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const db = await connectToMongoDB();
    if (!db) return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    const medicationsCollection = db.collection('medications');
    const medications = await medicationsCollection.find({ userId: userId.toString() }).toArray();
    res.json(medications);
  } catch (error) {
    console.error('İlaçları getirme hatası:', error);
    res.status(500).json({ error: 'İlaçlar getirilemedi' });
  }
});

// İlaç ekle
app.post('/api/medications', getUserFromToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const db = await connectToMongoDB();
    if (!db) return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    const medicationsCollection = db.collection('medications');
    const usersCollection = db.collection('users');
    const { name, dosage, frequency, time, remainingDays, notes, isActive } = req.body;
    if (!name || !dosage) return res.status(400).json({ error: 'İlaç adı ve dozajı zorunludur.' });
    const newMed = {
      userId: userId.toString(),
      name,
      dosage,
      frequency: frequency || 'Günde 1 kez',
      time: time || '',
      remainingDays: remainingDays || 30,
      notes: notes || '',
      isActive: isActive !== undefined ? isActive : true,
      lastTaken: null,
      createdAt: new Date()
    };
    const result = await medicationsCollection.insertOne(newMed);
    // Puan ekle
    await usersCollection.updateOne({ _id: userId }, { $inc: { points: 5 } });
    // Streak ve lastActiveDate güncelle
    await updateUserStreakAndActivity(userId);
    res.status(201).json({ ...newMed, _id: result.insertedId });
  } catch (error) {
    console.error('İlaç ekleme hatası:', error);
    res.status(500).json({ error: 'İlaç eklenemedi' });
  }
});

// İlaç güncelle
app.put('/api/medications/:id', getUserFromToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const db = await connectToMongoDB();
    if (!db) return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    const medicationsCollection = db.collection('medications');
    const usersCollection = db.collection('users');
    const updateFields = { ...req.body };
    // Sadece kendi ilacını güncelleyebilsin
    const result = await medicationsCollection.updateOne(
      { _id: new ObjectId(id), userId: userId.toString() },
      { $set: updateFields }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'İlaç bulunamadı veya yetkiniz yok' });
    // Puan ekle
    await usersCollection.updateOne({ _id: userId }, { $inc: { points: 2 } });
    const updated = await medicationsCollection.findOne({ _id: new ObjectId(id) });
    res.json(updated);
  } catch (error) {
    console.error('İlaç güncelleme hatası:', error);
    res.status(500).json({ error: 'İlaç güncellenemedi' });
  }
});

// İlaç sil
app.delete('/api/medications/:id', getUserFromToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const db = await connectToMongoDB();
    if (!db) return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    const medicationsCollection = db.collection('medications');
    const usersCollection = db.collection('users');
    const result = await medicationsCollection.deleteOne({ _id: new ObjectId(id), userId: userId.toString() });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'İlaç bulunamadı veya yetkiniz yok' });
    // Puan azalt
    await usersCollection.updateOne({ _id: userId }, { $inc: { points: -1 } });
    res.json({ message: 'İlaç silindi' });
  } catch (error) {
    console.error('İlaç silme hatası:', error);
    res.status(500).json({ error: 'İlaç silinemedi' });
  }
});

// Kullanıcı puanını güncelle (increment)
app.patch('/api/users/:id/points', getUserFromToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    if (typeof amount !== 'number') {
      return res.status(400).json({ error: 'Geçersiz puan miktarı' });
    }
    // Sadece kendi puanını güncelleyebilsin
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'Bu işlemi yapmaya yetkiniz yok' });
    }
    const db = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ error: 'Veritabanı bağlantı hatası' });
    }
    const usersCollection = db.collection('users');
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { points: amount } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    // Güncellenmiş kullanıcıyı getir
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );
    res.json({
      message: 'Puan güncellendi',
      user: updatedUser
    });
  } catch (error) {
    console.error('Puan güncelleme hatası:', error);
    res.status(500).json({ error: 'Puan güncellenirken bir hata oluştu' });
  }
});

// MongoDB'ye bağlan ve sunucuyu başlat
async function startServer() {
  try {
    await client.connect();
    console.log('MongoDB bağlantısı kuruldu');
    
    // Server'ı başlat
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server ${PORT} portunda çalışıyor`);
    });
    
    // Uygulama kapatıldığında MongoDB bağlantısını kapat
    process.on('SIGINT', async () => {
      await client.close();
      console.log('MongoDB bağlantısı kapatıldı');
      process.exit(0);
    });
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
}

// Sunucuyu başlat
startServer();
