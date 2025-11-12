#!/usr/bin/env python3
"""
MCP客户端测试脚本
用于测试新的生物节律生活指南工具
"""

import asyncio
import json
import websockets

async def test_mcp_server():
    """测试MCP服务器连接和工具调用"""
    uri = "ws://localhost:8765/mcp"
    
    try:
        print("🔄 连接到MCP服务器...")
        async with websockets.connect(uri) as websocket:
            print("✅ 连接成功")
            
            # 1. 获取服务器信息
            print("\n📋 获取服务器信息...")
            server_info_request = {
                "jsonrpc": "2.0",
                "id": "server_info",
                "method": "server.info",
                "params": {}
            }
            
            await websocket.send(json.dumps(server_info_request))
            response = await websocket.recv()
            server_info = json.loads(response)
            
            if "result" in server_info:
                print("✅ 服务器信息获取成功")
                tools = server_info["result"].get("tools", [])
                print(f"📊 可用工具数量: {len(tools)}")
                
                # 显示所有工具
                for tool in tools:
                    print(f"  - {tool['name']}: {tool['description']}")
            
            # 2. 测试新的生物节律生活指南工具
            print("\n🧬 测试生物节律生活指南工具...")
            
            # 测试get_biorhythm_life_guide
            guide_request = {
                "jsonrpc": "2.0",
                "id": "test_guide",
                "method": "get_biorhythm_life_guide",
                "params": {
                    "birth_date": "1991-04-21",
                    "location": "北京,中国"
                }
            }
            
            await websocket.send(json.dumps(guide_request))
            response = await websocket.recv()
            guide_result = json.loads(response)
            
            if "result" in guide_result:
                result = guide_result["result"]
                print("✅ 生物节律生活指南获取成功")
                print(f"📅 出生日期: {result.get('birth_date', 'N/A')}")
                print(f"📍 位置: {result.get('location', 'N/A')}")
                print(f"📊 生物节律状态: {result.get('biorhythm_status', 'N/A')}")
                print(f"👔 穿衣建议: {result.get('dress_advice', 'N/A')}")
                print(f"🍽️ 饮食建议: {result.get('diet_advice', 'N/A')}")
                print(f"🏃 活动建议: {result.get('activity_advice', 'N/A')}")
            else:
                print("❌ 工具调用失败:", guide_result.get("error", "未知错误"))
            
            # 3. 测试今日生物节律指南
            print("\n📅 测试今日生物节律指南...")
            
            today_request = {
                "jsonrpc": "2.0",
                "id": "test_today",
                "method": "get_today_biorhythm_guide",
                "params": {
                    "birth_date": "1991-04-21"
                }
            }
            
            await websocket.send(json.dumps(today_request))
            response = await websocket.recv()
            today_result = json.loads(response)
            
            if "result" in today_result:
                result = today_result["result"]
                print("✅ 今日生物节律指南获取成功")
                print(f"📅 今日日期: {result.get('today_date', 'N/A')}")
                print(f"📊 今日状态: {result.get('today_status', 'N/A')}")
            else:
                print("❌ 工具调用失败:", today_result.get("error", "未知错误"))
            
            print("\n🎉 所有测试完成！")
            
    except Exception as e:
        print(f"❌ 连接或测试失败: {e}")

if __name__ == "__main__":
    print("🚀 MCP客户端测试开始")
    print("=" * 50)
    asyncio.run(test_mcp_server())