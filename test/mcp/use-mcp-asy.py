import asyncio
import json
import websockets

async def test_tool():
    async with websockets.connect("ws://localhost:8765/mcp") as websocket:
        # 调用综合生活指南工具
        request = {
            "jsonrpc": "2.0",
            "id": "test",
            "method": "get_biorhythm_life_guide",
            "params": {
                "birth_date": "1991-04-21",
                "location": "北京,中国"
            }
        }
        await websocket.send(json.dumps(request))
        response = await websocket.recv()
        result = json.loads(response)
        print(result["result"])

asyncio.run(test_tool())
