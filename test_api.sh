#!/bin/bash

# API测试脚本
echo "=================================================="
echo "API接口测试脚本"
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
BACKEND_PORT=${FLASK_RUN_PORT:-5000}
MCP_PORT=${MCP_PORT:-8765}
TEST_BIRTH_DATE="1990-01-01"
TEST_DATE="2024-01-15"

# 测试函数
test_api() {
    local url=$1
    local description=$2
    local method=${3:-GET}
    local data=${4:-}
    
    echo -e "${BLUE}测试: $description${NC}"
    echo "URL: $url"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/api_response.json "$url")
    else
        response=$(curl -s -w "%{http_code}" -o /tmp/api_response.json -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ 成功 (HTTP $http_code)${NC}"
        if [ -s /tmp/api_response.json ]; then
            echo "响应数据:"
            cat /tmp/api_response.json | jq '.' 2>/dev/null || cat /tmp/api_response.json
        fi
    else
        echo -e "${RED}✗ 失败 (HTTP $http_code)${NC}"
        if [ -s /tmp/api_response.json ]; then
            echo "错误信息:"
            cat /tmp/api_response.json
        fi
    fi
    echo ""
}

# 检查curl是否安装
if ! command -v curl >/dev/null 2>&1; then
    echo -e "${RED}错误: curl未安装，请先安装curl${NC}"
    exit 1
fi

# 检查jq是否安装（可选）
if ! command -v jq >/dev/null 2>&1; then
    echo -e "${YELLOW}警告: jq未安装，JSON响应将不会格式化${NC}"
fi

echo -e "${BLUE}1. 测试基础API接口...${NC}"

# 测试根路径
test_api "http://localhost:$BACKEND_PORT/" "API根路径"

# 测试健康检查
test_api "http://localhost:$BACKEND_PORT/health" "健康检查"

echo -e "${BLUE}2. 测试生物节律API...${NC}"

# 测试今日生物节律
test_api "http://localhost:$BACKEND_PORT/biorhythm/today?birth_date=$TEST_BIRTH_DATE" "今日生物节律"

# 测试指定日期生物节律
test_api "http://localhost:$BACKEND_PORT/biorhythm/date?birth_date=$TEST_BIRTH_DATE&date=$TEST_DATE" "指定日期生物节律"

# 测试生物节律范围
test_api "http://localhost:$BACKEND_PORT/biorhythm/range?birth_date=$TEST_BIRTH_DATE&days_before=5&days_after=5" "生物节律范围"

# 测试历史记录
test_api "http://localhost:$BACKEND_PORT/biorhythm/history" "历史记录"

echo -e "${BLUE}3. 测试穿衣建议API...${NC}"

# 测试今日穿衣建议
test_api "http://localhost:$BACKEND_PORT/dress/today" "今日穿衣建议"

# 测试指定日期穿衣建议
test_api "http://localhost:$BACKEND_PORT/dress/date?date=$TEST_DATE" "指定日期穿衣建议"

# 测试穿衣建议范围
test_api "http://localhost:$BACKEND_PORT/dress/range?days_before=3&days_after=3" "穿衣建议范围"

echo -e "${BLUE}4. 测试MCP服务...${NC}"

# 测试MCP服务健康检查
test_api "http://localhost:$MCP_PORT/health" "MCP服务健康检查"

# 测试MCP服务根路径
test_api "http://localhost:$MCP_PORT/" "MCP服务根路径"

echo -e "${BLUE}5. 测试前端服务...${NC}"

# 测试前端服务
test_api "http://localhost:3000" "前端服务"

echo -e "${BLUE}6. 测试错误处理...${NC}"

# 测试无效的出生日期
test_api "http://localhost:$BACKEND_PORT/biorhythm/today?birth_date=invalid-date" "无效出生日期处理"

# 测试缺少参数
test_api "http://localhost:$BACKEND_PORT/biorhythm/today" "缺少参数处理"

echo -e "${BLUE}7. 性能测试...${NC}"

# 测试API响应时间
echo "测试API响应时间..."
start_time=$(date +%s.%N)
curl -s "http://localhost:$BACKEND_PORT/biorhythm/today?birth_date=$TEST_BIRTH_DATE" >/dev/null
end_time=$(date +%s.%N)
response_time=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "无法计算")
echo -e "${GREEN}响应时间: ${response_time}秒${NC}"

echo -e "${BLUE}8. 负载测试...${NC}"

# 简单的并发测试
echo "执行并发测试（5个并发请求）..."
for i in {1..5}; do
    (curl -s "http://localhost:$BACKEND_PORT/biorhythm/today?birth_date=$TEST_BIRTH_DATE" >/dev/null && echo -e "${GREEN}请求 $i 成功${NC}") &
done
wait
echo "并发测试完成"

echo "=================================================="
echo "API测试完成！"
echo "=================================================="
echo ""
echo "服务地址:"
echo "后端API: http://localhost:$BACKEND_PORT"
echo "MCP服务: http://localhost:$MCP_PORT"
echo "前端服务: http://localhost:3000"
echo ""
echo "API文档:"
echo "http://localhost:$BACKEND_PORT/docs"
echo ""

# 清理临时文件
rm -f /tmp/api_response.json 