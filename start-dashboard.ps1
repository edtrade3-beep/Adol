$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\dixie\OneDrive\Documents\New project"
$backendHealthUrl = "http://127.0.0.1:8080/api/health"
$healthUrl = "http://127.0.0.1:3001/api/health"
$appUrl = "http://127.0.0.1:3001/?fresh=31"
$runnerPath = Join-Path $projectRoot "platform-supervisor.js"
$backendLogPath = Join-Path $projectRoot "backend-all.log"

Set-Location $projectRoot

Write-Host "Checking optional backend on port 8080..."
$backendListener = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $backendListener) {
  Write-Host "Starting Market AI backend in background (optional)..."
  Start-Process -WindowStyle Minimized -FilePath "cmd.exe" -ArgumentList "/c", "cd /d `"$projectRoot`" && npm run start:backend >> `"$backendLogPath`" 2>&1"

  $backendReady = $false
  for ($i = 1; $i -le 10; $i++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing $backendHealthUrl -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        $backendReady = $true
        break
      }
    } catch {
      Start-Sleep -Milliseconds 800
    }
  }

  if (-not $backendReady) {
    Write-Host "Optional backend is still starting or unavailable. The main platform will still open."
  }
} else {
  Write-Host ("Optional backend already running (PID {0})." -f $backendListener.OwningProcess)
}

Write-Host "Checking web server on port 3001..."
$listener = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $listener) {
  Write-Host "Starting platform supervisor..."
  Start-Process -WindowStyle Hidden -FilePath "powershell.exe" -ArgumentList @(
    "-NoLogo",
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    "Set-Location '$projectRoot'; node '$runnerPath'"
  )
} else {
  Write-Host ("Platform already running (PID {0})." -f $listener.OwningProcess)
}

$ready = $false
for ($i = 1; $i -le 30; $i++) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing $healthUrl -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
      $ready = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 1
  }
}

if ($ready) {
  Start-Process $appUrl
  Write-Host "Dashboard opened at $appUrl"
} else {
  Write-Host "Platform did not become healthy in time. Check the Node process and try again."
  exit 1
}
