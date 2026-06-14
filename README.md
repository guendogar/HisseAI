<div align="center">

# 📈 HisseAI

**Borsayı yapay zeka ile keşfet, portföyünü yönet, geleceği tahmin et.**

Gerçek zamanlı piyasa haberleri, hisse senedi takibi ve yapay zeka destekli fiyat tahminlerini tek bir modern ekranda sunan; **yatırımcılara özel** ve **güvenli** bir mobil yol arkadaşı.

![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)
![Render](https://img.shields.io/badge/Render-Deployment-46E3B7?logo=render&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-8FAE8B)

</div>

---

## 📌 Çözdüğü Problem

Borsa takibi yapmak, karmaşık grafikler ve düzensiz haber akışları arasında kaybolmaya neden olabilir. Ayrıca, hisselerin gelecekteki yönelimlerini analiz etmek ciddi bir zaman ve finansal okuryazarlık gerektirir.

**HisseAI yatırım danışmanlığı yapmaz** — ama kararlarını verirken sana veri odaklı ve yenilikçi bir perspektif sunar:

- Anlık olarak piyasa haberlerini ve gelişmeleri takip etme
- Portföyündeki hisseleri tek bir ekranda kolayca yönetme
- **Yapay zeka modelleri** ile hisselerin gelecekteki olası fiyat hareketlerini tahmin etme
- Karmaşadan uzak, modern ve anlaşılır bir arayüzle finansal verilere erişme

> 💡 **İnovasyon:** Uygulamamız, yapay zeka destekli tahmin altyapısını kullanarak geleneksel borsa takibini bir adım öteye taşır. Veriler güvenli Supabase altyapısında anlık olarak işlenir.

---

## ✨ Özellikler

### 📊 Ana Ekran — Portföy Takibi
- Seçtiğin hisselerin anlık durumunu ve fiyatlarını görüntüle.
- Modern grafikler ve renk kodlarıyla yükseliş/düşüş trendlerini hızlıca fark et.

### 🤖 Yapay Zeka Tahmini — Geleceğe Bakış
- Seçilen hisseler için yapay zeka destekli fiyat tahminleri ve analizler.
- Geçmiş verilere dayalı algoritmik öngörüler.

### 📰 Haberler — Gerçek Zamanlı Akış
- Finans dünyasından ve piyasalardan en güncel gelişmeleri takip et.
- Hisseler üzerinde etkisi olabilecek haberlere anında ulaş.

### 👤 Profil & Ayarlar
- Kullanıcıya özel hesap yönetimi (Kayıt Ol / Giriş Yap).
- Güvenli Supabase kimlik doğrulaması.
- Uygulama içi kişiselleştirme ve bildirim ayarları.

### 🎨 Deneyim
- Sezgisel, karmaşadan uzak ve modern kullanıcı arayüzü.
- Mobil cihazlara optimize edilmiş akıcı geçişler ve bileşenler.

---

## 📸 Ekran Görüntüleri

<div align="center">

| Giriş Ekranı | Kayıt Ol Ekranı | Ana Ekran |
|:---:|:---:|:---:|
| <img src="screenshots/giris.jpg" width="230"/> | <img src="screenshots/kayitol.jpg" width="230"/> | <img src="screenshots/anaekran.jpg" width="230"/> |

| Haberler Ekranı | Yapay Zeka Tahmin | Ayarlar Ekranı |
|:---:|:---:|:---:|
| <img src="screenshots/haberler.jpg" width="230"/> | <img src="screenshots/yz_tahmin.jpg" width="230"/> | <img src="screenshots/ayarlar.jpg" width="230"/> |

</div>

---

## 🏗️ Mimari ve Altyapı

HisseAI, ölçeklenebilir ve kolay yönetilebilir bir **katmanlı / modüler mimari** kullanılarak geliştirilmiştir. Projenin klasör hiyerarşisi, her bileşenin kendi sorumluluğuna (separation of concerns) sahip olmasını sağlar:

- `src/components`: Uygulama genelinde tekrar kullanılabilir UI bileşenleri (özel butonlar, hisse kartları, grafikler).
- `src/screens`: Kullanıcının etkileşime girdiği ana uygulama ekranları (Ana Sayfa, Haberler, Tahminler, Profil).
- `src/navigation`: React Navigation ile yapılandırılmış sekme (tab) ve yığın (stack) yönlendirmeleri.
- `src/services`: Supabase veritabanı işlemleri, piyasa verileri ve yapay zeka tahmin algoritmaları için dış API entegrasyonları.
- `src/store`: Uygulama içi global durum yönetimi (State Management).
- `src/theme`: Uygulamanın renk paleti, tipografisi ve tasarım sisteminin merkezi yapılandırması.
- `src/utils` & `src/types`: TypeScript arayüzleri, veri tipleri ve yardımcı (helper) fonksiyonlar.

---

### Backend, Veritabanı ve Dağıtım

**Değerli Hocamızın Dikkatine,**

Bu GitHub reposu, HisseAI projemizin **istemci (client/mobil)** tarafını içermektedir. Projemizin **backend, veritabanı (Supabase) ve sunucu konfigürasyon dosyaları**, içerdikleri hassas kimlik bilgileri, API anahtarları ve veritabanı bağlantı şifreleri sebebiyle siber güvenlik standartları gereği *public* (herkese açık) olarak paylaşılmamıştır. 

Uygulamamızın veri tabanı mimarisi, kimlik doğrulama süreçleri ve sunucu dağıtım aşamaları ile ilgili detaylı ekran görüntüleri ve şemaları aşağıda inceleyebilirsiniz:

<div align="center">

**Supabase Veritabanı ve Yönetim**
| Supabase Genel Bakış | Supabase Tabloları |
|:---:|:---:|
| <img src="screenshots/supabase.png" width="400"/> | <img src="screenshots/supabase_table.png" width="400"/> |

**Dağıtım ve Sürüm Kontrolü (Render & Git)**
| Git Backend | Render Dağıtımı | Render Projesi |
|:---:|:---:|:---:|
| <img src="screenshots/git_backend.png" width="250"/> | <img src="screenshots/render.png" width="250"/> | <img src="screenshots/render_project.png" width="250"/> |

</div>

---

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz.

### Adımlar

1. **Projeyi Klonlayın**
   ```bash
   git clone <github-repo-url>
   cd HisseAI
   ```

2. **Bağımlılıkları Yükleyin**
   ```bash
   npm install
   ```

3. **Çevresel Değişkenleri Ayarlayın**
   Kök dizinde bir `.env` dosyası oluşturun ve gerekli Supabase / API anahtarlarını ekleyin:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Uygulamayı Başlatın**
   ```bash
   npm run android
   # veya
   npm run ios
   ```

---

*Değerlendirme Notu: Sayın Hocam, projeyi yukarıdaki adımları takip ederek kendi ortamınızda (simülatör veya fiziksel cihaz) test edebilirsiniz. İncelemeniz ve değerli vaktiniz için teşekkür ederim.*
