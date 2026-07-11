# sync-backend.ps1 — Copy backend source vào container và clear cache
# Dùng khi sửa code PHP trên host mà container không mount source
#
# Usage:
#   .\sync-backend.ps1           # copy routes/ + toàn bộ app/Http/Controllers/
#   .\sync-backend.ps1 -All      # copy routes/ + toàn bộ app/

param(
    [switch]$All  # copy toàn bộ app/ thay vì chỉ Controllers
)

$container = "horse_racing_api"
$src       = "$PSScriptRoot\backend"
$dest      = "/var/www/html"

Write-Host "📄 Copying routes/api.php..." -ForegroundColor Cyan
docker cp "$src\routes\api.php" "${container}:${dest}/routes/api.php"

if ($All) {
    Write-Host "📦 Copying entire app/..." -ForegroundColor Cyan
    docker cp "$src\app" "${container}:${dest}/app"
} else {
    Write-Host "📦 Copying app/Http/Controllers/..." -ForegroundColor Cyan
    docker cp "$src\app\Http\Controllers" "${container}:${dest}/app/Http/Controllers"
    Write-Host "📦 Copying app/Repositories/..." -ForegroundColor Cyan
    docker cp "$src\app\Repositories" "${container}:${dest}/app/Repositories"
    Write-Host "📦 Copying app/Models/..." -ForegroundColor Cyan
    docker cp "$src\app\Models" "${container}:${dest}/app/Models"
}

Write-Host "🔄 Clearing caches..." -ForegroundColor Cyan
docker exec $container php artisan route:clear
docker exec $container php artisan config:clear
docker exec $container php artisan cache:clear

Write-Host ""
Write-Host "✅ Sync complete! Referee routes:" -ForegroundColor Green
docker exec $container php artisan route:list --path=referee
