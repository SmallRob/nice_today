# Windows PowerShell启动脚本 - UTF-8编码版本
# 生物节律应用启动脚本

# 定义端口
$BACKEND_PORT = 5020
$FRONTEND_PORT = 3000

# 定义虚拟环境名称和路径
$VENV_NAME = "biorhythm_env"
$VENV_PATH = "./$VENV_NAME"

# 检查端口是否被占用并找到可用端口
function Find-AvailablePort {
    param (
        [int]$port
    )
    
    while (Test-Port $port) {
        Write-Output "端口 $port 已被占用，尝试使用端口 $($port+1)"
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
Write-Output "后端将使用端口: $BACKEND_PORT"

# 查找可用的前端端口
$FRONTEND_PORT = Find-AvailablePort -port $FRONTEND_PORT
Write-Output "前端将使用端口: $FRONTEND_PORT"

# 确保目录存在
if (-not (Test-Path "backend")) {
    Write-Output "错误: 找不到 backend 目录"
    exit 1
}

if (-not (Test-Path "frontend")) {
    Write-Output "错误: 找不到 frontend 目录"
    exit 1
}

# 检测是否使用conda环境
$USE_CONDA = $false
if ($env:CONDA_PREFIX) {
    Write-Output "检测到Conda环境: $env:CONDA_PREFIX"
    $USE_CONDA = $true
}

# 如果是conda环境，使用conda创建虚拟环境
if ($USE_CONDA) {
    Write-Output "使用Conda创建虚拟环境..."
    $condaEnvExists = conda env list | Select-String -Pattern $VENV_NAME
    
    if (-not $condaEnvExists) {
        Write-Output "创建新的Conda环境: $VENV_NAME"
        conda create -y -n $VENV_NAME python=3.9
        if ($LASTEXITCODE -ne 0) {
            Write-Output "创建Conda环境失败"
            exit 1
        }
    }
    else {
        Write-Output "使用已存在的Conda环境: $VENV_NAME"
    }
    
    # 激活conda环境
    Write-Output "激活Conda环境..."
    conda activate $VENV_NAME
    if ($LASTEXITCODE -ne 0) {
        Write-Output "激活Conda环境失败"
        exit 1
    }
    
    $VENV_ACTIVE = $true
}
else {
    # 创建并激活虚拟环境
    Write-Output "设置Python虚拟环境..."
    
    # 检测Python版本
    $pythonVersionInfo = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
    Write-Output "检测到Python版本: $pythonVersionInfo"
    
    # 如果是Python 3.12，尝试使用Python 3.9
    $PYTHON_CMD = "python"
    if ($pythonVersionInfo -eq "3.12") {
        Write-Output "检测到Python 3.12，尝试使用Python 3.9..."
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
            Write-Output "警告: 未找到Python 3.9/3.10/3.11，将使用当前Python版本"
            Write-Output "注意: Python 3.12可能与某些依赖包不兼容，如果遇到问题，请安装Python 3.9-3.11"
        }
    }
    
    Write-Output "使用Python命令: $PYTHON_CMD"
    
    # Windows下的激活路径
    $ACTIVATE_PATH = "Scripts\activate.ps1"
    
    # 如果虚拟环境存在但可能有问题，删除它
    if ((Test-Path $VENV_PATH) -and (-not (Test-Path "$VENV_PATH\$ACTIVATE_PATH"))) {
        Write-Output "检测到虚拟环境可能已损坏，删除并重新创建..."
        Remove-Item -Recurse -Force $VENV_PATH
    }
    
    if (-not (Test-Path $VENV_PATH)) {
        Write-Output "创建新的虚拟环境: $VENV_NAME"
        try {
            & $PYTHON_CMD -m venv $VENV_PATH
            if ($LASTEXITCODE -ne 0) {
                throw "创建虚拟环境失败"
            }
        }
        catch {
            Write-Output "创建虚拟环境失败，尝试使用 virtualenv..."
            $virtualenv = Get-Command virtualenv -ErrorAction SilentlyContinue
            
            if (-not $virtualenv) {
                Write-Output "virtualenv 未安装，尝试安装..."
                pip install virtualenv
                if ($LASTEXITCODE -ne 0) {
                    Write-Output "安装 virtualenv 失败，请手动安装 virtualenv 或 venv"
                    exit 1
                }
            }
            
            virtualenv -p $PYTHON_CMD $VENV_PATH
            if ($LASTEXITCODE -ne 0) {
                Write-Output "使用 virtualenv 创建虚拟环境失败"
                exit 1
            }
        }
    }
    else {
        Write-Output "使用已存在的虚拟环境: $VENV_NAME"
    }
    
    # 激活虚拟环境
    Write-Output "激活虚拟环境..."
    if (Test-Path "$VENV_PATH\$ACTIVATE_PATH") {
        & "$VENV_PATH\$ACTIVATE_PATH"
        $VENV_ACTIVE = $true
        Write-Output "虚拟环境已激活"
        # 验证虚拟环境是否正确激活
        Get-Command python | Select-Object -ExpandProperty Source
        python --version
    }
    else {
        Write-Output "警告: 无法激活虚拟环境，将使用系统Python"
        $VENV_ACTIVE = $false
    }
}

# 启动后端服务
Write-Output "启动后端服务..."
Push-Location backend

Write-Output "安装后端依赖..."
if ($VENV_ACTIVE) {
    # 先升级pip
    Write-Output "升级pip..."
    pip install --upgrade pip
    
    # 安装setuptools和wheel
    Write-Output "安装基础包..."
    pip install setuptools wheel
    
    # 检测Python版本
    $pythonVersionInfo = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
    
    # 安装Flask和其他基本依赖
    Write-Output "安装Flask和其他基本依赖..."
    pip install Flask==2.2.3 Flask-Cors==3.0.10
    
    # 根据Python版本选择安装方式
    if ($pythonVersionInfo -eq "3.12") {
        Write-Output "检测到Python 3.12，跳过numpy和pandas安装，直接使用替代方案..."
        # 对于Python 3.12，我们不安装numpy和pandas，而是使用替代方案
        # 创建一个简单的替代模块
        $npModuleContent = @"
# numpy替代模块
class array:
    def __init__(self, data):
        self.data = data
    
    def __str__(self):
        return str(self.data)

def linspace(start, stop, num=50):
    step = (stop - start) / (num - 1)
    return [start + i * step for i in range(num)]

def sin(x):
    import math
    if isinstance(x, list):
        return [math.sin(i) for i in x]
    return math.sin(x)

def cos(x):
    import math
    if isinstance(x, list):
        return [math.cos(i) for i in x]
    return math.cos(x)
"@
        $npModuleContent | Out-File -FilePath "numpy_alt.py" -Encoding utf8
        
        # 修改app.py以使用替代模块
        $appContent = Get-Content -Path "app.py" -Raw
        $appContent = $appContent -replace "import numpy as np", "import numpy_alt as np"
        $appContent | Out-File -Path "app.py" -Encoding utf8
        
        Write-Output "已创建numpy替代模块并修改app.py"
    } else {
        # 对于Python 3.9-3.11，使用指定版本
        Write-Output "安装numpy和pandas..."
        pip install numpy==1.24.2 --only-binary=numpy
        if ($LASTEXITCODE -ne 0) {
            Write-Output "无法安装numpy预编译版本，尝试直接安装..."
            pip install numpy==1.24.2
            if ($LASTEXITCODE -ne 0) {
                Write-Output "无法安装numpy，创建替代模块..."
                $npModuleContent = @"
# numpy替代模块
class array:
    def __init__(self, data):
        self.data = data
    
    def __str__(self):
        return str(self.data)

def linspace(start, stop, num=50):
    step = (stop - start) / (num - 1)
    return [start + i * step for i in range(num)]

def sin(x):
    import math
    if isinstance(x, list):
        return [math.sin(i) for i in x]
    return math.sin(x)

def cos(x):
    import math
    if isinstance(x, list):
        return [math.cos(i) for i in x]
    return math.cos(x)
"@
                $npModuleContent | Out-File -FilePath "numpy_alt.py" -Encoding utf8
                
                # 修改app.py以使用替代模块
                $appContent = Get-Content -Path "app.py" -Raw
                $appContent = $appContent -replace "import numpy as np", "import numpy_alt as np"
                $appContent | Out-File -Path "app.py" -Encoding utf8
                
                Write-Output "已创建numpy替代模块并修改app.py"
            }
        }
        
        pip install pandas==1.5.3 --only-binary=pandas
        if ($LASTEXITCODE -ne 0) {
            Write-Output "无法安装pandas预编译版本，跳过pandas安装..."
        }
    }
}
else {
    # 如果虚拟环境未激活，尝试直接安装依赖
    Write-Output "尝试直接安装依赖..."
    pip install Flask==2.2.3 Flask-Cors==3.0.10
    
    # 检测Python版本
    $pythonVersionInfo = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
    
    if ($pythonVersionInfo -eq "3.12") {
        # 创建替代模块
        $npModuleContent = @"
# numpy替代模块
class array:
    def __init__(self, data):
        self.data = data
    
    def __str__(self):
        return str(self.data)

def linspace(start, stop, num=50):
    step = (stop - start) / (num - 1)
    return [start + i * step for i in range(num)]

def sin(x):
    import math
    if isinstance(x, list):
        return [math.sin(i) for i in x]
    return math.sin(x)

def cos(x):
    import math
    if isinstance(x, list):
        return [math.cos(i) for i in x]
    return math.cos(x)
"@
        $npModuleContent | Out-File -FilePath "numpy_alt.py" -Encoding utf8
        
        # 修改app.py以使用替代模块
        $appContent = Get-Content -Path "app.py" -Raw
        $appContent = $appContent -replace "import numpy as np", "import numpy_alt as np"
        $appContent | Out-File -Path "app.py" -Encoding utf8
        
        Write-Output "已创建numpy替代模块并修改app.py"
    } else {
        pip install numpy pandas
        if ($LASTEXITCODE -ne 0) {
            Write-Output "安装numpy和pandas失败，创建替代模块..."
            $npModuleContent = @"
# numpy替代模块
class array:
    def __init__(self, data):
        self.data = data
    
    def __str__(self):
        return str(self.data)

def linspace(start, stop, num=50):
    step = (stop - start) / (num - 1)
    return [start + i * step for i in range(num)]

def sin(x):
    import math
    if isinstance(x, list):
        return [math.sin(i) for i in x]
    return math.sin(x)

def cos(x):
    import math
    if isinstance(x, list):
        return [math.cos(i) for i in x]
    return math.cos(x)
"@
            $npModuleContent | Out-File -FilePath "numpy_alt.py" -Encoding utf8
            
            # 修改app.py以使用替代模块
            $appContent = Get-Content -Path "app.py" -Raw
            $appContent = $appContent -replace "import numpy as np", "import numpy_alt as np"
            $appContent | Out-File -Path "app.py" -Encoding utf8
            
            Write-Output "已创建numpy替代模块并修改app.py"
        }
    }
}

Write-Output "启动 Flask 服务器..."
# 使用动态端口启动后端
$env:FLASK_RUN_PORT = $BACKEND_PORT  # 保留这个变量名以保持兼容性
$backendJob = Start-Job -ScriptBlock {
    param($workDir, $port)
    Set-Location $workDir
    $env:FLASK_RUN_PORT = $port
    python app.py
} -ArgumentList $PWD.Path, $BACKEND_PORT

# 创建日志文件
Start-Sleep -Seconds 1
Receive-Job -Job $backendJob -Keep | Out-File -FilePath "backend.log" -Append

Pop-Location

# 等待后端服务启动
Write-Output "等待后端服务启动..."
Start-Sleep -Seconds 3

# 检查后端服务是否成功启动
if ($backendJob.State -ne "Running") {
    Write-Output "错误: 后端服务启动失败，请查看 backend/backend.log 文件了解详情"
    Get-Content backend/backend.log
    exit 1
}

# 测试后端服务是否可访问
Write-Output "测试后端服务是否可访问..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$BACKEND_PORT" -UseBasicParsing -ErrorAction SilentlyContinue
}
catch {
    Write-Output "警告: 无法访问后端服务，但进程似乎在运行"
}

# 安装前端依赖并启动前端服务
Write-Output "安装前端依赖并启动前端服务..."
Push-Location frontend
Write-Output "安装 npm 依赖..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Output "安装前端依赖失败"
    Stop-Job -Job $backendJob
    Remove-Job -Job $backendJob -Force
    exit 1
}

Write-Output "启动 React 开发服务器..."
# 使用动态端口启动前端，并传递后端端口给前端应用
$env:REACT_APP_BACKEND_PORT = $BACKEND_PORT
$env:PORT = $FRONTEND_PORT
$frontendJob = Start-Job -ScriptBlock {
    param($workDir, $backendPort, $frontendPort)
    Set-Location $workDir
    $env:REACT_APP_BACKEND_PORT = $backendPort
    $env:PORT = $frontendPort
    npm start
} -ArgumentList $PWD.Path, $BACKEND_PORT, $FRONTEND_PORT

# 创建日志文件
Start-Sleep -Seconds 1
Receive-Job -Job $frontendJob -Keep | Out-File -FilePath "frontend.log" -Append

Pop-Location

# 等待前端服务启动
Write-Output "等待前端服务启动..."
Start-Sleep -Seconds 5

# 检查前端服务是否成功启动
if ($frontendJob.State -ne "Running") {
    Write-Output "错误: 前端服务启动失败，请查看 frontend/frontend.log 文件了解详情"
    Get-Content frontend/frontend.log
    Stop-Job -Job $backendJob
    Remove-Job -Job $backendJob -Force
    exit 1
}

# 显示服务信息
Write-Output "=================================================="
Write-Output "服务已成功启动！"
Write-Output "后端服务运行在: http://localhost:$BACKEND_PORT"
Write-Output "前端服务运行在: http://localhost:$FRONTEND_PORT"
Write-Output ""
Write-Output "提示: 如果无法访问服务，请检查防火墙设置"
Write-Output "      或尝试直接在浏览器中访问上述URL"
Write-Output ""
Write-Output "按 Ctrl+C 停止所有服务"
Write-Output "=================================================="

# 注册清理函数
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Write-Output "正在停止服务..."
    if ($backendJob) {
        Stop-Job -Job $backendJob
        Remove-Job -Job $backendJob -Force
        Write-Output "后端服务已停止"
    }
    
    if ($frontendJob) {
        Stop-Job -Job $frontendJob
        Remove-Job -Job $frontendJob -Force
        Write-Output "前端服务已停止"
    }
    
    Write-Output "所有服务已停止"
}

# 保持脚本运行并监控服务状态
try {
    while ($true) {
        # 检查后端服务是否仍在运行
        if ($backendJob.State -ne "Running") {
            Write-Output "警告: 后端服务已停止运行"
            if ($frontendJob) {
                Stop-Job -Job $frontendJob
                Remove-Job -Job $frontendJob -Force
            }
            exit 1
        }
        
        # 检查前端服务是否仍在运行
        if ($frontendJob.State -ne "Running") {
            Write-Output "警告: 前端服务已停止运行"
            if ($backendJob) {
                Stop-Job -Job $backendJob
                Remove-Job -Job $backendJob -Force
            }
            exit 1
        }
        
        # 更新日志文件
        Receive-Job -Job $backendJob -Keep | Out-File -FilePath "backend/backend.log" -Append
        Receive-Job -Job $frontendJob -Keep | Out-File -FilePath "frontend/frontend.log" -Append
        
        Start-Sleep -Seconds 5
    }
}
finally {
    # 确保在脚本终止时清理资源
    if ($backendJob) {
        Stop-Job -Job $backendJob
        Remove-Job -Job $backendJob -Force
        Write-Output "后端服务已停止"
    }
    
    if ($frontendJob) {
        Stop-Job -Job $frontendJob
        Remove-Job -Job $frontendJob -Force
        Write-Output "前端服务已停止"
    }
    
    Write-Output "所有服务已停止"
}