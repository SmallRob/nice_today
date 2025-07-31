#!/bin/bash

# 构建和运行Docker容器的Bash脚本

echo -e "\033[36m开始构建和运行生物节律应用的Docker容器...\033[0m"

# 检查Docker是否已安装
if ! command -v docker &> /dev/null; then
    echo -e "\033[31m错误: 未检测到Docker。请先安装Docker Engine。\033[0m"
    exit 1
else
    echo -e "\033[32m检测到Docker: $(docker --version)\033[0m"
fi

# 检查docker-compose是否已安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "\033[31m错误: 未检测到Docker Compose。请先安装Docker Compose。\033[0m"
    exit 1
else
    echo -e "\033[32m检测到Docker Compose: $(docker-compose --version)\033[0m"
fi

# 构建Docker镜像
echo -e "\033[36m构建Docker镜像...\033[0m"
docker-compose build

if [ $? -ne 0 ]; then
    echo -e "\033[31m错误: 构建Docker镜像失败。\033[0m"
    exit 1
fi

# 启动Docker容器
echo -e "\033[36m启动Docker容器...\033[0m"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "\033[31m错误: 启动Docker容器失败。\033[0m"
    exit 1
fi

# 等待服务启动
echo -e "\033[36m等待服务启动...\033[0m"
sleep 5

# 检查服务是否正常运行
if command -v curl &> /dev/null; then
    if curl -s http://localhost:5000/health > /dev/null; then
        echo -e "\033[32m后端服务状态: 健康\033[0m"
    else
        echo -e "\033[33m警告: 无法连接到后端健康检查端点。服务可能仍在启动中...\033[0m"
    fi
else
    echo -e "\033[33m警告: 未安装curl，无法检查服务健康状态。\033[0m"
fi

# 显示服务信息
echo -e "\033[32m==================================================\033[0m"
echo -e "\033[32m服务已成功启动！\033[0m"
echo -e "\033[36m后端服务运行在: http://localhost:5000\033[0m"
echo -e "\033[36m前端服务运行在: http://localhost:3000\033[0m"
echo -e "\033[36mWebSocket服务运行在: ws://localhost:8765/mcp\033[0m"
echo ""
echo -e "\033[33m可以使用以下命令查看容器日志:\033[0m"
echo -e "\033[33m  docker-compose logs -f\033[0m"
echo ""
echo -e "\033[33m可以使用以下命令停止服务:\033[0m"
echo -e "\033[33m  docker-compose down\033[0m"
echo -e "\033[32m==================================================\033[0m"

# 设置脚本执行权限
chmod +x build_and_run.sh