# Sağlık Takip Uygulaması

Bu proje, kullanıcıların sağlık verilerini ve egzersiz geçmişini kolayca takip edebileceği, modern ve kullanıcı dostu bir web uygulamasıdır. Kullanıcılar; kilo, boy, tansiyon, kan şekeri, uyku, su tüketimi ve egzersiz gibi sağlık verilerini kaydedebilir, geçmiş verilerini görüntüleyebilir ve analiz edebilir.

## Özellikler
- Kullanıcı kaydı ve giriş sistemi
- Profil ve vücut ölçüleri yönetimi (kilo, boy, yaş, cinsiyet, aktivite seviyesi)
- Sağlık verisi ekleme, listeleme, düzenleme ve silme (kilo, tansiyon, kan şekeri, uyku, su tüketimi)
- Egzersiz geçmişi ve önerileri
- Günlük/haftalık sağlık ve egzersiz istatistikleri (grafiklerle)
- Arkadaş ekleme ve sosyal etkileşim
- İlaç takibi
- Karanlık/aydınlık tema desteği
- Puan ve ödül sistemi

## Kurulum

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/huseyin4215/HealthArea.git
cd HealthArea
```

### 2. Frontend Kurulumu
```bash
npm install
npm run dev
```

### 3. Backend Kurulumu
```bash
cd backend
npm install
npm run dev
```

> Not: Backend varsayılan olarak `localhost:5000` portunda çalışır. Gerekirse `backend/server.js` dosyasından portu değiştirebilirsiniz.

Veritabanı: MongoDB
Uygulama MongoDB veritabanı ile çalışmaktadır. Bağlantı için aşağıdaki adımları takip edin:

MongoDB Kurulumu
MongoDB Download Center üzerinden MongoDB Community Edition’ı indirin ve kurun.

MongoDB Compass uygulamasını indirerek veritabanınızı görsel olarak da yönetebilirsiniz.

MongoDB Bağlantısı
.env dosyasına aşağıdaki satırı ekleyin:

env
MONGO_URI=mongodb://localhost:27017/healtharea
Not: MONGO_URI değeri, MongoDB Compass veya terminal üzerinden çalıştırdığınız bağlantı URI’sine göre değişebilir.


## Kullanım
- Uygulamayı başlattıktan sonra tarayıcınızda `http://localhost:5173` adresine gidin.
- Kayıt olun veya giriş yapın.
- Profil bilgilerinizi tamamlayın.
- Sağlık verilerinizi ve egzersizlerinizi ekleyin, geçmişinizi görüntüleyin.

## Katkı
Katkıda bulunmak için lütfen bir fork oluşturun ve pull request gönderin.

## Lisans
Bu proje MIT lisansı ile lisanslanmıştır. 
