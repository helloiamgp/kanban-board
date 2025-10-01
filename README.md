# Kanban Board - JSON Tabanlı Görev Yönetimi

Modern ve kullanıcı dostu Kanban Board uygulaması. ITIL uyumlu Change Management ve Request yönetimi özellikleri içerir.

## Özellikler

- ✅ Sürükle-bırak ile görev yönetimi
- 📝 İki farklı görev tipi: Request (Talep) ve Change (Değişiklik)
- 🏢 Şirket, Departman ve Personel yönetimi
- 📊 Otomatik güncelleme geçmişi takibi
- 💾 JSON dosyalarına otomatik kayıt
- 🎨 Modern ve responsive tasarım
- 🔍 5 adımlı wizard ile kolay görev oluşturma

## Kurulum

1. Projeyi klonlayın veya indirin
2. `kanban-board.html` dosyasını tarayıcıda açın
3. Uygulama otomatik olarak `./data/` klasöründeki JSON dosyalarını yükler

## JSON Dosya Yapısı

Uygulama 3 ana JSON dosyası kullanır:

### 1. `data/companies.json`
Şirketler, departmanlar ve personel bilgilerini içerir:

```json
{
  "companies": [
    {
      "id": 1,
      "name": "ABC Teknoloji",
      "departments": [
        {
          "id": 101,
          "name": "IT",
          "persons": [
            {
              "id": 1001,
              "name": "Ahmet Yılmaz",
              "email": "ahmet@abc.com"
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. `data/config.json`
Uygulama yapılandırma bilgilerini içerir:
- Change tipleri (Normal, Standard, Emergency)
- Risk seviyeleri (Düşük, Orta, Yüksek)
- Etki seviyeleri
- Öncelik seviyeleri
- Görev kategorileri

### 3. `data/tasks.json`
Tüm görevleri ve görev geçmişini içerir:

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Proje planlaması",
      "status": "todo",
      "taskType": "request",
      "companyId": 1,
      "departmentId": 101,
      "assignedToId": 1001,
      "priority": "high",
      "history": []
    }
  ]
}
```

## Kullanım

### Görev Oluşturma
1. "Yeni Görev Ekle" butonuna tıklayın
2. 5 adımlı wizard'ı takip edin:
   - Görev tipini seçin (Request/Change)
   - Temel bilgileri girin
   - Takım ve atama yapın
   - Tipe özel detayları doldurun
   - Özeti kontrol edin ve oluşturun

### Görev Düzenleme
- Görev kartındaki "Düzenle" butonuna tıklayın
- Güncelleme geçmişi otomatik olarak kaydedilir

### Görev Durumu Değiştirme
- Görevleri sürükleyerek farklı kolonlara taşıyın
- Durum değişiklikleri otomatik olarak kaydedilir

### Veri Yedekleme
- "Tüm Verileri Dışa Aktar" butonuna tıklayın
- 3 JSON dosyası otomatik olarak indirilir
- İndirilen dosyaları `./data/` klasörüne yerleştirin

## Görev Tipleri

### Request (Talep)
Son kullanıcılardan gelen ihtiyaç ve istekler için:
- Talep eden kullanıcı
- İş gerekçesi
- Etkilenen kullanıcı sayısı
- Beklenen tamamlanma tarihi

### Change (Değişiklik)
IT sistemlerinde yapılacak değişiklikler için (ITIL uyumlu):
- Change tipi (Normal/Standard/Emergency)
- Risk seviyesi
- Etki seviyesi
- Rollback planı
- Planlanan uygulama tarihi
- Bakım penceresi
- Etkilenen sistemler

## Teknik Detaylar

- **Framework**: Vanilla JavaScript (bağımlılık yok)
- **Veri Depolama**: JSON dosyaları
- **Tasarım**: Modern, IFTA-style form inputs
- **Responsive**: Mobil ve masaüstü uyumlu
- **Tarayıcı Desteği**: Tüm modern tarayıcılar

## Notlar

- Tarayıcıda doğrudan dosya yazma yapılamadığı için, veriler indirme olarak sunulur
- JSON dosyaları `./data/` klasöründe bulunmalıdır
- Dosyalar bulunamazsa varsayılan veriler kullanılır
- Her değişiklik otomatik olarak indirme için hazırlanır

## Lisans

MIT License - İstediğiniz gibi kullanabilirsiniz.
