# MCP服务测试指南

本指南将帮助你验证本地MCP服务是否正常工作。

## 📋 测试前准备

### 1. 安装依赖

确保已安装必要的Python包：

```bash
pip install websockets requests fastapi uvicorn
```

### 2. 启动服务

有两种方式启动MCP服务：

#### 方式一：使用完整启动脚本
```bash
./start.sh
```

#### 方式二：仅启动MCP服务器
```bash
python3 start_mcp_server.py
```

## 🧪 测试方法

### 方法一：快速测试（推荐）

使用快速测试脚本：

```bash
./quick_test_mcp.sh
```

这个脚本会：
- 检查服务是否运行
- 测试HTTP端点
- 测试WebSocket连接
- 测试生物节律API

### 方法二：详细测试

使用Python测试脚本：

```bash
python3 test_mcp_service.py
```

或者指定自定义地址和端口：

```bash
python3 test_mcp_service.py localhost 5020
```

### 方法三：手动测试

#### 1. 测试HTTP端点

```bash
# 测试根路径
curl http://localhost:5020/

# 测试健康检查
curl http://localhost:5020/health

# 测试生物节律API
curl "http://localhost:5020/biorhythm/today?birth_date=1990-01-01"
```

#### 2. 测试WebSocket连接

使用Python测试WebSocket：

```python
import asyncio
import websockets
import json

async def test_mcp():
    async with websockets.connect('ws://localhost:5020/mcp') as websocket:
        # 获取服务器信息
        request = {
            "jsonrpc": "2.0",
            "id": "test",
            "method": "server.info",
            "params": {}
        }
        await websocket.send(json.dumps(request))
        response = await websocket.recv()
        print(json.loads(response))

asyncio.run(test_mcp())
```

## 📊 预期结果

### 成功指标

✅ **HTTP服务正常**
- 根路径返回API信息
- 健康检查返回 `{"status": "healthy"}`
- 生物节律API返回有效数据

✅ **WebSocket服务正常**
- 能够建立WebSocket连接
- 服务器信息请求成功
- 工具调用正常工作

### 常见问题

#### 1. 服务未启动
```
❌ 后端服务未运行或不可访问
```
**解决方案：** 确保已运行 `./start.sh` 或 `python3 start_mcp_server.py`

#### 2. 端口被占用
```
❌ 端口 5020 已被占用
```
**解决方案：** 
- 检查是否有其他服务占用端口
- 修改端口配置
- 停止占用端口的服务

#### 3. 依赖缺失
```
❌ ModuleNotFoundError: No module named 'websockets'
```
**解决方案：** 安装缺失的依赖
```bash
pip install websockets requests
```

## 🔧 故障排除

### 1. 检查服务状态

```bash
# 检查端口是否被占用
lsof -i :5020

# 检查进程
ps aux | grep python
```

### 2. 查看日志

```bash
# 查看后端日志
cat backend/backend.log

# 查看MCP服务器日志
cat backend/mcp_server.log
```

### 3. 重启服务

```bash
# 停止所有Python进程
pkill -f python

# 重新启动
./start.sh
```

## 📝 测试报告

测试完成后，你应该看到类似以下的输出：

```
🚀 开始MCP服务测试...
   目标地址: localhost:5020
==================================================
🔍 测试HTTP端点...
✅ 根路径 / 正常
✅ 健康检查 /health 正常
🔍 测试生物节律API...
✅ 生物节律API正常
🔍 测试WebSocket连接...
✅ WebSocket连接成功
🔍 测试服务器信息...
✅ 服务器信息获取成功
🔍 测试工具调用...
✅ 今日穿衣建议获取成功
==================================================
📊 测试结果总结:
   HTTP服务: ✅ 正常
   WebSocket服务: ✅ 正常

🎉 MCP服务测试通过！服务运行正常。
```

## 🎯 下一步

如果测试通过，你的MCP服务已经可以正常使用。你可以：

1. 在Cursor中配置MCP服务器
2. 使用MCP工具进行生物节律计算
3. 集成到其他应用程序中

如果测试失败，请按照故障排除步骤进行调试。 