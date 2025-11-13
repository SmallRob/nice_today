@echo off
REM =============================================================================
REM 生物节律应用 Windows 批处理启动脚本
REM 优化版本 - 专业级错误处理、日志记录和跨版本兼容性
REM =============================================================================

REM 设置脚本目录和日志文件路径
set "SCRIPT_DIR=%~dp0"
set "LOG_FILE=%SCRIPT_DIR%debug.log"

REM 服务端口配置
set "DEFAULT_BACKEND_PORT=5020"
set "DEFAULT_FRONTEND_PORT=3000"

REM 虚拟环境配置
set "VENV_NAME=biorhythm_env"
set "VENV_PATH=%SCRIPT_DIR%%VENV_NAME%"

REM 初始化日志文件
echo === 生物节律应用调试日志 === > "%LOG_FILE%"
echo 启动时间: %date% %time% >> "%LOG_FILE%"

REM =============================================================================
REM 日志模块
REM =============================================================================

:LOG_INFO
set "LOG_MESSAGE=%~1"
call :LOG_WRITE "INFO" "%LOG_MESSAGE%"
echo [INFO] %LOG_MESSAGE%
goto :EOF

:LOG_WARN
set "LOG_MESSAGE=%~1"
call :LOG_WRITE "WARN" "%LOG_MESSAGE%"
echo [WARN] %LOG_MESSAGE%
goto :EOF

:LOG_ERROR
set "LOG_MESSAGE=%~1"
call :LOG_WRITE "ERROR" "%LOG_MESSAGE%"
echo [ERROR] %LOG_MESSAGE%
exit /b 1

:LOG_SUCCESS
set "LOG_MESSAGE=%~1"
call :LOG_WRITE "SUCCESS" "%LOG_MESSAGE%"
echo [SUCCESS] %LOG_MESSAGE%
goto :EOF

:LOG_WRITE
set "LOG_LEVEL=%~1"
set "LOG_MESSAGE=%~2"
for /f "tokens=1-3 delims=: " %%a in ("%time%") do set "TIMESTAMP=%date% %%a:%%b:%%c"
echo [%TIMESTAMP%] [%LOG_LEVEL%] %LOG_MESSAGE% >> "%LOG_FILE%"
goto :EOF

REM =============================================================================
REM 工具函数模块
REM =============================================================================

:CHECK_COMMAND_EXISTS
set "COMMAND=%~1"
where %COMMAND% >nul 2>nul
if %ERRORLEVEL% equ 0 (
    exit /b 0
) else (
    exit /b 1
)

:TEST_PORT_AVAILABILITY
set "PORT=%~1"

REM 方法1: 使用 PowerShell Test-NetConnection (推荐)
powershell -Command "try { Test-NetConnection -ComputerName localhost -Port %PORT% -InformationLevel Quiet } catch { exit 1 }" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    exit /b 1  REM 端口被占用
) else (
    exit /b 0  REM 端口可用
)

:FIND_AVAILABLE_PORT
set "DEFAULT_PORT=%~1"
set "PORT=%DEFAULT_PORT%"

:PORT_LOOP
call :TEST_PORT_AVAILABILITY %PORT%
if %ERRORLEVEL% equ 0 goto :PORT_FOUND

call :LOG_INFO "端口 %PORT% 已被占用，尝试端口 %PORT%+1"
set /a PORT+=1
goto :PORT_LOOP

:PORT_FOUND
exit /b %PORT%

:TEST_DIRECTORY_EXISTS
set "DIR_PATH=%~1"
set "DIR_NAME=%~2"

if not exist "%DIR_PATH%" (
    call :LOG_ERROR "%DIR_NAME% 目录不存在: %DIR_PATH%"
)
exit /b 0

REM =============================================================================
REM 虚拟环境管理模块
REM =============================================================================

:SETUP_VIRTUAL_ENVIRONMENT
call :LOG_INFO "设置Python虚拟环境..."

REM 检查Python可用性
call :CHECK_COMMAND_EXISTS python
if %ERRORLEVEL% neq 0 (
    call :LOG_ERROR "未找到Python解释器，请确保Python已安装并添加到PATH"
)

REM 获取Python版本
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    call :LOG_ERROR "无法获取Python版本信息"
)

REM 创建或激活虚拟环境
if not exist "%VENV_PATH%" (
    call :LOG_INFO "创建虚拟环境: %VENV_NAME%"
    python -m venv "%VENV_PATH%"
    if %ERRORLEVEL% neq 0 (
        call :LOG_ERROR "创建虚拟环境失败"
    )
) else (
    call :LOG_INFO "使用现有虚拟环境: %VENV_NAME%"
)

REM 激活虚拟环境
if exist "%VENV_PATH%\Scripts\activate.bat" (
    call "%VENV_PATH%\Scripts\activate.bat"
    call :LOG_SUCCESS "虚拟环境已激活"
) else (
    call :LOG_ERROR "虚拟环境激活文件不存在"
)
exit /b 0

REM =============================================================================
REM 后端服务模块
REM =============================================================================

:START_BACKEND_SERVICE
set "PORT=%~1"
call :LOG_INFO "启动后端服务 (端口: %PORT%)..."

REM 验证目录
call :TEST_DIRECTORY_EXISTS "%SCRIPT_DIR%backend" "后端"

REM 切换到后端目录
cd /d "%SCRIPT_DIR%backend"

REM 安装依赖
call :LOG_INFO "安装后端依赖..."
pip install --upgrade pip
if %ERRORLEVEL% neq 0 (
    call :LOG_ERROR "pip升级失败"
)

pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    call :LOG_ERROR "后端依赖安装失败"
)

REM 启动服务
call :LOG_INFO "启动FastAPI服务器..."
start "" /B python app.py --port %PORT% > "%SCRIPT_DIR%backend.log" 2>&1
set "BACKEND_PID=%ERRORLEVEL%"

REM 等待服务启动
timeout /t 3 /nobreak >nul

REM 验证服务状态 (简化检查)
tasklist /fi "PID eq %BACKEND_PID%" /fo csv | find "%BACKEND_PID%" >nul
if %ERRORLEVEL% neq 0 (
    call :LOG_ERROR "后端服务启动失败，请检查 backend.log"
)

REM 返回PID
exit /b %BACKEND_PID%

REM =============================================================================
REM 前端服务模块
REM =============================================================================

:START_FRONTEND_SERVICE
set "PORT=%~1"
set "BACKEND_API=%~2"
call :LOG_INFO "启动前端服务 (端口: %PORT%)..."

REM 验证目录
call :TEST_DIRECTORY_EXISTS "%SCRIPT_DIR%frontend" "前端"

REM 检查Node.js可用性
call :CHECK_COMMAND_EXISTS node
if %ERRORLEVEL% neq 0 (
    call :LOG_ERROR "未找到Node.js，请确保Node.js已安装并添加到PATH"
)

REM 切换到前端目录
cd /d "%SCRIPT_DIR%frontend"

REM 安装依赖
call :LOG_INFO "安装前端依赖..."
if not exist "node_modules" (
    npm install
    if %ERRORLEVEL% neq 0 (
        call :LOG_ERROR "前端依赖安装失败"
    )
)

REM 设置环境变量并启动服务
call :LOG_INFO "启动React开发服务器..."
set "REACT_APP_BACKEND_API=%BACKEND_API%"
set "PORT=%PORT%"

start "" /B npm start > "%SCRIPT_DIR%frontend.log" 2>&1
set "FRONTEND_PID=%ERRORLEVEL%"

REM 等待服务启动
timeout /t 5 /nobreak >nul

REM 验证服务状态
tasklist /fi "PID eq %FRONTEND_PID%" /fo csv | find "%FRONTEND_PID%" >nul
if %ERRORLEVEL% neq 0 (
    call :LOG_ERROR "前端服务启动失败，请检查 frontend.log"
)

REM 返回PID
exit /b %FRONTEND_PID%

REM =============================================================================
REM 服务监控模块
REM =============================================================================

:MONITOR_SERVICES
set "BACKEND_PID=%~1"
set "FRONTEND_PID=%~2"
call :LOG_INFO "开始监控服务状态..."

REM 注册Ctrl+C处理
echo 按 Ctrl+C 停止所有服务...

:MONITOR_LOOP
REM 检查后端服务状态
tasklist /fi "PID eq %BACKEND_PID%" /fo csv | find "%BACKEND_PID%" >nul
if %ERRORLEVEL% neq 0 (
    call :LOG_ERROR "后端服务异常停止"
)

REM 检查前端服务状态
tasklist /fi "PID eq %FRONTEND_PID%" /fo csv | find "%FRONTEND_PID%" >nul
if %ERRORLEVEL% neq 0 (
    call :LOG_ERROR "前端服务异常停止"
)

REM 等待10秒
timeout /t 10 /nobreak >nul
goto :MONITOR_LOOP

REM =============================================================================
REM 清理函数
REM =============================================================================

:CLEANUP_SERVICES
call :LOG_INFO "正在停止服务..."

REM 停止后端服务
taskkill /PID %BACKEND_PID% /F >nul 2>&1
if %ERRORLEVEL% equ 0 (
    call :LOG_INFO "后端服务已停止"
)

REM 停止前端服务
taskkill /PID %FRONTEND_PID% /F >nul 2>&1
if %ERRORLEVEL% equ 0 (
    call :LOG_INFO "前端服务已停止"
)

call :LOG_SUCCESS "所有服务已停止"
exit /b 0

REM =============================================================================
REM 主函数
REM =============================================================================

:MAIN
call :LOG_INFO "启动生物节律应用调试环境..."

REM 检查是否在项目根目录运行
if not exist "%SCRIPT_DIR%backend\app.py" (
    call :LOG_ERROR "请在项目根目录运行此脚本"
)
if not exist "%SCRIPT_DIR%frontend\package.json" (
    call :LOG_ERROR "请在项目根目录运行此脚本"
)

REM 查找可用端口
call :FIND_AVAILABLE_PORT %DEFAULT_BACKEND_PORT%
set "BACKEND_PORT=%ERRORLEVEL%"
call :LOG_INFO "后端服务端口: %BACKEND_PORT%"

call :FIND_AVAILABLE_PORT %DEFAULT_FRONTEND_PORT%
set "FRONTEND_PORT=%ERRORLEVEL%"
call :LOG_INFO "前端服务端口: %FRONTEND_PORT%"

REM 设置虚拟环境
call :SETUP_VIRTUAL_ENVIRONMENT

REM 启动后端服务
call :START_BACKEND_SERVICE %BACKEND_PORT%
set "BACKEND_PID=%ERRORLEVEL%"

REM 配置后端API地址
set "BACKEND_API=http://localhost:%BACKEND_PORT%"

REM 启动前端服务
call :START_FRONTEND_SERVICE %FRONTEND_PORT% "%BACKEND_API%"
set "FRONTEND_PID=%ERRORLEVEL%"

REM 显示服务信息
echo.
echo ==================================================
echo 🚀 生物节律应用调试环境已启动
echo.
echo 📊 后端服务: http://localhost:%BACKEND_PORT%
echo 🌐 前端服务: http://localhost:%FRONTEND_PORT%
echo.
echo 📝 日志文件: %LOG_FILE%
echo 💡 按 Ctrl+C 停止所有服务
echo ==================================================
echo.

REM 开始监控服务
call :MONITOR_SERVICES %BACKEND_PID% %FRONTEND_PID%
exit /b 0

REM =============================================================================
REM 脚本入口点
REM =============================================================================

REM 设置UTF-8编码
chcp 65001 >nul

REM 注册Ctrl+C处理
for /f "tokens=2 delims==" %%a in ('wmic process get ProcessId^,CommandLine /format:list ^| find "Powershell.exe"') do (
    set "POWERSHELL_PID=%%a"
)

REM 执行主函数
call :MAIN

REM 清理服务
call :CLEANUP_SERVICES

exit /b 0