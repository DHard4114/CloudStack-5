# 🎮 CompEng Quiz – Enterprise Gamified Quiz Platform

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://mysql.com/)
[![CloudStack](https://img.shields.io/badge/Apache%20CloudStack-4.18-orange)](https://cloudstack.apache.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**CompEng Quiz** adalah platform kuis interaktif real-time berbasis web (Quizizz/Kahoot-like) yang dirancang dengan arsitektur enterprise di atas **Apache CloudStack**. Proyek ini adalah bagian dari tugas akhir mata kuliah **Komputasi Awan** dengan fokus pada:

- **High-concurrency gaming** (200+ peserta per sesi)
- **Real-time leaderboard** via WebSocket
- **Auto-scaling** backend API di CloudStack
- **High availability** database dan management server
- **Isolasi tenant** berbasis project

---

## 🚀 Fitur Utama

| Fitur | Teknologi |
|-------|------------|
| Autentikasi JWT | bcrypt + jsonwebtoken |
| Live leaderboard | Socket.IO |
| Clean architecture | Route → Controller → Repository |
| Anti-IDOR | UUID di semua eksposur API |
| Race condition protection | UNIQUE KEY + trigger MySQL |
| Auto-scaling backend | CloudStack Auto Scaling Group |
| Load balancing | CloudStack LB + leastconn |
| Isolated network per session | CloudStack Guest Network (VLAN) |

---

## 🏗️ Arsitektur Infrastruktur (CloudStack)

- **1 Management Server** (VM Ubuntu 22.04) – bisa di‑clone untuk HA
- **1 MySQL Server** (co‑hosted dengan management) – siap untuk Galera Cluster
- **NAT + Bridge dual network** agar VM bisa internet dan tetap dijangkau host lokal
- **Primary Storage**: NFS (untuk volume VM)
- **Secondary Storage**: NFS (untuk template & snapshot)
- **Guest Network**: Isolated with Source NAT (VLAN per sesi kuis)
- **Load Balancer**: Least Connection untuk WebSocket
- **Auto Scaling**: CPU >70% → spin up new API instance

> Lihat diagram lengkap di `docs/architecture/network-diagram.md`

---

## 🧩 Komponen Utama

### Backend API (Node.js + Express + Socket.IO)
- Port: `3000`
- Endpoints: `/api/auth`, `/api/quizzes`, `/api/sessions`
- WebSocket event: `join-session`, `leaderboard-update`

### Database (MySQL 8.0)
- 9 tabel master + 2 transactional
- Triggers untuk auto‑update skor dan validasi
- Stored procedures untuk finalisasi rank

### CloudStack Resources
- VM template `CompEng-API-v1`
- Auto Scale Group `quiz-asm`
- Load Balancer `quiz-websocket-lb`

---

## 📦 Deployment Guide (Singkat)

### 1. Persiapan VM Ubuntu (dengan dual network)
```bash
# Konfigurasi netplan seperti di docs/deployment/dual-network-bridge-nat.md
sudo netplan apply