# Spectator Portal & Betting — Luồng hoạt động

## Tổng quan

Spectator Portal là phần dành cho người xem (role `spectator`) — cho phép xem giải đấu, theo dõi lịch đua và đặt dự đoán (cược) vào ngựa trước khi cuộc đua bắt đầu. Kết quả cược được xác định sau khi referee nhập kết quả chính thức.

---

## Kiến trúc tổng thể

```
Spectator (Browser)
    │
    ├── GET /public/tournaments        → Xem danh sách giải đấu (không cần auth)
    ├── GET /public/races              → Xem danh sách cuộc đua (không cần auth)
    ├── GET /public/races/:id          → Xem chi tiết cuộc đua + danh sách ngựa
    ├── GET /public/race-results/:id   → Xem kết quả công khai
    │
    └── [Yêu cầu JWT + role spectator]
        ├── POST /api/bets             → Đặt cược
        ├── GET  /api/bets             → Xem lịch sử cược
        ├── GET  /api/bets/:id         → Xem chi tiết một cược
        └── DELETE /api/bets/:id       → Hủy cược (chỉ khi pending + trước giờ đua)
```

---

## Routes định nghĩa

**File:** `backend/routes/api.php`

```php
// Dòng 30-36 — Public routes (không cần auth)
Route::get('/public/tournaments',           [TournamentController::class, 'index']);
Route::get('/public/tournaments/{id}',      [TournamentController::class, 'show']);
Route::get('/public/races',                 [RaceController::class, 'index']);
Route::get('/public/races/live',            [RaceController::class, 'live']);
Route::get('/public/races/{id}',            [RaceController::class, 'show']);
Route::get('/public/race-results/{raceId}', [RaceResultController::class, 'leaderboard']);

// Dòng 38-39 — Races không cần auth (dùng cho Predictions.jsx)
Route::get('/races',      [RaceController::class, 'index']);
Route::get('/races/{id}', [RaceController::class, 'show']);

// Dòng 172-177 — Spectator routes (yêu cầu JWT + role spectator)
Route::middleware('jwt.auth:spectator')->group(function () {
    Route::post('/bets',        [BetController::class, 'store']);
    Route::get('/bets',         [BetController::class, 'index']);
    Route::get('/bets/{id}',    [BetController::class, 'show']);
    Route::delete('/bets/{id}', [BetController::class, 'destroy']);
});
```

---

## React Router — Khai báo trang

**File:** `frontend/src/App.jsx`

```jsx
// Dòng 17-20 — Import các trang public
import Home        from './pages/Home';
import Tournaments from './pages/Tournaments';
import RaceDetail  from './pages/RaceDetail';
import Predictions from './pages/Predictions';

// Dòng 77-83 — Route định nghĩa (không cần PrivateRoute)
<Route path="/"                element={<Home />} />
<Route path="/tournaments"     element={<Tournaments />} />
<Route path="/tournaments/:id" element={<TournamentDetail />} />
<Route path="/races/:id"       element={<RaceDetail />} />
<Route path="/predictions"     element={<Predictions />} />
```

> `Predictions` không dùng `<PrivateRoute>` — trang có thể truy cập khi chưa đăng nhập,
> nhưng khi nhấn **GỬI DỰ ĐOÁN** sẽ gọi `POST /api/bets` yêu cầu JWT.

---

## Các trang Frontend

### 1. Trang chủ (`/`) — `frontend/src/pages/Home.jsx`

#### Fetch dữ liệu — dòng 282-298

```js
useEffect(() => {
  Promise.all([
    api.get('/public/tournaments'),  // dòng 283
    api.get('/public/races'),        // dòng 284
  ]).then(([tRes, rRes]) => {
    const ts = tRes.data?.data ?? tRes.data ?? [];
    const rs = rRes.data?.data ?? rRes.data ?? [];
    setTournaments(ts);
    setRaces(rs);
    // Lấy race sắp tới gần nhất
    const upcoming = rs
      .filter(r => r.status === 'scheduled' || r.status === 'ongoing')
      .sort((a, b) => new Date(a.race_time) - new Date(b.race_time));
    if (upcoming.length) setNextRace(upcoming[0]);
  });
}, []);
```

#### Component `HeroBanner` — dòng 40-110
- Hiển thị race sắp tới nhất (`nextRace`)
- Đồng hồ đếm ngược tới `race_time` — component `Countdown` dòng 6-35
- Nút **"Đặt cược ngay"** → `/predictions` (dòng 74)

#### Component `FeaturedTournaments` — dòng 113-172
- Hiển thị tối đa 6 giải đấu (`tournaments.slice(0, 6)` dòng 135)
- Tính trạng thái tournament từ `start_date`/`end_date` — hàm `getStatus` dòng 119-124

#### Component `UpcomingRaces` — dòng 175-265
- Filter race theo ngày: Hôm nay / Ngày mai — dòng 188-196
- Nút "CHI TIẾT" → `/races/:id` — dòng 246

---

### 2. Danh sách giải đấu (`/tournaments`) — `frontend/src/pages/Tournaments.jsx`

#### Fetch dữ liệu — dòng 11-15

```js
api.get('/public/tournaments')
  .then(res => setTournaments(res.data?.data ?? res.data ?? []))  // dòng 12
  .catch(() => setError('Không thể tải danh sách giải đấu.'))
  .finally(() => setLoading(false));
```

> `res.data?.data ?? res.data ?? []` — unwrap format `{success, data}` từ `TournamentController`

#### Tính trạng thái — dòng 17-24
```js
const getStatus = (start, end) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const s = new Date(start); s.setHours(0, 0, 0, 0);
  const e = new Date(end);   e.setHours(0, 0, 0, 0);
  if (today < s) return { label: 'Sắp diễn ra', cls: 'text-green-600' };
  if (today > e) return { label: 'Đã kết thúc',  cls: 'text-slate-400' };
  return { label: 'Đang diễn ra', cls: 'text-sky-600' };
};
```

#### Click card → `/tournaments/:id` — dòng 63

---

### 3. Chi tiết cuộc đua (`/races/:id`) — `frontend/src/pages/RaceDetail.jsx`

#### Fetch dữ liệu — dòng 13-22

```js
Promise.all([
  api.get(`/public/races/${id}`),                                    // dòng 14
  api.get(`/public/race-results/${id}`).catch(() => ({ data: { data: [] } })),  // dòng 15
]).then(([raceRes, resultRes]) => {
  const raceData = raceRes.data?.data ?? raceRes.data;               // dòng 17
  setRace(raceData);
  setResults(resultRes.data?.data ?? resultRes.data ?? []);
}).catch(() => setError('Không thể tải thông tin cuộc đua.'))
```

#### Nút "Đặt cược ngay" — dòng 92-94
```jsx
{race.status === 'scheduled' && (
  <Link to="/predictions" ...>Đặt cược ngay</Link>
)}
```
> Chỉ hiển thị khi race chưa bắt đầu (`status === 'scheduled'`)

#### Bảng ngựa tham dự — dòng 130-165
- Đọc `race.registrations` trả về từ `GET /public/races/:id`
- Hiển thị: làn, tên ngựa, nài ngựa, giống, tuổi
- Nút "Đặt cược" mỗi hàng → `/predictions` (dòng 159)

#### Bảng kết quả — dòng 101-127
- Chỉ hiển thị khi `results.length > 0` (race đã `finished`)

---

### 4. Sàn dự đoán (`/predictions`) — `frontend/src/pages/Predictions.jsx`

**Đây là trang chính của Betting.**

#### State — dòng 5-17
```js
const [races, setRaces]             = useState([]);   // danh sách race có thể cược
const [selectedRace, setSelectedRace] = useState(null);
const [participants, setParticipants] = useState([]);  // ngựa trong race
const [selectedHorse, setSelectedHorse] = useState(null);
const [prediction, setPrediction]   = useState({ amount: 10000, type: 'win' });
const [predictions, setPredictions] = useState([]);   // lịch sử cược
```

#### Bước 1 — Load danh sách race — dòng 21-29
```js
api.get('/public/races')
  .then(res => {
    const data = res.data?.data ?? res.data ?? [];
    const now = new Date();
    // Chỉ lấy race scheduled VÀ chưa qua giờ đua
    setRaces(data.filter(r => r.status === 'scheduled' && new Date(r.race_time) > now));
  })
```

#### Bước 2 — Load danh sách ngựa khi chọn race — dòng 33-51
```js
api.get(`/public/races/${selectedRace.id}`)
  .then(res => {
    const race = res.data?.data ?? res.data ?? {};
    const regs = race.registrations ?? [];
    setParticipants(regs.map(reg => ({
      id:          reg.id,           // registration_id — dùng để đặt cược
      horse_name:  reg.horse?.name  ?? '—',
      jockey_name: reg.jockey?.name ?? reg.jockey?.user?.name ?? '—',
      lane:        reg.lane ?? '—',
      odds:        reg.odds ?? 2.5,  // tỷ lệ thưởng
    })));
  })
```

#### Bước 3 — Load lịch sử cược — dòng 53-57
```js
const fetchPredictions = () => {
  api.get('/bets')   // yêu cầu JWT + role spectator
    .then(res => setPredictions(res.data?.data ?? res.data ?? []))
};
```

#### Bước 4 — Gửi cược — dòng 61-82
```js
const handleBetSubmit = async (e) => {
  // Validation frontend
  if (Number(prediction.amount) < 10000) { ... }   // dòng 67

  await api.post('/bets', {          // dòng 75
    registration_id: selectedHorse.id,
    race_id:         selectedRace.id,
    amount:          Number(prediction.amount),
    prediction_type: prediction.type,  // 'win' | 'place' | 'show'
  });
};
```

#### UI Form — dòng 178-230
- 3 nút loại dự đoán: `win/Thắng`, `place/Top 2`, `show/Top 3` — dòng 188
- Input số tiền, min=10000, step=1000 — dòng 198
- Tính tiền thưởng dự kiến: `prediction.amount * selectedHorse.odds` — dòng 215

#### Bảng lịch sử cược — dòng 237-270
- Badge trạng thái: `won=Thắng`, `lost=Thua`, mặc định=`Chờ kết quả` — dòng 256

---

## Backend Controllers

### BetController — `backend/app/Http/Controllers/API/BetController.php`

#### `GET /api/bets` — `index()` — dòng 16-48

```php
$bets = Bet::with([
    'registration.horse',           // tên ngựa
    'registration.jockey',
    'registration.race.tournament', // tên giải đấu
])->where('user_id', $userId)->orderByDesc('created_at')->get();

$formattedBets = $bets->map(fn ($bet) => [
    'race_name'       => $bet->registration->race->name ?? 'N/A',
    'horse_name'      => $bet->registration->horse->name ?? 'N/A',
    'prediction_type' => $bet->prediction_type,
    'amount'          => $bet->amount,
    'status'          => $bet->status,
    'payout'          => $bet->reward_amount              // dòng 43
                         ?? ($bet->status === 'won' ? $bet->amount * 2.5 : 0),
]);
```

#### `POST /api/bets` — `store()` — dòng 50-87

```php
// Validate — dòng 57-62
$validated = $request->validate([
    'registration_id' => 'required|integer|exists:registrations,id',
    'race_id'         => 'required|integer|exists:races,id',
    'amount'          => 'required|numeric|min:10000',
    'prediction_type' => 'required|string|in:win,place,show',
]);

// Kiểm tra thời gian — dòng 64-66
$race = Race::findOrFail($validated['race_id']);
if (now()->greaterThanOrEqualTo($race->race_time)) {
    return response()->json(['message' => 'Cuộc đua đã bắt đầu...'], 422);
}

// Kiểm tra registration hợp lệ — dòng 68-73
$registration = Registration::where('id', $validated['registration_id'])
    ->where('race_id', $validated['race_id'])
    ->where('status', 'confirmed')   // phải được duyệt mới cược được
    ->first();
```

#### `DELETE /api/bets/:id` — `destroy()` — dòng 97-111

```php
// Chỉ cho hủy khi pending VÀ chưa qua giờ đua — dòng 107-109
if ($bet->status !== 'pending' || now()->greaterThanOrEqualTo($race->race_time)) {
    return response()->json(['message' => 'Không thể hủy cược này!'], 422);
}
```

---

## Database Models

### Bet Model — `backend/app/Models/Bet.php`

```php
// dòng 16-21 — Fillable fields
protected $fillable = [
    'user_id',
    'registration_id',
    'amount',
    'prediction_type',   // win | place | show
    'status',            // pending | won | lost
    'reward_amount',     // tiền thưởng thực nhận (null khi pending)
];

// dòng 28-33 — Relationships
public function user(): BelongsTo          // → users
public function registration(): BelongsTo  // → registrations (ngựa+race)
```

### Registration Model — `backend/app/Models/Registration.php`

```php
// dòng 14-20 — Fields
protected $fillable = [
    'race_id',
    'horse_id',
    'jockey_id',
    'lane',
    'status',   // pending | confirmed | rejected | withdrawn
];

// dòng 29-43 — Relationships
public function race():   BelongsTo   // → races
public function horse():  BelongsTo   // → horses
public function jockey(): BelongsTo   // → jockeys
public function result(): HasOne      // → race_results
```

---

## Database Schema

### Bảng `bets`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | bigint PK | |
| `user_id` | FK → users | Spectator đặt cược |
| `registration_id` | FK → registrations | Ngựa được cược |
| `amount` | decimal(15,2) | Số tiền cược |
| `reward_amount` | decimal(15,2) | Tiền thưởng thực nhận (null nếu chưa có) |
| `prediction_type` | enum | `win`, `place`, `show` |
| `status` | string | `pending`, `won`, `lost` |

### Bảng `registrations` (liên kết Bet → Horse + Race)

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | bigint PK | Đây là `registration_id` gửi khi đặt cược |
| `race_id` | FK → races | |
| `horse_id` | FK → horses | |
| `jockey_id` | FK → jockeys | |
| `lane` | int nullable | Làn đua |
| `status` | enum | `pending`, `confirmed`, `rejected`, `withdrawn` |

> **Quan trọng:** Chỉ đặt cược được cho registration có `status = 'confirmed'`
> — kiểm tra tại `BetController@store` dòng 70

---

## Luồng dữ liệu đầy đủ

```
[Spectator mở /predictions]
        │
        ▼
Predictions.jsx dòng 22: GET /public/races
  → RaceController@index → RaceRepository@getAll()
  → filter client-side: status='scheduled' AND race_time > now()
  → Hiển thị danh sách race bên trái
        │
        ▼ (click chọn race)
Predictions.jsx dòng 39: GET /public/races/:id
  → RaceController@show → RaceRepository@findById()
  → with(['tournament', 'registrations.horse', 'registrations.jockey'])
  → map registrations → setParticipants()
  → Hiển thị danh sách ngựa
        │
        ▼ (click chọn ngựa + nhập số tiền + chọn loại)
Predictions.jsx dòng 75: POST /api/bets
  → BetController@store
      → validate (dòng 57-62)
      → check race_time (dòng 64-66)
      → check registration confirmed (dòng 68-73)
      → Bet::create() với status='pending'
  → fetchPredictions() — refresh lịch sử
        │
        ▼
[Referee nhập kết quả]
POST /referee/races/:race/results
  → ResultController@store → cập nhật rank từng registration
        │
        ▼
[Admin/Hệ thống xử lý payout]
  → Cập nhật bets: status = 'won'/'lost', reward_amount
  → BetController@index dòng 43: trả payout = reward_amount ?? amount*2.5
        │
        ▼
Predictions.jsx dòng 54: GET /api/bets
  → BetController@index → Spectator xem kết quả lịch sử cược
```

---

## Quyền truy cập (Auth)

| Route | File định nghĩa | Dòng | Auth | Role |
|-------|----------------|------|------|------|
| `GET /public/tournaments` | `routes/api.php` | 30 | Không | Tất cả |
| `GET /public/races` | `routes/api.php` | 32 | Không | Tất cả |
| `GET /public/races/:id` | `routes/api.php` | 34 | Không | Tất cả |
| `GET /public/race-results/:id` | `routes/api.php` | 35 | Không | Tất cả |
| `POST /api/bets` | `routes/api.php` | 173 | JWT | `spectator` |
| `GET /api/bets` | `routes/api.php` | 174 | JWT | `spectator` |
| `GET /api/bets/:id` | `routes/api.php` | 175 | JWT | `spectator` |
| `DELETE /api/bets/:id` | `routes/api.php` | 176 | JWT | `spectator` |

---

## Xử lý lỗi phổ biến

| Lỗi | Nơi xảy ra | Nguyên nhân | Giải pháp |
|-----|-----------|-------------|-----------|
| "Cuộc đua đã bắt đầu hoặc kết thúc" | `BetController@store` dòng 65 | `race_time <= now()` | Race đã qua giờ |
| "Đăng ký này không hợp lệ" | `BetController@store` dòng 68-73 | Registration chưa `confirmed` | Admin duyệt đăng ký trước |
| Dropdown race trống | `Predictions.jsx` dòng 25-26 | Không có race `scheduled` trong tương lai | Tạo race mới với `race_time` tương lai |
| `tournaments.map is not a function` | `AdminLeaderboard.jsx` | `r.data` là object `{success,data}` thay vì array | Dùng `r.data?.data ?? r.data ?? []` |
| "Không thể tải thông tin cuộc đua" | `RaceDetail.jsx` dòng 20 | Gọi route cần auth thay vì `/public/` | Đã fix — dùng `/public/races/:id` |

---

## Ghi chú kỹ thuật

- **Tỷ lệ thưởng (`odds`):** `Predictions.jsx` dòng 49 — fallback `2.5` nếu API không trả `odds`. Cần thêm cột `odds` vào bảng `registrations` để quản lý linh hoạt hơn.
- **Payout tự động:** `BetController@index` dòng 43 — tính `reward_amount ?? amount*2.5`. Chưa có cơ chế tự động cập nhật status sau khi có kết quả — cần implement sau.
- **Race status filter:** `Predictions.jsx` dòng 25-26 — filter `scheduled AND race_time > now()` tại client để tránh hiển thị race đã qua nhưng DB chưa cập nhật status.
- **API response format:** Sau khi sửa `TournamentController`, tất cả response được wrap `{success: true, data: [...]}` — frontend phải dùng `res.data?.data ?? res.data ?? []` để tương thích cả 2 format.

---

## ❓ Câu hỏi thường gặp từ giảng viên

---

### 🏗️ Kiến trúc & Tech Stack

**Q: Kiến trúc tổng thể của project là gì?**

> Project theo mô hình **Client-Server tách biệt hoàn toàn (Decoupled Architecture)**:
> - **Frontend** (React SPA) giao tiếp với **Backend** (Laravel REST API) qua HTTP/JSON
> - **WebSocket Server** riêng biệt (Ratchet/PHP) xử lý dữ liệu real-time
> - **Database** MySQL tách biệt, chạy trong container riêng
> - Toàn bộ được đóng gói bằng **Docker Compose** với 5 container

```
Browser ←─── React (Vite) :5173
    │
    ├─ HTTP/REST ──→ Laravel API :8000 ──→ MySQL :3307
    │
    └─ WebSocket ──→ Ratchet PHP :8080
```

---

**Q: Frontend sử dụng những framework/thư viện gì? Version bao nhiêu?**

> Xem `frontend/package.json`:

| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | DOM rendering |
| `react-router-dom` | ^6.30.0 | Client-side routing |
| `axios` | ^1.8.4 | HTTP client gọi API |
| `tailwindcss` | ^3.4.17 | CSS utility framework |
| `vite` | ^6.3.5 | Build tool / Dev server |

---

**Q: Backend sử dụng những gì? Version bao nhiêu?**

> Xem `backend/composer.json`:

| Package | Version | Mục đích |
|---------|---------|---------|
| `php` | ^8.2 | Runtime |
| `laravel/framework` | ^11.0 | Backend framework |
| `firebase/php-jwt` | ^6.10 | Tạo/verify JWT token |
| `laravel/sanctum` | ^4.0 | Auth scaffolding |
| `laravel/reverb` | ^1.0 | WebSocket (dự phòng) |

---

**Q: Tại sao chọn JWT thay vì Session-based auth?**

> Vì đây là **SPA + REST API** — frontend và backend chạy ở 2 domain/port khác nhau (`localhost:5173` vs `localhost:8000`). Session-based auth yêu cầu cookie cùng domain, không phù hợp. JWT stateless, dễ gửi qua `Authorization: Bearer` header, phù hợp cho kiến trúc này.

---

**Q: Docker Compose có những container nào?**

> Xem `docker-compose.yml`:

| Container | Image | Port | Vai trò |
|-----------|-------|------|---------|
| `horse_racing_api` | Laravel PHP custom | 8000 | REST API backend |
| `horse_racing_frontend` | Node/Vite custom | 5173 | React frontend |
| `laptrinh-web-db-1` | mysql:8.0 | 3307 | Database |
| `horse_racing_phpmyadmin` | phpmyadmin:latest | 8081 | DB admin UI |
| `horse_racing_websocket` | php:8.2-cli | 8080 | WebSocket server |

---

### 🔐 Xác thực & Phân quyền

**Q: Cơ chế xác thực hoạt động như thế nào?**

> **Luồng đăng nhập:**
> 1. Frontend gửi `POST /api/auth/login` với `{email, password}`
> 2. Backend (Laravel) verify mật khẩu, tạo JWT token bằng `firebase/php-jwt`
> 3. Token được trả về, **frontend lưu vào `localStorage`** (`AuthContext.jsx` dòng 47-51)
> 4. Mỗi request sau đó, `axios interceptor` (`api/axios.js` dòng 14-19) tự động đính kèm `Authorization: Bearer <token>`
> 5. Backend middleware `JwtMiddleware` (`JwtMiddleware.php` dòng 28) decode và verify token mỗi request

> **Khi app load lại** (`AuthContext.jsx` dòng 19-35): tự động gọi `GET /auth/me` để verify token còn hợp lệ không. Nếu hết hạn → tự động logout.

---

**Q: Phân quyền (Authorization) hoạt động như thế nào?**

> Hệ thống có **5 role**: `admin`, `horse_owner`, `jockey`, `race_referee`, `spectator`

> Backend dùng **custom JWT Middleware** (`JwtMiddleware.php`) thay vì middleware mặc định của Laravel:
> ```php
> // JwtMiddleware.php dòng 55-65
> if (! empty($roles)) {
>     $userRole = $decoded->role ?? null;
>     if (! in_array($userRole, $roles, true)) {
>         return response()->json(['message' => 'Forbidden'], 403);
>     }
> }
> ```
> Route khai báo role: `->middleware('jwt.auth:admin,race_referee')` — dùng trong `routes/api.php`

> Frontend dùng `<PrivateRoute roles={['spectator']}>` bọc các route cần bảo vệ (`App.jsx`). `PrivateRoute` check `isRole()` từ `AuthContext`.

---

**Q: Token được lưu ở đâu? Có an toàn không?**

> Token lưu trong **`localStorage`** (`AuthContext.jsx` dòng 47). Đây là lựa chọn đơn giản cho môi trường học tập.
>
> Nhược điểm: dễ bị XSS đọc token. Production nên dùng `httpOnly cookie` thay thế.
> Ưu điểm: đơn giản, không cần cấu hình CORS cookie, phù hợp SPA.

---

### 🗄️ Database & ORM

**Q: Database sử dụng gì? Thiết kế schema như thế nào?**

> Sử dụng **MySQL 8.0**. ORM là **Eloquent** (built-in Laravel).
>
> Các bảng chính liên quan đến betting:
> ```
> users ──→ spectators (1-1)
> users ──→ bets (1-N, user_id)
> bets ──→ registrations (N-1, registration_id)
> registrations ──→ races (N-1)
> registrations ──→ horses (N-1)
> registrations ──→ jockeys (N-1)
> races ──→ tournaments (N-1)
> ```

---

**Q: Migration là gì? Project này dùng migration thế nào?**

> Migration là các file PHP mô tả cấu trúc bảng, cho phép tạo/rollback schema có kiểm soát.
> Chạy bằng: `php artisan migrate`
>
> Project có các migration tại `backend/database/migrations/`:
> - `2026_05_24_000000_create_horse_racing_system_tables.php` — tạo tất cả bảng ban đầu
> - `2026_07_04_000000_add_round_name_to_races_table.php` — thêm cột `round`, `name`, `max_horses`
> - `2026_07_04_100000_add_missing_columns.php` — thêm `phone`, `location`, `weight`, `prize_pool`, `reward_amount`

---

**Q: Repository Pattern là gì? Tại sao dùng?**

> **Repository Pattern** tách biệt logic truy vấn database ra khỏi Controller/Service.
>
> Cấu trúc trong project:
> ```
> Controller → Service → Repository → Eloquent Model → Database
> ```
>
> Ví dụ cụ thể:
> - `RaceController` gọi `IRaceService`
> - `RaceService` gọi `IRaceRepository`
> - `RaceRepository` (`backend/app/Repositories/RaceRepository.php`) thực thi Eloquent query
>
> **Lợi ích:** Dễ thay đổi ORM/database mà không đụng vào Controller. Dễ mock khi test.

---

### 🌐 API & HTTP

**Q: API của project theo chuẩn gì?**

> **RESTful API** — sử dụng đúng HTTP methods:
> - `GET` — đọc dữ liệu
> - `POST` — tạo mới
> - `PUT` — cập nhật
> - `DELETE` — xóa
>
> Response format nhất quán: `{ success: true, data: [...] }` (sau khi chuẩn hóa)

---

**Q: Tại sao có route `/public/races` và `/races` riêng biệt?**

> `/public/races` — **không cần auth**, dành cho trang Home, Predictions, RaceDetail xem thông tin công khai.
>
> `/races` (trong group `jwt.auth:admin,race_referee`) — dành cho admin/referee quản lý race, cần xác thực.
>
> Thiết kế này theo nguyên tắc **Least Privilege** — chỉ expose dữ liệu cần thiết cho từng đối tượng.

---

**Q: CORS được cấu hình thế nào?**

> Laravel xử lý CORS qua middleware. Frontend dev server chạy ở `localhost:5173`, backend ở `localhost:8000`.
> Trong môi trường Docker, `SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1` được set trong `docker-compose.yml` dòng 27.

---

### ⚡ Real-time & WebSocket

**Q: Real-time được implement như thế nào?**

> Dùng **WebSocket** với thư viện **Ratchet** (PHP) chạy trong container riêng (`horse_racing_websocket` port 8080).
>
> Frontend kết nối: `JockeyLive.jsx` dòng 5:
> ```js
> const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080';
> ```
>
> Luồng:
> 1. Client gửi `{"action": "subscribe_race", "race_id": 1}` khi kết nối
> 2. Script simulation (`simulate-race.php`) gửi update mỗi 500ms: `{"action": "race_update", "horses": [...]}`
> 3. Server broadcast đến tất cả client đang subscribe race đó
> 4. Frontend render progress bar real-time

---

**Q: Tại sao không dùng HTTP polling thay vì WebSocket?**

> HTTP polling (gọi API mỗi X giây) sẽ tạo nhiều request không cần thiết, độ trễ cao (phụ thuộc interval).
> WebSocket duy trì **1 kết nối persistent**, server chủ động push data khi có cập nhật → độ trễ thấp hơn, phù hợp hiển thị vị trí ngựa real-time.

---

### 🧩 Frontend Architecture

**Q: State management được xử lý như thế nào?**

> Project dùng **React Context API** thay vì Redux/Zustand vì scope nhỏ:
> - `AuthContext` (`context/AuthContext.jsx`) — quản lý user, token, login/logout toàn app
> - `SocketContext` (`context/SocketContext.jsx`) — quản lý WebSocket connection
>
> Từng page tự quản lý local state bằng `useState`/`useEffect` — phù hợp với quy mô project.

---

**Q: Routing hoạt động thế nào? Bảo vệ route như thế nào?**

> Dùng **React Router v6** (`react-router-dom`).
>
> `<PrivateRoute roles={['spectator']}>` bọc các route cần bảo vệ — check `isAuthenticated` và `isRole()` từ `AuthContext`. Nếu không đủ quyền → redirect về `/login` hoặc `/unauthorized`.
>
> Route khai báo tập trung tại `frontend/src/App.jsx`.

---

**Q: Axios interceptor dùng để làm gì?**

> Xem `frontend/src/api/axios.js`:
>
> **Request interceptor** (dòng 13-19): Tự động thêm `Authorization: Bearer <token>` vào mọi request — không cần truyền thủ công mỗi lần gọi API.
>
> **Response interceptor** (dòng 22-32): Khi nhận 401 (token hết hạn) và đang có token trong localStorage → tự động xóa token và redirect về `/login`.

---

### 🐞 Debug & Vấn đề thực tế

**Q: Trong quá trình làm gặp bug gì khó nhất?**

> **Bug khó nhất:** `tournaments.map is not a function` — do thay đổi format response của `TournamentController` từ trả raw array sang wrap `{success, data}`, nhưng một số component frontend chưa cập nhật cách đọc. Phải trace từng component để fix.
>
> **Bug routing:** Route `/public/races/live` và `/public/races/{id}` bị conflict vì Laravel match `/live` vào `{id}` — cần khai báo `/live` trước `/public/races/{id}` trong `routes/api.php`.
>
> **Bug permission:** `RaceDetail.jsx` gọi `GET /races/:id` (route bảo vệ) thay vì `GET /public/races/:id` → spectator bị 401. Fix bằng cách thêm public route.

---

**Q: Tại sao race cũ status `scheduled` vẫn hiện trong danh sách?**

> DB không tự cập nhật status khi `race_time` qua. Frontend xử lý bằng cách filter thêm `race_time > now()` tại `Predictions.jsx` dòng 25-26. Giải pháp hoàn chỉnh hơn là tạo **Laravel Scheduled Job** tự động cập nhật status sau giờ đua.

---

**Q: Làm thế nào để scale hệ thống này lên production?**

> 1. **WebSocket:** Dùng Laravel Reverb (đã cài) hoặc Pusher thay vì Ratchet custom
> 2. **Token storage:** Chuyển từ `localStorage` sang `httpOnly cookie`
> 3. **Database:** Thêm index, read replica cho query lớn
> 4. **Cache:** Dùng Redis cache cho `GET /public/races`, `GET /public/tournaments`
> 5. **Queue:** Xử lý payout bet qua Laravel Queue (async) thay vì đồng bộ
> 6. **Container:** Dùng Kubernetes hoặc Docker Swarm thay vì single docker-compose
