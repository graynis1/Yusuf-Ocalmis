/**
 * Gerçek, küratörlü ürün kataloğu — marka-doğru isimler + epey tarzı gerçek teknik özellikler.
 * Görsel: loremflickr ile anahtar kelimeye uygun GERÇEK foto (her zaman yüklenir, lock ile sabit).
 * Demo feed üreticisi ve seed bu kataloğu kullanır.
 */
export interface CatalogItem {
  brand: string;
  model: string;
  categoryName: string; // leaf görünen ad (taksonomi ile birebir)
  categoryPath: string; // "Elektronik > Telefon > Akıllı Telefon"
  price: number; // yaklaşık TRY referans fiyatı
  keyword: string; // görsel arama anahtarı (loremflickr)
  specs: Record<string, string>;
}

const P = "Elektronik > Telefon > Akıllı Telefon";
const L = "Elektronik > Bilgisayar > Dizüstü";
const T = "Elektronik > TV & Ses > Televizyon";
const H = "Elektronik > TV & Ses > Kulaklık";
const W = "Elektronik > Giyilebilir > Akıllı Saat";
const G = "Elektronik > Oyun > Oyun Konsolu";
const BE = "Ev & Yaşam > Beyaz Eşya";
const KE = "Ev & Yaşam > Küçük Ev Aletleri";
const KO = "Kozmetik & Kişisel Bakım > Parfüm";
const AY = "Moda > Ayakkabı";

export const CATALOG: CatalogItem[] = [
  // ---------- AKILLI TELEFON ----------
  { brand: "Apple", model: "iPhone 15 Pro Max 256GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 76999, keyword: "iphone", specs: { Ekran: "6.7 inç OLED", "Yenileme Hızı": "120 Hz", İşlemci: "A17 Pro", "Dahili Hafıza": "256 GB", RAM: "8 GB", "Arka Kamera": "48 MP + 12 MP + 12 MP", Batarya: "4441 mAh", "İşletim Sistemi": "iOS 17", Renk: "Titanyum" } },
  { brand: "Apple", model: "iPhone 15 Pro 128GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 64999, keyword: "iphone", specs: { Ekran: "6.1 inç OLED", "Yenileme Hızı": "120 Hz", İşlemci: "A17 Pro", "Dahili Hafıza": "128 GB", RAM: "8 GB", "Arka Kamera": "48 MP + 12 MP + 12 MP", Batarya: "3274 mAh", "İşletim Sistemi": "iOS 17" } },
  { brand: "Apple", model: "iPhone 15 128GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 52999, keyword: "iphone", specs: { Ekran: "6.1 inç OLED", İşlemci: "A16 Bionic", "Dahili Hafıza": "128 GB", RAM: "6 GB", "Arka Kamera": "48 MP + 12 MP", Batarya: "3349 mAh", "İşletim Sistemi": "iOS 17" } },
  { brand: "Apple", model: "iPhone 14 128GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 44999, keyword: "iphone", specs: { Ekran: "6.1 inç OLED", İşlemci: "A15 Bionic", "Dahili Hafıza": "128 GB", RAM: "6 GB", "Arka Kamera": "12 MP + 12 MP", Batarya: "3279 mAh", "İşletim Sistemi": "iOS 16" } },
  { brand: "Samsung", model: "Galaxy S24 Ultra 512GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 69999, keyword: "samsung galaxy", specs: { Ekran: "6.8 inç AMOLED", "Yenileme Hızı": "120 Hz", İşlemci: "Snapdragon 8 Gen 3", "Dahili Hafıza": "512 GB", RAM: "12 GB", "Arka Kamera": "200 MP + 50 MP + 12 MP + 10 MP", Batarya: "5000 mAh", "İşletim Sistemi": "Android 14" } },
  { brand: "Samsung", model: "Galaxy S24 256GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 47999, keyword: "samsung galaxy", specs: { Ekran: "6.2 inç AMOLED", "Yenileme Hızı": "120 Hz", İşlemci: "Exynos 2400", "Dahili Hafıza": "256 GB", RAM: "8 GB", "Arka Kamera": "50 MP + 12 MP + 10 MP", Batarya: "4000 mAh", "İşletim Sistemi": "Android 14" } },
  { brand: "Samsung", model: "Galaxy A55 256GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 22999, keyword: "samsung galaxy", specs: { Ekran: "6.6 inç AMOLED", İşlemci: "Exynos 1480", "Dahili Hafıza": "256 GB", RAM: "8 GB", "Arka Kamera": "50 MP + 12 MP + 5 MP", Batarya: "5000 mAh", "İşletim Sistemi": "Android 14" } },
  { brand: "Samsung", model: "Galaxy A35 128GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 16999, keyword: "smartphone", specs: { Ekran: "6.6 inç AMOLED", İşlemci: "Exynos 1380", "Dahili Hafıza": "128 GB", RAM: "8 GB", "Arka Kamera": "50 MP + 8 MP + 5 MP", Batarya: "5000 mAh" } },
  { brand: "Xiaomi", model: "14 256GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 39999, keyword: "xiaomi phone", specs: { Ekran: "6.36 inç AMOLED", İşlemci: "Snapdragon 8 Gen 3", "Dahili Hafıza": "256 GB", RAM: "12 GB", "Arka Kamera": "50 MP + 50 MP + 50 MP", Batarya: "4610 mAh" } },
  { brand: "Xiaomi", model: "Redmi Note 13 Pro 256GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 15999, keyword: "xiaomi phone", specs: { Ekran: "6.67 inç AMOLED", İşlemci: "Snapdragon 7s Gen 2", "Dahili Hafıza": "256 GB", RAM: "8 GB", "Arka Kamera": "200 MP + 8 MP + 2 MP", Batarya: "5100 mAh" } },
  { brand: "Oppo", model: "Reno 11 256GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 18999, keyword: "smartphone", specs: { Ekran: "6.7 inç AMOLED", İşlemci: "Dimensity 7050", "Dahili Hafıza": "256 GB", RAM: "8 GB", "Arka Kamera": "50 MP + 32 MP + 8 MP", Batarya: "4800 mAh" } },
  { brand: "Realme", model: "12 Pro Plus 512GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 21999, keyword: "smartphone", specs: { Ekran: "6.7 inç AMOLED", İşlemci: "Snapdragon 7s Gen 2", "Dahili Hafıza": "512 GB", RAM: "12 GB", "Arka Kamera": "50 MP + 64 MP + 8 MP", Batarya: "5000 mAh" } },
  { brand: "Huawei", model: "Nova 12i 128GB", categoryName: "Akıllı Telefon", categoryPath: P, price: 12999, keyword: "smartphone", specs: { Ekran: "6.7 inç IPS", İşlemci: "Snapdragon 680", "Dahili Hafıza": "128 GB", RAM: "8 GB", "Arka Kamera": "108 MP + 2 MP", Batarya: "5000 mAh" } },

  // ---------- DİZÜSTÜ ----------
  { brand: "Apple", model: "MacBook Air M3 13 inç 256GB", categoryName: "Dizüstü", categoryPath: L, price: 54999, keyword: "macbook", specs: { Ekran: "13.6 inç Liquid Retina", İşlemci: "Apple M3", RAM: "8 GB", "SSD": "256 GB", "Ekran Kartı": "M3 8 çekirdek GPU", "İşletim Sistemi": "macOS", Ağırlık: "1.24 kg" } },
  { brand: "Apple", model: "MacBook Pro 14 inç M3 512GB", categoryName: "Dizüstü", categoryPath: L, price: 84999, keyword: "macbook", specs: { Ekran: "14.2 inç Liquid Retina XDR", İşlemci: "Apple M3", RAM: "16 GB", "SSD": "512 GB", "Ekran Kartı": "M3 10 çekirdek GPU", "İşletim Sistemi": "macOS" } },
  { brand: "Asus", model: "ROG Strix G16 RTX 4060", categoryName: "Dizüstü", categoryPath: L, price: 61999, keyword: "gaming laptop", specs: { Ekran: "16 inç 165 Hz", İşlemci: "Intel Core i7-13650HX", RAM: "16 GB", "SSD": "1 TB", "Ekran Kartı": "RTX 4060 8 GB", "İşletim Sistemi": "Windows 11" } },
  { brand: "Asus", model: "Vivobook 15 i5 16GB", categoryName: "Dizüstü", categoryPath: L, price: 22999, keyword: "laptop", specs: { Ekran: "15.6 inç FHD", İşlemci: "Intel Core i5-1235U", RAM: "16 GB", "SSD": "512 GB", "Ekran Kartı": "Intel Iris Xe", "İşletim Sistemi": "Windows 11" } },
  { brand: "Lenovo", model: "ThinkPad E14 Ryzen 5", categoryName: "Dizüstü", categoryPath: L, price: 27999, keyword: "laptop", specs: { Ekran: "14 inç FHD", İşlemci: "AMD Ryzen 5 7530U", RAM: "16 GB", "SSD": "512 GB", "Ekran Kartı": "AMD Radeon", "İşletim Sistemi": "FreeDOS" } },
  { brand: "Lenovo", model: "LOQ 15 RTX 4050", categoryName: "Dizüstü", categoryPath: L, price: 38999, keyword: "gaming laptop", specs: { Ekran: "15.6 inç 144 Hz", İşlemci: "Intel Core i5-12450HX", RAM: "16 GB", "SSD": "512 GB", "Ekran Kartı": "RTX 4050 6 GB", "İşletim Sistemi": "Windows 11" } },
  { brand: "HP", model: "Victus 15 RTX 3050", categoryName: "Dizüstü", categoryPath: L, price: 31999, keyword: "gaming laptop", specs: { Ekran: "15.6 inç FHD 144 Hz", İşlemci: "Intel Core i5-12500H", RAM: "16 GB", "SSD": "512 GB", "Ekran Kartı": "RTX 3050 4 GB", "İşletim Sistemi": "FreeDOS" } },
  { brand: "HP", model: "Pavilion 14 i5 512GB", categoryName: "Dizüstü", categoryPath: L, price: 24999, keyword: "laptop", specs: { Ekran: "14 inç FHD", İşlemci: "Intel Core i5-1334U", RAM: "16 GB", "SSD": "512 GB", "Ekran Kartı": "Intel Iris Xe", "İşletim Sistemi": "Windows 11" } },
  { brand: "Monster", model: "Abra A5 V20.5 RTX 4050", categoryName: "Dizüstü", categoryPath: L, price: 41999, keyword: "gaming laptop", specs: { Ekran: "15.6 inç 144 Hz", İşlemci: "Intel Core i7-13620H", RAM: "16 GB", "SSD": "1 TB", "Ekran Kartı": "RTX 4050 6 GB", "İşletim Sistemi": "FreeDOS" } },
  { brand: "Casper", model: "Excalibur G870 i7", categoryName: "Dizüstü", categoryPath: L, price: 36999, keyword: "laptop", specs: { Ekran: "15.6 inç 144 Hz", İşlemci: "Intel Core i7-12700H", RAM: "16 GB", "SSD": "500 GB", "Ekran Kartı": "RTX 3050", "İşletim Sistemi": "Windows 11" } },

  // ---------- TELEVİZYON ----------
  { brand: "Samsung", model: "55Q60D QLED 4K", categoryName: "Televizyon", categoryPath: T, price: 27999, keyword: "smart tv", specs: { "Ekran Boyutu": "55 inç", Çözünürlük: "4K UHD", Panel: "QLED", "Yenileme Hızı": "60 Hz", "Akıllı TV": "Tizen", HDR: "Quantum HDR" } },
  { brand: "Samsung", model: "65Q80D QLED 4K", categoryName: "Televizyon", categoryPath: T, price: 49999, keyword: "smart tv", specs: { "Ekran Boyutu": "65 inç", Çözünürlük: "4K UHD", Panel: "QLED", "Yenileme Hızı": "120 Hz", "Akıllı TV": "Tizen", HDR: "Quantum HDR+" } },
  { brand: "LG", model: "55C4 OLED evo 4K", categoryName: "Televizyon", categoryPath: T, price: 64999, keyword: "oled tv", specs: { "Ekran Boyutu": "55 inç", Çözünürlük: "4K UHD", Panel: "OLED evo", "Yenileme Hızı": "120 Hz", "Akıllı TV": "webOS", HDR: "Dolby Vision" } },
  { brand: "LG", model: "50UR8000 4K", categoryName: "Televizyon", categoryPath: T, price: 18999, keyword: "smart tv", specs: { "Ekran Boyutu": "50 inç", Çözünürlük: "4K UHD", Panel: "LED", "Yenileme Hızı": "60 Hz", "Akıllı TV": "webOS" } },
  { brand: "Sony", model: "65X90L 4K", categoryName: "Televizyon", categoryPath: T, price: 54999, keyword: "smart tv", specs: { "Ekran Boyutu": "65 inç", Çözünürlük: "4K UHD", Panel: "Full Array LED", "Yenileme Hızı": "120 Hz", "Akıllı TV": "Google TV", HDR: "Dolby Vision" } },
  { brand: "Philips", model: "55PUS8009 4K Ambilight", categoryName: "Televizyon", categoryPath: T, price: 23999, keyword: "smart tv", specs: { "Ekran Boyutu": "55 inç", Çözünürlük: "4K UHD", Panel: "LED", Ambilight: "3 taraflı", "Akıllı TV": "Titan OS" } },
  { brand: "TCL", model: "55C645 QLED 4K", categoryName: "Televizyon", categoryPath: T, price: 21999, keyword: "smart tv", specs: { "Ekran Boyutu": "55 inç", Çözünürlük: "4K UHD", Panel: "QLED", "Yenileme Hızı": "60 Hz", "Akıllı TV": "Google TV" } },
  { brand: "Vestel", model: "50U9601 4K", categoryName: "Televizyon", categoryPath: T, price: 16999, keyword: "led tv", specs: { "Ekran Boyutu": "50 inç", Çözünürlük: "4K UHD", Panel: "LED", "Akıllı TV": "Vestel Smart" } },

  // ---------- KULAKLIK ----------
  { brand: "Apple", model: "AirPods Pro 2. Nesil USB-C", categoryName: "Kulaklık", categoryPath: H, price: 8999, keyword: "airpods", specs: { Tip: "Kulak içi (TWS)", "Gürültü Engelleme": "Aktif (ANC)", "Pil Ömrü": "6 saat (kutu ile 30 saat)", Bağlantı: "Bluetooth 5.3", "Suya Dayanıklılık": "IP54" } },
  { brand: "Apple", model: "AirPods 3. Nesil", categoryName: "Kulaklık", categoryPath: H, price: 6499, keyword: "earbuds", specs: { Tip: "Kulak içi (TWS)", "Pil Ömrü": "6 saat (kutu ile 30 saat)", Bağlantı: "Bluetooth 5.0", "Suya Dayanıklılık": "IPX4" } },
  { brand: "Samsung", model: "Galaxy Buds2 Pro", categoryName: "Kulaklık", categoryPath: H, price: 4999, keyword: "earbuds", specs: { Tip: "Kulak içi (TWS)", "Gürültü Engelleme": "Aktif (ANC)", "Pil Ömrü": "5 saat", Bağlantı: "Bluetooth 5.3", "Suya Dayanıklılık": "IPX7" } },
  { brand: "Sony", model: "WH-1000XM5", categoryName: "Kulaklık", categoryPath: H, price: 12999, keyword: "headphones", specs: { Tip: "Kulak üstü", "Gürültü Engelleme": "Aktif (ANC)", "Pil Ömrü": "30 saat", Bağlantı: "Bluetooth 5.2" } },
  { brand: "JBL", model: "Tune 770NC", categoryName: "Kulaklık", categoryPath: H, price: 3499, keyword: "headphones", specs: { Tip: "Kulak üstü", "Gürültü Engelleme": "Aktif (ANC)", "Pil Ömrü": "70 saat", Bağlantı: "Bluetooth 5.3" } },
  { brand: "Bose", model: "QuietComfort Ultra", categoryName: "Kulaklık", categoryPath: H, price: 14999, keyword: "headphones", specs: { Tip: "Kulak üstü", "Gürültü Engelleme": "Aktif (ANC)", "Pil Ömrü": "24 saat", Bağlantı: "Bluetooth 5.3" } },

  // ---------- AKILLI SAAT ----------
  { brand: "Apple", model: "Watch Series 9 45mm", categoryName: "Akıllı Saat", categoryPath: W, price: 18999, keyword: "apple watch", specs: { Ekran: "1.9 inç OLED", "Kasa Boyutu": "45 mm", "Suya Dayanıklılık": "50 m", "İşletim Sistemi": "watchOS 10", "Pil Ömrü": "18 saat" } },
  { brand: "Apple", model: "Watch SE 2 40mm", categoryName: "Akıllı Saat", categoryPath: W, price: 11499, keyword: "apple watch", specs: { Ekran: "1.57 inç OLED", "Kasa Boyutu": "40 mm", "Suya Dayanıklılık": "50 m", "İşletim Sistemi": "watchOS 10" } },
  { brand: "Samsung", model: "Galaxy Watch6 44mm", categoryName: "Akıllı Saat", categoryPath: W, price: 9999, keyword: "smartwatch", specs: { Ekran: "1.5 inç AMOLED", "Kasa Boyutu": "44 mm", "Suya Dayanıklılık": "5 ATM", "İşletim Sistemi": "Wear OS" } },
  { brand: "Huawei", model: "Watch GT 4 46mm", categoryName: "Akıllı Saat", categoryPath: W, price: 7499, keyword: "smartwatch", specs: { Ekran: "1.43 inç AMOLED", "Kasa Boyutu": "46 mm", "Pil Ömrü": "14 gün", "Suya Dayanıklılık": "5 ATM" } },
  { brand: "Xiaomi", model: "Smart Band 8", categoryName: "Akıllı Saat", categoryPath: W, price: 1499, keyword: "fitness tracker", specs: { Ekran: "1.62 inç AMOLED", "Pil Ömrü": "16 gün", "Suya Dayanıklılık": "5 ATM" } },
  { brand: "Amazfit", model: "GTR 4", categoryName: "Akıllı Saat", categoryPath: W, price: 5999, keyword: "smartwatch", specs: { Ekran: "1.43 inç AMOLED", "Pil Ömrü": "14 gün", GPS: "Çift bant", "Suya Dayanıklılık": "5 ATM" } },

  // ---------- OYUN KONSOLU ----------
  { brand: "Sony", model: "PlayStation 5 Slim", categoryName: "Oyun Konsolu", categoryPath: G, price: 24999, keyword: "playstation 5", specs: { Depolama: "1 TB SSD", Çözünürlük: "4K 120 fps", "Disk Sürücü": "Var", Nesil: "9. Nesil" } },
  { brand: "Sony", model: "PlayStation 5 Digital", categoryName: "Oyun Konsolu", categoryPath: G, price: 21999, keyword: "playstation 5", specs: { Depolama: "1 TB SSD", Çözünürlük: "4K 120 fps", "Disk Sürücü": "Yok", Nesil: "9. Nesil" } },
  { brand: "Microsoft", model: "Xbox Series X 1TB", categoryName: "Oyun Konsolu", categoryPath: G, price: 23999, keyword: "xbox", specs: { Depolama: "1 TB SSD", Çözünürlük: "4K 120 fps", "Disk Sürücü": "Var", Nesil: "9. Nesil" } },
  { brand: "Microsoft", model: "Xbox Series S 512GB", categoryName: "Oyun Konsolu", categoryPath: G, price: 13999, keyword: "xbox", specs: { Depolama: "512 GB SSD", Çözünürlük: "1440p", "Disk Sürücü": "Yok", Nesil: "9. Nesil" } },
  { brand: "Nintendo", model: "Switch OLED", categoryName: "Oyun Konsolu", categoryPath: G, price: 13499, keyword: "nintendo switch", specs: { Ekran: "7 inç OLED", Depolama: "64 GB", Tip: "Hibrit (taşınabilir)" } },

  // ---------- BEYAZ EŞYA ----------
  { brand: "Arçelik", model: "584611 EI No Frost Buzdolabı", categoryName: "Beyaz Eşya", categoryPath: BE, price: 32999, keyword: "refrigerator", specs: { Tip: "Gardırop (Side by Side)", "Net Hacim": "611 L", "Enerji Sınıfı": "A++", Teknoloji: "No Frost", Renk: "Inox" } },
  { brand: "Bosch", model: "KGN56XLEA No Frost Buzdolabı", categoryName: "Beyaz Eşya", categoryPath: BE, price: 28999, keyword: "refrigerator", specs: { Tip: "Alttan Donduruculu", "Net Hacim": "508 L", "Enerji Sınıfı": "E", Teknoloji: "No Frost" } },
  { brand: "Samsung", model: "RS68A8840S9 Gardırop Buzdolabı", categoryName: "Beyaz Eşya", categoryPath: BE, price: 41999, keyword: "refrigerator", specs: { Tip: "Side by Side", "Net Hacim": "634 L", "Enerji Sınıfı": "F", Teknoloji: "No Frost", Renk: "Inox" } },
  { brand: "Arçelik", model: "9123 PM 9 kg Çamaşır Makinesi", categoryName: "Beyaz Eşya", categoryPath: BE, price: 18999, keyword: "washing machine", specs: { Kapasite: "9 kg", "Devir": "1200 rpm", "Enerji Sınıfı": "A", "Motor": "ProSmart Inverter" } },
  { brand: "Siemens", model: "WG44G2A0TR 9 kg Çamaşır Makinesi", categoryName: "Beyaz Eşya", categoryPath: BE, price: 24999, keyword: "washing machine", specs: { Kapasite: "9 kg", "Devir": "1400 rpm", "Enerji Sınıfı": "A", "Motor": "iQdrive Inverter" } },
  { brand: "Bosch", model: "WGG2440XTR 9 kg Çamaşır Makinesi", categoryName: "Beyaz Eşya", categoryPath: BE, price: 22999, keyword: "washing machine", specs: { Kapasite: "9 kg", "Devir": "1400 rpm", "Enerji Sınıfı": "A" } },
  { brand: "LG", model: "F4R5VYW0W 9 kg Kurutmalı Çamaşır Makinesi", categoryName: "Beyaz Eşya", categoryPath: BE, price: 34999, keyword: "washing machine", specs: { Kapasite: "9 kg yıkama / 6 kg kurutma", "Devir": "1400 rpm", "Enerji Sınıfı": "D", "Motor": "AI DD Inverter" } },
  { brand: "Vestel", model: "BM 5101 Bulaşık Makinesi", categoryName: "Beyaz Eşya", categoryPath: BE, price: 14999, keyword: "dishwasher", specs: { "Kapasite": "14 kişilik", "Program": "5 program", "Enerji Sınıfı": "E" } },
  { brand: "Bosch", model: "SMS4HVI33E Bulaşık Makinesi", categoryName: "Beyaz Eşya", categoryPath: BE, price: 21999, keyword: "dishwasher", specs: { "Kapasite": "14 kişilik", "Program": "6 program", "Enerji Sınıfı": "D" } },

  // ---------- KÜÇÜK EV ALETLERİ ----------
  { brand: "Dyson", model: "V12 Detect Slim Dikey Süpürge", categoryName: "Küçük Ev Aletleri", categoryPath: KE, price: 24999, keyword: "vacuum cleaner", specs: { Tip: "Kablosuz dikey", "Çalışma Süresi": "60 dk", "Toz Haznesi": "0.35 L", Güç: "150 AW" } },
  { brand: "Xiaomi", model: "Robot Vacuum S10 Robot Süpürge", categoryName: "Küçük Ev Aletleri", categoryPath: KE, price: 9999, keyword: "robot vacuum", specs: { Tip: "Robot (paspaslı)", "Çalışma Süresi": "120 dk", "Emiş Gücü": "4000 Pa", Navigasyon: "LDS Lazer" } },
  { brand: "Philips", model: "Airfryer XXL HD9650 Sıcak Hava Fritözü", categoryName: "Küçük Ev Aletleri", categoryPath: KE, price: 7499, keyword: "air fryer", specs: { Kapasite: "1.4 kg / 7.3 L", Güç: "2225 W", Teknoloji: "Twin TurboStar" } },
  { brand: "Tefal", model: "Easy Fry Airfryer", categoryName: "Küçük Ev Aletleri", categoryPath: KE, price: 3999, keyword: "air fryer", specs: { Kapasite: "4.2 L", Güç: "1500 W", Program: "8 otomatik" } },
  { brand: "Karaca", model: "Hatır Mod Çay Makinesi", categoryName: "Küçük Ev Aletleri", categoryPath: KE, price: 2499, keyword: "tea maker", specs: { Kapasite: "2.2 L", Güç: "1800 W", Malzeme: "Çelik" } },
  { brand: "Philips", model: "EP2231 Tam Otomatik Espresso Makinesi", categoryName: "Küçük Ev Aletleri", categoryPath: KE, price: 16999, keyword: "espresso machine", specs: { Tip: "Tam otomatik", "Öğütücü": "Seramik", "Su Haznesi": "1.8 L", Güç: "1500 W" } },
  { brand: "Arzum", model: "AR3074 Blender Seti", categoryName: "Küçük Ev Aletleri", categoryPath: KE, price: 1799, keyword: "blender", specs: { Güç: "1000 W", "Hazne": "Cam 1.5 L", "Hız": "2 kademe + turbo" } },

  // ---------- PARFÜM ----------
  { brand: "Dior", model: "Sauvage EDT 100ml", categoryName: "Parfüm", categoryPath: KO, price: 4299, keyword: "perfume", specs: { Cinsiyet: "Erkek", Hacim: "100 ml", Koku: "Odunsu - Baharatlı", Tip: "EDT" } },
  { brand: "Chanel", model: "Bleu de Chanel EDP 100ml", categoryName: "Parfüm", categoryPath: KO, price: 5999, keyword: "perfume", specs: { Cinsiyet: "Erkek", Hacim: "100 ml", Koku: "Odunsu - Aromatik", Tip: "EDP" } },
  { brand: "Versace", model: "Eros EDT 100ml", categoryName: "Parfüm", categoryPath: KO, price: 2899, keyword: "perfume", specs: { Cinsiyet: "Erkek", Hacim: "100 ml", Koku: "Aromatik - Fougère", Tip: "EDT" } },
  { brand: "Lancome", model: "La Vie Est Belle EDP 75ml", categoryName: "Parfüm", categoryPath: KO, price: 4799, keyword: "perfume bottle", specs: { Cinsiyet: "Kadın", Hacim: "75 ml", Koku: "Çiçeksi - Meyveli", Tip: "EDP" } },
  { brand: "Yves Saint Laurent", model: "Black Opium EDP 90ml", categoryName: "Parfüm", categoryPath: KO, price: 5299, keyword: "perfume bottle", specs: { Cinsiyet: "Kadın", Hacim: "90 ml", Koku: "Oryantal - Vanilya", Tip: "EDP" } },
  { brand: "Nivea", model: "Q10 Yaşlanma Karşıtı Yüz Kremi 50ml", categoryName: "Parfüm", categoryPath: KO, price: 349, keyword: "cosmetics cream", specs: { Tip: "Nemlendirici", Hacim: "50 ml", "Cilt Tipi": "Tüm ciltler" } },
  { brand: "La Roche-Posay", model: "Anthelios SPF50+ Güneş Kremi 50ml", categoryName: "Parfüm", categoryPath: KO, price: 799, keyword: "sunscreen", specs: { SPF: "50+", Hacim: "50 ml", "Cilt Tipi": "Hassas" } },

  // ---------- AYAKKABI ----------
  { brand: "Nike", model: "Air Force 1 '07 Erkek Spor Ayakkabı", categoryName: "Ayakkabı", categoryPath: AY, price: 4499, keyword: "sneakers", specs: { Cinsiyet: "Erkek", Renk: "Beyaz", Taban: "Kauçuk", "Üst Malzeme": "Deri" } },
  { brand: "Nike", model: "Air Max 270 Spor Ayakkabı", categoryName: "Ayakkabı", categoryPath: AY, price: 5999, keyword: "sneakers", specs: { Cinsiyet: "Unisex", Renk: "Siyah", Taban: "Air yastıklama", "Üst Malzeme": "Tekstil" } },
  { brand: "Adidas", model: "Samba OG Spor Ayakkabı", categoryName: "Ayakkabı", categoryPath: AY, price: 4799, keyword: "sneakers", specs: { Cinsiyet: "Unisex", Renk: "Siyah-Beyaz", Taban: "Kauçuk", "Üst Malzeme": "Deri - Süet" } },
  { brand: "Adidas", model: "Ultraboost Light Koşu Ayakkabısı", categoryName: "Ayakkabı", categoryPath: AY, price: 7499, keyword: "running shoes", specs: { Cinsiyet: "Erkek", Renk: "Lacivert", Taban: "Boost", Kullanım: "Koşu" } },
  { brand: "Puma", model: "Suede Classic XXI Spor Ayakkabı", categoryName: "Ayakkabı", categoryPath: AY, price: 2999, keyword: "sneakers", specs: { Cinsiyet: "Unisex", Renk: "Bordo", Taban: "Kauçuk", "Üst Malzeme": "Süet" } },
  { brand: "New Balance", model: "574 Sneaker", categoryName: "Ayakkabı", categoryPath: AY, price: 3899, keyword: "sneakers", specs: { Cinsiyet: "Unisex", Renk: "Gri", Taban: "ENCAP", "Üst Malzeme": "Süet - Tekstil" } },
];

/**
 * Her ürün için en uygun Wikipedia makale başlığı (CATALOG ile aynı sırada).
 * Lead görsel buradan çekilir. null → kategori-tipi jenerik makaleye düşülür (gerçek ürün fotosu).
 */
export const WIKI_TITLES: (string | null)[] = [
  "iPhone 15 Pro", "iPhone 15 Pro", "iPhone 15", "iPhone 14",            // 0-3
  "Samsung Galaxy S24 Ultra", "Samsung Galaxy S24", null, null,          // 4-7 (A55/A35 → Smartphone)
  "Xiaomi 14", "Redmi Note 13", null, null, null,                        // 8-12
  "MacBook Air", "MacBook Pro", null, null,                              // 13-16
  "ThinkPad", null, null, null, null, null,                              // 17-22
  null, null, null, null, "Sony Bravia", null, null, null,               // 23-30 TV
  "AirPods Pro", "AirPods", "Samsung Galaxy Buds", null, null, null,     // 31-36
  "Apple Watch", "Apple Watch", "Samsung Galaxy Watch", null, null, null, // 37-42
  "PlayStation 5", "PlayStation 5", "Xbox Series X and Series S", "Xbox Series X and Series S", "Nintendo Switch", // 43-47
  null, null, null, null, null, null, null, null, null,                  // 48-56 beyaz eşya
  null, null, null, null, null, null, null,                              // 57-63 küçük ev
  null, null, null, null, null, null, null,                              // 64-70 parfüm/bakım
  "Nike Air Force 1", "Nike Air Max", "Adidas Samba", "Adidas Ultraboost", "Puma Suede", null, // 71-76
];

/** Kategori-tipi jenerik Wikipedia makalesi (lead görseli gerçek ürün tipi fotosu). */
export const GENERIC_WIKI: Record<string, string> = {
  "Akıllı Telefon": "Smartphone",
  "Dizüstü": "Laptop",
  "Televizyon": "Smart TV",
  "Kulaklık": "Headphones",
  "Akıllı Saat": "Smartwatch",
  "Oyun Konsolu": "Nintendo Switch (OLED model)",
  "Beyaz Eşya": "Major appliance",
  "Küçük Ev Aletleri": "Small appliance",
  "Parfüm": "Chanel No. 5",
  "Ayakkabı": "Sneakers",
};

/** Beyaz eşya/küçük ev aletleri için ürün-bazlı daha iyi jenerik makaleler. */
export const ITEM_WIKI_HINT: Record<string, string> = {
  Buzdolabı: "Refrigerator",
  "Çamaşır Makinesi": "Washing machine",
  "Bulaşık Makinesi": "Dishwasher",
  Süpürge: "Vacuum cleaner",
  Airfryer: "Air fryer",
  Fritöz: "Air fryer",
  "Çay Makinesi": "Kettle",
  "Espresso Makinesi": "Espresso machine",
  Blender: "Blender",
  Parfüm: "Perfume",
  Kremi: "Cosmetics",
};

/** Bir ürün için kullanılacak wiki başlığı (spesifik → ürün ipucu → kategori jeneriği). */
export function wikiTitleFor(index: number): string {
  const explicit = WIKI_TITLES[index];
  if (explicit) return explicit;
  const it = CATALOG[index];
  for (const [hint, article] of Object.entries(ITEM_WIKI_HINT)) {
    if (it.model.includes(hint)) return article;
  }
  return GENERIC_WIKI[it.categoryName] ?? "Product";
}

/** Katalog indeksine karşılık gelen kararlı 13 haneli GTIN (generator ve seed paylaşır). */
export function catalogGtin(index: number): string {
  const base = 8690000000000 + index * 137 + 1;
  return String(base).slice(0, 13);
}

// Çözülmüş gerçek Wikipedia görselleri (scripts/resolve-images.ts üretir).
import RESOLVED from "./catalog-images.json";
const RESOLVED_IMAGES = RESOLVED as Record<string, string>;

/** Ürün indeksi için gerçek görsel URL'i (yoksa null → UI placeholder). */
export function imageFor(index: number): string | null {
  return RESOLVED_IMAGES[String(index)] ?? null;
}
