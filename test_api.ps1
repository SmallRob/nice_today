# API Connection Test Script
Write-Host "Testing Backend API Connection..." -ForegroundColor Cyan

# Test Basic API
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5020/" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Basic API Connection Success (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Basic API Connection Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test Biorhythm API
try {
    $testDate = "1990-01-01"
    $response = Invoke-WebRequest -Uri "http://localhost:5020/biorhythm/today?birth_date=$testDate" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Biorhythm API Connection Success (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Parse and display returned data
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  - Date: $($data.date)" -ForegroundColor Yellow
    Write-Host "  - Physical: $($data.physical)" -ForegroundColor Yellow
    Write-Host "  - Emotional: $($data.emotional)" -ForegroundColor Yellow
    Write-Host "  - Intellectual: $($data.intellectual)" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Biorhythm API Connection Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Chart Data API (Range)
try {
    $testDate = "1990-01-01"
    $response = Invoke-WebRequest -Uri "http://localhost:5020/biorhythm?birth_date=$testDate&days=30" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Chart Data API Connection Success (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Check returned data structure
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  - Date Count: $($data.dates.Count)" -ForegroundColor Yellow
    Write-Host "  - Physical Data Points: $($data.physical.Count)" -ForegroundColor Yellow
    Write-Host "  - Emotional Data Points: $($data.emotional.Count)" -ForegroundColor Yellow
    Write-Host "  - Intellectual Data Points: $($data.intellectual.Count)" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Chart Data API Connection Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "All API tests completed!" -ForegroundColor Cyan