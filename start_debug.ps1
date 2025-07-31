# Windows PowerShell综合启动调试脚本 - UTF-8
# 生物节律应用综合启动调试脚本

# 强制设置输出编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 菜单
$menu = @"
========================================
生物节律应用综合启动调试脚本
========================================

1. 本地开发模式 (start.ps1)
2. Docker 容器模式 (build_and_run.ps1)
3. 本地调试模式 (debug.ps1)
4. Docker 调试模式 (docker_debug.ps1)
5. 退出
"@

Write-Host $menu -ForegroundColor Cyan

# 读取用户选择
$choice = Read-Host '请选择启动模式 (1-5)'

# 根据选择执行
if ($choice -eq '1') {
    Write-Host '启动本地开发模式...' -ForegroundColor Green
    if (Test-Path '.\start.ps1') { . .\start.ps1 } else { Write-Host '找不到 start.ps1' -ForegroundColor Red }
}
elseif ($choice -eq '2') {
    Write-Host '启动 Docker 容器模式...' -ForegroundColor Green
    if (Test-Path '.\build_and_run.ps1') { . .\build_and_run.ps1 } else { Write-Host '找不到 build_and_run.ps1' -ForegroundColor Red }
}
elseif ($choice -eq '3') {
    Write-Host '启动本地调试模式...' -ForegroundColor Green
    if (Test-Path '.\debug.ps1') { . .\debug.ps1 } else { Write-Host '找不到 debug.ps1' -ForegroundColor Red }
}
elseif ($choice -eq '4') {
    Write-Host '启动 Docker 调试模式...' -ForegroundColor Green
    if (Test-Path '.\docker_debug.ps1') { . .\docker_debug.ps1 } else { Write-Host '找不到 docker_debug.ps1' -ForegroundColor Red }
}
elseif ($choice -eq '5') {
    Write-Host '已退出' -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host '无效选择，请输入 1-5 之间的数字' -ForegroundColor Red
    exit 1
}

# 结束提示
Write-Host ''
Write-Host '脚本执行完毕，请按任意键退出...' -ForegroundColor Cyan
[void][System.Console]::ReadKey($true)