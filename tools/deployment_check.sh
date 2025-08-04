#!/bin/bash

# 部署检查脚本 - 验证环境变量配置和API服务可用性
echo "=================================================="
echo "部署环境检查脚本"
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

echo -e "${BLUE}1. 检查Docker环境...${NC}"
# 检查Docker是否安装
if command -v docker >/dev/null 2>&1; then
    check_status 0 "Docker已安装"
    docker --version
else
    check_status 1 "Docker未安装"
    echo "请先安装Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查Docker Compose是否安装
if command -v docker-compose >/dev/null 2>&1; then
    check_status 0 "Docker Compose已安装"
    docker-compose --version
else
    check_status 1 "Docker Compose未安装"
    echo "请先安装Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${BLUE}2. 检查Docker Compose配置...${NC}"
# 验证docker-compose.yml配置
if docker-compose config >/dev/null 2>&1; then
    check_status 0 "Docker Compose配置有效"
else
    check_status 1 "Docker Compose配置无效"
    echo "请检查docker-compose.yml文件"
    exit 1
fi

echo -e "${BLUE}3. 检查环境变量配置...${NC}"
# 检查必要的环境变量
REQUIRED_ENV_VARS=(
    "FLASK_RUN_PORT"
    "MCP_PORT"
    "REACT_APP_BACKEND_PORT"
)

for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        check_status 0 "环境变量 $var 已设置: ${!var}"
    else
        echo -e "${YELLOW}⚠ 环境变量 $var 未设置，将使用默认值${NC}"
    fi
done

echo -e "${BLUE}4. 检查端口配置...${NC}"
# 检查端口是否被占用
BACKEND_PORT=${FLASK_RUN_PORT:-5000}
MCP_PORT=${MCP_PORT:-8765}
FRONTEND_PORT=${REACT_APP_BACKEND_PORT:-3000}

check_port() {
    if command -v lsof >/dev/null 2>&1; then
        lsof -i:$1 >/dev/null 2>&1
        return $?
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tuln | grep -q ":$1 "
        return $?
    else
        return 1
    fi
}

for port in $BACKEND_PORT $MCP_PORT $FRONTEND_PORT; do
    if check_port $port; then
        echo -e "${YELLOW}⚠ 端口 $port 已被占用${NC}"
    else
        check_status 0 "端口 $port 可用"
    fi
done

echo -e "${BLUE}5. 检查文件结构...${NC}"
# 检查必要的文件和目录
REQUIRED_FILES=(
    "docker-compose.yml"
    "backend/Dockerfile"
    "backend/app.py"
    "backend/requirements.txt"
    "frontend/Dockerfile"
    "frontend/package.json"
    "frontend/nginx.conf"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_status 0 "文件存在: $file"
    else
        check_status 1 "文件不存在: $file"
    fi
done

echo -e "${BLUE}6. 构建Docker镜像...${NC}"
# 构建镜像
echo "构建后端镜像..."
if docker-compose build biorhythm-api; then
    check_status 0 "后端镜像构建成功"
else
    check_status 1 "后端镜像构建失败"
    exit 1
fi

echo "构建前端镜像..."
if docker-compose build biorhythm-frontend; then
    check_status 0 "前端镜像构建成功"
else
    check_status 1 "前端镜像构建失败"
    exit 1
fi

echo -e "${BLUE}7. 启动服务...${NC}"
# 启动服务
echo "启动Docker服务..."
if docker-compose up -d; then
    check_status 0 "Docker服务启动成功"
else
    check_status 1 "Docker服务启动失败"
    exit 1
fi

echo -e "${BLUE}8. 等待服务启动...${NC}"
# 等待服务启动
echo "等待服务启动..."
sleep 10

echo -e "${BLUE}9. 检查服务健康状态...${NC}"
# 检查后端健康状态
echo "检查后端服务健康状态..."
if curl -f http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
    check_status 0 "后端服务健康检查通过"
else
    check_status 1 "后端服务健康检查失败"
fi

# 检查MCP服务健康状态
echo "检查MCP服务健康状态..."
if curl -f http://localhost:$MCP_PORT/health >/dev/null 2>&1; then
    check_status 0 "MCP服务健康检查通过"
else
    check_status 1 "MCP服务健康检查失败"
fi

echo -e "${BLUE}10. 测试API接口...${NC}"
# 测试API接口
TEST_BIRTH_DATE="1990-01-01"

# 测试根路径
echo "测试API根路径..."
if curl -s http://localhost:$BACKEND_PORT/ >/dev/null; then
    check_status 0 "API根路径可访问"
else
    check_status 1 "API根路径不可访问"
fi

# 测试生物节律API
echo "测试生物节律API..."
if curl -s "http://localhost:$BACKEND_PORT/biorhythm/today?birth_date=$TEST_BIRTH_DATE" >/dev/null; then
    check_status 0 "生物节律API可访问"
else
    check_status 1 "生物节律API不可访问"
fi

# 测试穿衣建议API
echo "测试穿衣建议API..."
if curl -s "http://localhost:$BACKEND_PORT/dress/today" >/dev/null; then
    check_status 0 "穿衣建议API可访问"
else
    check_status 1 "穿衣建议API不可访问"
fi

echo -e "${BLUE}11. 检查前端服务...${NC}"
# 检查前端服务
echo "检查前端服务..."
if curl -s http://localhost:3000 >/dev/null; then
    check_status 0 "前端服务可访问"
else
    check_status 1 "前端服务不可访问"
fi

echo -e "${BLUE}12. 显示服务信息...${NC}"
echo "=================================================="
echo "服务部署信息:"
echo "=================================================="
echo "后端API服务: http://localhost:$BACKEND_PORT"
echo "MCP服务: http://localhost:$MCP_PORT"
echo "前端服务: http://localhost:3000"
echo ""
echo "API测试示例:"
echo "curl http://localhost:$BACKEND_PORT/"
echo "curl \"http://localhost:$BACKEND_PORT/biorhythm/today?birth_date=1990-01-01\""
echo "curl http://localhost:$BACKEND_PORT/dress/today"
echo "curl http://localhost:$BACKEND_PORT/health"
echo ""
echo "Docker容器状态:"
docker-compose ps
echo ""
echo "Docker日志查看:"
echo "docker-compose logs biorhythm-api"
echo "docker-compose logs biorhythm-frontend"
echo ""
echo "停止服务:"
echo "docker-compose down"
echo "=================================================="

echo -e "${GREEN}部署检查完成！${NC}" 