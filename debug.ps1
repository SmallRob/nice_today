# Windows PowerShell调试脚本
# 生物节律应用本地调试启动脚本

# 设置输出编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "开始启动生物节律应用的本地调试环境..." -ForegroundColor Cyan

# 定义端口
$BACKEND_PORT = 5020
$FRONTEND_PORT = 3000
$WEBSOCKET_PORT = 8765

# 定义日志文件路径
$LOG_DIR = ".\logs"
$BACKEND_LOG = "$LOG_DIR\backend_debug.log"
$FRONTEND_LOG = "$LOG_DIR\frontend_debug.log"

# 创建日志目录
if (-not (Test-Path $LOG_DIR)) {
    Write-Host "创建日志目录..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $LOG_DIR | Out-Null
}

# 检查端口是否被占用并找到可用端口
function Find-AvailablePort {
    param (
        [int]$port
    )
    
    while (Test-Port $port) {
        Write-Host "端口 $port 已被占用，尝试使用端口 $($port+1)" -ForegroundColor Yellow
        $port++
    }
    
    return $port
}

# 检查端口是否被占用
function Test-Port {
    param (
        [int]$port
    )
    
    $result = $null
    try {
        $result = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -ErrorAction SilentlyContinue -WarningAction SilentlyContinue
    }
    catch {
        return $false
    }
    
    return $result
}

# 查找可用的后端端口
$BACKEND_PORT = Find-AvailablePort -port $BACKEND_PORT
Write-Host "后端将使用端口: $BACKEND_PORT" -ForegroundColor Green

# 查找可用的前端端口
$FRONTEND_PORT = Find-AvailablePort -port $FRONTEND_PORT
Write-Host "前端将使用端口: $FRONTEND_PORT" -ForegroundColor Green

# 查找可用的WebSocket端口
$WEBSOCKET_PORT = Find-AvailablePort -port $WEBSOCKET_PORT
Write-Host "WebSocket将使用端口: $WEBSOCKET_PORT" -ForegroundColor Green

# 确保目录存在
if (-not (Test-Path "backend")) {
    Write-Host "错误: 找不到 backend 目录" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend")) {
    Write-Host "错误: 找不到 frontend 目录" -ForegroundColor Red
    exit 1
}

# 检测是否使用conda环境
$USE_CONDA = $false
if ($env:CONDA_PREFIX) {
    Write-Host "检测到Conda环境: $env:CONDA_PREFIX" -ForegroundColor Green
    $USE_CONDA = $true
}

# 定义虚拟环境名称和路径
$VENV_NAME = "biorhythm_env"
$VENV_PATH = "./$VENV_NAME"

# 如果是conda环境，使用conda创建虚拟环境
if ($USE_CONDA) {
    Write-Host "使用Conda创建虚拟环境..." -ForegroundColor Cyan
    $condaEnvExists = conda env list | Select-String -Pattern $VENV_NAME
    
    if (-not $condaEnvExists) {
        Write-Host "创建新的Conda环境: $VENV_NAME" -ForegroundColor Cyan
        conda create -y -n $VENV_NAME python=3.9
        if ($LASTEXITCODE -ne 0) {
            Write-Host "创建Conda环境失败" -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "使用已存在的Conda环境: $VENV_NAME" -ForegroundColor Green
    }
    
    # 激活conda环境
    Write-Host "激活Conda环境..." -ForegroundColor Cyan
    conda activate $VENV_NAME
    if ($LASTEXITCODE -ne 0) {
        Write-Host "激活Conda环境失败" -ForegroundColor Red
        exit 1
    }
    
    $VENV_ACTIVE = $true
}
else {
    # 创建并激活虚拟环境
    Write-Host "设置Python虚拟环境..." -ForegroundColor Cyan
    
    # 检测Python版本
    $pythonVersionInfo = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
    Write-Host "检测到Python版本: $pythonVersionInfo" -ForegroundColor Green
    
    # 如果是Python 3.12，尝试使用Python 3.9
    $PYTHON_CMD = "python"
    if ($pythonVersionInfo -eq "3.12") {
        Write-Host "检测到Python 3.12，尝试使用Python 3.9..." -ForegroundColor Yellow
        $python39 = Get-Command python3.9 -ErrorAction SilentlyContinue
        $python310 = Get-Command python3.10 -ErrorAction SilentlyContinue
        $python311 = Get-Command python3.11 -ErrorAction SilentlyContinue
        
        if ($python39) {
            $PYTHON_CMD = "python3.9"
        }
        elseif ($python310) {
            $PYTHON_CMD = "python3.10"
        }
        elseif ($python311) {
            $PYTHON_CMD = "python3.11"
        }
        else {
            Write-Host "警告: 未找到Python 3.9/3.10/3.11，将使用当前Python版本" -ForegroundColor Yellow
        }
    }
    
    Write-Host "使用Python命令: $PYTHON_CMD" -ForegroundColor Green
    
    # Windows下的激活路径
    $ACTIVATE_PATH = "Scripts\activate.ps1"
    
    # 如果虚拟环境存在但可能有问题，删除它
    if ((Test-Path $VENV_PATH) -and (-not (Test-Path "$VENV_PATH\$ACTIVATE_PATH"))) {
        Write-Host "检测到虚拟环境可能已损坏，删除并重新创建..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $VENV_PATH
    }
    
    if (-not (Test-Path $VENV_PATH)) {
        Write-Host "创建新的虚拟环境: $VENV_NAME" -ForegroundColor Cyan
        try {
            & $PYTHON_CMD -m venv $VENV_PATH
            if ($LASTEXITCODE -ne 0) {
                throw "创建虚拟环境失败"
            }
        }
        catch {
            Write-Host "创建虚拟环境失败，尝试使用 virtualenv..." -ForegroundColor Yellow
            $virtualenv = Get-Command virtualenv -ErrorAction SilentlyContinue
            
            if (-not $virtualenv) {
                Write-Host "virtualenv 未安装，尝试安装..." -ForegroundColor Yellow
                pip install virtualenv
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "安装 virtualenv 失败，请手动安装 virtualenv 或 venv" -ForegroundColor Red
                    exit 1
                }
            }
            
            virtualenv -p $PYTHON_CMD $VENV_PATH
            if ($LASTEXITCODE -ne 0) {
                Write-Host "使用 virtualenv 创建虚拟环境失败" -ForegroundColor Red
                exit 1
            }
        }
    }
    else {
        Write-Host "使用已存在的虚拟环境: $VENV_NAME" -ForegroundColor Green
    }
    
    # 激活虚拟环境
    Write-Host "激活虚拟环境..." -ForegroundColor Cyan
    if (Test-Path "$VENV_PATH\$ACTIVATE_PATH") {
        & "$VENV_PATH\$ACTIVATE_PATH"
        $VENV_ACTIVE = $true
        Write-Host "虚拟环境已激活" -ForegroundColor Green
        # 验证虚拟环境是否正确激活
        Get-Command python | Select-Object -ExpandProperty Source
        python --version
    }
    else {
        Write-Host "警告: 无法激活虚拟环境，将使用系统Python" -ForegroundColor Yellow
        $VENV_ACTIVE = $false
    }
}

# 启动后端服务
Write-Host "启动后端服务..." -ForegroundColor Cyan
Push-Location backend

Write-Host "安装后端依赖..." -ForegroundColor Cyan
if ($VENV_ACTIVE) {
    # 先升级pip
    Write-Host "升级pip..." -ForegroundColor Cyan
    pip install --upgrade pip
    
    # 安装setuptools和wheel
    Write-Host "安装基础包..." -ForegroundColor Cyan
    pip install setuptools wheel
    
    # 安装预编译的二进制包
    Write-Host "安装预编译的依赖包..." -ForegroundColor Cyan
    pip install fastapi==0.95.0 uvicorn==0.21.1 python-multipart==0.0.6
    
    # 尝试安装numpy和pandas的预编译版本
    Write-Host "安装numpy和pandas..." -ForegroundColor Cyan
    pip install numpy==1.24.2 --only-binary=:all:
    if ($LASTEXITCODE -ne 0) {
        Write-Host "尝试安装较低版本的numpy..." -ForegroundColor Yellow
        pip install numpy==1.21.6 --only-binary=:all:
        if ($LASTEXITCODE -ne 0) {
            Write-Host "警告: 无法安装numpy预编译包，尝试安装不需要编译的版本..." -ForegroundColor Yellow
            pip install numpy --only-binary=:all:
        }
    }
    
    pip install pandas==1.5.3 --only-binary=:all:
    if ($LASTEXITCODE -ne 0) {
        Write-Host "尝试安装较低版本的pandas..." -ForegroundColor Yellow
        pip install pandas==1.3.5 --only-binary=:all:
        if ($LASTEXITCODE -ne 0) {
            Write-Host "警告: 无法安装pandas预编译包，尝试安装不需要编译的版本..." -ForegroundColor Yellow
            pip install pandas --only-binary=:all:
        }
    }
}
else {
    # 如果requirements.txt存在，使用它安装依赖
    if (Test-Path "requirements.txt") {
        pip install -r requirements.txt
        if ($LASTEXITCODE -ne 0) {
            Write-Host "安装后端依赖失败" -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "警告: requirements.txt不存在，尝试安装基本依赖..." -ForegroundColor Yellow
        pip install fastapi uvicorn python-multipart numpy pandas
        if ($LASTEXITCODE -ne 0) {
            Write-Host "安装基本依赖失败" -ForegroundColor Red
            exit 1
        }
    }
}

# 启动后端服务（调试模式）
Write-Host "启动后端服务（调试模式）..." -ForegroundColor Cyan
$env:FLASK_RUN_PORT = $BACKEND_PORT
$env:FLASK_ENV = "development"
$env:FLASK_DEBUG = "1"
$env:PYTHONPATH = $PWD.Path

# 启动后端服务，并将输出重定向到日志文件
$backendJob = Start-Job -ScriptBlock {
    param($workDir, $port, $logFile)
    Set-Location $workDir
    $env:FLASK_RUN_PORT = $port
    $env:FLASK_ENV = "development"
    $env:FLASK_DEBUG = "1"
    $env:PYTHONPATH = $workDir
    python app.py 2>&1 | Tee-Object -FilePath $logFile
} -ArgumentList $PWD.Path, $BACKEND_PORT, $BACKEND_LOG

# 等待后端服务启动
Start-Sleep -Seconds 1
Receive-Job -Job $backendJob -Keep | Out-File -FilePath $BACKEND_LOG -Append

Pop-Location

# 等待后端服务启动
Write-Host "等待后端服务启动..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# 检查后端服务是否成功启动
if ($backendJob.State -ne "Running") {
    Write-Host "错误: 后端服务启动失败，请查看日志文件了解详情" -ForegroundColor Red
    Get-Content $BACKEND_LOG
    exit 1
}

# 测试后端服务是否可访问
Write-Host "测试后端服务是否可访问..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT" -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "后端服务已成功启动并可访问" -ForegroundColor Green
}
catch {
    Write-Host "警告: 无法访问后端服务，但进程似乎在运行" -ForegroundColor Yellow
}

# 安装前端依赖并启动前端服务
Write-Host "安装前端依赖并启动前端服务..." -ForegroundColor Cyan
Push-Location frontend
Write-Host "安装 npm 依赖..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "安装前端依赖失败" -ForegroundColor Red
    Stop-Job -Job $backendJob
    Remove-Job -Job $backendJob -Force
    exit 1
}

# 启动前端服务（调试模式）
Write-Host "启动前端服务（调试模式）..." -ForegroundColor Cyan
$env:REACT_APP_BACKEND_PORT = $BACKEND_PORT
$env:PORT = $FRONTEND_PORT
$env:BROWSER = "none"  # 不自动打开浏览器

# 启动前端服务，并将输出重定向到日志文件
$frontendJob = Start-Job -ScriptBlock {
    param($workDir, $backendPort, $frontendPort, $logFile)
    Set-Location $workDir
    $env:REACT_APP_BACKEND_PORT = $backendPort
    $env:PORT = $frontendPort
    $env:BROWSER = "none"
    npm start 2>&1 | Tee-Object -FilePath $logFile
} -ArgumentList $PWD.Path, $BACKEND_PORT, $FRONTEND_PORT, $FRONTEND_LOG

# 等待前端服务启动
Start-Sleep -Seconds 1
Receive-Job -Job $frontendJob -Keep | Out-File -FilePath $FRONTEND_LOG -Append

Pop-Location

# 等待前端服务启动
Write-Host "等待前端服务启动..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# 检查前端服务是否成功启动
if ($frontendJob.State -ne "Running") {
    Write-Host "错误: 前端服务启动失败，请查看日志文件了解详情" -ForegroundColor Red
    Get-Content $FRONTEND_LOG
    Stop-Job -Job $backendJob
    Remove-Job -Job $backendJob -Force
    exit 1
}

# 打开浏览器访问前端应用
Write-Host "正在打开浏览器访问前端应用..." -ForegroundColor Cyan
Start-Process "http://localhost:$FRONTEND_PORT"

# 显示调试信息
Write-Host "==================================================" -ForegroundColor Green
Write-Host "调试环境已成功启动！" -ForegroundColor Green
Write-Host "后端服务运行在: http://localhost:$BACKEND_PORT" -ForegroundColor Cyan
Write-Host "前端服务运行在: http://localhost:$FRONTEND_PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "调试日志文件:" -ForegroundColor Yellow
Write-Host "  后端日志: $BACKEND_LOG" -ForegroundColor Yellow
Write-Host "  前端日志: $FRONTEND_LOG" -ForegroundColor Yellow
Write-Host ""
Write-Host "调试工具:" -ForegroundColor Yellow
Write-Host "  1. 实时查看后端日志: Get-Content $BACKEND_LOG -Wait" -ForegroundColor Yellow
Write-Host "  2. 实时查看前端日志: Get-Content $FRONTEND_LOG -Wait" -ForegroundColor Yellow
Write-Host "  3. 重启后端服务: Stop-Job -Job `$backendJob; Remove-Job -Job `$backendJob -Force; <启动新的后端服务>" -ForegroundColor Yellow
Write-Host ""
Write-Host "按 Ctrl+C 停止所有服务" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Green

# 注册清理函数
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Write-Host "正在停止服务..." -ForegroundColor Cyan
    if ($backendJob) {
        Stop-Job -Job $backendJob
        Remove-Job -Job $backendJob -Force
        Write-Host "后端服务已停止" -ForegroundColor Green
    }
    
    if ($frontendJob) {
        Stop-Job -Job $frontendJob
        Remove-Job -Job $frontendJob -Force
        Write-Host "前端服务已停止" -ForegroundColor Green
    }
    
    Write-Host "所有服务已停止" -ForegroundColor Green
}

# 保持脚本运行并监控服务状态
try {
    while ($true) {
        # 检查后端服务是否仍在运行
        if ($backendJob.State -ne "Running") {
            Write-Host "警告: 后端服务已停止运行" -ForegroundColor Red
            if ($frontendJob) {
                Stop-Job -Job $frontendJob
                Remove-Job -Job $frontendJob -Force
            }
            exit 1
        }
        
        # 检查前端服务是否仍在运行
        if ($frontendJob.State -ne "Running") {
            Write-Host "警告: 前端服务已停止运行" -ForegroundColor Red
            if ($backendJob) {
                Stop-Job -Job $backendJob
                Remove-Job -Job $backendJob -Force
            }
            exit 1
        }
        
        # 更新日志文件
        Receive-Job -Job $backendJob -Keep | Out-File -FilePath $BACKEND_LOG -Append
        Receive-Job -Job $frontendJob -Keep | Out-File -FilePath $FRONTEND_LOG -Append
        
        # 显示最新的日志条目（可选）
        # Write-Host "最新后端日志:" -ForegroundColor Cyan
        # Get-Content $BACKEND_LOG -Tail 5
        # Write-Host "最新前端日志:" -ForegroundColor Cyan
        # Get-Content $FRONTEND_LOG -Tail 5
        
        Start-Sleep -Seconds 5
    }
}
finally {
    # 确保在脚本终止时清理资源
    if ($backendJob) {
        Stop-Job -Job $backendJob
        Remove-Job -Job $backendJob -Force
        Write-Host "后端服务已停止" -ForegroundColor Green
    }
    
    if ($frontendJob) {
        Stop-Job -Job $frontendJob
        Remove-Job -Job $frontendJob -Force
        Write-Host "前端服务已停止" -ForegroundColor Green
    }
    
    Write-Host "所有服务已停止" -ForegroundColor Green
}