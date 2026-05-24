# Horse Racing Tournament Management System

Dự án quản lý giải đua ngựa với Backend PHP (Laravel) và Frontend React (Vite).

## Cấu trúc thư mục

```text
/
├── backend/            # Mã nguồn Laravel (API)
│   ├── app/            # Controllers, Models, Services
│   ├── database/       # Migrations & Seeders
│   └── routes/         # Định nghĩa các API endpoints
├── frontend/           # Mã nguồn React (Vite)
│   ├── src/            # Components, Pages, Hooks, API services
│   └── public/         # Static assets
└── README.md
```

## Hướng dẫn cài đặt

### 1. Backend (Laravel)

Yêu cầu: PHP >= 8.1, Composer, MySQL.

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Cấu hình database trong file .env
php artisan migrate
php artisan serve
```

### 2. Frontend (React)

Yêu cầu: Node.js, npm/yarn.

```bash
cd frontend
npm install
npm run dev
```

## Các tính năng chính (theo vai trò)

- **Horse Owner**: Đăng ký ngựa, quản lý ngựa, chọn Jockey, theo dõi kết quả.
- **Jockey**: Nhận lời mời, quản lý lịch thi đấu, xem thành tích cá nhân.
- **Referee**: Kiểm tra thông tin trước cuộc đua, ghi nhận kết quả & vi phạm.
- **Spectator**: Xem thông tin giải đấu, theo dõi kết quả trực tiếp, dự đoán kết quả.
- **Admin**: Quản lý người dùng, thiết lập giải đấu và hệ thống.

## Công nghệ sử dụng

- **Backend**: PHP 8.x, Laravel 10/11, MySQL, Sanctum (Authentication).
- # **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router.

# Laptrinh-Web
