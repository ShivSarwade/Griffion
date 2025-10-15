# Griffion Setup Script

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🛡️  Griffion Authentication Platform Setup  🛡️       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Backend Setup
Write-Host "📦 Setting up Backend..." -ForegroundColor Yellow
Set-Location backend

if (-Not (Test-Path ".env")) {
    Write-Host "  → Creating .env file..." -ForegroundColor Gray
    Copy-Item .env.example .env
    Write-Host "  ✓ .env file created" -ForegroundColor Green
} else {
    Write-Host "  ℹ .env file already exists" -ForegroundColor Blue
}

Write-Host "  → Installing backend dependencies..." -ForegroundColor Gray
npm install
Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green

Set-Location ..

# Frontend Setup
Write-Host ""
Write-Host "📦 Setting up Frontend..." -ForegroundColor Yellow
Set-Location frontend

Write-Host "  → Installing frontend dependencies..." -ForegroundColor Gray
npm install
Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green

Set-Location ..

# Done
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ Setup Complete! ✅                     ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend:  cd backend ; npm start" -ForegroundColor White
Write-Host "  2. Start frontend: cd frontend ; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Default admin credentials:" -ForegroundColor Cyan
Write-Host "  Email: admin@griffion.local" -ForegroundColor White
Write-Host "  Password: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
