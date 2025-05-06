# Story App

Story App adalah aplikasi web progresif (PWA) yang memungkinkan pengguna untuk berbagi cerita dengan lokasi. Aplikasi ini dibangun menggunakan vanilla JavaScript dan mengimplementasikan berbagai fitur modern seperti PWA, offline capability, dan push notifications.

## Fitur Utama

- 📱 **Progressive Web App (PWA)**
  - Dapat diinstal di perangkat
  - Bekerja offline
  - Push notifications
  - Responsif di berbagai perangkat

- 📍 **Integrasi Peta**
  - Menambahkan lokasi ke cerita
  - Menampilkan peta interaktif
  - Menggunakan OpenStreetMap

- 📸 **Fitur Kamera**
  - Mengambil foto langsung dari kamera
  - Switch antara kamera depan dan belakang
  - Preview foto sebelum upload

- 🔄 **Offline Capability**
  - Menyimpan cerita offline
  - Sinkronisasi otomatis saat online
  - Halaman offline stories

- 🔔 **Push Notifications**
  - Notifikasi saat cerita baru dibuat
  - Notifikasi saat cerita berhasil disinkronkan

## Teknologi yang Digunakan

- Vanilla JavaScript
- Workbox untuk PWA
- IndexedDB untuk penyimpanan offline
- Leaflet untuk peta
- Webpack untuk build
- ESLint untuk linting

## Persyaratan Sistem

- Node.js (versi 14 atau lebih tinggi)
- NPM (versi 6 atau lebih tinggi)
- Browser modern yang mendukung PWA

## Instalasi

1. Clone repository:
```bash
git clone https://github.com/username/story-app.git
cd story-app
```

2. Install dependencies:
```bash
npm install
```

3. Jalankan aplikasi dalam mode development:
```bash
npm start
```

4. Build untuk production:
```bash
npm run build
```

## Struktur Proyek

```
story-app/
├── public/
│   ├── icons/
│   ├── screenshots/
│   ├── manifest.json
│   ├── offline.html
│   └── not-found.html
├── src/
│   ├── scripts/
│   │   ├── app.js
│   │   ├── router.js
│   │   ├── presenter.js
│   │   ├── model.js
│   │   ├── view.js
│   │   ├── addStoryForm.js
│   │   ├── offlineStories.js
│   │   └── indexedDB.js
│   └── styles/
│       └── styles.css
├── webpack.config.js
├── workbox-config.js
└── package.json
```

## Penggunaan

1. **Login/Register**
   - Buat akun baru atau login dengan akun yang ada
   - Akses sebagai tamu juga tersedia

2. **Menambah Story**
   - Klik "Add Story" di menu
   - Isi deskripsi
   - Ambil foto atau pilih dari galeri
   - Pilih lokasi di peta
   - Submit story

3. **Melihat Story**
   - Story ditampilkan di halaman utama
   - Klik story untuk melihat detail
   - Lihat lokasi di peta

4. **Mode Offline**
   - Story akan tersimpan lokal saat offline
   - Akses story offline di menu "Offline Stories"
   - Sinkronisasi otomatis saat online

## Testing

```bash
npm run lint
```

## Deployment

1. Build aplikasi:
```bash
npm run build
```

2. Deploy folder `dist` ke hosting yang mendukung HTTPS

## Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## Lisensi

Distribusikan di bawah lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

## Kontak

Dio Adista Laksono - [@diyoadista](https://github.com/diyoadisuta)

Link Proyek: [https://github.com/diyoadisuta/story-app](https://github.com/diyoadisuta/story-app) 