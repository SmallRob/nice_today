#!/bin/bash

# 快速部署脚本
echo "=================================================="
echo "快速部署脚本"
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        return 1
    fi
}

# 检查Docker环境
echo -e "${BLUE}检查Docker环境...${NC}"
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}错误: Docker未安装${NC}"
    exit 1
fi

if ! command -v docker-compose >/dev/null 2>&1; then
    echo -e "${RED}错误: Docker Compose未安装${NC}"
    exit 1
fi

check_status 0 "Docker环境检查通过"

# 设置环境变量
export FLASK_RUN_PORT=5000
export MCP_PORT=8765
export REACT_APP_BACKEND_PORT=5000
export NODE_ENV=production
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo -e "${BLUE}环境变量已设置${NC}"

# 停止现有服务
echo -e "${BLUE}停止现有服务...${NC}"
docker-compose down 2>/dev/null || true
check_status 0 "现有服务已停止"

# 清理Docker缓存（可选）
read -p "是否清理Docker缓存？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}清理Docker缓存...${NC}"
    docker system prune -f
    check_status 0 "Docker缓存已清理"
fi

# 构建镜像
echo -e "${BLUE}构建Docker镜像...${NC}"
if docker-compose build --no-cache; then
    check_status 0 "Docker镜像构建成功"
else
    check_status 1 "Docker镜像构建失败"
    exit 1
fi

# 启动服务
echo -e "${BLUE}启动服务...${NC}"
if docker-compose up -d; then
    check_status 0 "服务启动成功"
else
    check_status 1 "服务启动失败"
    exit 1
fi

# 等待服务启动
echo -e "${BLUE}等待服务启动...${NC}"
sleep 15

# 检查服务状态
echo -e "${BLUE}检查服务状态...${NC}"
if docker-compose ps | grep -q "Up"; then
    check_status 0 "服务运行正常"
else
    check_status 1 "服务运行异常"
    echo "查看服务日志:"
    docker-compose logs
    exit 1
fi

# 测试API
echo -e "${BLUE}测试API接口...${NC}"
if curl -f http://localhost:5000/health >/dev/null 2>&1; then
    check_status 0 "API健康检查通过"
else
    check_status 1 "API健康检查失败"
fi

# 显示服务信息
echo "=================================================="
echo "部署完成！"
echo "=================================================="
echo "服务地址:"
echo "后端API: http://localhost:5000"
echo "MCP服务: http://localhost:8765"
echo "前端服务: http://localhost:3000"
echo ""
echo "API测试:"
echo "curl http://localhost:5000/health"
echo "curl \"http://localhost:5000/biorhythm/today?birth_date=1990-01-01\""
echo "curl http://localhost:5000/dress/today"
echo ""
echo "服务管理:"
echo "查看状态: docker-compose ps"
echo "查看日志: docker-compose logs"
echo "停止服务: docker-compose down"
echo "重启服务: docker-compose restart"
echo "=================================================="

# 询问是否运行完整测试
read -p "是否运行完整API测试？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "./test_api.sh" ]; then
        echo -e "${BLUE}运行API测试...${NC}"
        ./test_api.sh
    else
        echo -e "${YELLOW}API测试脚本不存在${NC}"
    fi
fi

echo -e "${GREEN}部署完成！${NC}" 