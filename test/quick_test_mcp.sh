#!/bin/bash

# MCP服务快速测试脚本

echo "🔍 快速测试MCP服务..."

# 检查服务是否运行
check_service() {
    local port=$1
    local service_name=$2
    
    echo "检查 $service_name 服务 (端口: $port)..."
    
    if curl -s http://localhost:$port/health > /dev/null 2>&1; then
        echo "✅ $service_name 服务运行正常"
        return 0
    else
        echo "❌ $service_name 服务未运行或不可访问"
        return 1
    fi
}

# 测试WebSocket连接
test_websocket() {
    local port=$1
    echo "测试WebSocket连接 (端口: $port)..."
    
    # 使用Python测试WebSocket
    python3 -c "
import asyncio
import websockets
import json

async def test_ws():
    try:
        async with websockets.connect('ws://localhost:$port/mcp') as websocket:
            request = {
                'jsonrpc': '2.0',
                'id': 'test',
                'method': 'server.info',
                'params': {}
            }
            await websocket.send(json.dumps(request))
            response = await websocket.recv()
            data = json.loads(response)
            if 'result' in data:
                print('✅ WebSocket连接正常')
                print(f'   服务器: {data[\"result\"].get(\"name\", \"N/A\")}')
                print(f'   版本: {data[\"result\"].get(\"version\", \"N/A\")}')
            else:
                print('❌ WebSocket响应异常')
    except Exception as e:
        print(f'❌ WebSocket连接失败: {e}')

asyncio.run(test_ws())
"
}

# 主测试流程
echo "=" * 50
echo "MCP服务测试"
echo "=" * 50

# 检查后端服务
if check_service 5020 "后端API"; then
    echo ""
    echo "📊 测试API端点..."
    
    # 测试根路径
    echo "测试根路径..."
    curl -s http://localhost:5020/ | python3 -m json.tool 2>/dev/null || echo "❌ 根路径测试失败"
    
    # 测试健康检查
    echo "测试健康检查..."
    curl -s http://localhost:5020/health | python3 -m json.tool 2>/dev/null || echo "❌ 健康检查测试失败"
    
    # 测试生物节律API
    echo "测试生物节律API..."
    curl -s "http://localhost:5020/biorhythm/today?birth_date=1990-01-01" | python3 -m json.tool 2>/dev/null || echo "❌ 生物节律API测试失败"
    
    echo ""
    echo "🔌 测试WebSocket连接..."
    test_websocket 5020
    
else
    echo ""
    echo "⚠️  后端服务未运行，请先启动服务："
    echo "   ./start.sh"
    echo "   或者"
    echo "   python3 start_mcp_server.py"
fi

echo ""
echo "=" * 50
echo "测试完成"
echo "=" * 50 