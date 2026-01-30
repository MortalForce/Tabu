# 🎮 Neon Tabu Online

Arkadaşlarınızla gerçek zamanlı olarak oynayabileceğiniz, modern ve karanlık (neon) temalı bir web tabanlı Tabu oyunu. Node.js ve Socket.io altyapısı ile kesintisiz çok oyunculu deneyim sunar.

## ✨ Özellikler

- **Çok Oyunculu Destek:** Oda oluşturma ve kod ile odaya katılma sistemi.
- **Takım Sistemi:** Kırmızı ve Mavi takımlar. Oyuncular istedikleri takıma katılabilir.
- **Gerçek Zamanlı Senkronizasyon:** Tüm oyuncular için eşzamanlı oyun durumu, zamanlayıcı ve skor takibi.
- **Rol Tabanlı Görünüm:**
  - **Anlatan:** Kartı ve yasaklı kelimeleri görür, butonları (Doğru/Tabu/Pas) yönetir.
  - **Gözlemci (Karşı Takım):** Tabu yapılıp yapılmadığını kontrol etmek için kartı görür ancak müdahale edemez.
  - **Tahmin Eden (Kendi Takımı):** Kartı görmez, sadece anlatan kişiyi dinler.
- **Oyun Kontrolleri:**
  - Zamanlayıcıyı Durdurma/Başlatma (Pause)
  - Pas Hakkı Limiti (Maksimum 3 Pas)
  - Süre Ayarı (Lobi ekranında yönetici tarafından ayarlanabilir)
- **Modern Arayüz:** Neon efektli, animasyonlu "Gamer" teması.
- **Geniş Kelime Havuzu:** Oyun dünyası ve genel kültür temalı yüzlerce kart.

## 🚀 Kurulum ve Çalıştırma

Bu projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### Gereksinimler
- [Node.js](https://nodejs.org/) (Sürüm 14 veya üzeri önerilir)

### Adımlar

1. **Projeyi İndirin/Klonlayın:**
   ```bash
   git clone <repo-url>
   cd Tabu
   ```

2. **Bağımlılıkları Yükleyin:**
   Proje dizininde terminali açın ve gerekli paketleri yükleyin:
   ```bash
   npm install
   ```

3. **Sunucuyu Başlatın:**
   ```bash
   node server.js
   ```
   Terminalde `Server running on http://localhost:3000` mesajını görmelisiniz.

4. **Oyuna Girin:**
   Tarayıcınızı açın ve `http://localhost:3000` adresine gidin.
   
5. **Oynamaya Başlayın:**
   - Bir kullanıcı adı girin.
   - **"ODA OLUŞTUR"** butonuna basarak yeni bir oyun odası açın.
   - Size verilen **ODA KODU**'nu arkadaşlarınızla paylaşın.
   - Arkadaşlarınız aynı adreste ODA KODU ile **"KATIL"** diyerek odaya gelebilir.
   - Herkes takımını seçtikten sonra Yönetici **"OYUNU BAŞLAT"** diyebilir.

## 🛠️ Teknolojiler

- **Backend:** Node.js, Express
- **İletişim:** Socket.io (WebSocket)
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
- **Stil:** Özel CSS değişkenleri, Flexbox/Grid, CSS Animasyonları

## 📂 Proje Yapısı

```
Tabu/
├── index.html      # Ana uygulama arayüzü
├── style.css       # Tüm stil ve tema tanımları
├── script.js       # İstemci tarafı oyun mantığı ve Socket.io yönetimi
├── server.js       # Sunucu, oda yönetimi ve oyun mantığı
├── package.json    # Proje bağımlılıkları ve scriptler
└── README.md       # Proje dokümantasyonu
```

## 🎮 Nasıl Oynanır?

1. **Amaç:** Anlatan oyuncu, karttaki **Ana Kelimeyi**, altındaki 5 **Yasaklı Kelimeyi** kullanmadan takım arkadaşlarına anlatmaya çalışır.
2. **Süre:** Her tur belirlenen süre (varsayılan 60sn) kadar sürer.
3. **Puanlama:**
   - **Doğru:** Takım +1 puan kazanır.
   - **Tabu:** Yasaklı kelime kullanılırsa takım -1 puan yer.
   - **Pas:** Kart geçilir, puan değişmez (Maks 3 hak).
4. **Sıra:** Süre bittiğinde sıra karşı takıma geçer.

---
*İyi Eğlenceler!*
