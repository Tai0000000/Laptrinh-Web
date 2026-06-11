# 🐴 Horse Racing Tournament Management System

Dự án quản lý giải đua ngựa với Backend **Laravel 11** và Frontend **React + Vite**.

---

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo đã cài:

- ✅ **Docker Desktop** (tải từ https://www.docker.com/products/docker-desktop)
- ✅ **Git** 
- ✅ **Node.js 18+** (nếu muốn chạy frontend)

Kiểm tra:
```bash
docker --version
docker compose --version
git --version
node --version
```

---

## 🚀 Setup nhanh (5 bước)

### 1️⃣ Clone repository
```bash
git clone <your-repo-url>
cd Laptrinh-Web
```

### 2️⃣ Setup Backend + Database
```bash
# Copy file cấu hình
cp backend/.env.example backend/.env

# Khởi động Docker containers (Laravel + MySQL)
docker compose up --build
```

**Lần đầu sẽ mất 5-10 phút:**
- Download PHP 8.3-FPM image
- Download MySQL image  
- Chạy `composer install` (76 packages)
- Tạo database schema từ migration
- Chạy migration tự động

**Khi xong, bạn sẽ thấy:**
```
   INFO  Server running on [http://0.0.0.0:8000].
  Press Ctrl+C to stop the server
```

✅ **Backend ready:** http://localhost:8000

### 3️⃣ Kiểm tra Backend
Mở terminal khác (giữ Docker chạy):
```bash
curl http://localhost:8000/api/health
# Response: {"status":"ok","service":"Horse Racing API","timestamp":"..."}
```

### 4️⃣ Setup Frontend (Optional)
```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://localhost:5173**

### 5️⃣ Bắt đầu coding
Các thành viên implement logic ở `backend/app/Http/Controllers/API/`

---

## 📁 Project Structure

```
Laptrinh-Web/
├── backend/                          # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/API/
│   │   │   │   └── AuthController.php ← TODO: implement
│   │   │   └── Middleware/
│   │   └── Models/
│   │       ├── User.php
│   │       └── Horse.php
│   ├── bootstrap/
│   │   └── app.php
│   ├── config/
│   ├── database/
│   │   └── migrations/
│   ├── routes/
│   │   └── api.php
│   ├── .env.example              # Copy to .env
│   ├── Dockerfile
│   ├── composer.json
│   └── artisan
│
├── frontend/                         # React + Vite SPA
│   ├── src/
│   │   ├── api/axios.js          # API client
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Tech Stack

- **Backend**: PHP 8.3, Laravel 11, Laravel Sanctum (Authentication)
- **Database**: MySQL 8.0 (in Docker)
- **Frontend**: React 18, Vite, Tailwind CSS, Axios
- **Deployment**: Docker, Docker Compose

---

## 👥 Features

- **Horse Owner** - Đăng ký ngựa, quản lý, chọn Jockey
- **Jockey** - Quản lý lịch thi đấu
- **Referee** - Ghi nhận kết quả
- **Spectator** - Xem giải đấu, dự đoán kết quả
- **Admin** - Quản lý toàn hệ thống

---

## 🔌 API Endpoints

| Method | Endpoint | Status | Ghi chú |
|--------|----------|--------|---------|
| GET | `/api/health` | ✅ Hoạt động | Health check |
| POST | `/api/register` | 🔄 Stub | Team implements |
| POST | `/api/login` | 🔄 Stub | Team implements |
| GET | `/api/user` | 🔄 Cần auth | Team implements |
| POST | `/api/logout` | 🔄 Stub | Team implements |

**Stub** = Route tồn tại nhưng trả placeholder. Team implement business logic.

---

## 🗄️ Database Schema

Tự động tạo khi Docker start (7 bảng):

- **users** - Tài khoản (horse_owner, jockey, referee, spectator, admin)
- **horses** - Thông tin ngựa  
- **tournaments** - Giải đua
- **races** - Cuộc chạy
- **registrations** - Đăng ký ngựa cho cuộc chạy
- **race_results** - Kết quả chạy
- **bets** - Cược của khán giả

---

## 👨‍💻 Development Guide

### Add Route mới
Mở `backend/routes/api.php`:
```php
Route::get('/tournaments', [TournamentController::class, 'index']);
```

### Create Model mới
```bash
docker compose exec backend php artisan make:model Tournament
```

### Create Migration mới
```bash
docker compose exec backend php artisan make:migration create_tournaments_table
```

### Run Migration
```bash
docker compose exec backend php artisan migrate
```

### Lệnh artisan hữu ích
```bash
docker compose exec backend php artisan tinker          # Interactive shell
docker compose exec backend php artisan cache:clear    # Clear cache
docker compose exec backend php artisan route:list     # Xem routes
docker compose exec backend php artisan db:seed        # Run seeders
```

---

## ✅ Team Tasks

Các thành viên implement:

- [ ] **AuthController** - Login, Register, Logout logic
- [ ] **TournamentController** - CRUD tournaments
- [ ] **HorseController** - CRUD horses
- [ ] **RaceController** - CRUD races
- [ ] **BetController** - Place & manage bets
- [ ] **Frontend Pages** - Kết nối API

Controllers có TODO comments ở `backend/app/Http/Controllers/API/`.

---

## 🛑 Troubleshooting

### Docker containers không start?
```bash
docker system prune -af
docker compose down
docker compose up --build
```

### Port 8000 hoặc 3306 đã bị dùng?
Sửa `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # External:Internal
```

### Quên copy .env?
```bash
cp backend/.env.example backend/.env
```

### Reset database?
```bash
docker compose down -v
docker compose up --build
```

### API không respond?
```bash
docker logs horse_racing_api
```

### Database error?
```bash
docker logs laptrinh-web-db-1
```

### Vào MySQL?
```bash
docker compose exec db mysql -u horse_user -p horse_racing
```

---

## 📞 Thêm info

- Xem routes: `docker compose exec backend php artisan route:list`
- Config: `backend/config/` folder
- Database config: `backend/.env`
- Frontend config: `frontend/src/api/axios.js`

**Chúc mừng! 🎉 Setup xong, bắt đầu coding!**
