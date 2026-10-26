# SmartFinder — Modul Registrasi dan Eksplorasi

**Nama:** Nabil Faza Al-Musyaffa  
**NIM:** 25091397054  
**Kelas:** D4 Manajemen Informatika 2025 kelas B  
**Kelompok:** 09 (kode B09 untuk nama proyek UTS)  
**Mata kuliah:** Pemrograman Web

## Ringkasan dan cakupan UTS

Prototipe individu yang mengenalkan SmartFinder kepada calon pengguna dan memberi contoh eksplorasi data akademik Jawa Timur sebelum registrasi. Ini **bukan** aplikasi Laravel lama dan **belum** terhubung ke basis data nyata.

| Butir soal | Berkas | Implementasi |
| --- | --- | --- |
| 2.a | `index.html`, `assets/css/style.css`, `assets/css/refined.css`, `assets/js/app.js` | Layout utama responsif dengan navbar, hero, manfaat, alur penggunaan, footer, dan area konten dinamis. Link `#eksplorasi` dan `#registrasi` memicu `fetch()` HTML; layout tidak dimuat ulang. Gerak masuk/hover mengikuti preferensi *reduced motion*. |
| 2.b | `pages/eksplorasi.html`, `assets/js/eksplorasi.js`, `data/universitas.json` | Pencarian nama kampus/prodi, filter kota kampus dan jenis PTN/PTS, kartu hasil, detail program studi. |
| 2.c | `pages/registrasi.html`, `assets/js/registrasi.js`, `server.py` | Form nama, email, kata sandi, konfirmasi, kota domisili, kampus, fakultas, dan prodi; indikator langkah akademik yang mengikuti pilihan, validasi JavaScript sebelum HTTP POST, pesan error per kolom dan respons server demo. |

Halaman 2.b dan 2.c adalah fragmen HTML di dalam `index.html`, bukan halaman terpisah yang membuka layout baru. JavaScript penginisialisasiannya berada di berkas terpisah karena `<script>` pada HTML yang disisipkan dengan `innerHTML` tidak otomatis dijalankan.

## Menjalankan

Persyaratan: Python 3 dan browser modern. **Tidak perlu memasang library baru**; HTML/CSS/JS browser dan pustaka standar Python sudah cukup. Setelah mengunduh/mengekstrak seluruh folder proyek, buka terminal di folder induknya lalu jalankan:

```bash
cd PWUTS_B09_25091397054
python3 server.py
```

Buka `http://127.0.0.1:8000/` di browser **pada komputer yang menjalankan perintah tadi**. Di Windows, jika perintah `python3` tidak tersedia tetapi Python Launcher terpasang, jalankan `py -3 server.py` dari dalam folder proyek. Bila port sibuk, gunakan `python3 server.py 8765` lalu buka `http://127.0.0.1:8765/`. Hentikan server dengan Ctrl+C. Jangan buka `index.html` langsung melalui `file://` karena `fetch()` fragmen/data perlu HTTP. Server statis seperti `python3 -m http.server` bisa memperlihatkan tampilan, tetapi tidak mendukung simulasi POST `/api/registrasi` ini.

Jika saat menjalankan `python3 server.py` muncul pesan **“Port 8000 sudah digunakan”** (sebelumnya tampil sebagai `OSError: [Errno 48] Address already in use` di macOS), artinya server lain sudah mendengarkan pada port tersebut—bukan kesalahan HTML atau Python. Buka alamat server yang telah berjalan, hentikan server lama dengan Ctrl+C di terminalnya, atau pilih port lain seperti contoh di atas. Di macOS, `lsof -nP -iTCP:8000 -sTCP:LISTEN` dapat menunjukkan proses yang memakai port; pastikan itu proses proyek ini sebelum menghentikannya.

**Alamat pada bilah browser harus sama dengan alamat yang dicetak `server.py`, termasuk port.** Jika menjalankan `python3 server.py 8765`, buka `http://127.0.0.1:8765/#registrasi` dari awal; jangan mengisi formulir di tab lama dari Live Server (`:5500`), server statis lain, atau `file://`. Form mengirim POST ke asal halaman yang sedang dibuka, bukan otomatis ke port Python yang kebetulan aktif. Muat ulang halaman setelah pindah alamat agar skrip terbaru terambil.

`127.0.0.1` adalah alamat lokal: tautan dari komputer pengembang **tidak bisa dibuka dosen dari internet**. Untuk penilaian jarak jauh, dosen dapat mengunduh seluruh proyek dan menjalankan perintah di atas di komputernya; apabila wajib berupa situs online, perlu hosting yang menjalankan `server.py` atau backend HTTP setara. GitHub Pages hanya menyajikan berkas statis dan tidak dapat menjalankan endpoint POST demo tersebut. `server.py` ini untuk demonstrasi lokal, bukan server produksi terbuka ke internet.

## Alur teknis

- Link menu memakai hash (`#beranda`, `#eksplorasi`, `#registrasi`). `assets/js/app.js` mendeteksi perubahan hash, mengambil fragmen dari `pages/` melalui `fetch()` (Ajax), mengisi `#dynamic-content`, lalu mengaktifkan interaksi sesuai halaman. Ada status loading, pesan error, tombol coba lagi, dan perlindungan respons navigasi yang datang terlambat.
- `data/universitas.json` menggunakan relasi `provinces → cities → universities → faculties → study_programs`. Setiap prodi terhubung ke satu fakultas dan kampus; server memvalidasi kedua relasi. Saat riset 26 Oktober 2026, data memuat **16 kampus (12 PTN, 4 PTS), 128 kelompok fakultas, dan 651 pilihan S1/D4**. Setiap fakultas memiliki `source_url` resmi yang bisa dibuka dari panel detail. Ini inventaris yang dikompilasi untuk demonstrasi, **bukan jaminan seluruh prodi aktif menerima mahasiswa pada 2026/2027**. Perbedaan sumber per kampus disimpan dalam `catalog_notes`.
- Situs ITS memuat beberapa ejaan tak seragam; nama prodi dinormalisasi untuk tampilan tanpa mengubah pengelompokan fakultas. Daftar UNESA mencakup kampus utama (PSDKU tidak disebut fakultas). Pada UB, beberapa baris tidak dapat diaudit langsung karena perlindungan akses; lima program kampus Kediri yang belum dapat dipastikan relasi fakultasnya dikecualikan. Pada UNEJ, Peternakan kampus Bondowoso dikecualikan karena alokasi fakultasnya belum terkonfirmasi. Katalog UIN Kediri menampilkan 25 S1 dalam daftar fakultas sementara beranda menyebut 26; selisihnya belum ditemukan. Katalog UIN SATU dan halaman admisinya berbeda dalam penempatan Sains Data; relasi dalam data mengikuti tabel admisi. Dua prodi UMSIDA dan Desain Produk Dinamika ditemukan pada situs fakultas tetapi tidak jelas tercantum dalam daftar penerimaan terbaru. **Periksa catatan verifikasi dan sumber resmi sebelum menjadikan pilihan ini rujukan pendaftaran nyata.**

| Kampus | Fakultas | S1/D4 dalam data | Katalog utama |
| --- | ---: | ---: | --- |
| UNESA | 12 | 105 | [Program studi](https://unesa.ac.id/program-studi) |
| ITS | 8 | 55 | [Program studi](https://www.its.ac.id/program-studi/) |
| UPN Veteran Jawa Timur | 8 | 29 | [Sarjana](https://upnjatim.ac.id/program-sarjana/) |
| UB | 17 | 81 | [Seleksi 2026](https://selma.ub.ac.id/seleksi-masuk-nasional-tes/) |
| UNEJ | 15 | 68 | [SNBP 2026](https://unej.ac.id/akademik/snbp-unej-2026/) |
| UBAYA | 8 | 16 | [Akreditasi prodi](https://dpmai.ubaya.ac.id/akreditasi-nasional/index.html) |
| Dinamika | 3 | 8 | [PMB prodi](https://pmb.dinamika.ac.id/program-studi) |
| UMM | 11 | 38 | [Akreditasi prodi](https://bpp.umm.ac.id/akreditasi/) |
| UMSIDA | 5 | 30 | [Program sarjana](https://umsida.ac.id/program-sarjana/) |
| UIN Sunan Ampel Surabaya | 10 | 49 | [PMB prodi](https://pmb.uinsby.ac.id/program-studi) |
| UIN Maulana Malik Ibrahim Malang | 9 | 34 | [PMB prodi](https://pmb.uin-malang.ac.id/program-studi/) |
| UIN KH Achmad Siddiq Jember | 5 | 30 | [PMB sarjana](https://pmb.uinkhas.ac.id/page/detail/sarjana) |
| UIN Sayyid Ali Rahmatullah Tulungagung | 4 | 38 | [Fakultas dan prodi](https://uinsatu.ac.id/fakultas-dan-prodi/) |
| UIN Madura | 5 | 23 | [Izin operasional prodi](https://lpm.uinmadura.ac.id/halaman/izin-operasional-prodi) |
| UIN Syekh Wasil Kediri | 4 | 25 | [Fakultas](https://uinkediri.ac.id/page/unit-kerja-dan-fakultas) |
| UIN Kiai Ageng Muhammad Besari Ponorogo | 4 | 22 | [PMB prodi](https://my.uinponorogo.ac.id/pmb/index/prodi) |

Daftar tujuh UIN di atas dicocokkan dengan [daftar PTKIN SPAN-PTKIN 2026](https://span.ptkin.ac.id/ptkin). SPAN-PTKIN hanya salah satu jalur penerimaan, sehingga jumlah pilihannya tidak selalu sama dengan katalog kampus. Sumber spesifik tiap fakultas ada di `data/universitas.json` dan dapat dibuka lewat bagian Eksplorasi.
- `assets/css/refined.css` melapisi CSS dasar dengan tata letak editorial, respons hover/fokus, dan indikator progres form. `assets/js/app.js` menampilkan teks, kartu, dan elemen form setiap kali kembali masuk viewport lewat scroll atau swipe (bukan hanya saat halaman pertama dibuka), termasuk fragmen Ajax; kartu hero bergeser halus mengikuti scroll. Tombol **Buat akun** dan **Mulai daftar** langsung mengarah ke judul **Kenalan dulu, yuk.**, termasuk ketika halaman registrasi sudah aktif. Efek tidak menyembunyikan konten pada tab latar, tanpa JavaScript, atau saat `prefers-reduced-motion` aktif. Progres form diperbarui saat kampus → fakultas → prodi dipilih atau di-reset.
- `city_id` di form berarti **kota domisili mahasiswa**; kampus boleh berada di kota lain. Filter kota di eksplorasi berarti **lokasi kampus**. Fakultas mengikuti kampus, lalu prodi mengikuti fakultas.
- `assets/js/registrasi.js` memeriksa kolom wajib, format email, minimal 8 karakter kata sandi, kecocokan konfirmasi, serta relasi kampus/fakultas/prodi. Input invalid mencegah POST. Konfirmasi hanya untuk validasi dan **tidak** dikirim.
- Setelah valid, browser mengirim `POST /api/registrasi` dengan JSON. `server.py` memvalidasi ulang tipe/nilai/relasi dan mengembalikan JSON sukses atau galat. **Tidak ada penyimpanan data, akun, sesi login, maupun email sungguhan; kata sandi tidak ditulis ke file, localStorage, atau log aplikasi.** Endpoint ini hanya simulasi proses HTTP, bukan backend produksi.
- Untuk produksi, sambungkan ke backend dengan validasi server, autentikasi, perlindungan CSRF, database sesuai proposal, dan hashing kata sandi. Endpoint `/daftar` proyek Laravel lama tidak langsung kompatibel dengan skema/payload proposal baru.

## Struktur

```text
PWUTS_B09_25091397054/
├── index.html                 # Layout 2.a dan wadah konten Ajax
├── pages/
│   ├── eksplorasi.html        # Konten 2.b
│   └── registrasi.html        # Form 2.c
├── assets/
│   ├── css/style.css          # CSS dasar dari tahap awal
│   ├── css/refined.css        # Tata letak editorial, interaksi, animasi, responsif
│   ├── js/app.js              # Router Ajax dan pemuatan data
│   ├── js/eksplorasi.js       # Pencarian, filter, detail
│   ├── js/registrasi.js       # Dropdown, validasi, POST
│   └── images/logo.png        # Logo dari website SmartFinder lama
├── data/universitas.json      # Data simulasi berelasi
├── server.py                  # Server HTTP simulasi tanpa database
├── tests/                    # Tes relasi data, pemuatan Ajax, dan validasi server
├── .gitignore                # Abaikan cache Python dan berkas lokal
└── README.md                  # Dokumentasi proyek
```

## Asal komponen dan batasan

Logo diambil dari `public/images/logo.png` pada checkout `smart-finder-mahasiswa` milik Nabil faza al-musyaffa. Warna biru `#2563EB`, biru gelap `#1E3A8A`, dan mint `#A7FFE8`, serta konsep hero “temukan partner belajar” diadaptasi dari `public/css/smartfinder.css` dan `resources/views/home.blade.php`. Struktur HTML/Ajax, data berelasi, form, validasi, dan server demo dibuat khusus untuk UTS; proyek Laravel lama tidak diubah. Fitur profil, rekomendasi partner, dan ajakan masih di luar modul ini.

## Pengujian manual

Jalankan server lalu periksa:

1. Buka `/`, cek hero, manfaat, footer, logo, serta lebar ponsel sekitar 375 px tanpa scroll horizontal.
2. Klik Eksplorasi; pastikan URL menjadi `#eksplorasi`, hero tetap ada, dan network memuat `pages/eksplorasi.html` melalui fetch. Cari `sistem informasi`, lalu filter Malang + PTS, buka detail UMM, dan coba tombol hapus filter.
3. Klik Daftar Akun; kirim form kosong (muncul error per kolom), coba email salah dan konfirmasi berbeda, lalu pilih kampus → fakultas → prodi; ganti kampus untuk memastikan pilihan turunan ter-reset.
4. Isi valid: kota domisili Jember, Universitas Negeri Surabaya, Fakultas Vokasi, prodi Manajemen Informatika (D4), nama, email valid, dan kata sandi 8+ karakter yang cocok. Klik kirim; server mengembalikan pesan **simulasi berhasil, data tidak disimpan**.
5. Di DevTools Network periksa `POST /api/registrasi`. Kirim pasangan kampus/fakultas/prodi tidak cocok lewat klien HTTP: server harus merespons HTTP 422.
6. Matikan server atau putuskan akses data lalu reload; pastikan kegagalan ditampilkan jelas, bukan disembunyikan.

Uji browser desktop/mobile dan POST simulasi telah dijalankan pada server lokal. Data dan akun tidak dibuat untuk diuji ulang setelah server dimatikan.

Jalankan tes otomatis dengan `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -v`. Tes memeriksa integritas relasi, urutan pemuatan skrip Ajax, regresi server, serta jumlah entri per kampus dari snapshot sumber resmi; tes **tidak** dapat membuktikan kelengkapan mutakhir atau bahwa situs kampus tidak berubah kemudian.

## Pengumpulan GitHub

Gunakan repository **terpisah** bernama `PWUTS_B09_25091397054` di akun `nabilfazaalmusyaffa` agar URL sesuai contoh soal: `https://github.com/nabilfazaalmusyaffa/PWUTS_B09_25091397054`. Nama B09 mengikuti kelas B dan kelompok 09 pada proposal; konfirmasi lagi dengan dosen apabila kode resmi berbeda. Pastikan repository publik dan URL benar-benar dapat dibuka sebelum mengumpulkan. Jangan unggah file rahasia atau folder proyek Laravel lama. Periksa bahwa bagian 2.d (pekerjaan tiap anggota tidak sama) telah disepakati kelompok.

Buat repository **kosong** di GitHub dengan nama tepat tersebut, tanpa mencentang penambahan README, `.gitignore`, atau lisensi dari GitHub. Periksa dulu nama dan email penulis Git lokal; konfigurasi email yang terbaca pada komputer pengembang pernah berisi salah ketik `gmial.com`. Gunakan alamat email GitHub yang benar/terverifikasi, dan jangan menjalankan `git commit` sebelum identitasnya benar.

```bash
cd PWUTS_B09_25091397054
git init -b main
git config user.name "Nabil Faza Al-Musyaffa"
git config user.email "EMAIL_GITHUB_YANG_BENAR" # ganti placeholder sebelum commit
git add .gitignore README.md index.html server.py pages assets data tests
git diff --cached --name-only # pastikan tidak ada __pycache__, .env, atau berkas pribadi
git diff --cached --stat
git commit -m "Build SmartFinder UTS registration and exploration"
git remote add origin https://github.com/nabilfazaalmusyaffa/PWUTS_B09_25091397054.git
git push -u origin main
# Verifikasi: git status -sb dan buka URL repository untuk melihat index.html
```

Perintah di atas adalah panduan; repository GitHub **belum** dibuat atau diunggah oleh proyek lokal ini. Jika GitHub meminta autentikasi saat push, selesaikan melalui alur login browser/credential helper; jangan memasukkan kata sandi akun ke chat atau menaruh token di URL remote. Untuk revisi berikutnya, stage hanya berkas yang dimaksud, tinjau `git diff --cached`, lalu commit dan `git push` lagi.
# PWUTS_B09_25091397054
