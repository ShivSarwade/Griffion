# Run API Tests with Newman and output an HTML report

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   GRIFFION API TEST RUNNER (NEWMAN)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Install dependencies if needed
Write-Host "`n[1/3] Ensuring newman and newman-reporter-htmlextra are available..." -ForegroundColor Yellow
# We use npx to run newman so it will auto-download if not installed globally,
# but we need to make sure the htmlextra reporter is installed locally or globally.
npm install -g newman newman-reporter-htmlextra

Write-Host "`n[2/3] Running tests..." -ForegroundColor Yellow

$CollectionFile = "Griffion-API-Tests.postman_collection.json"
$ReportFile = "test-report.html"

if (-Not (Test-Path $CollectionFile)) {
    Write-Host "Error: Collection file $CollectionFile not found!" -ForegroundColor Red
    exit 1
}

# Run newman
newman run $CollectionFile -r cli,htmlextra --reporter-htmlextra-export $ReportFile

Write-Host "`n[3/3] Done!" -ForegroundColor Yellow
if (Test-Path $ReportFile) {
    Write-Host "✅ HTML Report generated successfully: $ReportFile" -ForegroundColor Green
    Write-Host "You can open this file in your browser to see the full test results." -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to generate HTML report." -ForegroundColor Red
}
