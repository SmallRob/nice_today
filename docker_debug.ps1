# Windows PowerShell Docker调试脚本
# 生物节律应用Docker调试启动脚本

# 设置输出编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "开始构建和调试生物节律应用的Docker容器..." -ForegroundColor Cyan

# 检查Docker是否已安装
try {
    $dockerVersion = docker --version
    Write-Host "检测到Docker: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "错误: 未检测到Docker。请先安装Docker Desktop或Docker Engine。" -ForegroundColor Red
    exit 1
}

# 检查docker-compose是否已安装
try {
    $composeVersion = docker-compose --version
    Write-Host "检测到Docker Compose: $composeVersion" -ForegroundColor Green
}
catch {
    Write-Host "错误: 未检测到Docker Compose。请先安装Docker Compose。" -ForegroundColor Red
    exit 1
}

# 定义日志目录
$LOG_DIR = ".\logs"
if (-not (Test-Path $LOG_DIR)) {
    Write-Host "创建日志目录..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $LOG_DIR | Out-Null
}

# 停止并移除现有容器（如果存在）
Write-Host "停止并移除现有容器（如果存在）..." -ForegroundColor Cyan
docker-compose down

# 构建Docker镜像（使用--no-cache选项以确保重新构建）
Write-Host "构建Docker镜像（调试模式）..." -ForegroundColor Cyan
docker-compose build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 构建Docker镜像失败。" -ForegroundColor Red
    exit 1
}

# 启动Docker容器（调试模式）
Write-Host "启动Docker容器（调试模式）..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 启动Docker容器失败。" -ForegroundColor Red
    exit 1
}

# 等待服务启动
Write-Host "等待服务启动..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# 检查服务是否正常运行
try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -ErrorAction Stop
    Write-Host "后端服务状态: $($backendHealth.status)" -ForegroundColor Green
}
catch {
    Write-Host "警告: 无法连接到后端健康检查端点。服务可能仍在启动中..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # 再次尝试
    try {
        $backendHealth = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -ErrorAction Stop
        Write-Host "后端服务状态: $($backendHealth.status)" -ForegroundColor Green
    }
    catch {
        Write-Host "警告: 无法连接到后端健康检查端点。请检查容器日志以获取更多信息。" -ForegroundColor Yellow
    }
}

# 显示容器日志
Write-Host "获取容器日志..." -ForegroundColor Cyan
docker-compose logs > "$LOG_DIR\docker_containers.log"

# 打开浏览器访问前端应用
Write-Host "正在打开浏览器访问前端应用..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

# 显示调试信息
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Docker调试环境已成功启动！" -ForegroundColor Green
Write-Host "后端服务运行在: http://localhost:5000" -ForegroundColor Cyan
Write-Host "前端服务运行在: http://localhost:3000" -ForegroundColor Cyan
Write-Host "WebSocket服务运行在: ws://localhost:8765/mcp" -ForegroundColor Cyan
Write-Host ""
Write-Host "调试工具:" -ForegroundColor Yellow
Write-Host "  1. 查看所有容器日志: docker-compose logs" -ForegroundColor Yellow
Write-Host "  2. 查看后端容器日志: docker-compose logs backend" -ForegroundColor Yellow
Write-Host "  3. 查看前端容器日志: docker-compose logs frontend" -ForegroundColor Yellow
Write-Host "  4. 实时查看所有容器日志: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "  5. 进入后端容器: docker-compose exec backend bash" -ForegroundColor Yellow
Write-Host "  6. 进入前端容器: docker-compose exec frontend sh" -ForegroundColor Yellow
Write-Host ""
Write-Host "调试命令:" -ForegroundColor Yellow
Write-Host "  1. 重启所有容器: docker-compose restart" -ForegroundColor Yellow
Write-Host "  2. 重启后端容器: docker-compose restart backend" -ForegroundColor Yellow
Write-Host "  3. 重启前端容器: docker-compose restart frontend" -ForegroundColor Yellow
Write-Host "  4. 停止所有容器: docker-compose down" -ForegroundColor Yellow
Write-Host ""
Write-Host "日志文件:" -ForegroundColor Yellow
Write-Host "  容器日志: $LOG_DIR\docker_containers.log" -ForegroundColor Yellow
Write-Host ""
Write-Host "按 Ctrl+C 停止监控日志（容器将继续运行）" -ForegroundColor Yellow
Write-Host "使用 'docker-compose down' 命令停止所有容器" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Green

# 实时显示容器日志
Write-Host "正在实时显示容器日志（按 Ctrl+C 停止）..." -ForegroundColor Cyan
try {
    docker-compose logs -f
}
catch {
    Write-Host "日志监控已停止，但容器仍在运行。" -ForegroundColor Yellow
}

Write-Host "使用 'docker-compose down' 命令停止所有容器" -ForegroundColor Yellow