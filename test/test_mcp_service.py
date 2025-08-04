#!/usr/bin/env python3
"""
MCP服务测试脚本
用于验证本地MCP服务是否正常工作
"""

import asyncio
import json
import websockets
import requests
import time
from typing import Dict, Any

class MCPServiceTester:
    def __init__(self, host="localhost", port=5020):
        self.host = host
        self.port = port
        self.ws_url = f"ws://{host}:{port}/mcp"
        self.http_url = f"http://{host}:{port}"
        
    def test_http_endpoints(self):
        """测试HTTP端点"""
        print("🔍 测试HTTP端点...")
        
        try:
            # 测试根路径
            response = requests.get(f"{self.http_url}/", timeout=5)
            if response.status_code == 200:
                print("✅ 根路径 / 正常")
                print(f"   响应: {response.json()}")
            else:
                print(f"❌ 根路径 / 失败: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ HTTP连接失败: {e}")
            return False
            
        try:
            # 测试健康检查
            response = requests.get(f"{self.http_url}/health", timeout=5)
            if response.status_code == 200:
                print("✅ 健康检查 /health 正常")
                print(f"   响应: {response.json()}")
            else:
                print(f"❌ 健康检查失败: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ 健康检查连接失败: {e}")
            return False
            
        return True
    
    async def test_websocket_connection(self):
        """测试WebSocket连接"""
        print("\n🔍 测试WebSocket连接...")
        
        try:
            async with websockets.connect(self.ws_url) as websocket:
                print("✅ WebSocket连接成功")
                
                # 测试服务器信息
                await self.test_server_info(websocket)
                
                # 测试工具调用
                await self.test_tool_calls(websocket)
                
        except Exception as e:
            print(f"❌ WebSocket连接失败: {e}")
            return False
            
        return True
    
    async def test_server_info(self, websocket):
        """测试服务器信息获取"""
        print("\n🔍 测试服务器信息...")
        
        request = {
            "jsonrpc": "2.0",
            "id": "test_server_info",
            "method": "server.info",
            "params": {}
        }
        
        try:
            await websocket.send(json.dumps(request))
            response = await websocket.recv()
            response_data = json.loads(response)
            
            if "result" in response_data:
                result = response_data["result"]
                print("✅ 服务器信息获取成功")
                print(f"   服务器名称: {result.get('name', 'N/A')}")
                print(f"   版本: {result.get('version', 'N/A')}")
                print(f"   描述: {result.get('description', 'N/A')}")
                print(f"   可用工具数量: {len(result.get('tools', []))}")
                
                # 显示可用工具
                tools = result.get('tools', [])
                if tools:
                    print("   可用工具:")
                    for tool in tools:
                        print(f"     - {tool.get('name', 'N/A')}: {tool.get('description', 'N/A')}")
            else:
                print(f"❌ 服务器信息获取失败: {response_data}")
                
        except Exception as e:
            print(f"❌ 服务器信息测试失败: {e}")
    
    async def test_tool_calls(self, websocket):
        """测试工具调用"""
        print("\n🔍 测试工具调用...")
        
        # 测试获取今日穿衣建议
        request = {
            "jsonrpc": "2.0",
            "id": "test_dress_today",
            "method": "get_dress_today",
            "params": {}
        }
        
        try:
            await websocket.send(json.dumps(request))
            response = await websocket.recv()
            response_data = json.loads(response)
            
            if "result" in response_data:
                print("✅ 今日穿衣建议获取成功")
                result = response_data["result"]
                print(f"   建议: {result}")
            else:
                print(f"❌ 今日穿衣建议获取失败: {response_data}")
                
        except Exception as e:
            print(f"❌ 工具调用测试失败: {e}")
    
    def test_biorhythm_api(self):
        """测试生物节律API"""
        print("\n🔍 测试生物节律API...")
        
        try:
            # 测试今日生物节律
            test_birth_date = "1990-01-01"
            response = requests.get(
                f"{self.http_url}/biorhythm/today",
                params={"birth_date": test_birth_date},
                timeout=5
            )
            
            if response.status_code == 200:
                print("✅ 生物节律API正常")
                result = response.json()
                print(f"   今日节律: {result.get('date', 'N/A')}")
            else:
                print(f"❌ 生物节律API失败: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ 生物节律API连接失败: {e}")
    
    async def run_all_tests(self):
        """运行所有测试"""
        print("🚀 开始MCP服务测试...")
        print(f"   目标地址: {self.host}:{self.port}")
        print("=" * 50)
        
        # 测试HTTP端点
        http_ok = self.test_http_endpoints()
        
        # 测试生物节律API
        self.test_biorhythm_api()
        
        # 测试WebSocket连接
        ws_ok = await self.test_websocket_connection()
        
        print("\n" + "=" * 50)
        print("📊 测试结果总结:")
        print(f"   HTTP服务: {'✅ 正常' if http_ok else '❌ 异常'}")
        print(f"   WebSocket服务: {'✅ 正常' if ws_ok else '❌ 异常'}")
        
        if http_ok and ws_ok:
            print("\n🎉 MCP服务测试通过！服务运行正常。")
            return True
        else:
            print("\n⚠️  MCP服务测试失败，请检查服务状态。")
            return False

def main():
    """主函数"""
    import sys
    
    # 获取命令行参数
    host = "localhost"
    port = 5020
    
    if len(sys.argv) > 1:
        host = sys.argv[1]
    if len(sys.argv) > 2:
        port = int(sys.argv[2])
    
    tester = MCPServiceTester(host, port)
    
    try:
        # 运行测试
        success = asyncio.run(tester.run_all_tests())
        
        if success:
            print("\n✅ 所有测试通过！MCP服务可用。")
            sys.exit(0)
        else:
            print("\n❌ 测试失败！MCP服务不可用。")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⏹️  测试被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 测试过程中发生错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 