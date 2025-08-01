# 生物节律应用启动调试脚本
# 作者: CodeBuddy
# 版本: 1.0.0
# 描述: 此脚本用于在Windows环境下启动前后端服务，并提供调试选项

# 设置控制台颜色
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "White"
Clear-Host

# 定义颜色函数
function Write-ColorText {
    param (
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

# 显示欢迎信息
Write-ColorText "====================================================" "Cyan"
Write-ColorText "            生物节律应用 - 启动调试脚本              " "Cyan"
Write-ColorText "====================================================" "Cyan"
Write-ColorText "此脚本将帮助您启动前后端服务并提供调试选项" "Yellow"
Write-ColorText "" 

# 检查环境
Write-ColorText "正在检查环境..." "Green"

# 检查 Node.js
try {
    $nodeVersion = node -v
    Write-ColorText "✓ Node.js 已安装: $nodeVersion" "Green"
} catch {
    Write-ColorText "✗ 未检测到 Node.js，请先安装 Node.js" "Red"
    exit 1
}

# 检查 Python
try {
    $pythonVersion = python --version
    Write-ColorText "✓ Python 已安装: $pythonVersion" "Green"
} catch {
    try {
        $pythonVersion = python3 --version
        Write-ColorText "✓ Python 已安装: $pythonVersion" "Green"
        $pythonCmd = "python3"
    } catch {
        Write-ColorText "✗ 未检测到 Python，请先安装 Python 3.x" "Red"
        exit 1
    }
}

if (-not $pythonCmd) {
    $pythonCmd = "python"
}

# 检查 Docker（可选）
try {
    $dockerVersion = docker --version
    Write-ColorText "✓ Docker 已安装: $dockerVersion" "Green"
    $dockerAvailable = $true
} catch {
    Write-ColorText "! Docker 未安装，将使用本地模式运行" "Yellow"
    $dockerAvailable = $false
}

# 显示菜单
function Show-Menu {
    Write-ColorText "`n选择启动模式:" "Cyan"
    Write-ColorText "1. 开发模式 (前后端分离启动)" "White"
    Write-ColorText "2. 生产模式 (使用 Docker 构建并运行)" "White"
    Write-ColorText "3. 仅启动前端" "White"
    Write-ColorText "4. 仅启动后端" "White"
    Write-ColorText "5. 调试模式 (带调试信息)" "White"
    Write-ColorText "6. 退出" "White"
    
    $choice = Read-Host "`n请输入选项 (1-6)"
    return $choice
}

# 启动前端
function Start-Frontend {
    param (
        [bool]$Debug = $false
    )
    
    Write-ColorText "`n正在启动前端服务..." "Magenta"
    Set-Location -Path "frontend"
    
    # 安装依赖
    Write-ColorText "正在检查并安装前端依赖..." "Yellow"
    npm install
    
    if ($Debug) {
        Write-ColorText "以调试模式启动前端..." "Yellow"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev -- --debug"
    } else {
        Write-ColorText "以标准模式启动前端..." "Yellow"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    }
    
    Set-Location -Path ".."
    Write-ColorText "前端服务已启动，请在浏览器中访问: http://localhost:3000" "Green"
}

# 启动后端
function Start-Backend {
    param (
        [bool]$Debug = $false
    )
    
    Write-ColorText "`n正在启动后端服务..." "Blue"
    Set-Location -Path "backend"
    
    # 检查虚拟环境
    if (-not (Test-Path -Path "venv")) {
        Write-ColorText "正在创建 Python 虚拟环境..." "Yellow"
        & $pythonCmd -m venv venv
    }
    
    # 激活虚拟环境
    Write-ColorText "正在激活虚拟环境..." "Yellow"
    if (Test-Path -Path "venv\Scripts\Activate.ps1") {
        . .\venv\Scripts\Activate.ps1
    } else {
        Write-ColorText "无法找到虚拟环境激活脚本，请检查 Python 安装" "Red"
        Set-Location -Path ".."
        return
    }
    
    # 安装依赖
    Write-ColorText "正在检查并安装后端依赖..." "Yellow"
    pip install -r requirements.txt
    
    if ($Debug) {
        Write-ColorText "以调试模式启动后端..." "Yellow"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", ". .\venv\Scripts\Activate.ps1; python app.py --debug"
    } else {
        Write-ColorText "以标准模式启动后端..." "Yellow"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", ". .\venv\Scripts\Activate.ps1; python app.py"
    }
    
    Set-Location -Path ".."
    Write-ColorText "后端服务已启动，API 地址: http://localhost:5000" "Green"
}

# 使用 Docker 启动
function Start-DockerMode {
    if (-not $dockerAvailable) {
        Write-ColorText "Docker 未安装，无法使用 Docker 模式" "Red"
        return
    }
    
    Write-ColorText "`n正在使用 Docker 构建并启动应用..." "Cyan"
    
    # 构建 Docker 镜像
    Write-ColorText "正在构建 Docker 镜像..." "Yellow"
    docker-compose build
    
    # 启动容器
    Write-ColorText "正在启动 Docker 容器..." "Yellow"
    docker-compose up
}

# 主循环
$exit = $false
while (-not $exit) {
    $choice = Show-Menu
    
    switch ($choice) {
        "1" {
            # 开发模式
            Start-Frontend -Debug $false
            Start-Backend -Debug $false
        }
        "2" {
            # 生产模式
            Start-DockerMode
        }
        "3" {
            # 仅前端
            Start-Frontend -Debug $false
        }
        "4" {
            # 仅后端
            Start-Backend -Debug $false
        }
        "5" {
            # 调试模式
            Write-ColorText "`n调试模式已选择" "Yellow"
            Write-ColorText "1. 调试前端" "White"
            Write-ColorText "2. 调试后端" "White"
            Write-ColorText "3. 同时调试前后端" "White"
            
            $debugChoice = Read-Host "`n请选择调试选项 (1-3)"
            
            switch ($debugChoice) {
                "1" { Start-Frontend -Debug $true }
                "2" { Start-Backend -Debug $true }
                "3" { 
                    Start-Frontend -Debug $true
                    Start-Backend -Debug $true
                }
                default { Write-ColorText "无效的选项" "Red" }
            }
        }
        "6" {
            # 退出
            $exit = $true
            Write-ColorText "`n感谢使用启动调试脚本，再见！" "Cyan"
        }
        default {
            Write-ColorText "`n无效的选项，请重新选择" "Red"
        }
    }
    
    if (-not $exit) {
        Write-ColorText "`n按任意键返回主菜单..." "Yellow"
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Clear-Host
        Write-ColorText "====================================================" "Cyan"
        Write-ColorText "            生物节律应用 - 启动调试脚本              " "Cyan"
        Write-ColorText "====================================================" "Cyan"
    }
}