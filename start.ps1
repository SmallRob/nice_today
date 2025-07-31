# Windows PowerShell 一键启动调试脚本 - UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 定义默认端口与虚拟环境
$BACKEND_PORT = 5020
$FRONTEND_PORT = 3000
$VENV_NAME    = "biorhythm_env"
$VENV_PATH    = "./$VENV_NAME"
$USE_CONDA    = $false

# 检查端口占用
function Test-Port {
    param([int]$port)
    try {
        return (Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet)
    } catch { return $false }
}

function Find-AvailablePort {
    param([int]$port)
    while (Test-Port $port) {
        Write-Host "端口 $port 已被占用，切换到 $($port + 1)" -ForegroundColor Yellow
        $port++
    }
    return $port
}

# 选择可用端口
$BACKEND_PORT  = Find-AvailablePort -port $BACKEND_PORT
Write-Host "后端将使用端口: $BACKEND_PORT" -ForegroundColor Cyan
$FRONTEND_PORT = Find-AvailablePort -port $FRONTEND_PORT
Write-Host "前端将使用端口: $FRONTEND_PORT" -ForegroundColor Cyan

# 检查目录
if (-not (Test-Path "backend"))  { Write-Host "错误: 找不到 backend 目录" -ForegroundColor Red; exit 1 }
if (-not (Test-Path "frontend")) { Write-Host "错误: 找不到 frontend 目录" -ForegroundColor Red; exit 1 }

# 检测 Conda
if ($env:CONDA_PREFIX) {
    Write-Host "检测到 Conda 环境: $env:CONDA_PREFIX" -ForegroundColor Cyan
    $USE_CONDA = $true
}

# 准备 Python 虚拟环境
if ($USE_CONDA) {
    Write-Host "使用 Conda 环境创建/激活虚拟环境..." -ForegroundColor Cyan
    if (-not (conda env list | Select-String -Pattern $VENV_NAME)) {
        conda create -y -n $VENV_NAME python=3.9
    }
    conda activate $VENV_NAME
} else {
    Write-Host "使用 venv 创建/激活虚拟环境..." -ForegroundColor Cyan
    if (-not (Test-Path $VENV_PATH)) {
        python -m venv $VENV_PATH
    }
    & "$VENV_PATH\Scripts\Activate.ps1"
}

# 启动后端服务
Write-Host "启动后端服务..." -ForegroundColor Green
Push-Location backend

# 检查并创建必要的配置文件
if (-not (Test-Path "config")) {
    Write-Host "创建 config 目录..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path "config" -Force
}

if (-not (Test-Path "config/app_config.json")) {
    Write-Host "创建默认配置文件..." -ForegroundColor Cyan
    $defaultConfig = @{
        "app_name" = "Biorhythm Application"
        "version" = "1.0.0"
        "debug" = $true
        "host" = "0.0.0.0"
        "port" = $BACKEND_PORT
        "cors_origins" = @("http://localhost:3000", "http://localhost:$FRONTEND_PORT")
    }
    $defaultConfig | ConvertTo-Json -Depth 3 | Out-File -FilePath "config/app_config.json" -Encoding UTF8
}

# 安装依赖
if ($USE_CONDA -or (Test-Path "$VENV_PATH\Scripts\Activate.ps1")) {
    pip install --upgrade pip setuptools wheel
    pip install fastapi uvicorn python-multipart
    pip install numpy pandas
} else {
    pip install -r requirements.txt
}

# 后端以 Job 方式运行
$backendJob = Start-Job -ScriptBlock {
    param($dir, $port)
    Set-Location $dir
    $env:FLASK_RUN_PORT = $port
    python app.py
} -ArgumentList (Get-Location).Path, $BACKEND_PORT

# 等待后端启动
Start-Sleep -Seconds 3
if ($backendJob.State -ne "Running") {
    Write-Host "错误: 后端启动失败，请查看 backend/backend.log" -ForegroundColor Red
    Receive-Job -Job $backendJob -Keep | Out-File -FilePath "../backend.log" -Append
    Pop-Location; exit 1
}
Receive-Job -Job $backendJob -Keep | Out-File -FilePath "../backend.log" -Append
Pop-Location

# 启动前端服务
Write-Host "启动前端服务..." -ForegroundColor Green
Push-Location frontend

npm install
$frontendJob = Start-Job -ScriptBlock {
    param($dir, $bport, $fport)
    Set-Location $dir
    $env:REACT_APP_BACKEND_PORT = $bport
    $env:PORT = $fport
    # 自动选择 Y 来使用其他端口
    echo "y" | npm start
} -ArgumentList (Get-Location).Path, $BACKEND_PORT, $FRONTEND_PORT

# 等待前端启动
Start-Sleep -Seconds 5
if ($frontendJob.State -ne "Running") {
    Write-Host "错误: 前端启动失败，请查看 frontend/frontend.log" -ForegroundColor Red
    Receive-Job -Job $frontendJob -Keep | Out-File -FilePath "../frontend.log" -Append
    Pop-Location; exit 1
}
Receive-Job -Job $frontendJob -Keep | Out-File -FilePath "../frontend.log" -Append
Pop-Location

# 输出访问信息
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "服务已启动：" -ForegroundColor Green
Write-Host "后端: http://localhost:$BACKEND_PORT" -ForegroundColor Cyan
Write-Host "前端: http://localhost:$FRONTEND_PORT" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Green

# 清理函数
function Cleanup {
    Write-Host "" 
    Write-Host "正在停止服务..." -ForegroundColor Yellow
    if ($backendJob)  { Stop-Job   $backendJob; Remove-Job $backendJob }
    if ($frontendJob) { Stop-Job   $frontendJob; Remove-Job $frontendJob }
    Write-Host "所有服务已停止" -ForegroundColor Yellow
    exit 0
}

# 注册 Ctrl+C 事件
Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

# 保持脚本运行并监控状态
while ($true) {
    Start-Sleep -Seconds 5
}