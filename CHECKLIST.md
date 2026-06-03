# Checklist Screenshot Dokumentasi

Checklist ini dipakai untuk melengkapi placeholder gambar pada `README.md`. Karena environment CloudStack dan QuizLive sudah selesai dibuat, screenshot tidak perlu mengulang command setup dari awal. Ambil gambar dari status akhir yang sudah ada di VirtualBox, Ubuntu Server, CloudStack dashboard, terminal, PM2, dan aplikasi QuizLive.

## Screenshot Infrastruktur

| Placeholder README | Isi gambar yang perlu dimasukkan | Status yang dibuktikan |
|--------------------|-----------------------------------|------------------------|
| `docs/images/banner.png` | Banner/top cover project QuizLive | Identitas project |
| `docs/images/network-topology.png` | Diagram/topologi jaringan akhir | Alur LAN -> CloudStack host -> Virtual Router -> VM |
| `docs/images/phase1-vbox-manager.png` | VirtualBox Manager menampilkan VM `CloudStack-Host` | VM host tersedia |
| `docs/images/phase2-network-config.png` | Settings Network VirtualBox | Adapter bridged aktif, promiscuous mode Allow All |
| `docs/images/phase3-netplan.png` | Output `ip addr show cloudbr0` atau tampilan config Netplan | Bridge `cloudbr0` aktif di `192.168.101.220/24` |
| `docs/images/phase4-cloudstack-login.png` | Halaman login/dashboard CloudStack | CloudStack management dapat diakses |
| `docs/images/phase5-nfs-export.png` | Output `showmount -e localhost` atau file `/etc/exports` | NFS primary/secondary tersedia |
| `docs/images/phase6-add-zone.png` | Detail Zone `QuizServer-Zone` | Advanced Zone sudah dibuat |
| `docs/images/phase6-zone-enabled.png` | Zone status enabled/ready | Zone sudah launch dan System VM berjalan |
| `docs/images/phase6-iso-ready.png` | ISO `Ubuntu-22.04-Server` status Ready | ISO berhasil diregister dari URL lokal |
| `docs/images/phase6-compute-offering.png` | Compute Offering `quizlivesmall` dan `quizlivemedium` | Offering custom tersedia |
| `docs/images/phase6-isolated-network.png` | Network `QuizLive-Isolated-OK` | Isolated guest network aktif |
| `docs/images/phase7-instance-running.png` | Instance `quizlive-db-vm` status Running | VM backend/database berjalan |
| `docs/images/phase8-view-console.png` | View Console VM Ubuntu | Akses instalasi VM via console tersedia |
| `docs/images/phase8-mysql-installed.png` | Status MySQL aktif di VM | Database service berjalan |
| `docs/images/phase9-pm2.png` | `pm2 list` menampilkan `quizlive-api` online | Backend API aktif |
| `docs/images/phase10-firewall.png` | Firewall rules port `3000` dan `2222` | Akses publik dibuka di Virtual Router |
| `docs/images/phase10-port-forwarding.png` | Port forwarding `3000 -> 3000` dan `2222 -> 22` | DNAT ke VM benar |
| `docs/images/phase10-curl.png` | Test `curl /health` dari Windows host | Backend bisa diakses dari luar isolated network |
| `docs/images/phase11-landing.png` | Landing/dashboard frontend QuizLive | Frontend berjalan |
| `docs/images/phase12-e2e.png` | Bukti akhir quiz selesai/leaderboard | E2E berhasil |

## Screenshot Alur QuizLive

Bagian Phase 12 di `README.md` sudah menggunakan gambar HackMD untuk alur admin dan client HP. Jika ingin dipindah ke file lokal, simpan screenshot dengan nama berikut:

| Urutan | File lokal opsional | Isi screenshot |
|--------|---------------------|----------------|
| 1 | `docs/images/phase12-01-admin-register.png` | Admin/guru membuat akun |
| 2 | `docs/images/phase12-02-admin-login.png` | Admin/guru login |
| 3 | `docs/images/phase12-03-create-quiz.png` | Admin membuat quiz |
| 4 | `docs/images/phase12-04-add-questions.png` | Admin menambahkan pertanyaan |
| 5 | `docs/images/phase12-05-session-code.png` | Kode join/PIN muncul |
| 6 | `docs/images/phase12-06-mobile-join.png` | Client HP memasukkan kode join |
| 7 | `docs/images/phase12-07-start-quiz.png` | Admin memulai quiz |
| 8 | `docs/images/phase12-08-mobile-answer.png` | Client HP menjawab pertanyaan |
| 9 | `docs/images/phase12-09-leaderboard.png` | Skor/leaderboard terlihat |
| 10 | `docs/images/phase12-10-end-session.png` | Sesi quiz selesai |

## Cara Mengisi Gambar

1. Buat folder `docs/images/` di root repository.
2. Ambil screenshot dari status akhir yang sudah ada, bukan menjalankan ulang setup.
3. Rename file sesuai placeholder pada tabel.
4. Masukkan file ke `docs/images/`.
5. Buka `README.md` dan pastikan gambar lokal tidak broken.

