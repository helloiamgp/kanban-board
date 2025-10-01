# Kanban Board - Proje Hafızası

## 📋 Proje Özeti

Modern, ITIL uyumlu Kanban Board uygulaması. Şirketler, departmanlar ve personel yönetimi ile birlikte Request ve Change Management özellikleri içerir.

## 🏗️ Mimari

### Dosya Yapısı
```
kanban-board/
├── kanban-board.html    # Ana kanban board sayfası
├── dashboard.html       # İstatistik dashboard'u
├── admin.html          # Admin panel (CRUD işlemleri)
├── admin.js           # Admin panel JavaScript
├── data/
│   ├── companies.json  # Şirket, departman, personel
│   ├── config.json    # Konfigürasyon (tipler, seviyeler, vb.)
│   └── tasks.json     # Görevler ve geçmiş
├── README.md
├── MEMORY.md
└── .gitignore
```

### Veri Modeli

#### Companies (companies.json)
```json
{
  "companies": [
    {
      "id": 1,
      "name": "Şirket Adı",
      "departments": [
        {
          "id": 101,
          "name": "Departman Adı",
          "persons": [
            {
              "id": 1001,
              "name": "Ad Soyad",
              "email": "email@example.com"
            }
          ]
        }
      ]
    }
  ]
}
```

#### Config (config.json)
- `changeTypes`: Normal, Standard, Emergency
- `riskLevels`: Düşük, Orta, Yüksek
- `impactLevels`: Düşük, Orta, Yüksek
- `priorities`: Düşük, Orta, Yüksek
- `categories`: Bug, Feature, Maintenance, Security, vb.

#### Tasks (tasks.json)
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Görev Başlığı",
      "description": "Açıklama",
      "status": "todo|inprogress|done",
      "taskType": "request|change",
      "companyId": 1,
      "departmentId": 101,
      "assignedToId": 1001,
      "category": "feature",
      "priority": "high",
      "date": "01.10.2025",
      "history": [
        {
          "date": "01.10.2025 14:30",
          "changes": [
            {
              "field": "Durum",
              "oldValue": "Yapılacak",
              "newValue": "Devam Eden"
            }
          ]
        }
      ],

      // Request-specific
      "requester": "Talep Eden",
      "businessJustification": "İş gerekçesi",
      "affectedUsers": 50,
      "expectedCompletion": "2024-12-31",

      // Change-specific
      "changeType": "standard",
      "riskLevel": "low",
      "impactLevel": "medium",
      "rollbackPlan": "Geri alma planı",
      "implementationDate": "2024-11-15T02:00"
    }
  ]
}
```

## 🎨 Tasarım Sistemi

### Renkler
- **Primary (Mavi)**: `#0066cc` - Ana aksiyonlar
- **Success (Yeşil)**: `#48bb78` - Tamamlandı durumu
- **Warning (Turuncu)**: `#f39c12` - Düzenleme işlemi
- **Danger (Kırmızı)**: `#e74c3c` - Silme işlemi
- **Purple (Mor)**: `#9b59b6` - Admin panel
- **Gray**: `#7f8c8d` - İkincil metinler

### İkonlar
- **Düzenle**: Turuncu çerçeveli kalem SVG ikonu
- **Sil**: Kırmızı çerçeveli çöp kutusu SVG ikonu
- **Admin**: Mor yuvarlak buton, gear SVG ikonu
- **Tüm ikonlar**: Feather Icons (MIT License)

### Buton Stilleri
- **Outline Style**: Şeffaf arka plan, renkli çerçeve
- **Hover Effect**: Renk dolgusu + beyaz ikon + shadow + translateY(-2px)
- **Icon Buttons**: 32x32px (kanban), 36x36px (admin)

## 🔧 Özellikler

### Kanban Board (kanban-board.html)
- ✅ 3 kolon: Yapılacak, Devam Eden, Tamamlandı
- ✅ Sürükle-bırak ile görev taşıma
- ✅ 5 adımlı wizard ile görev oluşturma
- ✅ Görev düzenleme ve silme
- ✅ Otomatik güncelleme geçmişi
- ✅ JSON dosyalarından veri yükleme
- ✅ Her değişiklikte otomatik JSON indirme
- ✅ Floating admin button (sağ üst)
- ✅ Dashboard linki

### Dashboard (dashboard.html)
- ✅ 5 istatistik kartı
- ✅ Görev durumu progress bar'ları
- ✅ Son 10 güncellenen görev listesi
- ✅ Empty state mesajları
- ✅ Responsive tasarım
- ✅ Gerçek zamanlı JSON yükleme

### Admin Panel (admin.html)
- ✅ Şirket CRUD işlemleri
- ✅ Departman yönetimi (nested)
- ✅ Personel yönetimi (nested)
- ✅ Konfigürasyon yönetimi (5 kategori)
- ✅ JSON import/export
- ✅ Veri özeti dashboard
- ✅ Modal-based editing
- ✅ Tab navigation

## 📝 Görev Tipleri

### Request (📝)
Son kullanıcı talepleri için:
- Talep eden kullanıcı
- İş gerekçesi
- Etkilenen kullanıcı sayısı
- Beklenen tamamlanma tarihi
- İsteğe bağlı: Talep eden ekip, maliyet tahmini

### Change (🔧)
ITIL uyumlu IT değişiklik yönetimi:
- Change tipi (Normal, Standard, Emergency)
- Risk seviyesi (Düşük, Orta, Yüksek)
- Etki seviyesi
- Rollback planı (zorunlu)
- İsteğe bağlı: Uygulama tarihi, bakım penceresi, etkilenen sistemler

## 🔄 Veri Akışı

### Sayfa Yüklendiğinde
1. `loadAllData()` çağrılır
2. 3 JSON dosyası fetch edilir (companies, config, tasks)
3. Dosya bulunamazsa varsayılan (boş) veri kullanılır
4. UI render edilir

### Görev CRUD İşlemleri
1. Kullanıcı işlem yapar (oluştur/güncelle/sil)
2. `tasks` array güncellenir
3. `saveTasks()` otomatik çağrılır
4. JSON dosyası tarayıcıdan indirilir
5. Kullanıcı indirilen dosyayı `./data/` klasörüne koyar
6. Sayfa yenilenir, güncel veri yüklenir

## 🎯 Önemli Notlar

### Veri Kalıcılığı
- ⚠️ Tarayıcı ortamında doğrudan dosya yazma **YAPILAMAZ**
- ✅ Her değişiklikte JSON dosyası **indirilir**
- ✅ Kullanıcı manuel olarak `./data/` klasörüne koyar
- ✅ Gerçek backend entegrasyonu için Node.js/API kullanılmalı

### ID Yönetimi
- **Company ID**: 1, 2, 3, ...
- **Department ID**: (companyId * 100) + index (örn: 101, 102, 201)
- **Person ID**: (companyId * 1000) + (deptIndex * 10) + index (örn: 1001, 1002)
- **Task ID**: `Date.now()` ile otomatik

### Navigasyon
- **Dashboard** ⇄ **Kanban Board**: Tab-style navigation
- **Admin Panel**: Floating button (her sayfada sağ üst)
- **Admin → Kanban**: "← Kanban Board'a Dön" butonu

## 🐛 Bilinen Sınırlamalar

1. **Dosya Sistemi Erişimi Yok**
   - Tarayıcı güvenlik kısıtlamaları
   - Her değişiklik download olarak sunulur
   - Manuel dosya yönetimi gerekir

2. **Gerçek Zamanlı Senkronizasyon Yok**
   - Birden fazla kullanıcı için uygun değil
   - Her kullanıcı kendi JSON dosyalarını yönetir

3. **Rollback Özelliği Yok**
   - Görev geçmişi sadece görüntüleme için
   - Eski versiyona dönüş yapılamaz

## 🚀 Gelecek İyileştirmeler

### Kısa Vadeli
- [ ] Backend API entegrasyonu (Node.js/Express)
- [ ] Gerçek veritabanı (PostgreSQL/MongoDB)
- [ ] Kullanıcı kimlik doğrulama
- [ ] Gerçek zamanlı senkronizasyon (WebSocket)

### Orta Vadeli
- [ ] Dosya ekleme özelliği (görevlere attachment)
- [ ] Yorum sistemi
- [ ] Bildirim sistemi
- [ ] E-posta entegrasyonu
- [ ] Takvim görünümü
- [ ] Gantt chart

### Uzun Vadeli
- [ ] Mobil uygulama (React Native)
- [ ] Raporlama ve analitik
- [ ] AI-powered task prioritization
- [ ] Slack/Teams entegrasyonu
- [ ] Advanced filtering & search
- [ ] Multi-language support

## 📚 Teknoloji Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **UI Framework**: Yok (Pure CSS)
- **Icons**: Feather Icons (SVG)
- **Storage**: JSON files (client-side download)
- **No Dependencies**: Tamamen bağımlılık-sız

## 🎓 Kod Standartları

### JavaScript
- Fonksiyon isimleri: camelCase
- Global değişkenler: let/const
- Async/await kullanımı
- Template literals (backticks)
- Arrow functions tercih edilir

### CSS
- BEM-like naming (kebab-case)
- Mobile-first approach
- Flexbox & Grid kullanımı
- Transition/transform animasyonlar
- CSS variables yok (inline renkler)

### HTML
- Semantic HTML5
- Accessibility (title attributes)
- SVG inline kullanımı
- Modal-based form patterns

## 🔐 Güvenlik Notları

- ⚠️ Client-side only - güvenli değil
- ⚠️ Herkes tüm verilere erişebilir
- ⚠️ Şifreleme yok
- ✅ XSS koruması için escaping yapılmalı
- ✅ Backend implementasyonunda authentication/authorization eklenmeli

## 📊 Performans

### Dosya Boyutları
- `kanban-board.html`: ~120KB
- `admin.html`: ~25KB
- `admin.js`: ~20KB
- `dashboard.html`: ~18KB

### Optimize Edilebilir
- [ ] CSS/JS dosyalarını ayrı dosyalara taşı
- [ ] Minification
- [ ] Lazy loading
- [ ] Image optimization (şu an yok)
- [ ] Service Worker (offline support)

## 🔄 Son Güncelleme

**Tarih**: 1 Ekim 2025
**Versiyon**: 1.0.0
**Son Commit**: "feat: Major UI improvements and dashboard creation"

## 👥 Katkıda Bulunanlar

- Claude (AI Assistant)
- User (gp)

---

**Not**: Bu hafıza dosyası projenin mevcut durumunu yansıtır. Yeni özellikler eklendikçe güncellenmelidir.
