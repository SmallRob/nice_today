#!/usr/bin/env python3
"""
独立的MCP服务器启动脚本
用于启动和测试MCP服务
"""

import os
import sys
import uvicorn
from pathlib import Path

# 添加backend目录到Python路径
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

# 导入MCP服务器
from mcp_server import app

def main():
    """启动MCP服务器"""
    # 获取端口，默认为8765
    port = int(os.environ.get("MCP_PORT", 8765))
    host = os.environ.get("MCP_HOST", "0.0.0.0")
    
    print(f"🚀 启动MCP服务器...")
    print(f"   地址: {host}:{port}")
    print(f"   WebSocket端点: ws://{host}:{port}/mcp")
    print(f"   HTTP端点: http://{host}:{port}")
    print("=" * 50)
    
    try:
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info",
            reload=False
        )
    except KeyboardInterrupt:
        print("\n⏹️  MCP服务器已停止")
    except Exception as e:
        print(f"\n💥 启动MCP服务器时发生错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 