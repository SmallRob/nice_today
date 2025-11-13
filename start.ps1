<#
生物节律应用 Windows PowerShell 启动脚本
优化版本 - 专业的错误处理、日志记录和跨版本兼容性
#>

# =============================================================================
# 配置模块
# =============================================================================

# 设置严格的错误处理
$ErrorActionPreference = "Stop"

# 配置常量
$SCRIPT_DIR = $PSScriptRoot
$LOG_FILE = Join-Path $SCRIPT_DIR "debug.log"

# 服务端口配置
$DEFAULT_BACKEND_PORT = 5020
$DEFAULT_FRONTEND_PORT = 3000

# 虚拟环境配置
$VENV_NAME = "biorhythm_env"
$VENV_PATH = Join-Path $SCRIPT_DIR $VENV_NAME

# =============================================================================
# 日志模块
# =============================================================================

function Write-Log {
    param(
        [string]$Level,
        [string]$Message
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # 输出到控制台
    switch ($Level) {
        "INFO"    { Write-Host $logEntry -ForegroundColor Green }
        "WARN"    { Write-Host $logEntry -ForegroundColor Yellow }
        "ERROR"   { Write-Host $logEntry -ForegroundColor Red }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Cyan }
        default   { Write-Host $logEntry }
    }
    
    # 写入日志文件
    Add-Content -Path $LOG_FILE -Value $logEntry -Encoding UTF8
}

function Write-Info { param([string]$Message) { Write-Log "INFO" $Message } }
function Write-Warn { param([string]$Message) { Write-Log "WARN" $Message } }
function Write-Error { param([string]$Message) { Write-Log "ERROR" $Message } }
function Write-Success { param([string]$Message) { Write-Log "SUCCESS" $Message } }

# =============================================================================
# 工具函数模块
# =============================================================================

function Test-PortAvailability {
    param([int]$Port)
    
    try {
        # 使用 Test-NetConnection (PowerShell 4.0+)
        if (Get-Command "Test-NetConnection" -ErrorAction SilentlyContinue) {
            return -not (Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet)
        }
        
        # 备用方法：使用 .NET Socket
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $result = $tcpClient.BeginConnect("localhost", $Port, $null, $null)
        $success = $result.AsyncWaitHandle.WaitOne(1000, $false)
        $tcpClient.EndConnect($result)
        
        return -not $success
    } catch {
        # 连接失败说明端口可用
        return $true
    }
}

function Find-AvailablePort {
    param([int]$DefaultPort)
    
    $port = $DefaultPort
    while (-not (Test-PortAvailability -Port $port)) {
        Write-Info "端口 $port 已被占用，尝试端口 $($port + 1)"
        $port++
    }
    
    return $port
}

function Test-DirectoryExists {
    param([string]$Path, [string]$Name)
    
    if (-not (Test-Path $Path)) {
        Write-Error "$Name 目录不存在: $Path"
    }
}

function Test-PythonAvailable {
    try {
        $pythonVersion = & python --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Test-NodeAvailable {
    try {
        $nodeVersion = & node --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

# =============================================================================
# 虚拟环境管理模块
# =============================================================================

function Setup-VirtualEnvironment {
    Write-Info "设置Python虚拟环境..."
    
    # 检查Python可用性
    if (-not (Test-PythonAvailable)) {
        Write-Error "未找到Python解释器，请确保Python已安装并添加到PATH"
    }
    
    # 获取Python版本
    try {
        $pythonVersion = & python --version 2>&1
        Write-Info "检测到Python版本: $pythonVersion"
    } catch {
        Write-Error "无法获取Python版本信息"
    }
    
    # 创建或激活虚拟环境
    if (-not (Test-Path $VENV_PATH)) {
        Write-Info "创建虚拟环境: $VENV_NAME"
        & python -m venv $VENV_PATH
        if ($LASTEXITCODE -ne 0) {
            Write-Error "创建虚拟环境失败"
        }
    } else {
        Write-Info "使用现有虚拟环境: $VENV_NAME"
    }
    
    # 激活虚拟环境
    $activateScript = Join-Path $VENV_PATH "Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        . $activateScript
        Write-Success "虚拟环境已激活"
    } else {
        Write-Error "虚拟环境激活文件不存在: $activateScript"
    }
}

# =============================================================================
# 后端服务模块
# =============================================================================

function Start-BackendService {
    param([int]$Port)
    
    Write-Info "启动后端服务 (端口: $Port)..."
    
    # 验证目录
    Test-DirectoryExists (Join-Path $SCRIPT_DIR "backend") "后端"
    
    # 切换到后端目录
    Push-Location (Join-Path $SCRIPT_DIR "backend")
    
    try {
        # 安装依赖
        Write-Info "安装后端依赖..."
        & pip install --upgrade pip
        if ($LASTEXITCODE -ne 0) {
            Write-Error "pip升级失败"
        }
        
        & pip install -r requirements.txt
        if ($LASTEXITCODE -ne 0) {
            Write-Error "后端依赖安装失败"
        }
        
        # 启动服务
        Write-Info "启动FastAPI服务器..."
        $backendProcess = Start-Process python -ArgumentList "app.py", "--port", $Port -PassThru -NoNewWindow
        
        # 等待服务启动
        Start-Sleep -Seconds 3
        
        # 验证服务状态
        if ($backendProcess.HasExited) {
            Write-Error "后端服务启动失败，请检查 backend.log"
        }
        
        return $backendProcess.Id
        
    } finally {
        Pop-Location
    }
}

# =============================================================================
# 前端服务模块
# =============================================================================

function Start-FrontendService {
    param([int]$Port, [string]$BackendApi)
    
    Write-Info "启动前端服务 (端口: $Port)..."
    
    # 验证目录
    Test-DirectoryExists (Join-Path $SCRIPT_DIR "frontend") "前端"
    
    # 检查Node.js可用性
    if (-not (Test-NodeAvailable)) {
        Write-Error "未找到Node.js，请确保Node.js已安装并添加到PATH"
    }
    
    # 切换到前端目录
    Push-Location (Join-Path $SCRIPT_DIR "frontend")
    
    try {
        # 安装依赖
        Write-Info "安装前端依赖..."
        if (-not (Test-Path "node_modules")) {
            & npm install
            if ($LASTEXITCODE -ne 0) {
                Write-Error "前端依赖安装失败"
            }
        }
        
        # 设置环境变量并启动服务
        Write-Info "启动React开发服务器..."
        $env:REACT_APP_BACKEND_API = $BackendApi
        $env:PORT = $Port
        
        $frontendProcess = Start-Process npm -ArgumentList "start" -PassThru -NoNewWindow
        
        # 等待服务启动
        Start-Sleep -Seconds 5
        
        # 验证服务状态
        if ($frontendProcess.HasExited) {
            Write-Error "前端服务启动失败，请检查 frontend.log"
        }
        
        return $frontendProcess.Id
        
    } finally {
        Pop-Location
    }
}

# =============================================================================
# 服务监控模块
# =============================================================================

function Monitor-Services {
    param([int]$BackendPid, [int]$FrontendPid)
    
    Write-Info "开始监控服务状态..."
    
    # 清理函数
    function Cleanup-Services {
        Write-Info "正在停止服务..."
        
        try {
            # 停止后端服务
            if (Get-Process -Id $BackendPid -ErrorAction SilentlyContinue) {
                Stop-Process -Id $BackendPid -Force
                Write-Info "后端服务已停止"
            }
            
            # 停止前端服务
            if (Get-Process -Id $FrontendPid -ErrorAction SilentlyContinue) {
                Stop-Process -Id $FrontendPid -Force
                Write-Info "前端服务已停止"
            }
            
            Write-Success "所有服务已停止"
        } catch {
            Write-Warn "清理服务时发生错误: $($_.Exception.Message)"
        }
    }
    
    # 注册Ctrl+C事件
    Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
        Cleanup-Services
    }
    
    # 监控循环
    while ($true) {
        try {
            # 检查后端服务状态
            if (-not (Get-Process -Id $BackendPid -ErrorAction SilentlyContinue)) {
                Write-Error "后端服务异常停止"
            }
            
            # 检查前端服务状态
            if (-not (Get-Process -Id $FrontendPid -ErrorAction SilentlyContinue)) {
                Write-Error "前端服务异常停止"
            }
            
            Start-Sleep -Seconds 10
            
        } catch {
            Write-Warn "监控服务时发生错误: $($_.Exception.Message)"
            Start-Sleep -Seconds 5
        }
    }
}

# =============================================================================
# 主函数
# =============================================================================

function Start-BiorhythmApp {
    Write-Info "启动生物节律应用调试环境..."
    
    # 初始化日志文件
    "=== 生物节律应用调试日志 ===" | Out-File -FilePath $LOG_FILE -Encoding UTF8
    "启动时间: $(Get-Date)" | Out-File -FilePath $LOG_FILE -Encoding UTF8 -Append
    
    # 检查是否在项目根目录运行
    if (-not (Test-Path (Join-Path $SCRIPT_DIR "backend\app.py")) -or 
        -not (Test-Path (Join-Path $SCRIPT_DIR "frontend\package.json"))) {
        Write-Error "请在项目根目录运行此脚本"
    }
    
    # 查找可用端口
    $backendPort = Find-AvailablePort -DefaultPort $DEFAULT_BACKEND_PORT
    $frontendPort = Find-AvailablePort -DefaultPort $DEFAULT_FRONTEND_PORT
    
    Write-Info "后端服务端口: $backendPort"
    Write-Info "前端服务端口: $frontendPort"
    
    # 设置虚拟环境
    Setup-VirtualEnvironment
    
    # 启动后端服务
    $backendPid = Start-BackendService -Port $backendPort
    
    # 配置后端API地址
    $backendApi = "http://localhost:$backendPort"
    
    # 启动前端服务
    $frontendPid = Start-FrontendService -Port $frontendPort -BackendApi $backendApi
    
    # 显示服务信息
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "🚀 生物节律应用调试环境已启动" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 后端服务: http://localhost:$backendPort" -ForegroundColor Yellow
    Write-Host "🌐 前端服务: http://localhost:$frontendPort" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 日志文件: $LOG_FILE" -ForegroundColor Magenta
    Write-Host "💡 按 Ctrl+C 停止所有服务" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # 开始监控服务
    Monitor-Services -BackendPid $backendPid -FrontendPid $frontendPid
}

# =============================================================================
# 脚本入口点
# =============================================================================

try {
    # 设置控制台编码为UTF-8
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    
    # 执行主函数
    Start-BiorhythmApp
} catch {
    Write-Error "脚本执行失败: $($_.Exception.Message)"
    exit 1
}