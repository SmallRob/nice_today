@echo off
REM 生物节律应用启动批处理脚本
REM 此脚本会调用PowerShell脚本来启动应用

echo 正在启动生物节律应用...

REM 检查PowerShell是否可用
where powershell >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 未找到PowerShell，请确保PowerShell已安装
    exit /b 1
)

REM 执行PowerShell脚本
powershell -ExecutionPolicy Bypass -File "%~dp0start.ps1"

REM 如果PowerShell脚本执行失败
if %ERRORLEVEL% neq 0 (
    echo 启动应用失败，请查看日志文件了解详情
    exit /b 1
)

exit /b 0